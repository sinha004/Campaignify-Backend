-- Create campaigns table
-- Run this SQL in your Supabase SQL Editor to create the campaigns table

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  segment_id TEXT NOT NULL REFERENCES segments(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  total_users_targeted INTEGER NOT NULL DEFAULT 0,
  total_jobs_created INTEGER NOT NULL DEFAULT 0,
  total_sent INTEGER NOT NULL DEFAULT 0,
  total_failed INTEGER NOT NULL DEFAULT 0,
  flow_data JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);

-- Create index on segment_id for faster queries
CREATE INDEX IF NOT EXISTS idx_campaigns_segment_id ON campaigns(segment_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- Add comment
COMMENT ON TABLE campaigns IS 'Marketing campaigns table with segment targeting and flow builder integration';
