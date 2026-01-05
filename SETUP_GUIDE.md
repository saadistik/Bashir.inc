# 🚀 BASHIR.INC ERP - COMPLETE SETUP GUIDE

## 📋 Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works)
- A code editor (VS Code recommended)

---

## 🏗️ STEP 1: PROJECT SETUP

### 1.1 Install Dependencies
```bash
cd "c:\Users\hp\Desktop\Bashir.inc"
npm install
```

This will install:
- React 18 + Vite
- Tailwind CSS
- Framer Motion
- Supabase Client
- Recharts
- React Router
- Lucide Icons
- date-fns

---

## ☁️ STEP 2: SUPABASE SETUP

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose a name (e.g., "bashir-inc-erp")
4. Set a strong database password
5. Select a region close to you
6. Wait for project to initialize (~2 minutes)

### 2.2 Get API Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### 2.3 Create Environment File
1. In the project root, create a file named `.env`
2. Add your credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**⚠️ Important**: Replace the placeholder values with your actual credentials!

---

## 🗄️ STEP 3: DATABASE SETUP

### 3.1 Run SQL Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Open the file `supabase_schema.sql` from your project
4. Copy ALL the contents (Ctrl+A, Ctrl+C)
5. Paste into the SQL Editor
6. Click **RUN** or press **Ctrl+Enter**
7. Wait for confirmation: "Success. No rows returned"

This creates:
- ✅ All database tables
- ✅ Row Level Security policies
- ✅ Triggers for auto-updates
- ✅ Sample seed data (companies, workers, tussles)

---

## 👥 STEP 4: CREATE USER ACCOUNTS

### 4.1 Create Owner Account
1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Fill in:
   - Email: `owner@bashir.inc`
   - Password: `bashir123`
   - Auto Confirm User: ✅ **YES**
4. Click **Create User**
5. **Copy the User ID** (looks like: `12345678-1234-1234-1234-123456789012`)

6. Go to **SQL Editor** and run:
```sql
UPDATE profiles 
SET 
  username = 'owner',
  full_name = 'Business Owner',
  role = 'owner',
  salary = 0
WHERE id = 'paste-owner-user-id-here';
```

### 4.2 Create Employee Account
1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Fill in:
   - Email: `ali@bashir.inc`
   - Password: `bashir123`
   - Auto Confirm User: ✅ **YES**
4. Click **Create User**
5. **Copy the User ID**

6. Go to **SQL Editor** and run:
```sql
UPDATE profiles 
SET 
  username = 'ali',
  full_name = 'Ali Khan',
  role = 'employee',
  salary = 50000
WHERE id = 'paste-employee-user-id-here';
```

---

## 🎨 STEP 5: RUN THE APPLICATION

### 5.1 Start Development Server
```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 5.2 Open in Browser
Navigate to: **http://localhost:3000**

---

## 🔐 STEP 6: TEST LOGIN

### Test Owner Account
1. On login page, enter:
   - Username: `owner`
   - Password: `bashir123`
2. Click **Sign In**
3. Watch the mascot celebrate! 🎉
4. You should be redirected to `/dashboard` (Owner view)

### Test Employee Account
1. Sign out (top-right menu)
2. On login page, enter:
   - Username: `ali`
   - Password: `bashir123`
3. Click **Sign In**
4. You should be redirected to `/home` (Employee view)

---

## ✅ VERIFICATION CHECKLIST

After setup, verify these features work:

### Owner Dashboard
- [ ] Dashboard shows financial charts
- [ ] Profit calculation displays correctly
- [ ] Can switch between Weekly/Monthly views
- [ ] Pie chart shows order status
- [ ] Cost breakdown bars appear

### Employee Workflow
- [ ] Home page shows pending orders
- [ ] Can view companies list
- [ ] Click "Add Order" opens modal
- [ ] Can create new tussle for a company
- [ ] Tussle detail page has 3 tabs
- [ ] Can toggle tussle status
- [ ] Calendar shows deadlines
- [ ] Workers page displays correctly

### Profile & Admin
- [ ] Owner can see "Employee Management" section
- [ ] Owner can create new employees
- [ ] Employee sees their salary on profile
- [ ] Logout works correctly

---

## 🎨 FEATURES TO EXPLORE

### 1. Interactive Mascot
- Move your mouse around on the login page
- Watch the monster's eyes follow your cursor
- Type in the username field - mascot looks attentive
- Type in the password field - mascot covers its eyes!

### 2. Smart Add Order Flow
1. Click the floating **+** button (employee view)
2. Type a new client name: `Test Company`
3. System automatically creates company and opens tussle form
4. Try again with existing company `Sapphire Textiles`
5. It redirects to that company's page

### 3. Tussle Workspace
1. Click any tussle card
2. Explore the **Overview** tab - see profit calculations
3. Go to **Materials** tab - add expense allocations
4. Go to **Labor** tab - assign workers

### 4. Responsive Design
- Resize browser window to mobile size (<768px)
- Navigation moves to bottom dock
- Add button floats in corner
- Resize to desktop - navigation moves to top

---

## 🐛 TROUBLESHOOTING

### Issue: "Invalid API credentials"
**Solution**: 
- Double-check your `.env` file
- Ensure URL doesn't have trailing slash
- Restart dev server after changing `.env`

### Issue: Users can't login
**Solution**:
- Verify users were created in Supabase Auth
- Check "Auto Confirm User" was enabled
- Run the UPDATE profiles SQL commands
- Try password reset in Supabase Dashboard

### Issue: Database queries fail
**Solution**:
- Verify SQL schema ran successfully
- Check RLS policies are enabled
- Ensure seed data was inserted

### Issue: Mascot doesn't animate
**Solution**:
- Clear browser cache
- Check browser console for errors
- Ensure Framer Motion is installed

### Issue: Charts don't show
**Solution**:
- Verify Recharts is installed
- Check if seed data exists in database
- Look for console errors

### Issue: "No rows returned" errors
**Solution**:
- Re-run seed data section of SQL schema
- Verify foreign key relationships
- Check RLS policies aren't blocking reads

---

## 📱 MOBILE TESTING

To test on your phone:
1. Run: `npm run dev -- --host`
2. Find your computer's IP address
3. On phone, navigate to: `http://YOUR-IP:3000`

---

## 🚀 DEPLOYMENT

### Deploy to Vercel
```bash
npm run build
```

Then:
1. Create account on [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables in Vercel dashboard
4. Deploy!

Your Supabase backend is already live - no extra deployment needed.

---

## 📚 NEXT STEPS

### Customize for Your Business
1. Update company name in `README.md` and `index.html`
2. Replace placeholder images with real product photos
3. Adjust color scheme in `tailwind.config.js`
4. Add your logo to login page

### Add Features
- File upload for receipts (use Supabase Storage)
- Email notifications for deadlines
- Export reports to PDF
- Multi-language support
- Dark mode toggle

### Production Checklist
- [ ] Change all default passwords
- [ ] Set up proper email authentication
- [ ] Configure Supabase security rules
- [ ] Add error tracking (Sentry)
- [ ] Set up analytics
- [ ] Configure backup strategy
- [ ] Add terms of service
- [ ] Set up SSL certificate

---

## 🆘 SUPPORT

If you encounter issues:

1. **Check Browser Console**: Press F12 to see JavaScript errors
2. **Check Network Tab**: See if API calls are failing
3. **Verify Supabase**: Check dashboard for query errors
4. **Review SQL Logs**: In Supabase → Logs → PostgreSQL

---

## 🎉 SUCCESS!

If you can login and see the dashboard, congratulations! Your Manufacturing ERP system is now running.

**Demo Credentials:**
- 👑 Owner: `owner` / `bashir123`
- 👤 Employee: `ali` / `bashir123`

Enjoy managing your manufacturing business with style! ✨

---

**Built with ❤️ using React, Supabase, and Framer Motion**
