-- =====================================================
-- MIGRATION: Reset Auth Users and Seed Fixed IDs
-- Creates exactly 3 allowed users:
--   Owners: zeeshan, bashir
--   Employee: farhan
-- =====================================================
-- Run this in Supabase SQL Editor as a privileged role.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Remove every existing app profile first (requested behavior)
DELETE FROM public.profiles;

-- Remove all existing auth users so only the seeded IDs can sign in
DELETE FROM auth.users;

DO $$
DECLARE
  zeeshan_user_id UUID;
  bashir_user_id UUID;
  farhan_user_id UUID;
BEGIN
  -- Create owner: zeeshan
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'zeeshan@bashir.inc',
    crypt('bashir123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"zeeshan","full_name":"Zeeshan","role":"owner","salary":0}'::jsonb,
    now(),
    now()
  ) RETURNING id INTO zeeshan_user_id;

  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    zeeshan_user_id,
    'zeeshan@bashir.inc',
    jsonb_build_object('sub', zeeshan_user_id::text, 'email', 'zeeshan@bashir.inc'),
    'email',
    now(),
    now(),
    now()
  );

  -- Create owner: bashir
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'bashir@bashir.inc',
    crypt('bashir123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"bashir","full_name":"Bashir","role":"owner","salary":0}'::jsonb,
    now(),
    now()
  ) RETURNING id INTO bashir_user_id;

  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    bashir_user_id,
    'bashir@bashir.inc',
    jsonb_build_object('sub', bashir_user_id::text, 'email', 'bashir@bashir.inc'),
    'email',
    now(),
    now(),
    now()
  );

  -- Create employee: farhan
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'farhan@bashir.inc',
    crypt('bashir123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"farhan","full_name":"Farhan","role":"employee","salary":50000}'::jsonb,
    now(),
    now()
  ) RETURNING id INTO farhan_user_id;

  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    farhan_user_id,
    'farhan@bashir.inc',
    jsonb_build_object('sub', farhan_user_id::text, 'email', 'farhan@bashir.inc'),
    'email',
    now(),
    now(),
    now()
  );

  -- Ensure profile roles and optional ID cards are exactly as required
  UPDATE public.profiles
  SET role = 'owner', full_name = 'Zeeshan', username = 'zeeshan', salary = 0, id_card = 'OWN-001'
  WHERE id = zeeshan_user_id;

  UPDATE public.profiles
  SET role = 'owner', full_name = 'Bashir', username = 'bashir', salary = 0, id_card = 'OWN-002'
  WHERE id = bashir_user_id;

  UPDATE public.profiles
  SET role = 'employee', full_name = 'Farhan', username = 'farhan', salary = 50000, id_card = 'EMP-001'
  WHERE id = farhan_user_id;
END;
$$;

COMMIT;

-- Verification query
SELECT username, full_name, role, id_card
FROM public.profiles
ORDER BY role DESC, username ASC;
