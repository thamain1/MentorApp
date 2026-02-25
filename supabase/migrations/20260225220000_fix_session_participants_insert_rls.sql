/*
  # Fix session_participants INSERT policy circular reference

  The INSERT policy on session_participants queries the sessions table to verify
  the current user is the organizer. This creates a potential evaluation chain:

    session_participants INSERT policy
      → SELECT from sessions
        → sessions SELECT policy
          → SELECT from session_participants  ← chain could deepen under load

  Fix: rewrite INSERT policy to use invited_by column (same approach as the
  SELECT policy fix in 20260225210000). This removes all cross-table references
  from session_participants policies entirely.
*/

DROP POLICY IF EXISTS "Session organizers can insert participants" ON session_participants;

CREATE POLICY "Session organizers can insert participants"
  ON session_participants FOR INSERT TO authenticated
  WITH CHECK (
    -- Only the person listed as invited_by (the organizer) may insert rows.
    -- This mirrors how the SELECT policy was fixed and avoids querying sessions.
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = session_participants.invited_by
        AND p.user_id = auth.uid()
    )
  );
