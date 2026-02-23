/*
  # Add target_role to training_tracks

  ## Changes
  - Adds `target_role` column to `training_tracks` (values: 'mentor', 'mentee', 'all')
  - Defaults to 'all' so existing tracks are not broken
  - Updates existing mentor-specific tracks to 'mentor'
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_tracks' AND column_name = 'target_role'
  ) THEN
    ALTER TABLE training_tracks ADD COLUMN target_role text NOT NULL DEFAULT 'all';
  END IF;
END $$;

UPDATE training_tracks
SET target_role = 'mentor'
WHERE id IN (
  '11111111-0000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000002'
);
