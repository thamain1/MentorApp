CREATE TABLE IF NOT EXISTS mentor_surveys (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id             uuid REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  mentee_id            uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_id            uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  survey_month         text NOT NULL,           -- 'YYYY-MM', e.g. '2026-02'
  overall_rating       smallint NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  communication_rating smallint NOT NULL CHECK (communication_rating BETWEEN 1 AND 5),
  helpfulness_rating   smallint NOT NULL CHECK (helpfulness_rating BETWEEN 1 AND 5),
  feedback_text        text,
  created_at           timestamptz DEFAULT now(),
  UNIQUE (match_id, survey_month)               -- one submission per match per month
);
ALTER TABLE mentor_surveys ENABLE ROW LEVEL SECURITY;

-- Mentee can submit for their own match
CREATE POLICY "Mentees can submit surveys" ON mentor_surveys FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = mentor_surveys.mentee_id AND p.user_id = auth.uid())
  );

-- Mentor sees feedback about themselves; mentee sees their own submissions; admin sees all
CREATE POLICY "View own surveys" ON mentor_surveys FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE (p.id = mentor_surveys.mentee_id OR p.id = mentor_surveys.mentor_id)
        AND p.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  );
