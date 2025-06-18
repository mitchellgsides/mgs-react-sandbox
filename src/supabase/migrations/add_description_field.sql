-- Add description field to activities table if it doesn't exist
-- This migration ensures that activities have a user-editable description field

ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comment for documentation
COMMENT ON COLUMN activities.description IS 'User-editable activity description';

-- Create index for text search on descriptions (optional, for future search functionality)
CREATE INDEX IF NOT EXISTS idx_activities_description ON activities USING gin(to_tsvector('english', description)) WHERE description IS NOT NULL;
