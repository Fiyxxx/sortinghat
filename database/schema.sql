-- Run this in the Supabase SQL Editor to reset the schema.
-- Safe to re-run on an empty database.
-- Drop in dependency order: child tables first, then parent.
DROP TABLE IF EXISTS student_allocations;
DROP TABLE IF EXISTS allocation_runs;
DROP TABLE IF EXISTS student_profiles;

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

  -- Identity
  nus_id TEXT,

  -- Admissions data (pre-filled, not from quiz)
  faculty TEXT,
  race    TEXT,

  -- Preferences
  room_type_preference TEXT,
  gender_floor_preference TEXT,
  sleep_schedule DECIMAL(3,2),

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
CREATE INDEX idx_student_profiles_nus_id ON student_profiles(nus_id);
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

-- Policy: Allow anonymous reads (for dashboard student count)
CREATE POLICY "Allow anonymous reads"
  ON student_profiles
  FOR SELECT
  TO anon
  USING (true);

-- ─── Allocation Runs Table ──────────────────────────────────────────────────

CREATE TABLE allocation_runs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  global_fitness DECIMAL(4,3),
  duration_ms    INTEGER,
  student_count  INTEGER,
  floor_scores   JSONB   -- { "2": 0.712, "3": 0.803, ... }
);

CREATE INDEX idx_runs_created_at ON allocation_runs(created_at);

ALTER TABLE allocation_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon reads on runs"
  ON allocation_runs FOR SELECT TO anon USING (true);

CREATE POLICY "Allow service role full access on runs"
  ON allocation_runs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ─── Student Allocations Table ──────────────────────────────────────────────

CREATE TABLE student_allocations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id              UUID NOT NULL REFERENCES allocation_runs(id) ON DELETE CASCADE,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  student_profile_id  UUID REFERENCES student_profiles(id),
  nus_id              TEXT,
  floor_number        INTEGER,
  unit_number         TEXT,
  room_type_assigned  TEXT,
  archetype           TEXT,
  placement_rationale TEXT,
  floor_score         DECIMAL(4,3),
  is_locked           BOOLEAN DEFAULT false
);

CREATE INDEX idx_allocations_run_id ON student_allocations(run_id);
CREATE INDEX idx_allocations_floor  ON student_allocations(floor_number);
CREATE INDEX idx_allocations_nus_id ON student_allocations(nus_id);

ALTER TABLE student_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon reads on allocations"
  ON student_allocations FOR SELECT TO anon USING (true);

CREATE POLICY "Allow service role full access on allocations"
  ON student_allocations FOR ALL TO service_role
  USING (true) WITH CHECK (true);
