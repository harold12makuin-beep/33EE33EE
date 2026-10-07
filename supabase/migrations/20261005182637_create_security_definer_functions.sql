/*
# Create SECURITY DEFINER functions for core operations

1. Functions Created
- `create_investment(p_package_id uuid, p_company_id uuid)` — creates investment, deducts balance, logs transaction + notification
- `process_profit_updates()` — processes all due profit updates server-side
- `create_deposit(p_amount bigint, p_method text)` — creates pending deposit transaction (no balance credit yet)
- `approve_deposit(p_transaction_id uuid)` — admin approves deposit, credits balance
- `request_withdrawal(p_amount bigint, p_method text)` — creates withdrawal request + pending transaction
- `create_reinvestment(p_source_investment_id uuid, p_package_id uuid, p_company_id uuid)` — reinvests accumulated profit
- `create_notification(p_user_id uuid, p_title text, p_message text)` — internal helper
2. Security
- All functions are SECURITY DEFINER with SET search_path = public
- EXECUTE revoked from anon, granted to authenticated
- All mutations validate server-side: balance checks, amount bounds, ownership
3. Important Notes
- No client can directly modify balance, profit, or investment status
- Profit updates use server timestamps (now()) not client-supplied values
- Deposits start as PENDING — only admin approval credits balance (Wompi-ready)
*/

-- Helper: create notification
CREATE OR REPLACE FUNCTION create_notification(p_user_id uuid, p_title text, p_message text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message)
  VALUES (p_user_id, p_title, p_message);
END;
$$;

REVOKE EXECUTE ON FUNCTION create_notification FROM anon;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;

-- Create investment: validates balance, deducts, creates investment + transaction + notification
CREATE OR REPLACE FUNCTION create_investment(p_package_id uuid, p_company_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_wallet wallets%ROWTYPE;
  v_pkg investment_packages%ROWTYPE;
  v_company companies%ROWTYPE;
  v_investment_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Fetch package and validate it belongs to the company
  SELECT * INTO v_pkg FROM investment_packages WHERE id = p_package_id;
  IF v_pkg IS NULL THEN
    RAISE EXCEPTION 'Package not found';
  END IF;
  IF v_pkg.company_id != p_company_id THEN
    RAISE EXCEPTION 'Package does not belong to this company';
  END IF;

  -- Fetch company and validate active
  SELECT * INTO v_company FROM companies WHERE id = p_company_id AND is_active = true;
  IF v_company IS NULL THEN
    RAISE EXCEPTION 'Company not found or inactive';
  END IF;

  -- Fetch wallet
  SELECT * INTO v_wallet FROM wallets WHERE user_id = v_user_id;
  IF v_wallet IS NULL THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  -- Check sufficient balance
  IF v_wallet.balance_cop < v_pkg.investment_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Deduct balance
  UPDATE wallets SET balance_cop = balance_cop - v_pkg.investment_amount, updated_at = now()
  WHERE user_id = v_user_id;

  -- Create investment
  INSERT INTO investments (
    user_id, company_id, package_id, principal_amount,
    status, started_at, last_profit_update, next_profit_update
  )
  VALUES (
    v_user_id, p_company_id, p_package_id, v_pkg.investment_amount,
    'active', now(), now(), now() + interval '24 hours'
  )
  RETURNING id INTO v_investment_id;

  -- Log transaction
  INSERT INTO transactions (user_id, type, amount, currency, status, description)
  VALUES (v_user_id, 'investment', v_pkg.investment_amount, 'COP', 'approved',
    'Inversión en ' || v_company.name);

  -- Notification
  PERFORM create_notification(v_user_id, 'Nueva inversión',
    'Has invertido ' || v_pkg.investment_amount || ' COP en ' || v_company.name);

  RETURN v_investment_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION create_investment FROM anon;
GRANT EXECUTE ON FUNCTION create_investment TO authenticated;

-- Process profit updates: checks all due investments, credits profit
CREATE OR REPLACE FUNCTION process_profit_updates()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
  v_rec RECORD;
  v_pkg investment_packages%ROWTYPE;
  v_company companies%ROWTYPE;
  v_cycles integer;
  v_profit bigint;
BEGIN
  FOR v_rec IN
    SELECT i.* FROM investments i
    WHERE i.status = 'active'
    AND i.next_profit_update <= now()
  LOOP
    -- Get package for profit amount
    SELECT * INTO v_pkg FROM investment_packages WHERE id = v_rec.package_id;
    IF v_pkg IS NULL THEN
      CONTINUE;
    END IF;

    -- Calculate how many 24h cycles have passed
    v_cycles := EXTRACT(epoch FROM (now() - v_rec.last_profit_update)) / 86400;
    IF v_cycles < 1 THEN
      v_cycles := 1;
    END IF;

    v_profit := v_pkg.simulated_daily_profit * v_cycles;

    -- Update investment
    UPDATE investments
    SET accumulated_simulated_profit = accumulated_simulated_profit + v_profit,
        last_profit_update = last_profit_update + (v_cycles || ' hours')::interval * 24,
        next_profit_update = last_profit_update + (v_cycles || ' hours')::interval * 24 + interval '24 hours',
        updated_at = now()
    WHERE id = v_rec.id;

    -- Log profit history
    INSERT INTO profit_history (investment_id, user_id, amount)
    VALUES (v_rec.id, v_rec.user_id, v_profit);

    -- Credit to wallet
    UPDATE wallets SET balance_cop = balance_cop + v_profit, updated_at = now()
    WHERE user_id = v_rec.user_id;

    -- Log transaction
    SELECT * INTO v_company FROM companies WHERE id = v_rec.company_id;
    INSERT INTO transactions (user_id, type, amount, currency, status, description)
    VALUES (v_rec.user_id, 'profit', v_profit, 'COP', 'approved',
      'Ganancia simulada de ' || COALESCE(v_company.name, 'empresa'));

    -- Notification
    PERFORM create_notification(v_rec.user_id, 'Ganancia simulada',
      'Has ganado ' || v_profit || ' COP simulados');

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION process_profit_updates FROM anon;
GRANT EXECUTE ON FUNCTION process_profit_updates TO authenticated;

-- Create deposit (pending — no balance credit)
CREATE OR REPLACE FUNCTION create_deposit(p_amount bigint, p_method text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_tx_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_amount IS NULL OR p_amount < 1000 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;
  IF p_method IS NULL OR p_method = '' THEN
    RAISE EXCEPTION 'Method required';
  END IF;

  INSERT INTO transactions (user_id, type, amount, currency, status, description)
  VALUES (v_user_id, 'deposit', p_amount, 'COP', 'pending',
    'Recarga vía ' || p_method)
  RETURNING id INTO v_tx_id;

  PERFORM create_notification(v_user_id, 'Recarga en proceso',
    'Tu recarga de ' || p_amount || ' COP está pendiente de confirmación.');

  RETURN v_tx_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION create_deposit FROM anon;
GRANT EXECUTE ON FUNCTION create_deposit TO authenticated;

-- Admin: approve deposit and credit balance
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
  SELECT role INTO v_admin_role FROM profiles WHERE id = v_admin_role;
  IF v_admin_role IS NULL THEN
    SELECT role INTO v_admin_role FROM profiles WHERE id = v_admin_id;
  END IF;
  IF v_admin_role != 'admin' THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO v_tx FROM transactions WHERE id = p_transaction_id AND type = 'deposit' AND status = 'pending';
  IF v_tx IS NULL THEN
    RAISE EXCEPTION 'Transaction not found or already processed';
  END IF;

  -- Credit balance
  UPDATE wallets SET balance_cop = balance_cop + v_tx.amount, updated_at = now()
  WHERE user_id = v_tx.user_id;

  -- Mark approved
  UPDATE transactions SET status = 'approved' WHERE id = p_transaction_id;

  PERFORM create_notification(v_tx.user_id, 'Recarga aprobada',
    'Tu recarga de ' || v_tx.amount || ' COP ha sido acreditada.');
END;
$$;

REVOKE EXECUTE ON FUNCTION approve_deposit FROM anon;
GRANT EXECUTE ON FUNCTION approve_deposit TO authenticated;

-- Request withdrawal (deducts balance immediately, creates pending withdrawal)
CREATE OR REPLACE FUNCTION request_withdrawal(p_amount bigint, p_method text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_wallet wallets%ROWTYPE;
  v_w_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_amount IS NULL OR p_amount < 1000 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;
  IF p_method IS NULL OR p_method = '' THEN
    RAISE EXCEPTION 'Method required';
  END IF;

  SELECT * INTO v_wallet FROM wallets WHERE user_id = v_user_id;
  IF v_wallet IS NULL THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;
  IF v_wallet.balance_cop < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Deduct balance immediately
  UPDATE wallets SET balance_cop = balance_cop - p_amount, updated_at = now()
  WHERE user_id = v_user_id;

  -- Create withdrawal record
  INSERT INTO withdrawals (user_id, amount, currency, method, status)
  VALUES (v_user_id, p_amount, 'COP', p_method, 'pending')
  RETURNING id INTO v_w_id;

  -- Log transaction
  INSERT INTO transactions (user_id, type, amount, currency, status, description)
  VALUES (v_user_id, 'withdrawal', p_amount, 'COP', 'pending',
    'Retiro vía ' || p_method);

  PERFORM create_notification(v_user_id, 'Retiro solicitado',
    'Tu retiro de ' || p_amount || ' COP está en proceso.');

  RETURN v_w_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION request_withdrawal FROM anon;
GRANT EXECUTE ON FUNCTION request_withdrawal TO authenticated;

-- Reinvest: uses accumulated profit from one investment to create a new one
CREATE OR REPLACE FUNCTION create_reinvestment(p_source_investment_id uuid, p_package_id uuid, p_company_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_source investments%ROWTYPE;
  v_pkg investment_packages%ROWTYPE;
  v_company companies%ROWTYPE;
  v_wallet wallets%ROWTYPE;
  v_new_inv_id uuid;
  v_reinvest_amount bigint;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate source investment ownership
  SELECT * INTO v_source FROM investments WHERE id = p_source_investment_id;
  IF v_source IS NULL OR v_source.user_id != v_user_id THEN
    RAISE EXCEPTION 'Investment not found';
  END IF;
  IF v_source.accumulated_simulated_profit <= 0 THEN
    RAISE EXCEPTION 'No accumulated profit to reinvest';
  END IF;

  -- Validate package
  SELECT * INTO v_pkg FROM investment_packages WHERE id = p_package_id;
  IF v_pkg IS NULL THEN
    RAISE EXCEPTION 'Package not found';
  END IF;
  IF v_pkg.company_id != p_company_id THEN
    RAISE EXCEPTION 'Package does not belong to this company';
  END IF;

  -- Validate company
  SELECT * INTO v_company FROM companies WHERE id = p_company_id AND is_active = true;
  IF v_company IS NULL THEN
    RAISE EXCEPTION 'Company not found or inactive';
  END IF;

  -- The reinvest amount is the accumulated profit
  v_reinvest_amount := v_source.accumulated_simulated_profit;

  -- Check wallet balance (profit was already credited to wallet by process_profit_updates)
  SELECT * INTO v_wallet FROM wallets WHERE user_id = v_user_id;
  IF v_wallet IS NULL THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;
  IF v_wallet.balance_cop < v_reinvest_amount THEN
    RAISE EXCEPTION 'Insufficient balance for reinvestment';
  END IF;

  -- Deduct from wallet
  UPDATE wallets SET balance_cop = balance_cop - v_reinvest_amount, updated_at = now()
  WHERE user_id = v_user_id;

  -- Mark source investment as reinvested
  UPDATE investments SET status = 'reinvested', updated_at = now()
  WHERE id = p_source_investment_id;

  -- Create new investment
  INSERT INTO investments (
    user_id, company_id, package_id, principal_amount,
    status, started_at, last_profit_update, next_profit_update
  )
  VALUES (
    v_user_id, p_company_id, p_package_id, v_reinvest_amount,
    'active', now(), now(), now() + interval '24 hours'
  )
  RETURNING id INTO v_new_inv_id;

  -- Log transaction
  INSERT INTO transactions (user_id, type, amount, currency, status, description)
  VALUES (v_user_id, 'reinvestment', v_reinvest_amount, 'COP', 'approved',
    'Reinversión en ' || v_company.name);

  -- Notification
  PERFORM create_notification(v_user_id, 'Reinversión realizada',
    'Has reinvertido ' || v_reinvest_amount || ' COP en ' || v_company.name);

  RETURN v_new_inv_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION create_reinvestment FROM anon;
GRANT EXECUTE ON FUNCTION create_reinvestment TO authenticated;