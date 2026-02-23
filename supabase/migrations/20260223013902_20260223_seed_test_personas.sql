/*
  # Seed Test Personas and Demo Data

  Creates three test user accounts for demonstrating the three personas:
  - Admin: dan@ironsharpensirontest.dev (Dan Mitchell, Program Director)
  - Mentor: david@ironsharpensirontest.dev (David Williams, Software Engineer)
  - Mentee: marcus@ironsharpensirontest.dev (Marcus Johnson, High School Junior)

  Also seeds:
  - Profiles for all three personas
  - An active match between David (mentor) and Marcus (mentee)
  - Sessions for the match (upcoming + past completed)
  - Goals for Marcus
  - Community posts from all three personas
  - Messages between David and Marcus
  - Notifications for Marcus
  - Training tracks and modules (shared content)
  - Groups and group memberships
  - Admin pending matches from other users

  Notes:
  - All test accounts use password: IronTest2026!
  - Auth users are created via auth.users insert (admin override)
  - Profiles reference auth user IDs
  - All data is linked via real foreign keys
*/

-- =====================
-- CREATE AUTH USERS
-- =====================

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
VALUES
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'dan@ironsharpensirontest.dev',
    crypt('IronTest2026!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false, '', '', '', ''
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'david@ironsharpensirontest.dev',
    crypt('IronTest2026!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false, '', '', '', ''
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'marcus@ironsharpensirontest.dev',
    crypt('IronTest2026!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false, '', '', '', ''
  )
ON CONFLICT (id) DO NOTHING;

-- Also insert two extra mentor auth users for admin pending matches demo
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
VALUES
  (
    'bbbbbbbb-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'james@ironsharpensirontest.dev',
    crypt('IronTest2026!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false, '', '', '', ''
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'michael@ironsharpensirontest.dev',
    crypt('IronTest2026!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false, '', '', '', ''
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'kevin@ironsharpensirontest.dev',
    crypt('IronTest2026!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false, '', '', '', ''
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'andre@ironsharpensirontest.dev',
    crypt('IronTest2026!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false, '', '', '', ''
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'jordan@ironsharpensirontest.dev',
    crypt('IronTest2026!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false, '', '', '', ''
  )
ON CONFLICT (id) DO NOTHING;

-- =====================
-- CREATE PROFILES
-- =====================

INSERT INTO profiles (id, user_id, role, first_name, last_name, age, bio, interests, goals, specialties, location, avatar_url, guidelines_accepted_at, created_at, updated_at)
VALUES
  (
    'cccccccc-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'admin',
    'Dan', 'Mitchell', 35,
    'Program Director overseeing mentorship matches and community safety. Dedicated to building meaningful connections.',
    ARRAY['Mentorship', 'Community Service', 'Faith & Spirituality', 'Public Speaking'],
    ARRAY['Community Impact', 'Leadership Skills', 'Networking'],
    ARRAY['Leadership Development', 'Community Leadership', 'Networking & Mentorship'],
    'Chicago, IL', null,
    NOW() - INTERVAL '3 years', NOW() - INTERVAL '3 years', NOW()
  ),
  (
    'cccccccc-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000002',
    'mentor',
    'David', 'Williams', 32,
    'Software engineer with 10 years of experience. Passionate about helping young men discover their potential in tech and life.',
    ARRAY['Technology', 'Fitness', 'Entrepreneurship', 'Faith & Spirituality'],
    ARRAY['Leadership Skills', 'Career Development'],
    ARRAY['Tech & Coding', 'Career Coaching', 'Leadership Development'],
    'Chicago, IL', '/images/mentors/gettyimages-1146909737-612x612.jpg',
    NOW() - INTERVAL '2 years', NOW() - INTERVAL '2 years', NOW()
  ),
  (
    'cccccccc-0000-0000-0000-000000000003',
    'aaaaaaaa-0000-0000-0000-000000000003',
    'mentee',
    'Marcus', 'Johnson', 16,
    'High school junior interested in technology and music. Looking forward to learning from my mentor!',
    ARRAY['Technology', 'Music', 'Gaming', 'Sports'],
    ARRAY['Academic Success', 'Career Development', 'Leadership Skills'],
    ARRAY[]::text[],
    'Chicago, IL', null,
    NOW() - INTERVAL '6 months', NOW() - INTERVAL '6 months', NOW()
  ),
  -- Supporting cast profiles
  (
    'cccccccc-0000-0000-0000-000000000004',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'mentor',
    'James', 'Thompson', 28,
    'Youth pastor and basketball coach. Love seeing young men grow in character and confidence.',
    ARRAY['Sports', 'Faith & Spirituality', 'Music', 'Volunteering'],
    ARRAY['Personal Growth', 'Communication'],
    ARRAY['Confidence Building', 'Sports Mentorship', 'Faith & Discipleship'],
    'Chicago, IL', '/images/mentors/gettyimages-1455343282-612x612.jpg',
    NOW() - INTERVAL '18 months', NOW() - INTERVAL '18 months', NOW()
  ),
  (
    'cccccccc-0000-0000-0000-000000000005',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'mentor',
    'Michael', 'Chen', 35,
    'Financial advisor and former college athlete. Passionate about teaching young men financial literacy.',
    ARRAY['Fitness', 'Investing', 'Sports', 'Reading'],
    ARRAY['Financial Literacy', 'Health & Wellness'],
    ARRAY['Financial Literacy', 'Academic Tutoring', 'Fitness & Health'],
    'Chicago, IL', '/images/mentors/gettyimages-1463782257-612x612.jpg',
    NOW() - INTERVAL '2 years', NOW() - INTERVAL '2 years', NOW()
  ),
  (
    'cccccccc-0000-0000-0000-000000000006',
    'bbbbbbbb-0000-0000-0000-000000000003',
    'mentee',
    'Kevin', 'Wilson', 14,
    'Freshman who loves basketball and wants to improve both on and off the court.',
    ARRAY['Sports', 'Gaming', 'Music'],
    ARRAY['Confidence Building', 'Academic Success'],
    ARRAY[]::text[],
    'Chicago, IL', null,
    NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month', NOW()
  ),
  (
    'cccccccc-0000-0000-0000-000000000007',
    'bbbbbbbb-0000-0000-0000-000000000004',
    'mentee',
    'Andre', 'Jackson', 16,
    'Junior focused on college prep and financial literacy.',
    ARRAY['Reading', 'Entrepreneurship', 'Sports'],
    ARRAY['Career Development', 'Financial Literacy'],
    ARRAY[]::text[],
    'Chicago, IL', null,
    NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months', NOW()
  ),
  (
    'cccccccc-0000-0000-0000-000000000008',
    'bbbbbbbb-0000-0000-0000-000000000005',
    'mentee',
    'Jordan', 'Davis', 17,
    'Senior preparing for college. Grateful for this program!',
    ARRAY['Reading', 'Writing', 'Entrepreneurship'],
    ARRAY['Career Development', 'Financial Literacy'],
    ARRAY[]::text[],
    'Chicago, IL', null,
    NOW() - INTERVAL '1 year', NOW() - INTERVAL '1 year', NOW()
  )
ON CONFLICT (user_id) DO NOTHING;

-- =====================
-- CREATE ACTIVE MATCH (David ↔ Marcus)
-- =====================

INSERT INTO matches (id, mentor_id, mentee_id, status, requested_at, approved_at, approved_by, mentee_message, created_at, updated_at)
VALUES (
  'dddddddd-0000-0000-0000-000000000001',
  'cccccccc-0000-0000-0000-000000000002', -- David (mentor)
  'cccccccc-0000-0000-0000-000000000003', -- Marcus (mentee)
  'active',
  NOW() - INTERVAL '6 months',
  NOW() - INTERVAL '6 months' + INTERVAL '1 day',
  'cccccccc-0000-0000-0000-000000000001', -- Dan approved it
  'Hi David! I am really interested in technology and would love to learn from your experience as a software engineer.',
  NOW() - INTERVAL '6 months',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Pending matches for admin to review
INSERT INTO matches (id, mentor_id, mentee_id, status, requested_at, mentee_message, created_at, updated_at)
VALUES
  (
    'dddddddd-0000-0000-0000-000000000002',
    'cccccccc-0000-0000-0000-000000000004', -- James (mentor)
    'cccccccc-0000-0000-0000-000000000006', -- Kevin (mentee)
    'pending',
    NOW() - INTERVAL '1 day',
    'I want to get better at basketball and school.',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    'dddddddd-0000-0000-0000-000000000003',
    'cccccccc-0000-0000-0000-000000000005', -- Michael (mentor)
    'cccccccc-0000-0000-0000-000000000007', -- Andre (mentee)
    'pending',
    NOW() - INTERVAL '2 days',
    'Looking for help with college planning and finances.',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================
-- CREATE SESSIONS (David ↔ Marcus match)
-- =====================

INSERT INTO sessions (id, match_id, scheduled_at, status, completed_at, mentee_notes, mentor_notes, created_at)
VALUES
  -- Upcoming session
  (
    'eeeeeeee-0000-0000-0000-000000000001',
    'dddddddd-0000-0000-0000-000000000001',
    NOW() + INTERVAL '3 days',
    'scheduled', null, null, null,
    NOW() - INTERVAL '1 day'
  ),
  -- Completed: 1 week ago
  (
    'eeeeeeee-0000-0000-0000-000000000002',
    'dddddddd-0000-0000-0000-000000000001',
    NOW() - INTERVAL '7 days',
    'completed',
    NOW() - INTERVAL '7 days' + INTERVAL '1 hour',
    'We talked about my career goals and David shared his journey into tech. Very inspiring!',
    'Marcus is making great progress. Discussed setting SMART goals. He showed strong interest in software development.',
    NOW() - INTERVAL '10 days'
  ),
  -- Completed: 2 weeks ago
  (
    'eeeeeeee-0000-0000-0000-000000000003',
    'dddddddd-0000-0000-0000-000000000001',
    NOW() - INTERVAL '14 days',
    'completed',
    NOW() - INTERVAL '14 days' + INTERVAL '1 hour',
    'Learned about time management techniques. Going to try the Pomodoro method!',
    'Introduced productivity techniques. Marcus was very engaged.',
    NOW() - INTERVAL '17 days'
  ),
  -- Completed: 3 weeks ago
  (
    'eeeeeeee-0000-0000-0000-000000000004',
    'dddddddd-0000-0000-0000-000000000001',
    NOW() - INTERVAL '21 days',
    'completed',
    NOW() - INTERVAL '21 days' + INTERVAL '1 hour',
    'First official session! We set expectations and talked about what I want to achieve.',
    'Great first session with Marcus. He has clear goals and is eager to learn.',
    NOW() - INTERVAL '25 days'
  ),
  -- Completed recently (needs mentee notes)
  (
    'eeeeeeee-0000-0000-0000-000000000005',
    'dddddddd-0000-0000-0000-000000000001',
    NOW() - INTERVAL '3 hours',
    'completed',
    NOW() - INTERVAL '2 hours',
    null,
    'Discussed debugging techniques. Marcus is picking up concepts quickly.',
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================
-- CREATE GOALS (Marcus)
-- =====================

INSERT INTO goals (id, user_id, match_id, title, description, target_date, status, completed_at, created_at)
VALUES
  (
    'ffffffff-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000003',
    'dddddddd-0000-0000-0000-000000000001',
    'Improve GPA to 3.5',
    'Focus on math and science courses to bring up my overall GPA.',
    NOW() + INTERVAL '90 days',
    'active', null,
    NOW() - INTERVAL '30 days'
  ),
  (
    'ffffffff-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000003',
    'dddddddd-0000-0000-0000-000000000001',
    'Learn Python basics',
    'Complete an online Python course and build a small project.',
    NOW() + INTERVAL '60 days',
    'active', null,
    NOW() - INTERVAL '14 days'
  ),
  (
    'ffffffff-0000-0000-0000-000000000003',
    'aaaaaaaa-0000-0000-0000-000000000003',
    null,
    'Read one book per month',
    'Develop a consistent reading habit with diverse topics.',
    NOW() + INTERVAL '365 days',
    'active', null,
    NOW() - INTERVAL '45 days'
  ),
  (
    'ffffffff-0000-0000-0000-000000000004',
    'aaaaaaaa-0000-0000-0000-000000000003',
    'dddddddd-0000-0000-0000-000000000001',
    'Complete first coding project',
    'Build a simple web app to showcase at school.',
    NOW() - INTERVAL '10 days',
    'completed',
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '60 days'
  ),
  (
    'ffffffff-0000-0000-0000-000000000005',
    'aaaaaaaa-0000-0000-0000-000000000003',
    null,
    'Join school debate club',
    'Improve public speaking skills by participating in debates.',
    NOW() - INTERVAL '30 days',
    'completed',
    NOW() - INTERVAL '35 days',
    NOW() - INTERVAL '90 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================
-- CREATE TRAINING TRACKS & MODULES
-- =====================

INSERT INTO training_tracks (id, title, description, display_order, created_at)
VALUES
  (
    '11111111-0000-0000-0000-000000000001',
    'Mentor Foundations',
    'Essential skills and knowledge for effective mentoring. Complete this track to become a certified mentor.',
    1,
    NOW() - INTERVAL '2 years'
  ),
  (
    '11111111-0000-0000-0000-000000000002',
    'Safety Protocols',
    'Required training on safety, boundaries, and reporting. All mentors must complete this track.',
    2,
    NOW() - INTERVAL '2 years'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO training_modules (id, track_id, title, content, display_order, duration_mins, created_at)
VALUES
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Introduction to Mentoring', 'Understanding the mentor-mentee relationship and your role as a guide, role model, and trusted advisor.', 1, 15, NOW() - INTERVAL '2 years'),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Building Trust', 'Techniques for establishing rapport and building a trusting relationship through consistency and active listening.', 2, 20, NOW() - INTERVAL '2 years'),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'Active Listening Skills', 'How to truly hear and understand your mentee using the HEAR method and open-ended questions.', 3, 25, NOW() - INTERVAL '2 years'),
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 'Setting Goals Together', 'Collaborative goal-setting techniques for mentorship success using SMART goals framework.', 4, 20, NOW() - INTERVAL '2 years'),
  ('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000001', 'Navigating Challenges', 'How to handle difficult conversations and situations with care and professionalism.', 5, 30, NOW() - INTERVAL '2 years'),
  ('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000002', 'Understanding Boundaries', 'Establishing and maintaining appropriate professional boundaries in mentoring relationships.', 1, 20, NOW() - INTERVAL '2 years'),
  ('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000002', 'Recognizing Warning Signs', 'Identifying when a mentee may need additional support or intervention.', 2, 25, NOW() - INTERVAL '2 years'),
  ('22222222-0000-0000-0000-000000000008', '11111111-0000-0000-0000-000000000002', 'Reporting Procedures', 'When and how to escalate concerns appropriately to protect mentee safety.', 3, 15, NOW() - INTERVAL '2 years'),
  ('22222222-0000-0000-0000-000000000009', '11111111-0000-0000-0000-000000000002', 'Digital Safety', 'Best practices for online communication in mentoring relationships.', 4, 20, NOW() - INTERVAL '2 years')
ON CONFLICT (id) DO NOTHING;

-- David completed 2 modules in track 1 and all 4 in track 2
INSERT INTO user_training_progress (id, user_id, module_id, completed_at)
VALUES
  ('33333333-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', NOW() - INTERVAL '6 months'),
  ('33333333-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', NOW() - INTERVAL '5 months'),
  ('33333333-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000006', NOW() - INTERVAL '6 months'),
  ('33333333-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000007', NOW() - INTERVAL '5 months'),
  ('33333333-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000008', NOW() - INTERVAL '5 months'),
  ('33333333-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000009', NOW() - INTERVAL '4 months')
ON CONFLICT (id) DO NOTHING;

-- =====================
-- CREATE GROUPS
-- =====================

INSERT INTO groups (id, name, description, type, created_by, created_at)
VALUES
  ('44444444-0000-0000-0000-000000000001', 'Chicago Tech Mentors', 'Connect with mentors and mentees interested in technology careers. Share resources, opportunities, and support.', 'interest', 'cccccccc-0000-0000-0000-000000000002', NOW() - INTERVAL '2 years'),
  ('44444444-0000-0000-0000-000000000002', 'North Side Chapter', 'Local chapter for mentors and mentees on Chicago''s North Side. Monthly meetups and community events.', 'location', 'cccccccc-0000-0000-0000-000000000001', NOW() - INTERVAL '2 years'),
  ('44444444-0000-0000-0000-000000000003', 'College Prep', 'For mentees preparing for college applications, SATs, and the transition to higher education.', 'program', 'cccccccc-0000-0000-0000-000000000001', NOW() - INTERVAL '1 year'),
  ('44444444-0000-0000-0000-000000000004', 'Sports & Fitness', 'Athletes and fitness enthusiasts. Organize pickup games, workouts, and discuss sports as a path to discipline.', 'interest', 'cccccccc-0000-0000-0000-000000000004', NOW() - INTERVAL '18 months'),
  ('44444444-0000-0000-0000-000000000005', 'Future Entrepreneurs', 'Business-minded mentees and mentors sharing ideas, resources, and experiences in entrepreneurship.', 'interest', 'cccccccc-0000-0000-0000-000000000002', NOW() - INTERVAL '1 year')
ON CONFLICT (id) DO NOTHING;

-- Group memberships
INSERT INTO group_members (id, group_id, user_id, role, joined_at)
VALUES
  -- Marcus is in Tech Mentors and North Side
  ('55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000003', 'member', NOW() - INTERVAL '5 months'),
  ('55555555-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000003', 'member', NOW() - INTERVAL '5 months'),
  -- David is moderator of Tech Mentors and North Side
  ('55555555-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 'moderator', NOW() - INTERVAL '2 years'),
  ('55555555-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002', 'member', NOW() - INTERVAL '2 years'),
  -- Dan is in all groups
  ('55555555-0000-0000-0000-000000000005', '44444444-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'moderator', NOW() - INTERVAL '2 years'),
  ('55555555-0000-0000-0000-000000000006', '44444444-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'moderator', NOW() - INTERVAL '2 years'),
  ('55555555-0000-0000-0000-000000000007', '44444444-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'moderator', NOW() - INTERVAL '1 year')
ON CONFLICT (id) DO NOTHING;

-- =====================
-- CREATE COMMUNITY POSTS
-- =====================

INSERT INTO posts (id, group_id, user_id, content, created_at)
VALUES
  (
    '66666666-0000-0000-0000-000000000001', null,
    'bbbbbbbb-0000-0000-0000-000000000005', -- Jordan Davis
    'Just got accepted to my top choice college! None of this would have been possible without my mentor helping me with my applications. Grateful for this program!',
    NOW() - INTERVAL '2 hours'
  ),
  (
    '66666666-0000-0000-0000-000000000002', null,
    'aaaaaaaa-0000-0000-0000-000000000002', -- David Williams
    'Reminder: Group session this Saturday at 10 AM. We''ll be discussing goal-setting strategies. Looking forward to seeing everyone there!',
    NOW() - INTERVAL '5 hours'
  ),
  (
    '66666666-0000-0000-0000-000000000003', null,
    'bbbbbbbb-0000-0000-0000-000000000001', -- James Thompson
    'Proud of all the young men who participated in our community service project last weekend. You all showed great leadership and teamwork!',
    NOW() - INTERVAL '24 hours'
  ),
  (
    '66666666-0000-0000-0000-000000000004', null,
    'aaaaaaaa-0000-0000-0000-000000000003', -- Marcus Johnson
    'Had a great session with my mentor today. We worked through some tough debugging problems and I learned so much!',
    NOW() - INTERVAL '48 hours'
  ),
  (
    '66666666-0000-0000-0000-000000000005', null,
    'aaaaaaaa-0000-0000-0000-000000000002', -- David Williams
    'Quote of the day: "Iron sharpens iron, and one man sharpens another." Keep pushing each other to grow!',
    NOW() - INTERVAL '72 hours'
  ),
  (
    '66666666-0000-0000-0000-000000000006', null,
    'aaaaaaaa-0000-0000-0000-000000000001', -- Dan Mitchell
    'Exciting news: We are launching a new college prep track next month. If your mentee is a junior or senior, make sure they sign up!',
    NOW() - INTERVAL '96 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- Post likes
INSERT INTO post_likes (id, post_id, user_id, created_at)
VALUES
  -- Marcus liked post 1 (Jordan college acceptance)
  ('77777777-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000003', NOW() - INTERVAL '1 hour'),
  -- David liked post 1
  ('77777777-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', NOW() - INTERVAL '90 minutes'),
  -- Dan liked post 1
  ('77777777-0000-0000-0000-000000000003', '66666666-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', NOW() - INTERVAL '2 hours'),
  -- Marcus liked post 3 (James community service)
  ('77777777-0000-0000-0000-000000000004', '66666666-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000003', NOW() - INTERVAL '20 hours'),
  -- David liked post 4 (Marcus session)
  ('77777777-0000-0000-0000-000000000005', '66666666-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000002', NOW() - INTERVAL '47 hours'),
  -- Dan liked post 5 (David quote)
  ('77777777-0000-0000-0000-000000000006', '66666666-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', NOW() - INTERVAL '70 hours')
ON CONFLICT (id) DO NOTHING;

-- =====================
-- CREATE MESSAGES (David ↔ Marcus)
-- =====================

INSERT INTO messages (id, match_id, sender_id, content, read_at, created_at)
VALUES
  ('88888888-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 'Hey Marcus! How are you doing this week?', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('88888888-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000003', 'I''m doing good! Been working on that school project we talked about.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '5 minutes'),
  ('88888888-0000-0000-0000-000000000003', 'dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 'That''s great to hear! How''s the coding part coming along?', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '10 minutes'),
  ('88888888-0000-0000-0000-000000000004', 'dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000003', 'It''s challenging but I''m learning a lot. The debugging part is tricky!', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '15 minutes'),
  ('88888888-0000-0000-0000-000000000005', 'dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 'Debugging is where the real learning happens! Want to walk through some techniques in our next session?', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('88888888-0000-0000-0000-000000000006', 'dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000003', 'Yes please! That would be really helpful.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '3 minutes'),
  ('88888888-0000-0000-0000-000000000007', 'dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 'Perfect! I''ll prepare some examples. Also, don''t forget about your presentation tomorrow!', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '5 minutes'),
  ('88888888-0000-0000-0000-000000000008', 'dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000003', 'Thanks for the reminder! I''ve been practicing.', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),
  ('88888888-0000-0000-0000-000000000009', 'dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000003', 'The presentation went really well! Got positive feedback from my teacher.', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
  ('88888888-0000-0000-0000-000000000010', 'dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 'That''s awesome news! Proud of you!', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
  ('88888888-0000-0000-0000-000000000011', 'dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 'Great job on your presentation! Let me know how the feedback session goes.', null, NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- =====================
-- CREATE NOTIFICATIONS (Marcus)
-- =====================

INSERT INTO notifications (id, user_id, type, title, body, action_url, read_at, created_at)
VALUES
  (
    '99999999-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000003',
    'message', 'New message from David',
    'Great job on your presentation! Let me know how...',
    '/messages/dddddddd-0000-0000-0000-000000000001',
    null,
    NOW() - INTERVAL '30 minutes'
  ),
  (
    '99999999-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000003',
    'session', 'Upcoming session reminder',
    'You have a session with David Williams in 3 days',
    '/sessions/dddddddd-0000-0000-0000-000000000001',
    null,
    NOW() - INTERVAL '2 hours'
  ),
  (
    '99999999-0000-0000-0000-000000000003',
    'aaaaaaaa-0000-0000-0000-000000000003',
    'goal', 'Keep up the great work on your goals!',
    'You have 3 active goals in progress. Keep pushing!',
    '/goals',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '5 hours'
  ),
  (
    '99999999-0000-0000-0000-000000000004',
    'aaaaaaaa-0000-0000-0000-000000000003',
    'community', 'David Williams liked your post',
    'Your post received a new like',
    '/community',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '24 hours'
  ),
  (
    '99999999-0000-0000-0000-000000000005',
    'aaaaaaaa-0000-0000-0000-000000000003',
    'system', 'Welcome to Iron Sharpens Iron!',
    'Your account has been verified. Start exploring!',
    '/home',
    NOW() - INTERVAL '5 months',
    NOW() - INTERVAL '6 months'
  ),
  -- David's notifications
  (
    '99999999-0000-0000-0000-000000000006',
    'aaaaaaaa-0000-0000-0000-000000000002',
    'session', 'Session notes reminder',
    'Don''t forget to add notes for your session with Marcus today',
    '/sessions/dddddddd-0000-0000-0000-000000000001',
    null,
    NOW() - INTERVAL '1 hour'
  ),
  (
    '99999999-0000-0000-0000-000000000007',
    'aaaaaaaa-0000-0000-0000-000000000002',
    'community', 'Marcus Johnson liked your post',
    'Your post received a new like',
    '/community',
    null,
    NOW() - INTERVAL '47 hours'
  ),
  -- Dan's notifications
  (
    '99999999-0000-0000-0000-000000000008',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'match', '2 pending match requests',
    'There are 2 match requests awaiting your approval',
    '/admin',
    null,
    NOW() - INTERVAL '2 hours'
  )
ON CONFLICT (id) DO NOTHING;
