/*
  # Create post_comments table

  1. New Tables
    - `post_comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key -> posts.id, cascade delete)
      - `user_id` (uuid, foreign key -> auth.users.id, cascade delete)
      - `content` (text, required)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `post_comments` table
    - Authenticated users can read all comments
    - Authenticated users can insert their own comments
    - Users can delete only their own comments

  3. Notes
    - Deleting a post cascades to delete its comments
    - No updates allowed (comments are immutable once posted)
*/

CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read comments"
  ON post_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own comments"
  ON post_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON post_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS post_comments_post_id_idx ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS post_comments_created_at_idx ON post_comments(created_at);
