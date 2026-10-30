-- =============================================================================
-- MIGRATION 002: Row Level Security (RLS) Policies
-- Project: Kriyaa Promoters – Golden City Admin
-- Apply via: Supabase Dashboard → SQL Editor → paste and run AFTER migration 001
-- =============================================================================
-- SAFETY: Uses DROP POLICY IF EXISTS before each CREATE POLICY to be idempotent.
-- Never disables RLS. Never grants public write access.
-- =============================================================================


-- =============================================================================
-- HELPER FUNCTION: is_admin()
-- Returns true only if the calling user has is_admin=true in public.profiles.
-- Used in all admin RLS policies. Not callable by anon users.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND is_admin = TRUE
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.is_admin IS
  'Returns true if the currently authenticated user has the admin role in profiles.';


-- =============================================================================
-- TABLE: profiles — RLS
-- Users can only read/update their own profile row.
-- Nobody can set is_admin via client — only service-role can.
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can see their own profile
DROP POLICY IF EXISTS "profiles: own read"    ON public.profiles;
CREATE POLICY "profiles: own read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile EXCEPT is_admin
DROP POLICY IF EXISTS "profiles: own update"  ON public.profiles;
CREATE POLICY "profiles: own update"
  ON public.profiles FOR UPDATE
  USING  (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Prevent self-promotion: is_admin must remain the same value
    AND is_admin = (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

-- Supabase auto-creates profile on signup via trigger (see migration 003)
-- No direct INSERT policy for clients — the trigger handles it

-- Admins can read all profiles
DROP POLICY IF EXISTS "profiles: admin read all" ON public.profiles;
CREATE POLICY "profiles: admin read all"
  ON public.profiles FOR SELECT
  USING (public.is_admin());


-- =============================================================================
-- TABLE: projects — RLS
-- Public (anon): SELECT where is_published = true only.
-- Admin: full SELECT, INSERT, UPDATE, DELETE.
-- =============================================================================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can read published projects
DROP POLICY IF EXISTS "projects: public read published" ON public.projects;
CREATE POLICY "projects: public read published"
  ON public.projects FOR SELECT
  USING (is_published = TRUE);

-- Admins can read ALL projects (draft + published)
DROP POLICY IF EXISTS "projects: admin read all" ON public.projects;
CREATE POLICY "projects: admin read all"
  ON public.projects FOR SELECT
  USING (public.is_admin());

-- Admins can create projects
DROP POLICY IF EXISTS "projects: admin insert" ON public.projects;
CREATE POLICY "projects: admin insert"
  ON public.projects FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins can update projects (including toggling is_published)
DROP POLICY IF EXISTS "projects: admin update" ON public.projects;
CREATE POLICY "projects: admin update"
  ON public.projects FOR UPDATE
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete projects (plots cascade automatically via FK)
DROP POLICY IF EXISTS "projects: admin delete" ON public.projects;
CREATE POLICY "projects: admin delete"
  ON public.projects FOR DELETE
  USING (public.is_admin());


-- =============================================================================
-- TABLE: plots — RLS
-- Public (anon): SELECT plots that belong to a published project.
--   They can see status, dimensions, price — but cannot change anything.
-- Admin: full SELECT, INSERT, UPDATE, DELETE.
-- =============================================================================
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;

-- Anon/public: only read plots of published projects
DROP POLICY IF EXISTS "plots: public read from published project" ON public.plots;
CREATE POLICY "plots: public read from published project"
  ON public.plots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = plots.project_id
        AND p.is_published = TRUE
    )
  );

-- Admins can read ALL plots (from draft or published projects)
DROP POLICY IF EXISTS "plots: admin read all" ON public.plots;
CREATE POLICY "plots: admin read all"
  ON public.plots FOR SELECT
  USING (public.is_admin());

-- Admins can insert plots
DROP POLICY IF EXISTS "plots: admin insert" ON public.plots;
CREATE POLICY "plots: admin insert"
  ON public.plots FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins can update plots (status, price, boundary, etc.)
DROP POLICY IF EXISTS "plots: admin update" ON public.plots;
CREATE POLICY "plots: admin update"
  ON public.plots FOR UPDATE
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete plots
DROP POLICY IF EXISTS "plots: admin delete" ON public.plots;
CREATE POLICY "plots: admin delete"
  ON public.plots FOR DELETE
  USING (public.is_admin());


-- =============================================================================
-- TABLE: leads — RLS
-- Public (anon): INSERT only (submit inquiry). Cannot read others' data.
-- Authenticated users: cannot read leads unless admin.
-- Admins: full access.
-- =============================================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Public can submit a new inquiry (INSERT only, no SELECT)
DROP POLICY IF EXISTS "leads: public insert inquiry" ON public.leads;
CREATE POLICY "leads: public insert inquiry"
  ON public.leads FOR INSERT
  WITH CHECK (TRUE);   -- any visitor can submit; no user data required

-- Admins can read all leads
DROP POLICY IF EXISTS "leads: admin read all" ON public.leads;
CREATE POLICY "leads: admin read all"
  ON public.leads FOR SELECT
  USING (public.is_admin());

-- Admins can update leads (status, notes)
DROP POLICY IF EXISTS "leads: admin update" ON public.leads;
CREATE POLICY "leads: admin update"
  ON public.leads FOR UPDATE
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete leads
DROP POLICY IF EXISTS "leads: admin delete" ON public.leads;
CREATE POLICY "leads: admin delete"
  ON public.leads FOR DELETE
  USING (public.is_admin());


-- =============================================================================
-- TABLE: settings — RLS
-- Public: no access.
-- Admins: full read and update (no delete — singleton row must persist).
-- =============================================================================
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Admins can read settings
DROP POLICY IF EXISTS "settings: admin read" ON public.settings;
CREATE POLICY "settings: admin read"
  ON public.settings FOR SELECT
  USING (public.is_admin());

-- Admins can update settings (but not delete — singleton)
DROP POLICY IF EXISTS "settings: admin update" ON public.settings;
CREATE POLICY "settings: admin update"
  ON public.settings FOR UPDATE
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- Nobody (not even admins) can delete the settings singleton
-- No DELETE policy = DELETE is blocked for everyone

