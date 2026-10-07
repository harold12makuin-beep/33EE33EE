/*
# Create wallets table

1. New Tables
- `wallets`
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to auth.users, unique)
  - `balance_cop` (bigint, NOT NULL, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
2. Security
- RLS enabled
- Users can only read their own wallet
- balance_cop is NOT directly writable by users — only via SECURITY DEFINER functions
- Column-level: REVOKE UPDATE, GRANT UPDATE (updated_at) only (effectively read-only for users)
3. Important Notes
- balance_cop is in COP cents-equivalent (bigint to avoid float issues) — actually stored as whole pesos
- All balance changes go through server-side functions
*/

CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_cop bigint NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallets_select_own" ON wallets;
CREATE POLICY "wallets_select_own"
ON wallets FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wallets_insert_own" ON wallets;
CREATE POLICY "wallets_insert_own"
ON wallets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users cannot directly update wallet balance
DROP POLICY IF EXISTS "wallets_update_own" ON wallets;
CREATE POLICY "wallets_update_own"
ON wallets FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

REVOKE UPDATE ON wallets FROM authenticated;
-- No column-level UPDATE grant: balance is function-controlled only

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);