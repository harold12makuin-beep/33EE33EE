/*
# Create trigger: auto-create wallet on signup

1. Functions
- `handle_new_user()` — trigger function that creates a profile row and wallet for new auth.users
2. Triggers
- `on_auth_user_created` — AFTER INSERT on auth.users
3. Important Notes
- Automatically creates wallet with 0 balance when a user signs up
- Profile is also created here as backup (in case the frontend insert is skipped)
- The frontend also creates the profile row; the trigger uses ON CONFLICT to avoid duplicates
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO wallets (user_id, balance_cop)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();