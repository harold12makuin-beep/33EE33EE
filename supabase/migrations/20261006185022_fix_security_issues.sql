/*
# Fix security issues: column privileges, function grants, approve_deposit bug

1. Security Fixes
- profiles: REVOKE INSERT on `role` column — users can't set their own role to 'admin'
- wallets: REVOKE INSERT from authenticated entirely — only the trigger creates wallets
- wallets: REVOKE DELETE from authenticated — users can't delete their wallet
- All SECURITY DEFINER functions: REVOKE EXECUTE from anon (was still granted despite earlier revoke)
- approve_deposit: fix bug where admin check used wrong variable
2. Cleanup
- investment_packages: REVOKE INSERT, UPDATE, DELETE from authenticated (admin-only via policy)
- investments: REVOKE INSERT, UPDATE, DELETE from authenticated (function-only)
- profit_history: REVOKE INSERT, UPDATE, DELETE from authenticated (function-only)
- transactions: REVOKE INSERT, UPDATE, DELETE from authenticated (function-only)
- withdrawals: REVOKE INSERT, UPDATE, DELETE from authenticated (function-only)
3. Important Notes
- The trigger `handle_new_user()` runs as SECURITY DEFINER, so it bypasses RLS and can still create profiles and wallets
- All privileged mutations go through SECURITY DEFINER functions which run as the owner
- No data is lost — only privileges are tightened
*/

-- Fix profiles: prevent users from inserting role column
REVOKE INSERT ON profiles FROM authenticated;
GRANT INSERT (id, full_name, email) ON profiles TO authenticated;

-- Fix wallets: users cannot insert or delete wallets (trigger handles creation)
REVOKE INSERT ON wallets FROM authenticated;
REVOKE DELETE ON wallets FROM authenticated;

-- Clean up: investment_packages — admin-only writes, users only read
REVOKE INSERT ON investment_packages FROM authenticated;
REVOKE UPDATE ON investment_packages FROM authenticated;
REVOKE DELETE ON investment_packages FROM authenticated;

-- Clean up: investments — function-only mutations, users only read
REVOKE INSERT ON investments FROM authenticated;
REVOKE UPDATE ON investments FROM authenticated;
REVOKE DELETE ON investments FROM authenticated;

-- Clean up: profit_history — function-only mutations, users only read
REVOKE INSERT ON profit_history FROM authenticated;
REVOKE UPDATE ON profit_history FROM authenticated;
REVOKE DELETE ON profit_history FROM authenticated;

-- Clean up: transactions — function-only mutations, users only read
REVOKE INSERT ON transactions FROM authenticated;
REVOKE UPDATE ON transactions FROM authenticated;
REVOKE DELETE ON transactions FROM authenticated;

-- Clean up: withdrawals — function-only mutations, users only read
REVOKE INSERT ON withdrawals FROM authenticated;
REVOKE UPDATE ON withdrawals FROM authenticated;
REVOKE DELETE ON withdrawals FROM authenticated;

-- Revoke EXECUTE from anon on all SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION create_notification FROM anon;
REVOKE EXECUTE ON FUNCTION create_investment FROM anon;
REVOKE EXECUTE ON FUNCTION process_profit_updates FROM anon;
REVOKE EXECUTE ON FUNCTION create_deposit FROM anon;
REVOKE EXECUTE ON FUNCTION approve_deposit FROM anon;
REVOKE EXECUTE ON FUNCTION request_withdrawal FROM anon;
REVOKE EXECUTE ON FUNCTION create_reinvestment FROM anon;

-- Fix approve_deposit function: bug in admin check
CREATE OR REPLACE FUNCTION approve_deposit(p_transaction_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_admin_role text;
  v_tx transactions%ROWTYPE;
BEGIN
  SELECT role INTO v_admin_role FROM profiles WHERE id = v_admin_id;
  IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO v_tx FROM transactions WHERE id = p_transaction_id AND type = 'deposit' AND status = 'pending';
  IF v_tx IS NULL THEN
    RAISE EXCEPTION 'Transaction not found or already processed';
  END IF;

  UPDATE wallets SET balance_cop = balance_cop + v_tx.amount, updated_at = now()
  WHERE user_id = v_tx.user_id;

  UPDATE transactions SET status = 'approved' WHERE id = p_transaction_id;

  PERFORM create_notification(v_tx.user_id, 'Recarga aprobada',
    'Tu recarga de ' || v_tx.amount || ' COP ha sido acreditada.');
END;
$$;