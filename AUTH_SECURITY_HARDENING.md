# Auth Security Hardening (Supabase)

This guide configures brute-force resistance, bot protection, and safer session behavior for production.

## 1) Keep only approved users

1. Run [migration_seed_fixed_users.sql](migration_seed_fixed_users.sql) in Supabase SQL Editor.
2. Confirm only these users exist in Authentication > Users:
   - zeeshan@bashir.inc (owner)
   - bashir@bashir.inc (owner)
   - farhan@bashir.inc (employee)
3. Disable any workflow that creates users from the app UI (already removed).

## 2) Configure Auth rate limits

In Supabase Dashboard:
1. Go to Authentication > Settings.
2. Open the Rate Limits section.
3. Apply strict limits for:
   - Sign-in attempts
   - OTP/email sends (if enabled)
   - Token refresh endpoints
4. Recommended starting point:
   - Sign-in: 5 requests per minute per IP
   - Recovery/OTP sends: 3 requests per minute per IP
   - Keep burst limits low and tune from logs

Note: Setting labels can differ slightly by Supabase version/plan. Use the lowest practical values that do not block real users.

## 3) Add bot protection and brute-force friction

In Supabase Dashboard:
1. Go to Authentication > Settings > Bot and Abuse Protection.
2. Enable CAPTCHA protection for sign-in (hCaptcha or Turnstile if available).
3. Enable leaked password protection if available.
4. Keep email confirmation enabled for any future non-admin account creation.

App-side protection already added:
- Login UI now locks for 15 minutes after 5 failed attempts on the same browser.

## 4) Strengthen password policy

In Authentication > Settings:
1. Set minimum password length to at least 12.
2. Require mixed character classes (upper, lower, number, symbol) if available.
3. Rotate all current default passwords immediately after first secure login.

## 5) Session hardening

In Authentication > Settings:
1. Reduce JWT/session lifetime to business-acceptable minimum.
2. Enable single-session or shorter inactivity windows if supported by your plan.
3. Revoke all sessions after password reset or credential changes.

## 6) Enforce least privilege in database

1. Run [migration_security_hardening.sql](migration_security_hardening.sql) in SQL Editor.
2. Confirm anonymous users cannot read business tables.
3. Keep service_role key only on server-side systems, never in frontend code.

## 7) Monitoring and alerting

1. Review Authentication logs weekly.
2. Alert on:
   - Repeated failed logins from same IP/device
   - Unusual login geography/time
   - Rapid token refresh failures
3. Keep a simple incident process: lock user, reset password, review logs, rotate keys if needed.

## 8) SQL injection safety notes

1. Frontend uses Supabase query builder APIs, which parameterize queries and reduce classic SQL injection risk.
2. Avoid building raw SQL strings in client code.
3. For any future SQL functions/procedures, validate inputs and use strict types.
4. RLS is mandatory and already enabled in your schema.

## Quick implementation order

1. Run [migration_seed_fixed_users.sql](migration_seed_fixed_users.sql)
2. Run [migration_security_hardening.sql](migration_security_hardening.sql)
3. Apply Auth rate limits and bot protection in Supabase Dashboard
4. Rotate all three account passwords to strong unique values
5. Review logs for 24 hours and tune limits
