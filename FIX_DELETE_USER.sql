-- 1. Drop the existing strict constraint (if it exists)
-- harmless if it doesn't exist, but good practice to check names
ALTER TABLE bookmarks
DROP CONSTRAINT IF EXISTS bookmarks_user_id_fkey;

-- 2. Add the new constraint with ON DELETE CASCADE
-- This means: "If a User is deleted, also delete their Bookmarks automatically"
ALTER TABLE bookmarks
ADD CONSTRAINT bookmarks_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 3. Create a secure function to allow users to delete themselves
-- This function runs with elevated privileges (SECURITY DEFINER) but is restricted to the current user's ID.
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
