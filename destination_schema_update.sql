
-- SQL Migration to update destinations table for new features
-- Run this in your Supabase SQL Editor

ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS altitude TEXT,
ADD COLUMN IF NOT EXISTS weather_info TEXT, -- General weather summary
ADD COLUMN IF NOT EXISTS distance_from_major_hub TEXT, -- e.g. "120 km from Chandigarh"
ADD COLUMN IF NOT EXISTS languages_spoken TEXT[], -- Array of strings
ADD COLUMN IF NOT EXISTS how_to_reach JSONB DEFAULT '[]'::jsonb, -- [{ mode: "Air", hub: "...", distance: "...", ... }]
ADD COLUMN IF NOT EXISTS local_cuisine JSONB DEFAULT '{}'::jsonb, -- { intro: "...", dishes: [...] }
ADD COLUMN IF NOT EXISTS coordinates JSONB DEFAULT '{"lat": 0, "lng": 0}'::jsonb;

-- Comment on columns for clarity
COMMENT ON COLUMN destinations.altitude IS 'Altitude of the destination (e.g., "2500m")';
COMMENT ON COLUMN destinations.weather_info IS 'Brief weather summary';
COMMENT ON COLUMN destinations.how_to_reach IS 'Array of transport modes: [{ mode: string, hub: string, distance: string, time: string, details: string }]';
COMMENT ON COLUMN destinations.local_cuisine IS 'Object with intro string and dishes array: { intro: string, dishes: [{ name: string, description: string, image: string }] }';
