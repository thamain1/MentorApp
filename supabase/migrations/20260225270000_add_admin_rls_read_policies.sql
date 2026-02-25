-- Create user-specific tables if they don't exist yet,
-- then add admin read-all policies for the admin drill-down views.

-- ── check_ins ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS check_ins (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mood         integer NOT NULL CHECK (mood BETWEEN 1 AND 5),
  reflection   text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "owner_read_check_ins"
    ON check_ins FOR SELECT TO authenticated
    USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = check_ins.user_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "owner_insert_check_ins"
    ON check_ins FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = check_ins.user_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "admin_read_check_ins"
    ON check_ins FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = auth.uid()
          AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── goals ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id     uuid REFERENCES matches(id) ON DELETE SET NULL,
  title        text NOT NULL,
  description  text,
  target_date  date,
  status       text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','archived')),
  completed_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "owner_all_goals"
    ON goals FOR ALL TO authenticated
    USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = goals.user_id))
    WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = goals.user_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "admin_read_goals"
    ON goals FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = auth.uid()
          AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── user_training_progress ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_training_progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id    uuid NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);

ALTER TABLE user_training_progress ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "owner_all_training_progress"
    ON user_training_progress FOR ALL TO authenticated
    USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = user_training_progress.user_id))
    WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = user_training_progress.user_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "admin_read_training_progress"
    ON user_training_progress FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = auth.uid()
          AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
