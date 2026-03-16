
-- Add tags column to room_images table
ALTER TABLE room_images 
ADD COLUMN IF NOT EXISTS tags text;

-- Policy ensures existing logic handles this, but good to confirm permissions if RLS is strict
-- (Assuming existing policies cover update/insert for authenticated admins)
