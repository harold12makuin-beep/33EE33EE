/*
# Create investment_packages table

1. New Tables
- `investment_packages`
  - `id` (uuid, PK)
  - `company_id` (uuid, FK to companies)
  - `investment_amount` (bigint, NOT NULL) — COP
  - `simulated_daily_profit` (bigint, NOT NULL) — COP per day
  - `duration_days` (integer, default 30)
  - `created_at` (timestamptz)
2. Security
- RLS enabled
- All authenticated users can read packages (public)
- Only admins can insert/update/delete
3. Important Notes
- Each company has packages at different amounts
- simulated_daily_profit is the absolute COP profit per day
*/

CREATE TABLE IF NOT EXISTS investment_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  investment_amount bigint NOT NULL,
  simulated_daily_profit bigint NOT NULL,
  duration_days integer NOT NULL DEFAULT 30,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE investment_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "packages_select_all" ON investment_packages;
CREATE POLICY "packages_select_all"
ON investment_packages FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "packages_admin_write" ON investment_packages;
CREATE POLICY "packages_admin_write"
ON investment_packages FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_packages_company ON investment_packages(company_id);
CREATE INDEX IF NOT EXISTS idx_packages_amount ON investment_packages(investment_amount);