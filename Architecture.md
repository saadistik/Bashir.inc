# Architecture — Bashir.inc Manufacturing ERP

## Table of Contents

1. [Overview](#overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Technology Stack](#technology-stack)
4. [Frontend Architecture](#frontend-architecture)
   - [Directory Structure](#directory-structure)
   - [Routing](#routing)
   - [State Management & Auth](#state-management--auth)
   - [Component Hierarchy](#component-hierarchy)
   - [Design System](#design-system)
5. [Backend Architecture](#backend-architecture)
   - [Supabase Services](#supabase-services)
   - [Database Schema](#database-schema)
   - [Row Level Security](#row-level-security)
6. [Data Flow](#data-flow)
   - [Authentication Flow](#authentication-flow)
   - [Order (Tussle) Lifecycle](#order-tussle-lifecycle)
   - [Profit Calculation](#profit-calculation)
7. [Role-Based Access](#role-based-access)
8. [Deployment Architecture](#deployment-architecture)
9. [Key Design Decisions](#key-design-decisions)

---

## Overview

Bashir.inc is a **Manufacturing ERP (Enterprise Resource Planning)** single-page application built for a small-to-medium manufacturing business. It manages the full order lifecycle — from client intake through material tracking, worker assignments, and financial reporting — using a **Nature Glass** glassmorphic UI aesthetic.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Browser (SPA)                     │
│                                                     │
│   React 18 + Vite  │  Tailwind CSS  │ Framer Motion │
│   React Router v6  │  Recharts      │ Lucide Icons  │
└──────────────────────────┬──────────────────────────┘
                           │ HTTPS / Supabase JS SDK
                           ▼
┌─────────────────────────────────────────────────────┐
│                   Supabase (BaaS)                   │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │  Auth        │  │  PostgreSQL  │  │ Storage  │  │
│  │  (JWT/RLS)   │  │  (8 tables)  │  │ (images) │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────┘
```

The frontend is a fully static SPA deployed on **Vercel**. There is **no custom backend server** — all data persistence, authentication, and file storage are handled by Supabase.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Build tool | Vite 5 | Fast dev server & bundler |
| UI framework | React 18 | Component-based rendering |
| Styling | Tailwind CSS 3 | Utility-first CSS + custom glassmorphism theme |
| Animations | Framer Motion 11 | Page transitions, mascot, micro-interactions |
| Routing | React Router v6 | Client-side navigation |
| Charts | Recharts 2 | Revenue/profit visualizations |
| Icons | Lucide React | Icon library |
| Date utilities | date-fns 3 | Date formatting & arithmetic |
| Utility | clsx + tailwind-merge | Conditional class composition |
| Backend | Supabase | Auth, PostgreSQL DB, file storage |
| Hosting | Vercel | Static frontend deployment |

---

## Frontend Architecture

### Directory Structure

```
src/
├── App.jsx                  # Root component — router setup & config guard
├── main.jsx                 # Entry point — mounts React into #root
├── index.css                # Global styles, Tailwind imports, custom CSS vars
│
├── components/
│   ├── auth/
│   │   └── LoginMascot.jsx  # Interactive SVG monster with eye/hand animations
│   ├── layout/
│   │   └── AppLayout.jsx    # Shell: top/bottom nav + <Outlet> for pages
│   ├── ConfigError.jsx      # Displayed when env vars are missing
│   └── ProtectedRoute.jsx   # Auth + role gate wrapper for routes
│
├── contexts/
│   └── AuthContext.jsx      # Global auth state (user, profile, signIn, signOut)
│
├── lib/
│   ├── supabase.js          # Supabase client singleton + isConfigured flag
│   └── utils.js             # Shared helper/utility functions
│
└── pages/
    ├── Login.jsx            # Login form with animated mascot
    ├── Home.jsx             # Employee dashboard (pending orders, deadlines)
    ├── Dashboard.jsx        # Owner dashboard (financial charts, KPIs)
    ├── Companies.jsx        # Client company list + smart add-order flow
    ├── CompanyDetail.jsx    # Company page with tussle list
    ├── TussleDetail.jsx     # Tussle workspace (Overview / Materials / Labor tabs)
    ├── Calendar.jsx         # Calendar with deadline tracking
    ├── Workers.jsx          # Worker directory & management
    └── Profile.jsx          # User profile + owner-only employee management
```

### Routing

All routes are defined in `App.jsx` using React Router v6's nested routes:

```
/login                    → Login (public)
/                         → Redirect (→ /dashboard if owner, → /home if employee)
/home                     → Home           [ProtectedRoute: employee only]
/dashboard                → Dashboard      [ProtectedRoute: owner only]
/companies                → Companies      [ProtectedRoute: authenticated]
/companies/:id            → CompanyDetail  [ProtectedRoute: authenticated]
/tussles/:id              → TussleDetail   [ProtectedRoute: authenticated]
/calendar                 → Calendar       [ProtectedRoute: authenticated]
/workers                  → Workers        [ProtectedRoute: authenticated]
/profile                  → Profile        [ProtectedRoute: authenticated]
*                         → Redirect to /
```

`ProtectedRoute` wraps routes and enforces:
1. User must be authenticated (redirects to `/login` otherwise).
2. If `requiredRole` is specified, user's profile role must match (redirects to role-appropriate home otherwise).

All authenticated routes render inside `AppLayout`, which provides the navigation dock and page container.

### State Management & Auth

There is **no global state library** (no Redux, Zustand, etc.). State is managed via:

- **`AuthContext`** — single React context that holds `user` (Supabase session), `profile` (DB row), and `loading` state. Provided at the root via `<AuthProvider>`.
- **Local component state** (`useState`) — all page-level data (companies, tussles, workers, etc.) is fetched and held locally in each page component.
- **Supabase realtime is not used** — data is fetched on component mount and after mutations.

### Component Hierarchy

```
App
└── BrowserRouter
    └── AuthProvider
        └── AppRoutes
            ├── <Login />                        (public)
            └── ProtectedRoute
                └── AppLayout
                    ├── Navigation (top/bottom dock)
                    └── <Outlet>
                        ├── Home / Dashboard
                        ├── Companies / CompanyDetail
                        ├── TussleDetail (tabs: Overview, Materials, Labor)
                        ├── Calendar
                        ├── Workers
                        └── Profile
```

### Design System

The UI uses a **Nature Glass** aesthetic implemented in `tailwind.config.js` and `index.css`:

| Token | Value | Usage |
|---|---|---|
| `nature-emerald` | `#064E3B` | Primary background |
| `nature-forest` | `#047857` | Secondary background |
| `nature-teal` | `#14B8A6` | Accent / interactive elements |
| `nature-gold` | `#FCD34D` | Highlights / warnings |
| `nature-mint` | `#5EEAD4` | Success states |

**Glassmorphism** pattern applied consistently via Tailwind utilities:
- Background: `bg-white/10`
- Blur: `backdrop-blur-xl`
- Border: `border border-white/20`
- Shadow: custom `glass-shadow` CSS class

**Responsive breakpoints:**
- `< 768px` — floating bottom navigation dock, single-column layouts
- `≥ 768px` — floating top capsule navigation, multi-column grid layouts

---

## Backend Architecture

### Supabase Services

| Service | Usage |
|---|---|
| **Auth** | JWT-based authentication; email/password sign-in |
| **PostgreSQL** | Primary data store (8 tables) |
| **Row Level Security** | Authorization enforced at DB level |
| **Storage** | Receipt images, company logos, tussle images, profile avatars |

### Database Schema

The database has 8 tables with the following relationships:

```
auth.users (Supabase built-in)
    │
    └── profiles (1:1)
            id, username, full_name, role, salary, id_card, avatar_url

companies
    │
    └── tussles (1:N)
            id, company_id, name, image_url, status, sell_price, cost_price, due_date, notes
                │
                ├── expense_allocations (1:N)
                │       id, tussle_id, receipt_id, allocated_amount
                │
                └── work_assignments (1:N)
                        id, tussle_id, worker_id, quantity, rate, total_pay (computed), due_date, status

receipts
    │
    └── expense_allocations (1:N)
            id, receipt_id, tussle_id, allocated_amount

workers
    │
    └── work_assignments (1:N)
            id, worker_id, tussle_id, quantity, rate, total_pay, due_date, status

calendar_events
    id, title, date, type, description
```

**Computed column:** `work_assignments.total_pay` is a PostgreSQL `GENERATED ALWAYS AS (quantity * rate) STORED` column — labor cost is always consistent without application logic.

**Automatic timestamps:** A `update_updated_at_column()` trigger fires `BEFORE UPDATE` on `profiles`, `companies`, `tussles`, `workers`, and `work_assignments`.

**Auto profile creation:** An `on_auth_user_created` trigger fires `AFTER INSERT` on `auth.users`, automatically inserting a row into `profiles` using `raw_user_meta_data`.

### Row Level Security

All tables have RLS enabled. Policy summary:

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | All authenticated | Owners only | Own row | — |
| `companies` | All authenticated | All authenticated | All authenticated | — |
| `tussles` | All authenticated | All authenticated | All authenticated | All authenticated |
| `receipts` | All authenticated | All authenticated | — | — |
| `expense_allocations` | All authenticated | All authenticated | — | All authenticated |
| `workers` | All authenticated | All authenticated | All authenticated | — |
| `work_assignments` | All authenticated | All authenticated | All authenticated | All authenticated |
| `calendar_events` | All authenticated | All authenticated | All authenticated | All authenticated |

---

## Data Flow

### Authentication Flow

```
1. User enters username (e.g. "ali") + password on Login page
2. App maps username → email: "ali@bashir.inc"
3. supabase.auth.signInWithPassword({ email, password }) called
4. On success: Supabase returns JWT session
5. AuthContext.fetchProfile() queries profiles table for the user's id
6. Profile (including role) stored in AuthContext
7. AppRoutes redirects:
     role === 'owner'    → /dashboard
     role === 'employee' → /home
```

### Order (Tussle) Lifecycle

```
Employee clicks "Add Order"
    ↓
Modal: Enter client company name
    ↓
Search companies table for match
    ├── Found → Navigate to /companies/:id (company exists)
    └── Not found → INSERT into companies → Navigate to /companies/:id
                    ↓
            CompanyDetail auto-opens "Add Tussle" form
                    ↓
            INSERT into tussles (name, sell_price, due_date, …)
                    ↓
            TussleDetail workspace opens
            ┌───────────────────────────────────────┐
            │  Tab: Overview  → Revenue & profit     │
            │  Tab: Materials → Upload receipts,     │
            │                   allocate costs       │
            │  Tab: Labor     → Assign workers,      │
            │                   set qty × rate       │
            └───────────────────────────────────────┘
```

### Profit Calculation

Profit is calculated client-side in the Dashboard page using data aggregated from Supabase queries:

```
Net Profit = Total Revenue
           − Material Costs   (SUM of expense_allocations.allocated_amount)
           − Labor Costs      (SUM of work_assignments.total_pay)
           − Employee Salaries (SUM of profiles.salary WHERE role = 'employee')
```

---

## Role-Based Access

| Feature | Employee | Owner |
|---|---|---|
| View own dashboard (`/home`) | ✅ | ❌ |
| View owner dashboard (`/dashboard`) | ❌ | ✅ |
| View/add companies & tussles | ✅ | ✅ |
| Manage materials & labor | ✅ | ✅ |
| View calendar | ✅ | ✅ |
| View/add workers | ✅ | ✅ |
| Financial profit charts | ❌ | ✅ |
| Create employee accounts | ❌ | ✅ |
| View all employee profiles | ❌ | ✅ |

Role enforcement is layered:
1. **`ProtectedRoute`** (frontend) — redirects on role mismatch before rendering.
2. **Supabase RLS** (database) — prevents unauthorized data access even if the frontend is bypassed.

---

## Deployment Architecture

```
Developer
    │
    ├── git push → GitHub
    │
    └── Vercel (CD)
            │
            ├── npm run build  (Vite bundles SPA → dist/)
            └── Serve dist/ as static files
                    │
                    └── Browser loads index.html
                            │
                            └── Runtime API calls → Supabase (hosted cloud)
```

**Environment variables** required at build time (configured in Vercel):

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>
```

If these are absent, the app renders a `ConfigError` component rather than crashing silently.

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| No custom backend | Supabase BaaS provides Auth, DB, and Storage — eliminates operational overhead for a small team |
| RLS at database level | Authorization cannot be bypassed by client-side bugs; security is enforced close to data |
| Local component state only | Avoids complexity of a global store; each page fetches its own data on mount |
| Username → email mapping | Users log in with short usernames; the `@bashir.inc` suffix is transparent to them |
| Computed `total_pay` column | Ensures labor cost is always `quantity × rate` without relying on application logic |
| Vite over CRA | Significantly faster HMR and build times |
| Framer Motion | Provides a polished, branded feel; used sparingly to avoid performance impact |
