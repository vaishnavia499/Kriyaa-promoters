-- =============================================================================
-- MIGRATION 003: Auth Trigger — Auto-create profile on signup
-- Project: Kriyaa Promoters – Golden City Admin
-- Apply via: Supabase Dashboard → SQL Editor → paste and run AFTER migration 002
-- =============================================================================
-- When a user signs up via Supabase Auth, this trigger automatically inserts
-- a row in public.profiles with is_admin = FALSE.
-- The first admin must be manually set server-side (see README below).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    FALSE   -- Never auto-grant admin; must be set manually via service-role
  )
  ON CONFLICT (id) DO NOTHING;  -- safe if profile row already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach to auth.users signup event
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- HOW TO AUTHORIZE THE FIRST ADMIN ACCOUNT
-- =============================================================================
-- 
-- Step 1: Have Rajesh sign up normally through the app login page.
--         This creates an auth.users row and auto-inserts a profiles row
--         with is_admin = FALSE.
--
-- Step 2: Go to Supabase Dashboard → SQL Editor and run:
--
--   UPDATE public.profiles
--   SET is_admin = TRUE
--   WHERE email = 'kriyaapromoters@gmail.com';
--
-- This MUST be done from the Supabase SQL Editor (which uses the service-role
-- key internally). It cannot be done from the React app with the anon key
-- because the RLS policy on profiles prevents clients from changing is_admin.
--
-- Step 3: After this, that user can log in and access all admin features.
--
-- ⚠️  Never share your service-role key or database password.
-- ⚠️  Never expose this SQL in frontend code.
-- =============================================================================

