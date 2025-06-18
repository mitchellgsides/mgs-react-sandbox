-- Migration to add missing activity statistics fields to activities table
-- This ensures all CalendarActivity interface fields are properly stored

-- Add activity-level statistics fields to activities table
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS avg_speed DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS max_speed DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS avg_power INTEGER,
ADD COLUMN IF NOT EXISTS max_power INTEGER,
ADD COLUMN IF NOT EXISTS avg_heart_rate INTEGER,
ADD COLUMN IF NOT EXISTS max_heart_rate INTEGER;

-- Add indexes for better query performance on commonly filtered fields
CREATE INDEX IF NOT EXISTS idx_activities_sport ON activities(sport);
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, activity_timestamp);
CREATE INDEX IF NOT EXISTS idx_activities_avg_speed ON activities(avg_speed) WHERE avg_speed IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_avg_power ON activities(avg_power) WHERE avg_power IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_avg_hr ON activities(avg_heart_rate) WHERE avg_heart_rate IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN activities.name IS 'Human-readable activity name derived from filename';
COMMENT ON COLUMN activities.description IS 'User-editable activity description';
COMMENT ON COLUMN activities.avg_speed IS 'Average speed in meters per second';
COMMENT ON COLUMN activities.max_speed IS 'Maximum speed in meters per second';
COMMENT ON COLUMN activities.avg_power IS 'Average power in watts';
COMMENT ON COLUMN activities.max_power IS 'Maximum power in watts';
COMMENT ON COLUMN activities.avg_heart_rate IS 'Average heart rate in beats per minute';
COMMENT ON COLUMN activities.max_heart_rate IS 'Maximum heart rate in beats per minute';
