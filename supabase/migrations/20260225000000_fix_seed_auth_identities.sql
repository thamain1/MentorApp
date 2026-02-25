/*
  Fix seeded test user authentication.

  Direct inserts into auth.users do not automatically create the required
  auth.identities rows. Without an identity record, signInWithPassword
  fails even when the password hash is correct.

  This migration inserts the missing identity records for all 8 seeded
  test accounts so they can log in with email + IronTest2026!
*/

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES
  -- Primary personas
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","email":"dan@ironsharpensirontest.dev"}',
    'email',
    'dan@ironsharpensirontest.dev',
    NOW(), NOW(), NOW()
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000002',
    '{"sub":"aaaaaaaa-0000-0000-0000-000000000002","email":"david@ironsharpensirontest.dev"}',
    'email',
    'david@ironsharpensirontest.dev',
    NOW(), NOW(), NOW()
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    'aaaaaaaa-0000-0000-0000-000000000003',
    '{"sub":"aaaaaaaa-0000-0000-0000-000000000003","email":"marcus@ironsharpensirontest.dev"}',
    'email',
    'marcus@ironsharpensirontest.dev',
    NOW(), NOW(), NOW()
  ),
  -- Supporting cast
  (
    'bbbbbbbb-0000-0000-0000-000000000001',
    'bbbbbbbb-0000-0000-0000-000000000001',
    '{"sub":"bbbbbbbb-0000-0000-0000-000000000001","email":"james@ironsharpensirontest.dev"}',
    'email',
    'james@ironsharpensirontest.dev',
    NOW(), NOW(), NOW()
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000002',
    'bbbbbbbb-0000-0000-0000-000000000002',
    '{"sub":"bbbbbbbb-0000-0000-0000-000000000002","email":"michael@ironsharpensirontest.dev"}',
    'email',
    'michael@ironsharpensirontest.dev',
    NOW(), NOW(), NOW()
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000003',
    'bbbbbbbb-0000-0000-0000-000000000003',
    '{"sub":"bbbbbbbb-0000-0000-0000-000000000003","email":"kevin@ironsharpensirontest.dev"}',
    'email',
    'kevin@ironsharpensirontest.dev',
    NOW(), NOW(), NOW()
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000004',
    'bbbbbbbb-0000-0000-0000-000000000004',
    '{"sub":"bbbbbbbb-0000-0000-0000-000000000004","email":"andre@ironsharpensirontest.dev"}',
    'email',
    'andre@ironsharpensirontest.dev',
    NOW(), NOW(), NOW()
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000005',
    'bbbbbbbb-0000-0000-0000-000000000005',
    '{"sub":"bbbbbbbb-0000-0000-0000-000000000005","email":"jordan@ironsharpensirontest.dev"}',
    'email',
    'jordan@ironsharpensirontest.dev',
    NOW(), NOW(), NOW()
  )
ON CONFLICT (provider, provider_id) DO NOTHING;
