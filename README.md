# Bashir.inc - Manufacturing ERP System

A Next-Gen Manufacturing ERP System with a "Nature Glass" aesthetic, featuring a cute monster interactive login and role-based workflows for manufacturing businesses.

## 🌟 Features

### Visual Design
- **Nature Glass Aesthetic**: Glassmorphic UI with organic gradient backgrounds
- **Interactive Mascot**: Cute monster with eye-tracking and password hiding animations
- **Responsive Navigation**: Adaptive floating docks for mobile and desktop
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions

### User Roles

#### Employee Workflow
- Dashboard with pending orders and deadlines
- Smart "Add Order" flow with company search/creation
- Tussle workspace with tabbed interface:
  - Overview: Financial stats and profit calculations
  - Materials: Receipt management and cost allocation
  - Labor: Worker assignments and pay tracking
- Company and worker management
- Calendar with deadline tracking

#### Owner Workflow
- Financial dashboard with charts (Recharts)
- Profit analysis: Revenue - Materials - Labor - Salaries
- Weekly/Monthly profit trends
- Order status visualization
- Employee management and creation
- Super admin access to all features

## 🚀 Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom glassmorphism
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Dates**: date-fns

## 📦 Installation

1. **Clone and Install Dependencies**
   ```bash
   cd Bashir.inc
   npm install
   ```

2. **Set Up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Create `.env` file:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Run Database Schema**
   - Go to Supabase Dashboard → SQL Editor
   - Copy and paste the contents of `supabase_schema.sql`
   - Execute the SQL

4. **Create Demo Users**
   
   In Supabase Dashboard → Authentication → Users, create:
   
   **Owner Account:**
   - Email: `owner@bashir.inc`
   - Password: `bashir123`
   - Then run in SQL Editor:
     ```sql
     UPDATE profiles 
     SET username = 'owner', full_name = 'Business Owner', role = 'owner', salary = 0
     WHERE id = 'your_owner_user_id';
     ```

   **Employee Account:**
   - Email: `ali@bashir.inc`
   - Password: `bashir123`
   - Then run in SQL Editor:
     ```sql
     UPDATE profiles 
     SET username = 'ali', full_name = 'Ali Khan', role = 'employee', salary = 50000
     WHERE id = 'your_employee_user_id';
     ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open Browser**
   Navigate to `http://localhost:3000`

7. **Apply Production Auth Security**
   - Follow `AUTH_SECURITY_HARDENING.md` for rate limits, brute-force controls, CAPTCHA, and session hardening.

## 🎨 Design System

### Colors
- **Deep Emerald**: `#064E3B` (Primary background)
- **Soft Teal**: `#14B8A6` (Accent)
- **Sunlight Gold**: `#FCD34D` (Highlights)
- **Forest**: `#047857` (Secondary)
- **Mint**: `#5EEAD4` (Success)

### Glassmorphism
- Background: `bg-white/10`
- Backdrop Blur: `backdrop-blur-xl`
- Border: `border-white/20`
- Shadows: Custom glass shadows

## 📱 Responsive Design

### Mobile (< 768px)
- Floating bottom dock navigation
- Elevated circular "Add" button
- Single column layouts

### Desktop (≥ 768px)
- Floating top capsule navigation
- Multi-column masonry grids
- Expanded content areas

## 🔐 Authentication Flow

1. User enters username and password
2. Username is mapped to `username@bashir.inc` email format
3. Supabase authenticates user
4. Profile is fetched with role
5. User is redirected based on role:
   - Owner → `/dashboard`
   - Employee → `/home`

## 📊 Data Logic

### Profit Calculation
```
Profit = Total Revenue - Material Costs - Worker Labor - Employee Salaries
```

### Smart Order Creation
1. User clicks "Add Order"
2. Modal prompts for client name
3. System searches for existing company
4. If found: Redirect to company page with "Add Tussle" auto-opened
5. If new: Create company → Redirect → Open tussle form

### Expense Allocation
- Upload receipts with total amount
- Allocate specific amounts to individual tussles
- Track remaining receipt balance

### Worker Assignments
- Assign workers to tussles
- Calculate: Total Pay = Quantity × Rate
- Track status (pending/completed)

## 🗂️ Project Structure

```
Bashir.inc/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginMascot.jsx      # Interactive SVG mascot
│   │   ├── layout/
│   │   │   └── AppLayout.jsx        # Main layout with navigation
│   │   └── ProtectedRoute.jsx       # Route authentication wrapper
│   ├── contexts/
│   │   └── AuthContext.jsx          # Auth state management
│   ├── lib/
│   │   ├── supabase.js              # Supabase client
│   │   └── utils.js                 # Helper functions
│   ├── pages/
│   │   ├── Login.jsx                # Login page
│   │   ├── Home.jsx                 # Employee dashboard
│   │   ├── Dashboard.jsx            # Owner dashboard with charts
│   │   ├── Companies.jsx            # Company list
│   │   ├── CompanyDetail.jsx        # Company detail with tussles
│   │   ├── TussleDetail.jsx         # Tussle workspace (tabs)
│   │   ├── Calendar.jsx             # Calendar view
│   │   ├── Workers.jsx              # Worker management
│   │   └── Profile.jsx              # User profile + employee mgmt
│   ├── App.jsx                      # Main app with routing
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global styles
├── supabase_schema.sql              # Complete database schema
├── package.json
├── tailwind.config.js               # Tailwind with custom theme
├── vite.config.js
└── README.md
```

## 🎯 Key Features Implementation

### LoginMascot Animation States
- **Idle**: Eyes follow mouse cursor
- **Username Focus**: Monster looks attentive, slight scale
- **Password Focus**: Hands animate up to cover eyes
- **Success**: Celebration animation with sparkles

### Tussle Workspace Tabs
1. **Overview**: Revenue vs costs with profit display
2. **Materials**: Receipt gallery with allocation system
3. **Labor**: Worker list with auto-calculated totals

### Owner Dashboard Charts
- Area chart showing revenue, costs, and profit over time
- Pie chart for order status distribution
- Cost breakdown with progress bars
- Weekly/Monthly toggle for time periods

## 🚢 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Backend
- Supabase handles all backend automatically
- Database, Auth, and APIs are managed
- No additional backend deployment needed

## 📄 License

MIT License - Built for Bashir.inc Manufacturing

## 👨‍💻 Development

Created by a Principal Full-Stack Architect & Senior UI/UX Motion Designer

---

**Demo Credentials:**
- Owner: `owner` / `bashir123`
- Employee: `ali` / `bashir123`
