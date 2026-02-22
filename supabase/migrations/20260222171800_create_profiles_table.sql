/*
  # Create Profiles Table

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - Profile ID
      - `user_id` (uuid, foreign key to auth.users) - Auth user reference
      - `role` (text) - User role: mentee, mentor, or admin
      - `first_name` (text) - First name
      - `last_name` (text) - Last name
      - `age` (integer) - User age
      - `bio` (text) - User biography
      - `interests` (text[]) - Array of interests
      - `goals` (text[]) - Array of goals/focus areas
      - `location` (text) - User location
      - `avatar_url` (text) - Profile image URL
      - `guidelines_accepted_at` (timestamptz) - When user accepted guidelines
      - `created_at` (timestamptz) - When profile was created
      - `updated_at` (timestamptz) - Last profile update
  
  2. Security
    - Enable RLS on `profiles` table
    - Users can read their own profile
    - Users can update their own profile
    - Admins can read all profiles
    - Authenticated users can read other users' public profile info
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('mentee', 'mentor', 'admin')),
  first_name text NOT NULL,
  last_name text NOT NULL,
  age integer,
  bio text DEFAULT '',
  interests text[] DEFAULT '{}',
  goals text[] DEFAULT '{}',
  location text,
  avatar_url text,
  guidelines_accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can read other users' public info (for community features)
CREATE POLICY "Users can read public profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);