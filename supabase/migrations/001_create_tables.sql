-- =============================================================================
-- MIGRATION 001: Create Core Tables
-- Project: Kriyaa Promoters – Golden City Admin
-- Apply via: Supabase Dashboard → SQL Editor → paste and run
-- =============================================================================
-- SAFETY: All statements use IF NOT EXISTS. Safe to run on a fresh database.
-- DO NOT run this if tables already exist — inspect first.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- EXTENSION: uuid-ossp for gen_random_uuid() — already enabled in Supabase
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================================
-- TABLE: profiles
-- Extends auth.users with role information.
-- One row per authenticated Supabase user.
-- The is_admin flag can ONLY be set by the service-role key (server-side),
-- never by a client using the anon key.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  full_name     TEXT,
  is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS
  'One row per auth.users entry. is_admin must only be set server-side via service-role key.';
COMMENT ON COLUMN public.profiles.is_admin IS
  'Admin role flag. Cannot be self-granted by the user — set only via service-role SQL or dashboard.';


-- =============================================================================
-- TABLE: projects
-- Each project is a real estate layout (e.g. "Golden City").
-- Publish status controls public visibility.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name                TEXT NOT NULL,
  location            TEXT NOT NULL,
  district            TEXT NOT NULL DEFAULT '',
  description         TEXT NOT NULL DEFAULT '',

  -- Legal approvals
  dtcp_number         TEXT NOT NULL,
  rera_number         TEXT,

  -- Visual assets (public URLs from Supabase Storage or external CDN)
  master_plan_image   TEXT,
  layout_image_url    TEXT,
  layout_pdf_url      TEXT,
  layout_version      INTEGER NOT NULL DEFAULT 1,

  -- Project metadata
  status              TEXT NOT NULL DEFAULT 'Upcoming'
                        CHECK (status IN ('Active', 'Upcoming', 'Completed')),
  is_published        BOOLEAN NOT NULL DEFAULT FALSE,
  total_area_extent   TEXT,
  launch_year         INTEGER,

  -- Geo-coordinates
  geo_lat             NUMERIC(10, 6),
  geo_lng             NUMERIC(10, 6),

  -- Computed plot counts (updated via trigger or admin action)
  total_plots         INTEGER NOT NULL DEFAULT 0,
  available_plots     INTEGER NOT NULL DEFAULT 0,
  reserved_plots      INTEGER NOT NULL DEFAULT 0,
  sold_plots          INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.projects IS
  'Real estate layout projects. is_published=true makes it visible on the public website.';
COMMENT ON COLUMN public.projects.is_published IS
  'When false (draft), project is hidden from the public API. Only admins can see draft projects.';

-- Index: public visitor queries filter on is_published frequently
CREATE INDEX IF NOT EXISTS idx_projects_is_published ON public.projects (is_published);
CREATE INDEX IF NOT EXISTS idx_projects_status       ON public.projects (status);


-- =============================================================================
-- TABLE: plots
-- Each plot belongs to exactly one project via project_id (FK).
-- plot_number is display text (e.g. "42", "C-01") NOT the primary key.
-- Uniqueness: one plot_number per project.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.plots (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to project (cascades deletes)
  project_id          UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Display identifiers
  plot_number         TEXT NOT NULL,
  title               TEXT NOT NULL DEFAULT '',

  -- Classification
  category            TEXT NOT NULL DEFAULT 'Land/Plots'
                        CHECK (category IN ('Land/Plots', 'Residential', 'Commercial')),
  status              TEXT NOT NULL DEFAULT 'Available'
                        CHECK (status IN ('Available', 'Reserved', 'Sold')),

  -- Dimensions & area
  plot_dimensions     TEXT NOT NULL DEFAULT '',       -- e.g. "30x40 ft"
  area_sq_ft          NUMERIC(10, 2) NOT NULL DEFAULT 0,
  area_cents          NUMERIC(8, 4) NOT NULL DEFAULT 0,
  facing              TEXT NOT NULL DEFAULT 'North'
                        CHECK (facing IN ('North', 'East', 'South', 'West', 'North-East', 'North-West')),
  road_width          TEXT NOT NULL DEFAULT '',       -- e.g. "40 ft"

  -- Pricing
  total_price         NUMERIC(14, 2) NOT NULL DEFAULT 0,
  price_per_sq_ft     NUMERIC(10, 2) NOT NULL DEFAULT 0,

  -- Approvals (array of text tags: DTCP, RERA, Patta)
  approvals           TEXT[] NOT NULL DEFAULT '{}',

  -- Flags
  is_gated_community  BOOLEAN NOT NULL DEFAULT TRUE,
  is_corner_plot      BOOLEAN NOT NULL DEFAULT FALSE,

  -- Location text & map link
  address             TEXT NOT NULL DEFAULT '',
  google_maps_url     TEXT,

  -- Image gallery (array of public URLs)
  images              TEXT[] NOT NULL DEFAULT '{}',

  description         TEXT NOT NULL DEFAULT '',

  -- Layout boundary (percentage-based, 0–100, used in the 2D/3D viewer)
  boundary_x          NUMERIC(6, 3),   -- left edge %
  boundary_y          NUMERIC(6, 3),   -- top edge %
  boundary_width      NUMERIC(6, 3),   -- width %
  boundary_height     NUMERIC(6, 3),   -- height %
  boundary_points     JSONB,           -- optional polygon vertices [[x,y], ...]

  -- Geo-coordinates for the individual plot
  geo_lat             NUMERIC(10, 6),
  geo_lng             NUMERIC(10, 6),

  -- Version sync with parent project layout
  layout_version      INTEGER NOT NULL DEFAULT 1,

  -- Timestamps
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.plots IS
  'Individual plot parcels. Each belongs to one project. plot_number is display text, not primary key.';
COMMENT ON COLUMN public.plots.boundary_x IS
  'Left edge of plot boundary as percentage (0–100) of the layout image width.';
COMMENT ON COLUMN public.plots.boundary_points IS
  'Optional polygon vertices as [[x,y], ...] for irregular plot shapes.';

-- Unique plot_number within a project
ALTER TABLE public.plots
  ADD CONSTRAINT IF NOT EXISTS uq_plots_project_number UNIQUE (project_id, plot_number);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_plots_project_id ON public.plots (project_id);
CREATE INDEX IF NOT EXISTS idx_plots_status     ON public.plots (status);
CREATE INDEX IF NOT EXISTS idx_plots_category   ON public.plots (category);


-- =============================================================================
-- TABLE: leads
-- Buyer inquiries submitted from the public website.
-- Public users can INSERT (submit inquiry). Only admins can SELECT/UPDATE/DELETE.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Which project & plot the buyer is interested in
  project_id              UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  property_of_interest    TEXT NOT NULL DEFAULT '',

  -- Buyer contact details
  customer_name           TEXT NOT NULL,
  phone                   TEXT NOT NULL,
  email                   TEXT,

  -- Inquiry details
  preferred_action        TEXT NOT NULL DEFAULT 'Callback'
                            CHECK (preferred_action IN ('Site Visit', 'WhatsApp', 'Callback')),
  status                  TEXT NOT NULL DEFAULT 'New'
                            CHECK (status IN ('New', 'Contacted', 'Site Visited', 'Closed')),
  notes                   TEXT[] NOT NULL DEFAULT '{}',
  budget_lakhs            NUMERIC(8, 2),

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.leads IS
  'Buyer inquiries from the public website. Public can INSERT; only admins can read/update/delete.';

CREATE INDEX IF NOT EXISTS idx_leads_project_id ON public.leads (project_id);
CREATE INDEX IF NOT EXISTS idx_leads_status     ON public.leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);


-- =============================================================================
-- TABLE: settings
-- Singleton row for global business configuration.
-- Only one row should ever exist (enforced by id=1 convention).
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id                    INTEGER PRIMARY KEY DEFAULT 1
                          CHECK (id = 1),   -- enforces singleton
  company_name          TEXT NOT NULL DEFAULT 'Kriyaa Promoters',
  owner_name            TEXT NOT NULL DEFAULT 'Rajesh RTR',
  contact_number        TEXT NOT NULL DEFAULT '',
  business_email        TEXT NOT NULL DEFAULT '',
  locations_served      TEXT NOT NULL DEFAULT '',
  year_started          INTEGER,
  core_services         TEXT,
  udyam_registration    TEXT,
  main_project          TEXT,
  dtcp_number           TEXT,
  rera_number           TEXT,
  logo_url              TEXT,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.settings IS
  'Singleton business configuration row. Insert once; update only. Only admins can modify.';

-- Seed the singleton row on first migration (no-op if already exists)
INSERT INTO public.settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- TRIGGER FUNCTION: auto-update updated_at on row changes
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all mutable tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles', 'projects', 'plots', 'leads', 'settings']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'trg_' || t || '_updated_at'
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER trg_%I_updated_at
         BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
        t, t
      );
    END IF;
  END LOOP;
END;
$$;

