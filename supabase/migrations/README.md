# Supabase Migrations — Kriyaa Promoters

## Files

| File | Purpose |
|---|---|
| `001_create_tables.sql` | Creates `profiles`, `projects`, `plots`, `leads`, `settings` tables |
| `002_rls_policies.sql` | Row Level Security policies — all tables |
| `003_auth_trigger.sql` | Auto-creates profile on signup; explains first-admin setup |
| `004_storage_buckets.sql` | `layout-files` storage bucket + access policies |

---

## How to Apply

1. Go to [https://supabase.com/dashboard/project/zgvnivjopxmzdbbdyijq/sql/new](https://supabase.com/dashboard/project/zgvnivjopxmzdbbdyijq/sql/new)
2. Open each file **in order** (001 → 002 → 003 → 004)
3. Copy the full contents and paste into the SQL editor
4. Click **Run**
5. Verify it completes with no errors before moving to the next file

> ⚠️ Run them **in order**. Migration 002 depends on tables from 001. Migration 003 depends on the auth trigger. Migration 004 depends on the `is_admin()` function from 002.

---

## After Migration 003 — Set the First Admin

After Rajesh signs up via the app login page, run this **once** in the Supabase SQL Editor:

```sql
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'kriyaapromoters@gmail.com';
```

> This **must** be done from the Supabase Dashboard SQL Editor.
> It cannot be done from the React app — the RLS policy blocks clients from changing `is_admin`.

---

## What Already Exists (Before Running Migrations)

The Supabase project at `zgvnivjopxmzdbbdyijq` is freshly connected — **no tables exist yet**. All migrations are safe to run on a blank schema.

---

## Security Summary

| Rule | Status |
|---|---|
| RLS enabled on all tables | ✅ |
| Anon key used in frontend only | ✅ |
| Service-role key never in React code | ✅ |
| Public cannot write plot prices/status | ✅ — only admins can UPDATE plots |
| Public cannot grant themselves admin | ✅ — `is_admin` blocked in UPDATE policy |
| Leads: public can submit, not read | ✅ |
| Storage: draft files not publicly readable | ✅ |

