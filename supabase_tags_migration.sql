-- Add tags column to hotel_images table
ALTER TABLE hotel_images ADD COLUMN IF NOT EXISTS tags text;
-- Also for room_images if needed later, but user said Property first.
-- ALTER TABLE room_images ADD COLUMN IF NOT EXISTS tags text;
