/*
  # Create Matches and Sessions Tables

  1. New Tables
    - `matches`
      - `id` (uuid, primary key) - Match ID
      - `mentor_id` (uuid, foreign key) - Mentor's profile ID
      - `mentee_id` (uuid, foreign key) - Mentee's profile ID
      - `status` (text) - Status: pending, active, completed, cancelled
      - `requested_at` (timestamptz) - When match was requested
      - `approved_at` (timestamptz) - When match was approved by admin
      - `approved_by` (uuid) - Admin who approved the match
      - `ended_at` (timestamptz) - When match ended
      - `mentee_message` (text) - Initial message from mentee
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `sessions`
      - `id` (uuid, primary key) - Session ID
      - `match_id` (uuid, foreign key) - Associated match
      - `scheduled_at` (timestamptz) - Scheduled session time
      - `google_event_id` (text) - Google Calendar event ID
      - `status` (text) - Status: scheduled, completed, cancelled
      - `completed_at` (timestamptz) - When session was completed
      - `mentee_notes` (text) - Mentee's session notes
      - `mentor_notes` (text) - Mentor's session notes
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own matches and sessions
    - Admins can access all matches and sessions
*/

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mentee_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  requested_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES profiles(id),
  ended_at timestamptz,
  mentee_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(mentor_id, mentee_id)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  scheduled_at timestamptz NOT NULL,
  google_event_id text,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  completed_at timestamptz,
  mentee_notes text,
  mentor_notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Matches policies
CREATE POLICY "Users can view their own matches"
  ON matches
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND (profiles.id = matches.mentor_id OR profiles.id = matches.mentee_id)
    )
  );

CREATE POLICY "Mentees can create match requests"
  ON matches
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.id = matches.mentee_id
      AND profiles.role = 'mentee'
    )
  );

CREATE POLICY "Users can update their own matches"
  ON matches
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND (profiles.id = matches.mentor_id OR profiles.id = matches.mentee_id OR profiles.role = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND (profiles.id = matches.mentor_id OR profiles.id = matches.mentee_id OR profiles.role = 'admin')
    )
  );

-- Sessions policies
CREATE POLICY "Users can view sessions for their matches"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      JOIN profiles ON (profiles.id = matches.mentor_id OR profiles.id = matches.mentee_id)
      WHERE matches.id = sessions.match_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Match participants can create sessions"
  ON sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches
      JOIN profiles ON (profiles.id = matches.mentor_id OR profiles.id = matches.mentee_id)
      WHERE matches.id = sessions.match_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Match participants can update sessions"
  ON sessions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      JOIN profiles ON (profiles.id = matches.mentor_id OR profiles.id = matches.mentee_id)
      WHERE matches.id = sessions.match_id
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches
      JOIN profiles ON (profiles.id = matches.mentor_id OR profiles.id = matches.mentee_id)
      WHERE matches.id = sessions.match_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS matches_mentor_id_idx ON matches(mentor_id);
CREATE INDEX IF NOT EXISTS matches_mentee_id_idx ON matches(mentee_id);
CREATE INDEX IF NOT EXISTS matches_status_idx ON matches(status);
CREATE INDEX IF NOT EXISTS sessions_match_id_idx ON sessions(match_id);
CREATE INDEX IF NOT EXISTS sessions_scheduled_at_idx ON sessions(scheduled_at);