/*
  # Create Interests and Focus Areas Lookup Tables

  ## Summary
  This migration establishes canonical lookup tables for interests and focus areas,
  which are used throughout the app for consistent categorization of user profiles,
  mentor specialties, and matching logic.

  ## New Tables

  ### `interest_categories`
  Stores all available interest options users can select during onboarding and profile editing.
  - `id` - UUID primary key
  - `name` - Display name of the interest (e.g., "Technology", "Sports")
  - `group_label` - Category grouping for UI display (e.g., "Tech & Learning", "Sports & Fitness")
  - `display_order` - Integer for ordering within each group
  - `active` - Whether this interest is currently available for selection

  ### `focus_areas`
  Stores all available focus area options (what users want to work on or mentors can help with).
  - `id` - UUID primary key
  - `name` - Display name (e.g., "Career Development", "Financial Literacy")
  - `group_label` - Category grouping for UI display
  - `display_order` - Integer for ordering within each group
  - `active` - Whether this focus area is currently available for selection

  ### `mentor_specialties`
  Stores all mentor specialty options (what mentors are qualified to offer).
  - `id` - UUID primary key
  - `name` - Display name (e.g., "Leadership Development", "Tech & Coding")
  - `display_order` - Integer for ordering
  - `active` - Whether this specialty is currently available

  ## Security
  - RLS enabled on all three tables
  - Authenticated users can read all active entries (needed for onboarding and browsing)
  - Only admins (via service role) can insert/update/delete entries

  ## Notes
  1. These tables serve as the source of truth for the categorization system
  2. All three tables are seeded with initial canonical data in this migration
  3. The `profiles` table stores arrays of strings matching the `name` fields in these tables
  4. Admins can deactivate entries without deleting to preserve historical data
*/

-- =====================
-- interest_categories
-- =====================

CREATE TABLE IF NOT EXISTS interest_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  group_label text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE interest_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read active interests"
  ON interest_categories FOR SELECT
  TO authenticated
  USING (active = true);

-- =====================
-- focus_areas
-- =====================

CREATE TABLE IF NOT EXISTS focus_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  group_label text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE focus_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read active focus areas"
  ON focus_areas FOR SELECT
  TO authenticated
  USING (active = true);

-- =====================
-- mentor_specialties
-- =====================

CREATE TABLE IF NOT EXISTS mentor_specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE mentor_specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read active mentor specialties"
  ON mentor_specialties FOR SELECT
  TO authenticated
  USING (active = true);

-- =====================
-- SEED: interest_categories
-- =====================

INSERT INTO interest_categories (name, group_label, display_order) VALUES
  ('Sports', 'Sports & Fitness', 1),
  ('Fitness', 'Sports & Fitness', 2),
  ('Martial Arts', 'Sports & Fitness', 3),
  ('Outdoor Adventures', 'Sports & Fitness', 4),
  ('Golf', 'Sports & Fitness', 5),
  ('Music', 'Arts & Creativity', 6),
  ('Art & Design', 'Arts & Creativity', 7),
  ('Photography', 'Arts & Creativity', 8),
  ('Writing', 'Arts & Creativity', 9),
  ('Podcasting & Media', 'Arts & Creativity', 10),
  ('Technology', 'Tech & Learning', 11),
  ('Coding & Software', 'Tech & Learning', 12),
  ('Science', 'Tech & Learning', 13),
  ('Reading', 'Tech & Learning', 14),
  ('Gaming', 'Tech & Learning', 15),
  ('Cooking', 'Lifestyle', 16),
  ('Travel', 'Lifestyle', 17),
  ('Movies & TV', 'Lifestyle', 18),
  ('Fashion & Style', 'Lifestyle', 19),
  ('Cars & Mechanics', 'Lifestyle', 20),
  ('Faith & Spirituality', 'Faith & Community', 21),
  ('Volunteering', 'Faith & Community', 22),
  ('Community Service', 'Faith & Community', 23),
  ('Social Justice', 'Faith & Community', 24),
  ('Mentorship', 'Faith & Community', 25),
  ('Entrepreneurship', 'Business & Finance', 26),
  ('Investing', 'Business & Finance', 27),
  ('Real Estate', 'Business & Finance', 28),
  ('Business', 'Business & Finance', 29),
  ('Public Speaking', 'Business & Finance', 30)
ON CONFLICT (name) DO NOTHING;

-- =====================
-- SEED: focus_areas
-- =====================

INSERT INTO focus_areas (name, group_label, display_order) VALUES
  ('Academic Success', 'Education & Career', 1),
  ('Career Development', 'Education & Career', 2),
  ('College Readiness', 'Education & Career', 3),
  ('Networking', 'Education & Career', 4),
  ('Personal Growth', 'Personal Development', 5),
  ('Confidence Building', 'Personal Development', 6),
  ('Emotional Intelligence', 'Personal Development', 7),
  ('Time Management', 'Personal Development', 8),
  ('Leadership Skills', 'Leadership & Communication', 9),
  ('Communication', 'Leadership & Communication', 10),
  ('Public Speaking', 'Leadership & Communication', 11),
  ('Conflict Resolution', 'Leadership & Communication', 12),
  ('Financial Literacy', 'Finance & Life Skills', 13),
  ('Life Skills', 'Finance & Life Skills', 14),
  ('Entrepreneurship', 'Finance & Life Skills', 15),
  ('Real Estate & Investing', 'Finance & Life Skills', 16),
  ('Health & Wellness', 'Health & Relationships', 17),
  ('Relationships', 'Health & Relationships', 18),
  ('Fatherhood & Family', 'Health & Relationships', 19),
  ('Spiritual Growth', 'Health & Relationships', 20),
  ('Community Impact', 'Community', 21),
  ('Mentorship', 'Community', 22),
  ('Social Awareness', 'Community', 23)
ON CONFLICT (name) DO NOTHING;

-- =====================
-- SEED: mentor_specialties
-- =====================

INSERT INTO mentor_specialties (name, display_order) VALUES
  ('Academic Tutoring', 1),
  ('Career Coaching', 2),
  ('College Prep', 3),
  ('Communication Skills', 4),
  ('Community Leadership', 5),
  ('Confidence Building', 6),
  ('Conflict Resolution', 7),
  ('Emotional Intelligence', 8),
  ('Entrepreneurship', 9),
  ('Faith & Discipleship', 10),
  ('Financial Literacy', 11),
  ('Fitness & Health', 12),
  ('Leadership Development', 13),
  ('Life Skills', 14),
  ('Mental Health Awareness', 15),
  ('Networking & Mentorship', 16),
  ('Personal Branding', 17),
  ('Public Speaking', 18),
  ('Relationship Coaching', 19),
  ('Sports Mentorship', 20),
  ('Tech & Coding', 21),
  ('Trades & Vocational', 22),
  ('Workforce Readiness', 23)
ON CONFLICT (name) DO NOTHING;

-- Add specialties column to profiles table if it doesn't exist yet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'specialties'
  ) THEN
    ALTER TABLE profiles ADD COLUMN specialties text[] NOT NULL DEFAULT '{}';
  END IF;
END $$;
