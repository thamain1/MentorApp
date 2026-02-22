/*
  # Create Community Tables

  1. New Tables
    - `groups`
      - `id` (uuid, primary key) - Group ID
      - `name` (text) - Group name
      - `description` (text) - Group description
      - `type` (text) - Group type: interest, location, program
      - `image_url` (text) - Group image
      - `created_by` (uuid) - Creator profile ID
      - `created_at` (timestamptz)
    
    - `group_members`
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key) - Group
      - `user_id` (uuid, foreign key) - User
      - `joined_at` (timestamptz)
      - `role` (text) - Role: member, moderator
    
    - `posts`
      - `id` (uuid, primary key) - Post ID
      - `group_id` (uuid, foreign key) - Optional group (null for general feed)
      - `user_id` (uuid, foreign key) - Post author
      - `content` (text) - Post content
      - `created_at` (timestamptz)
    
    - `post_likes`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key) - Post
      - `user_id` (uuid, foreign key) - User who liked
      - `created_at` (timestamptz)
    
    - `messages`
      - `id` (uuid, primary key) - Message ID
      - `match_id` (uuid, foreign key) - Associated match
      - `sender_id` (uuid, foreign key) - Sender's user ID
      - `content` (text) - Message content
      - `read_at` (timestamptz) - When message was read
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can read public groups and their own memberships
    - Users can create posts and messages in their matches
    - Users can like posts
*/

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  type text NOT NULL CHECK (type IN ('interest', 'location', 'program')),
  image_url text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator')),
  UNIQUE(group_id, user_id)
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Groups policies (all authenticated users can read groups)
CREATE POLICY "Authenticated users can read groups"
  ON groups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create groups"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.id = groups.created_by
    )
  );

-- Group members policies
CREATE POLICY "Authenticated users can read group members"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join groups"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Authenticated users can read posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Post likes policies
CREATE POLICY "Authenticated users can read post likes"
  ON post_likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like posts"
  ON post_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON post_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can read messages in their matches"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      JOIN profiles ON (profiles.id = matches.mentor_id OR profiles.id = matches.mentee_id)
      WHERE matches.id = messages.match_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their matches"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM matches
      JOIN profiles ON (profiles.id = matches.mentor_id OR profiles.id = matches.mentee_id)
      WHERE matches.id = messages.match_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS groups_type_idx ON groups(type);
CREATE INDEX IF NOT EXISTS group_members_group_id_idx ON group_members(group_id);
CREATE INDEX IF NOT EXISTS group_members_user_id_idx ON group_members(user_id);
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts(user_id);
CREATE INDEX IF NOT EXISTS posts_group_id_idx ON posts(group_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS post_likes_post_id_idx ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS post_likes_user_id_idx ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS messages_match_id_idx ON messages(match_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);