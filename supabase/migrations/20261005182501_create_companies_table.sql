/*
# Create companies table

1. New Tables
- `companies`
  - `id` (uuid, PK)
  - `name` (text, NOT NULL)
  - `country` (text, NOT NULL)
  - `country_code` (text)
  - `sector` (text, NOT NULL)
  - `description` (text)
  - `logo_url` (text)
  - `website_url` (text)
  - `risk_level` (text, NOT NULL, default 'Medio')
  - `simulated_daily_rate` (numeric, NOT NULL, default 0) — percentage
  - `minimum_investment` (bigint, NOT NULL, default 10000)
  - `maximum_investment` (bigint, NOT NULL, default 300000)
  - `update_frequency` (text, default '24h')
  - `is_active` (boolean, default true)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
2. Security
- RLS enabled
- All authenticated users can read companies (public directory)
- Only admins can insert/update/delete (via SECURITY DEFINER functions or direct policy)
3. Important Notes
- Companies are reference data; users read but don't modify
- risk_level: 'Bajo', 'Medio', 'Alto'
*/

CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  country_code text,
  sector text NOT NULL,
  description text,
  logo_url text,
  website_url text,
  risk_level text NOT NULL DEFAULT 'Medio',
  simulated_daily_rate numeric NOT NULL DEFAULT 0,
  minimum_investment bigint NOT NULL DEFAULT 10000,
  maximum_investment bigint NOT NULL DEFAULT 300000,
  update_frequency text DEFAULT '24h',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "companies_select_all" ON companies;
CREATE POLICY "companies_select_all"
ON companies FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify companies
DROP POLICY IF EXISTS "companies_admin_write" ON companies;
CREATE POLICY "companies_admin_write"
ON companies FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_companies_risk ON companies(risk_level);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active);