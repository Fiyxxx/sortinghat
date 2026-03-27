-- Student Profiles Table
CREATE TABLE student_profiles (
  -- Primary key & metadata
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Personality scores (computed from quiz, 0.0 to 1.0)
  extraversion DECIMAL(3,2),
  openness DECIMAL(3,2),
  agreeableness DECIMAL(3,2),
  conscientiousness DECIMAL(3,2),
  social_catalyst_score DECIMAL(3,2),

  -- Preferences
  room_type_preference TEXT,
  gender_floor_preference TEXT,
  sleep_schedule DECIMAL(3,2),
  noise_tolerance DECIMAL(3,2),
  aircon_usage TEXT,

  -- Open-ended responses
  hope_to_experience TEXT,
  floor_event_idea TEXT,

  -- Special considerations
  requires_accessibility BOOLEAN DEFAULT false,

  -- Raw quiz responses (JSONB for backup)
  raw_responses JSONB
);

-- Indexes for common queries
CREATE INDEX idx_student_profiles_created_at ON student_profiles(created_at);
CREATE INDEX idx_student_profiles_accessibility ON student_profiles(requires_accessibility);

-- Enable Row Level Security (RLS)
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for quiz submissions)
CREATE POLICY "Allow anonymous quiz submissions"
  ON student_profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow service role full access (for HR dashboard later)
CREATE POLICY "Allow service role full access"
  ON student_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
