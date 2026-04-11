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

  INSERT INTO public.profiles (id, username, full_name, role, salary, id_card)
  VALUES (zeeshan_user_id, 'zeeshan', 'Zeeshan', 'owner', 0, 'OWN-001')
  ON CONFLICT (id) DO UPDATE
  SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    salary = EXCLUDED.salary,
    id_card = EXCLUDED.id_card;

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

  INSERT INTO public.profiles (id, username, full_name, role, salary, id_card)
  VALUES (bashir_user_id, 'bashir', 'Bashir', 'owner', 0, 'OWN-002')
  ON CONFLICT (id) DO UPDATE
  SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    salary = EXCLUDED.salary,
    id_card = EXCLUDED.id_card;

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

  INSERT INTO public.profiles (id, username, full_name, role, salary, id_card)
  VALUES (farhan_user_id, 'farhan', 'Farhan', 'employee', 50000, 'EMP-001')
  ON CONFLICT (id) DO UPDATE
  SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    salary = EXCLUDED.salary,
    id_card = EXCLUDED.id_card;
END;
$$;

COMMIT;

-- Verification query
SELECT username, full_name, role, id_card
FROM public.profiles
ORDER BY role DESC, username ASC;
