-- =============================================================================
-- MIGRATION 004: Supabase Storage Buckets for Layout Files
-- Project: Kriyaa Promoters – Golden City Admin
-- Apply via: Supabase Dashboard → SQL Editor → paste and run AFTER migration 003
-- =============================================================================
-- Creates a 'layout-files' bucket for project layout images and PDFs.
-- Public read is allowed ONLY for files in the 'public/' folder prefix,
-- which admins use for published project layouts.
-- =============================================================================

-- Create the bucket (safe to re-run — no-op if it already exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'layout-files',
  'layout-files',
  FALSE,               -- NOT globally public; access controlled by policies below
  52428800,            -- 50 MB max per file
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE storage.buckets IS
  'layout-files bucket: stores project master plan images and PDFs.';


-- =============================================================================
-- STORAGE POLICIES: layout-files bucket
-- =============================================================================

-- ─── PUBLIC READ: published layout images ────────────────────────────────────
-- Any visitor can read files under the 'public/' path prefix.
-- Admins upload published layout images to: public/{project_id}/layout.*
-- This mirrors the project's is_published status in the app layer.
DROP POLICY IF EXISTS "layout-files: public read published" ON storage.objects;
CREATE POLICY "layout-files: public read published"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'layout-files'
    AND (storage.foldername(name))[1] = 'public'
  );


-- ─── ADMIN UPLOAD: admins can insert files ───────────────────────────────────
DROP POLICY IF EXISTS "layout-files: admin insert" ON storage.objects;
CREATE POLICY "layout-files: admin insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'layout-files'
    AND public.is_admin()
  );


-- ─── ADMIN UPDATE: admins can replace/update files ───────────────────────────
DROP POLICY IF EXISTS "layout-files: admin update" ON storage.objects;
CREATE POLICY "layout-files: admin update"
  ON storage.objects FOR UPDATE
  USING  (bucket_id = 'layout-files' AND public.is_admin())
  WITH CHECK (bucket_id = 'layout-files' AND public.is_admin());


-- ─── ADMIN DELETE: admins can remove files ───────────────────────────────────
DROP POLICY IF EXISTS "layout-files: admin delete" ON storage.objects;
CREATE POLICY "layout-files: admin delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'layout-files' AND public.is_admin());


-- =============================================================================
-- FOLDER CONVENTION
-- =============================================================================
-- Use these paths when uploading from the admin panel:
--
--   PUBLISHED layout image:  public/{project_id}/layout.jpg
--   DRAFT layout image:      drafts/{project_id}/layout.jpg
--   Layout PDF:              public/{project_id}/layout.pdf
--
-- Only the 'public/' prefix is readable by anonymous visitors.
-- Draft files are only accessible to authenticated admins.
-- =============================================================================

