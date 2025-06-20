-- supabase/migrations/YYYYMMDDHHMMSS_create_user_profile_function_and_trigger.sql

-- Ensure the profiles table exists (idempotent check or assume it's created)
-- If you haven't created the profiles table yet, you should add its CREATE TABLE statement here first.
-- For this example, I'm assuming the profiles table is already created as per previous steps.

-- Function to insert a new profile row when a user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'full_name',
      SUBSTRING(SPLIT_PART(NEW.email, '@', 1) || '-' || SUBSTRING(NEW.id::text, 1, 4) FOR 255) -- Ensure username fits column
    )
  );
  RETURN NEW;
END;
$$;

-- Drop the trigger first if it already exists to make the script idempotent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to call the function after a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

