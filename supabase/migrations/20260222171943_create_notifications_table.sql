/*
  # Create Notifications Table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key) - Notification ID
      - `user_id` (uuid, foreign key) - User who receives notification
      - `type` (text) - Type: message, session, goal, community, system
      - `title` (text) - Notification title
      - `body` (text) - Notification body
      - `action_url` (text) - URL to navigate to when clicked
      - `read_at` (timestamptz) - When notification was read
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Users can only read their own notifications
    - Users can mark their own notifications as read
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('message', 'session', 'goal', 'community', 'system', 'match')),
  title text NOT NULL,
  body text NOT NULL,
  action_url text,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- System can create notifications (this will be used by triggers/functions)
CREATE POLICY "Authenticated users can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_read_at_idx ON notifications(read_at) WHERE read_at IS NULL;