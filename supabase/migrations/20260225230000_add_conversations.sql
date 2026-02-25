-- conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text NOT NULL DEFAULT 'direct'
                CHECK (type IN ('direct', 'announcement')),
  title       text,
  created_by  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- conversation_participants table
-- Uses added_by to avoid circular RLS (same pattern as session_participants/invited_by fix)
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id  uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  profile_id       uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  added_by         uuid REFERENCES profiles(id),
  joined_at        timestamptz DEFAULT now(),
  PRIMARY KEY (conversation_id, profile_id)
);
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Alter messages: make match_id optional, add conversation_id
ALTER TABLE messages ALTER COLUMN match_id DROP NOT NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id uuid
  REFERENCES conversations(id) ON DELETE CASCADE;

-- RLS: conversations
CREATE POLICY "Users can view conversations" ON conversations FOR SELECT TO authenticated
  USING (
    type = 'announcement'
    OR EXISTS (
      SELECT 1 FROM conversation_participants cp
      JOIN profiles p ON p.id = cp.profile_id
      WHERE cp.conversation_id = conversations.id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations" ON conversations FOR INSERT TO authenticated
  WITH CHECK (
    (type = 'direct' AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = conversations.created_by AND p.user_id = auth.uid()
    ))
    OR
    (type = 'announcement' AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
    ))
  );

-- RLS: conversation_participants
-- Uses added_by to avoid querying conversations (prevents circular RLS)
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = conversation_participants.profile_id AND p.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = conversation_participants.added_by AND p.user_id = auth.uid())
  );

CREATE POLICY "Users can add conversation participants"
  ON conversation_participants FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = conversation_participants.added_by AND p.user_id = auth.uid())
  );

-- RLS: messages — drop old policies, recreate with conversation support
DROP POLICY IF EXISTS "Users can view messages in their matches" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their matches" ON messages;

CREATE POLICY "Users can view messages" ON messages FOR SELECT TO authenticated
  USING (
    (match_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM matches m
      JOIN profiles p ON (p.id = m.mentor_id OR p.id = m.mentee_id)
      WHERE m.id = messages.match_id AND p.user_id = auth.uid()
    ))
    OR
    (conversation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id AND c.type = 'announcement'
    ))
    OR
    (conversation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM conversation_participants cp
      JOIN profiles p ON p.id = cp.profile_id
      WHERE cp.conversation_id = messages.conversation_id AND p.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can send messages" ON messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      (match_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM matches m
        JOIN profiles p ON (p.id = m.mentor_id OR p.id = m.mentee_id)
        WHERE m.id = messages.match_id AND p.user_id = auth.uid()
      ))
      OR
      (conversation_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM conversation_participants cp
        JOIN profiles p ON p.id = cp.profile_id
        WHERE cp.conversation_id = messages.conversation_id AND p.user_id = auth.uid()
      ))
      OR
      (conversation_id IS NOT NULL
        AND EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.type = 'announcement')
        AND EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
      )
    )
  );

-- Seed the Announcements channel
INSERT INTO conversations (type, title) VALUES ('announcement', 'Announcements');
