/*
  # Enhance Sessions for 1:1 and Group Support

  1. Changes to `sessions`
    - Make match_id nullable (group sessions have no match)
    - Add session_type (1on1 | group)
    - Add meeting_type (video | voice | chat)
    - Add meeting_url, title, description, organizer_id
    - Add duration_mins, recurrence, recurrence_end_date

  2. New Table: `session_participants`
    - Links sessions to participant profiles
    - Tracks invite status per participant

  3. RLS Updates
    - Sessions: expand SELECT to include group participants + organizer
    - Sessions: tighten INSERT to mentor/admin only
    - session_participants: own row + organizer visibility
*/

-- Make match_id nullable to support group sessions
ALTER TABLE sessions ALTER COLUMN match_id DROP NOT NULL;

-- Add new columns to sessions
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS session_type    text NOT NULL DEFAULT '1on1'
    CHECK (session_type IN ('1on1', 'group')),
  ADD COLUMN IF NOT EXISTS meeting_type    text NOT NULL DEFAULT 'video'
    CHECK (meeting_type IN ('video', 'voice', 'chat')),
  ADD COLUMN IF NOT EXISTS meeting_url     text,
  ADD COLUMN IF NOT EXISTS title           text,
  ADD COLUMN IF NOT EXISTS description     text,
  ADD COLUMN IF NOT EXISTS organizer_id    uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS duration_mins   integer NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS recurrence      text NOT NULL DEFAULT 'none'
    CHECK (recurrence IN ('none', 'weekly', 'biweekly', 'monthly')),
  ADD COLUMN IF NOT EXISTS recurrence_end_date date;

-- session_participants table
CREATE TABLE IF NOT EXISTS session_participants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  profile_id  uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status      text NOT NULL DEFAULT 'invited'
    CHECK (status IN ('invited', 'accepted', 'declined', 'attended')),
  invited_by  uuid REFERENCES profiles(id),
  created_at  timestamptz DEFAULT now(),
  UNIQUE(session_id, profile_id)
);

ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS session_participants_session_id_idx ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS session_participants_profile_id_idx ON session_participants(profile_id);

-- ============================================================
-- Update sessions RLS policies
-- ============================================================

DROP POLICY IF EXISTS "Users can view sessions for their matches" ON sessions;
DROP POLICY IF EXISTS "Match participants can create sessions" ON sessions;
DROP POLICY IF EXISTS "Match participants can update sessions" ON sessions;

-- SELECT: match participants + session participants + organizer
CREATE POLICY "Users can view their sessions"
  ON sessions FOR SELECT TO authenticated
  USING (
    -- 1:1 session via match membership
    (match_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM matches m
      JOIN profiles p ON (p.id = m.mentor_id OR p.id = m.mentee_id)
      WHERE m.id = sessions.match_id AND p.user_id = auth.uid()
    ))
    OR
    -- Any session where user is listed as a participant
    EXISTS (
      SELECT 1 FROM session_participants sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.session_id = sessions.id AND p.user_id = auth.uid()
    )
    OR
    -- Organizer can always see their own sessions
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = sessions.organizer_id AND p.user_id = auth.uid()
    )
  );

-- INSERT: mentor/admin only, must be the organizer
CREATE POLICY "Mentors and admins can create sessions"
  ON sessions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = sessions.organizer_id
        AND p.user_id = auth.uid()
        AND p.role IN ('mentor', 'admin')
    )
  );

-- UPDATE: organizer + admin + match participant (for notes)
CREATE POLICY "Session participants can update sessions"
  ON sessions FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = sessions.organizer_id AND p.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
    OR
    (match_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM matches m
      JOIN profiles p ON (p.id = m.mentor_id OR p.id = m.mentee_id)
      WHERE m.id = sessions.match_id AND p.user_id = auth.uid()
    ))
    OR
    EXISTS (
      SELECT 1 FROM session_participants sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.session_id = sessions.id AND p.user_id = auth.uid()
    )
  );

-- ============================================================
-- session_participants RLS policies
-- ============================================================

-- SELECT: own rows + rows for sessions you organized
CREATE POLICY "Participants can view their session participants"
  ON session_participants FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = session_participants.profile_id AND p.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM sessions s
      JOIN profiles p ON p.id = s.organizer_id
      WHERE s.id = session_participants.session_id AND p.user_id = auth.uid()
    )
  );

-- INSERT: organizer only
CREATE POLICY "Session organizers can insert participants"
  ON session_participants FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions s
      JOIN profiles p ON p.id = s.organizer_id
      WHERE s.id = session_participants.session_id AND p.user_id = auth.uid()
    )
  );

-- UPDATE: participant can update their own status (accept/decline)
CREATE POLICY "Participants can update their own status"
  ON session_participants FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = session_participants.profile_id AND p.user_id = auth.uid()
    )
  );
