-- Function to delete the calling user's own account.
-- SECURITY DEFINER lets it run as the postgres role so it can
-- delete from auth.users, which the anon/authenticated roles cannot do directly.
CREATE OR REPLACE FUNCTION delete_account()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM auth.users WHERE id = auth.uid();
$$;

-- Only authenticated users can call this
REVOKE ALL ON FUNCTION delete_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION delete_account() TO authenticated;
