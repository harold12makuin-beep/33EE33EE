/*
# Create transactions, profit_history, withdrawals, notifications tables

1. New Tables
- `transactions`
  - id, user_id, type, amount, currency, status, reference, description, created_at
- `profit_history`
  - id, investment_id, user_id, amount, calculated_at
- `withdrawals`
  - id, user_id, amount, currency, method, status, requested_at, processed_at
- `notifications`
  - id, user_id, title, message, read, created_at
2. Security
- All tables RLS enabled, owner-scoped
- transactions: users can read own; INSERT/UPDATE via functions only
- profit_history: users can read own; INSERT via function only
- withdrawals: users can read own; INSERT via function (request_withdrawal)
- notifications: users can read own; UPDATE read flag only
3. Important Notes
- transaction types: 'deposit', 'investment', 'profit', 'reinvestment', 'withdrawal'
- transaction status: 'pending', 'approved', 'rejected'
- withdrawal status: 'pending', 'processing', 'completed', 'rejected'
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount bigint NOT NULL,
  currency text NOT NULL DEFAULT 'COP',
  status text NOT NULL DEFAULT 'pending',
  reference text,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_select_own" ON transactions;
CREATE POLICY "transactions_select_own"
ON transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "transactions_admin_select" ON transactions;
CREATE POLICY "transactions_admin_select"
ON transactions FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

CREATE TABLE IF NOT EXISTS profit_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id uuid NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount bigint NOT NULL,
  calculated_at timestamptz DEFAULT now()
);

ALTER TABLE profit_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profit_history_select_own" ON profit_history;
CREATE POLICY "profit_history_select_own"
ON profit_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_profit_history_investment ON profit_history(investment_id);
CREATE INDEX IF NOT EXISTS idx_profit_history_user ON profit_history(user_id);

CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount bigint NOT NULL,
  currency text NOT NULL DEFAULT 'COP',
  method text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "withdrawals_select_own" ON withdrawals;
CREATE POLICY "withdrawals_select_own"
ON withdrawals FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "withdrawals_admin_select" ON withdrawals;
CREATE POLICY "withdrawals_admin_select"
ON withdrawals FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own"
ON notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own"
ON notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

REVOKE UPDATE ON notifications FROM authenticated;
GRANT UPDATE (read) ON notifications TO authenticated;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read);