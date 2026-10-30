-- =============================================================================
-- MIGRATION 005: Schema Sync & Seed Initial Projects and Plots
-- Project: Kriyaa Promoters – Golden City Admin
-- Apply via: Supabase Dashboard → SQL Editor → Run
-- =============================================================================

-- 1. Ensure boundary column exists on properties for 2D/3D coordinates
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS boundary JSONB;

-- 2. Ensure layout_image_url and is_published exist on projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS layout_image_url TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS layout_version INTEGER NOT NULL DEFAULT 1;

-- 3. Allow public visitors to submit inquiries into leads
DROP POLICY IF EXISTS "leads: public insert" ON public.leads;
CREATE POLICY "leads: public insert"
  ON public.leads FOR INSERT
  WITH CHECK (true);

-- 4. Allow public visitors to read published projects and properties
DROP POLICY IF EXISTS "projects: public read" ON public.projects;
CREATE POLICY "projects: public read"
  ON public.projects FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "properties: public read" ON public.properties;
CREATE POLICY "properties: public read"
  ON public.properties FOR SELECT
  USING (true);

-- 5. Seed Flagship Project: Golden City (if not already present)
INSERT INTO public.projects (
  name, location, district, dtcp_number, rera_number, master_plan_image,
  description, status, total_area_extent, launch_year
)
SELECT
  'Golden City', 'Cuddalore', 'Cuddalore District', 'DTCP No. 182/2023',
  'TN/RERA/0428/2024',
  'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1400&q=85',
  'Flagship 12.5-acre residential & commercial township along NH Bypass Corridor with 40ft/60ft avenue roads, potable sweet water, and underground power.',
  'Active', '12.5 Acres', 2023
WHERE NOT EXISTS (
  SELECT 1 FROM public.projects WHERE name = 'Golden City'
);

-- Seed Project 2: Chidambaram Plots
INSERT INTO public.projects (
  name, location, district, dtcp_number, rera_number, master_plan_image,
  description, status, total_area_extent, launch_year
)
SELECT
  'Chidambaram Plots', 'Chidambaram', 'Cuddalore District', 'DTCP No. 94/2022',
  'TN/RERA/0115/2023',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
  'Serene temple-town residential layout near Annamalai University Ring Road featuring Vastu-compliant villa plots, avenue plantation, and park reserves.',
  'Active', '8.2 Acres', 2022
WHERE NOT EXISTS (
  SELECT 1 FROM public.projects WHERE name = 'Chidambaram Plots'
);

-- Seed Project 3: Pondy Heights
INSERT INTO public.projects (
  name, location, district, dtcp_number, rera_number, master_plan_image,
  description, status, total_area_extent, launch_year
)
SELECT
  'Pondy Heights', 'Pondy ECR', 'Puducherry Border', 'DTCP No. 215/2024',
  'PY/RERA/0082/2024',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=85',
  'High-appreciation gated beachside corridor enclave along the East Coast Road with solar street illumination, storm-water drainage, and security surveillance.',
  'Upcoming', '15.0 Acres', 2024
WHERE NOT EXISTS (
  SELECT 1 FROM public.projects WHERE name = 'Pondy Heights'
);

