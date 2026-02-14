-- 1. Drop the existing strict constraint
ALTER TABLE bookmarks
DROP CONSTRAINT bookmarks_user_id_fkey;

-- 2. Add the new constraint with ON DELETE CASCADE
-- This means: "If a User is deleted, also delete their Bookmarks automatically"
ALTER TABLE bookmarks
ADD CONSTRAINT bookmarks_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
