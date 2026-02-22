/*
  # Create Goals and Training Tables

  1. New Tables
    - `goals`
      - `id` (uuid, primary key) - Goal ID
      - `user_id` (uuid, foreign key) - User who owns the goal
      - `match_id` (uuid, foreign key) - Optional associated match
      - `title` (text) - Goal title
      - `description` (text) - Goal description
      - `target_date` (timestamptz) - Target completion date
      - `status` (text) - Status: active, completed, archived
      - `completed_at` (timestamptz) - When goal was completed
      - `created_at` (timestamptz)
    
    - `training_tracks`
      - `id` (uuid, primary key) - Track ID
      - `title` (text) - Track title
      - `description` (text) - Track description
      - `display_order` (integer) - Display order
      - `badge_image_url` (text) - Badge image for completion
      - `created_at` (timestamptz)
    
    - `training_modules`
      - `id` (uuid, primary key) - Module ID
      - `track_id` (uuid, foreign key) - Parent track
      - `title` (text) - Module title
      - `content` (text) - Module content
      - `display_order` (integer) - Order within track
      - `duration_mins` (integer) - Estimated duration
      - `created_at` (timestamptz)
    
    - `user_training_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - User
      - `module_id` (uuid, foreign key) - Module
      - `completed_at` (timestamptz) - When completed
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can manage their own goals and training progress
    - Training content is publicly readable for authenticated users
*/

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  match_id uuid REFERENCES matches(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text DEFAULT '',
  target_date timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Training tracks table
CREATE TABLE IF NOT EXISTS training_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  badge_image_url text,
  created_at timestamptz DEFAULT now()
);

-- Training modules table
CREATE TABLE IF NOT EXISTS training_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES training_tracks(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  duration_mins integer DEFAULT 15,
  created_at timestamptz DEFAULT now()
);

-- User training progress table
CREATE TABLE IF NOT EXISTS user_training_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id uuid REFERENCES training_modules(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_training_progress ENABLE ROW LEVEL SECURITY;

-- Goals policies
CREATE POLICY "Users can read own goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Training content is readable by all authenticated users
CREATE POLICY "Authenticated users can read training tracks"
  ON training_tracks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read training modules"
  ON training_modules
  FOR SELECT
  TO authenticated
  USING (true);

-- Training progress policies
CREATE POLICY "Users can read own training progress"
  ON user_training_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own training progress"
  ON user_training_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS goals_user_id_idx ON goals(user_id);
CREATE INDEX IF NOT EXISTS goals_status_idx ON goals(status);
CREATE INDEX IF NOT EXISTS training_modules_track_id_idx ON training_modules(track_id);
CREATE INDEX IF NOT EXISTS user_training_progress_user_id_idx ON user_training_progress(user_id);
CREATE INDEX IF NOT EXISTS user_training_progress_module_id_idx ON user_training_progress(module_id);