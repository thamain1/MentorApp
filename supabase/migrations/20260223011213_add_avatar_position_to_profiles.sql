/*
  # Add avatar position columns to profiles

  Stores the user's chosen image crop/position so it is consistent
  across all screens (home dashboard, profile page, etc.).

  ## Changes
  - `profiles` table
    - `avatar_position_x` (integer, default 0) — horizontal offset (-50 to 50)
    - `avatar_position_y` (integer, default 0) — vertical offset (-50 to 50)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_position_x'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_position_x integer NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_position_y'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_position_y integer NOT NULL DEFAULT 0;
  END IF;
END $$;
