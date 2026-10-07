/*
# Create investments table

1. New Tables
- `investments`
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to auth.users, default auth.uid())
  - `company_id` (uuid, FK to companies)
  - `package_id` (uuid, FK to investment_packages)
  - `principal_amount` (bigint, NOT NULL) — COP invested
  - `accumulated_simulated_profit` (bigint, NOT NULL, default 0)
  - `status` (text, NOT NULL, default 'active') — 'active', 'completed', 'reinvested'
  - `started_at` (timestamptz)
  - `last_profit_update` (timestamptz)
  - `next_profit_update` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
2. Security
- RLS enabled, owner-scoped
- Users can read own investments
- INSERT only via SECURITY DEFINER function (create_investment)
- UPDATE to status/profit only via SECURITY DEFINER function (process_profit_updates)
- Users cannot directly insert or update investments
3. Important Notes
- All investment creation goes through create_investment() function
- Profit accumulation goes through process_profit_updates() function
*/

CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES investment_packages(id) ON DELETE CASCADE,
  principal_amount bigint NOT NULL,
  accumulated_simulated_profit bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  last_profit_update timestamptz DEFAULT now(),
  next_profit_update timestamptz DEFAULT now() + interval '24 hours',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "investments_select_own" ON investments;
CREATE POLICY "investments_select_own"
ON investments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for users — all via functions
-- Admins can read all
DROP POLICY IF EXISTS "investments_admin_select" ON investments;
CREATE POLICY "investments_admin_select"
ON investments FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_next_update ON investments(next_profit_update);