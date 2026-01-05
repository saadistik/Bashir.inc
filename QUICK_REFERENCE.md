# 🗺️ BASHIR.INC - PROJECT REFERENCE

## 📁 File Structure Overview

```
Bashir.inc/
├── 📄 Configuration Files
│   ├── package.json              # Dependencies & scripts
│   ├── vite.config.js            # Vite bundler config
│   ├── tailwind.config.js        # Custom Nature Glass theme
│   ├── postcss.config.js         # PostCSS for Tailwind
│   ├── .env.example              # Environment template
│   └── .gitignore                # Git exclusions
│
├── 📄 Documentation
│   ├── README.md                 # Project overview
│   ├── SETUP_GUIDE.md            # Detailed setup instructions
│   └── QUICK_REFERENCE.md        # This file
│
├── 🗄️ Database
│   └── supabase_schema.sql       # Complete DB schema + seed data
│
├── 🌐 Entry Point
│   ├── index.html                # HTML entry point
│   └── src/
│       ├── main.jsx              # React entry point
│       ├── App.jsx               # Main app with routing
│       └── index.css             # Global styles + Tailwind
│
└── 📦 Source Code (src/)
    ├── 🔧 Core Infrastructure
    │   ├── lib/
    │   │   ├── supabase.js       # Supabase client initialization
    │   │   └── utils.js          # Helper functions (formatCurrency, etc.)
    │   └── contexts/
    │       └── AuthContext.jsx   # Global auth state management
    │
    ├── 🧩 Components
    │   ├── ProtectedRoute.jsx    # Route authentication wrapper
    │   ├── auth/
    │   │   └── LoginMascot.jsx   # Interactive SVG mascot
    │   └── layout/
    │       └── AppLayout.jsx     # Main layout with adaptive navigation
    │
    └── 📄 Pages
        ├── Login.jsx             # Login page with mascot
        ├── Home.jsx              # Employee dashboard
        ├── Dashboard.jsx         # Owner financial dashboard
        ├── Companies.jsx         # Company list view
        ├── CompanyDetail.jsx     # Company detail + tussles
        ├── TussleDetail.jsx      # Tussle workspace (3 tabs)
        ├── Calendar.jsx          # Calendar with deadlines
        ├── Workers.jsx           # Worker management
        └── Profile.jsx           # User profile + employee mgmt
```

---

## 🎨 Design System

### Color Palette
```javascript
nature: {
  emerald: '#064E3B',  // Primary background
  teal: '#14B8A6',     // Accent color
  gold: '#FCD34D',     // Highlights
  forest: '#047857',   // Secondary
  mint: '#5EEAD4',     // Success state
}
```

### Glassmorphism Classes
```css
.glass-panel {
  @apply bg-white/10 backdrop-blur-xl border border-white/20 shadow-glass rounded-3xl;
}

.glass-button {
  @apply bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl;
}
```

### Custom Animations
- `animate-gradient-shift` - Background gradient movement
- `animate-pulse-glow` - Glowing notification effect
- `animate-float` - Floating button effect

---

## 🔐 Authentication Flow

```
User Input (username + password)
    ↓
Map to email: username@bashir.inc
    ↓
Supabase Auth (signInWithPassword)
    ↓
Fetch profile from profiles table
    ↓
Check role: 'owner' or 'employee'
    ↓
Redirect: /dashboard or /home
```

---

## 📊 Database Schema

### Core Tables
1. **profiles** - User info (extends auth.users)
2. **companies** - Client companies
3. **tussles** - Orders/projects
4. **receipts** - Material expense receipts
5. **expense_allocations** - Receipt → Tussle mapping
6. **workers** - Contract workers
7. **work_assignments** - Worker → Tussle mapping
8. **calendar_events** - Custom events

### Key Relationships
```
companies (1) → (many) tussles
tussles (1) → (many) expense_allocations
tussles (1) → (many) work_assignments
receipts (1) → (many) expense_allocations
workers (1) → (many) work_assignments
```

---

## 🛣️ Route Structure

### Public Routes
- `/login` - Login page

### Employee Routes
- `/home` - Dashboard with pending orders
- `/companies` - Company list
- `/companies/:id` - Company detail
- `/tussles/:id` - Tussle workspace
- `/calendar` - Calendar view
- `/workers` - Worker list
- `/profile` - User profile

### Owner Routes
- `/dashboard` - Financial dashboard with charts
- Plus all employee routes
- `/profile` - Employee management

---

## 🎭 Component Patterns

### LoginMascot States
```javascript
Idle → Eyes follow mouse
Username Focus → Attentive pose
Password Focus → Covers eyes
Success → Celebration jump
```

### TussleDetail Tabs
```javascript
Overview → Financial stats
Materials → Receipt allocations
Labor → Worker assignments
```

### AppLayout Responsive
```javascript
Mobile (<768px) → Bottom floating dock
Desktop (≥768px) → Top floating capsule
```

---

## 💡 Key Features

### Smart Add Order Flow
```
Click "Add Order"
    ↓
Enter client name
    ↓
Search companies table
    ↓
If exists → Go to company page (highlight Add Tussle)
If new → Create company → Go to page → Open tussle form
```

### Profit Calculation
```javascript
Profit = Total Revenue 
       - Material Costs (from allocations)
       - Labor Costs (from assignments)
       - Employee Salaries (from profiles)
```

### Expense Allocation
```
1. Upload receipt with total amount
2. Select existing receipt
3. Allocate portion to specific tussle
4. Track remaining balance
```

---

## 🔨 Common Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview

# Run with network access (mobile testing)
npm run dev -- --host
```

---

## 🐛 Debug Checklist

### Authentication Issues
```javascript
// Check in browser console:
console.log('User:', user)
console.log('Profile:', profile)
console.log('Role:', profile?.role)

// Verify in Supabase:
SELECT * FROM profiles WHERE username = 'owner';
```

### Data Not Showing
```javascript
// Check browser Network tab for failed requests
// Verify RLS policies in Supabase
// Test query in SQL Editor:
SELECT * FROM tussles;
```

### Mascot Not Animating
```javascript
// Check Framer Motion is installed:
npm list framer-motion

// Verify mouse events:
console.log('Mouse:', mousePosition)
```

---

## 📦 Key Dependencies

### Core
- `react` v18.2.0 - UI library
- `react-dom` v18.2.0 - React renderer
- `react-router-dom` v6.21.3 - Routing

### Styling
- `tailwindcss` v3.4.1 - Utility CSS
- `framer-motion` v11.0.3 - Animations
- `clsx` + `tailwind-merge` - Class utilities

### Data & Charts
- `@supabase/supabase-js` v2.39.3 - Backend
- `recharts` v2.10.3 - Charts
- `date-fns` v3.2.0 - Date utilities
- `lucide-react` v0.309.0 - Icons

---

## 🚀 Quick Start Commands

```bash
# 1. Install
npm install

# 2. Configure Supabase
# Create .env file with your credentials

# 3. Run SQL schema
# Copy supabase_schema.sql → Supabase SQL Editor

# 4. Create users
# Follow SETUP_GUIDE.md Step 4

# 5. Start app
npm run dev

# 6. Login
# owner/bashir123 or ali/bashir123
```

---

## 📱 Responsive Breakpoints

```javascript
// Tailwind defaults used:
sm: '640px'   // Small tablets
md: '768px'   // Tablets (navigation changes here)
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
```

---

## 🎯 Performance Tips

### Optimize Images
```javascript
// Use appropriate sizes
<img loading="lazy" />
```

### Lazy Load Pages
```javascript
const Dashboard = lazy(() => import('./pages/Dashboard'))
```

### Memoize Expensive Calculations
```javascript
const profit = useMemo(() => 
  revenue - costs
, [revenue, costs])
```

---

## 🔒 Security Notes

### Environment Variables
- Never commit `.env` file
- Use `.env.example` for template
- Store secrets in Vercel/hosting dashboard

### Supabase RLS
- All tables have Row Level Security enabled
- Policies control data access
- Test policies before production

### Password Requirements
- Minimum 6 characters (Supabase default)
- Change in production: Authentication → Settings

---

## 🎨 Customization Quick Guide

### Change Colors
Edit `tailwind.config.js`:
```javascript
nature: {
  emerald: '#YOUR_COLOR',
  teal: '#YOUR_COLOR',
  // ...
}
```

### Change Mascot
Edit `src/components/auth/LoginMascot.jsx`

### Add Page
1. Create in `src/pages/NewPage.jsx`
2. Add route in `src/App.jsx`
3. Add nav item in `AppLayout.jsx`

---

## 📞 Support Resources

- **Supabase Docs**: supabase.com/docs
- **React Docs**: react.dev
- **Tailwind Docs**: tailwindcss.com
- **Framer Motion**: framer.com/motion

---

**Last Updated**: January 2026
**Version**: 1.0.0
