# Vercel Deployment Guide for Bashir.inc ERP

## 🚨 Important: Environment Variables Required

Your app needs Supabase credentials to work. Follow these steps:

## Step 1: Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Open your project (or create one)
3. Go to **Project Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (long string starting with `eyJ...`)

## Step 2: Add Environment Variables to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to your project on [vercel.com](https://vercel.com)
2. Click **Settings** → **Environment Variables**
3. Add these variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Click **Save**
5. Go to **Deployments** tab
6. Click the ⋯ menu on the latest deployment → **Redeploy**

### Option B: Via Vercel CLI

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel --prod
```

## Step 3: Setup Database

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy the entire contents of `supabase_schema.sql`
3. Paste and run it in SQL Editor
4. Go to **Authentication** → **Users** → **Add User**
5. Create these accounts:

**Owner Account:**
- Email: `owner@bashir.inc`
- Password: `bashir123`
- Auto Confirm: ✅ Yes

**Employee Account:**
- Email: `ali@bashir.inc`
- Password: `bashir123`
- Auto Confirm: ✅ Yes

6. Update profiles (run in SQL Editor):

```sql
-- Update owner profile
UPDATE profiles 
SET username = 'owner', full_name = 'Business Owner', role = 'owner', salary = 0
WHERE id = (SELECT id FROM auth.users WHERE email = 'owner@bashir.inc');

-- Update employee profile
UPDATE profiles 
SET username = 'ali', full_name = 'Ali Khan', role = 'employee', salary = 50000
WHERE id = (SELECT id FROM auth.users WHERE email = 'ali@bashir.inc');
```

## Step 4: Test Your Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. You should see the login page (not a white screen!)
3. Login with:
   - Username: `owner` Password: `bashir123` (Owner Dashboard)
   - Username: `ali` Password: `bashir123` (Employee View)

## Troubleshooting

### Still seeing white screen?
- Open browser console (F12) and check for errors
- Verify environment variables are set in Vercel
- Make sure you redeployed after adding variables

### "Configuration Error" message?
- Environment variables are missing or incorrect
- Double-check spelling: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Both variables must start with `VITE_` prefix

### Can't login?
- Run the database schema in Supabase SQL Editor
- Create users via Supabase Authentication dashboard
- Update profiles table with username and role

### 404 errors on page refresh?
- Make sure `vercel.json` exists with SPA rewrites
- Check that file is committed to git

## Quick Checklist

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Demo users created in Supabase Auth
- [ ] Profiles updated with usernames/roles
- [ ] Environment variables added to Vercel
- [ ] Project redeployed after adding variables
- [ ] Login page loads (no white screen)
- [ ] Can login with demo credentials

## Need Help?

Check the following files in your repository:
- `README.md` - Project overview
- `SETUP_GUIDE.md` - Detailed setup instructions
- `QUICK_REFERENCE.md` - Developer reference

## Environment Variables Summary

```bash
# Required for production deployment
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Never commit these values to git!** They're only for Vercel's environment variables.
