-- =====================================================
-- MIGRATION: Reset Auth Users and Seed Fixed IDs
-- Creates exactly 3 allowed users:
--   Owners: zeeshan, bashir
--   Employee: farhan
-- =====================================================
-- Run this in Supabase SQL Editor as a privileged role.

BEGIN;

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
  SELECT id INTO zeeshan_user_id
  FROM auth.admin_create_user(
    jsonb_build_object(
      'email', 'zeeshan@bashir.inc',
      'password', 'bashir123',
      'email_confirm', true,
      'user_metadata', jsonb_build_object(
        'username', 'zeeshan',
        'full_name', 'Zeeshan',
        'role', 'owner',
        'salary', 0
      )
    )
  );

  -- Create owner: bashir
  SELECT id INTO bashir_user_id
  FROM auth.admin_create_user(
    jsonb_build_object(
      'email', 'bashir@bashir.inc',
      'password', 'bashir123',
      'email_confirm', true,
      'user_metadata', jsonb_build_object(
        'username', 'bashir',
        'full_name', 'Bashir',
        'role', 'owner',
        'salary', 0
      )
    )
  );

  -- Create employee: farhan
  SELECT id INTO farhan_user_id
  FROM auth.admin_create_user(
    jsonb_build_object(
      'email', 'farhan@bashir.inc',
      'password', 'bashir123',
      'email_confirm', true,
      'user_metadata', jsonb_build_object(
        'username', 'farhan',
        'full_name', 'Farhan',
        'role', 'employee',
        'salary', 50000
      )
    )
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
