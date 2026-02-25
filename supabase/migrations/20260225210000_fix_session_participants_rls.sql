/*
  # Fix circular RLS dependency between sessions and session_participants

  The previous migration created a circular reference:
    - sessions SELECT policy → queries session_participants
    - session_participants SELECT policy → queries sessions
  PostgreSQL detects infinite recursion and returns a 500 error.

  Fix: rewrite session_participants SELECT policy to use the `invited_by`
  column (which stores the organizer's profile_id) instead of joining back
  to the sessions table. This breaks the cycle.
*/

DROP POLICY IF EXISTS "Participants can view their session participants" ON session_participants;

CREATE POLICY "Participants can view their session participants"
  ON session_participants FOR SELECT TO authenticated
  USING (
    -- Participant can see their own row
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = session_participants.profile_id
        AND p.user_id = auth.uid()
    )
    OR
    -- Organizer (stored in invited_by) can see all rows for their sessions
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = session_participants.invited_by
        AND p.user_id = auth.uid()
    )
  );
