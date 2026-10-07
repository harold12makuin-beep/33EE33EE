/*
# Create profiles table

1. New Tables
- `profiles`
  - `id` (uuid, primary key, references auth.users on delete cascade)
  - `full_name` (text, not null)
  - `email` (text, not null)
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `profiles`.
- Owner-scoped CRUD: each authenticated user can only access their own profile row.
- SELECT, INSERT, UPDATE, DELETE policies scoped to auth.uid() = id.
3. Important Notes
- The `id` column defaults to `auth.uid()` so inserts that omit it still satisfy the INSERT policy.
- Email confirmation is OFF (default Supabase behavior).
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);