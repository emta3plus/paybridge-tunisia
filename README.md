# PayBridge Tunisia

A full-stack payment bridge application enabling Tunisian users to pay for international services in TND (Tunisian Dinar) while the admin handles international USD payments with a 15% commission.

## Features

- **User Authentication** — Registration, login, and profile management with NextAuth.js (JWT strategy)
- **Payment Requests** — Create requests for international services with automatic TND conversion
- **Live Price Calculator** — Real-time conversion preview (1 USD = 3.25 TND + 15% commission)
- **Proof Upload** — Users upload local bank transfer proof; admins upload international payment proof
- **Status Tracking** — Visual timeline: Created → Paid → Approved → Completed (or Rejected)
- **Reorder** — One-click reorder for completed services with pre-filled form
- **Search** — Filter requests by service name on the user dashboard
- **Notifications** — In-app notification bell with real-time alerts on status changes
- **Admin Panel** — Full admin dashboard with stats, request management, and user management
- **User Management** — Admin view of all users with request counts and spending totals
- **Profile Management** — Editable user profile (name, phone) with account information
- **Responsive Design** — Mobile-first layout with Tailwind CSS and shadcn/ui components
- **Role-Based Access** — Middleware-protected routes for user and admin areas

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Database** | SQLite via Prisma ORM |
| **Authentication** | NextAuth.js v4 (JWT, Credentials provider) |
| **Password** | PBKDF2 (Node.js `crypto` module) |
| **Animations** | Framer Motion |
| **State** | React hooks, `useCallback`, `useMemo` |
| **Notifications** | Sonner (toast) + custom notification bell |

## Getting Started

### Prerequisites

- **Bun** (latest) — [Install Bun](https://bun.sh)
- **Node.js** 18+ (optional, Bun handles everything)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/paybridge-tunisia.git
cd paybridge-tunisia

# Install dependencies
bun install

# Set up the database
bun run db:push

# (Optional) Seed demo accounts
bun run db:seed
```

### Setup

1. Copy `.env.example` to `.env` and fill in the values (see [Environment Variables](#environment-variables) below)
2. Run `bun run db:push` to create the SQLite database and tables
3. Run `bun run db:seed` to create the admin and demo user accounts
4. Start the development server:

```bash
bun run dev
```

The application will be available at `http://localhost:3000`.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database file path | `file:./db/dev.db` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | (auto-generated) |
| `NEXTAUTH_URL` | Base URL of the application | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | Application display name | `PayBridge Tunisia` |

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./db/dev.db"
NEXTAUTH_SECRET="your-secret-here-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

## Database Setup

The project uses **SQLite** for zero-config development. The database file is stored at `db/dev.db`.

### Schema

The Prisma schema defines three models:

- **User** — id, email, password, name, phone, role, balance, isVerified
- **PaymentRequest** — id, userId, serviceName, amountUSD, amountTND, commission, exchangeRate, status, proofs
- **Notification** — id, userId, title, message, read

### Migrations

```bash
# Push schema changes (development)
bun run db:push

# Generate Prisma client
bun run db:generate
```

## Seeding (Admin & Demo Accounts)

```bash
bun run db:seed
```

This creates two accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@paybridge.tn` | `admin123` |
| **Demo User** | `demo@paybridge.tn` | `demo123` |

## Project Structure

```
paybridge-tunisia/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeder
├── db/
│   └── dev.db                 # SQLite database file
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (providers, toaster)
│   │   ├── page.tsx           # Landing page
│   │   ├── auth/
│   │   │   ├── signin/        # Sign-in page
│   │   │   └── signup/        # Registration page
│   │   ├── dashboard/
│   │   │   ├── page.tsx       # User dashboard (search, stats)
│   │   │   ├── profile/       # User profile management
│   │   │   └── requests/
│   │   │       ├── new/       # New payment request (live calculator)
│   │   │       └── [id]/      # Request detail (timeline, proof upload)
│   │   ├── admin/
│   │   │   ├── page.tsx       # Admin panel (stats, request list)
│   │   │   ├── users/         # User management table
│   │   │   └── requests/[id]/ # Admin request review
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── register/  # POST user registration
│   │       │   └── [...nextauth]/ # NextAuth handler
│   │       ├── requests/      # CRUD + proof upload
│   │       ├── admin/         # Admin APIs (stats, requests, users)
│   │       ├── profile/       # GET/PATCH user profile
│   │       └── notifications/ # GET user notifications
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── providers/         # Session provider
│   │   └── notification-bell.tsx
│   └── lib/
│       ├── auth.ts            # getCurrentUser, requireAuth, requireAdmin
│       ├── auth-options.ts    # NextAuth configuration
│       ├── db.ts              # Prisma client singleton
│       ├── format.ts          # Currency/date/status formatters
│       └── password.ts        # PBKDF2 hashing
├── middleware.ts              # Route protection (auth + admin)
├── .env                       # Environment variables
├── package.json
├── tsconfig.json
└── worklog.md                 # Development changelog
```

## Deployment to Vercel

PayBridge Tunisia is optimized for Vercel deployment:

1. **Push to GitHub** and connect the repository to [Vercel](https://vercel.com)
2. **Set environment variables** in the Vercel project settings:
   - `DATABASE_URL` — Switch to a managed PostgreSQL/MySQL for production
   - `NEXTAUTH_SECRET` — Generate a strong secret
   - `NEXTAUTH_URL` — Set to your production domain
3. **Update Prisma provider** in `schema.prisma` from `sqlite` to `postgresql` (or `mysql`)
4. **Deploy** — Vercel auto-detects Next.js and configures the build

> **Note:** SQLite is for development only. For production, use a managed database (PostgreSQL recommended). Update the Prisma provider and `DATABASE_URL` accordingly.

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET/POST` | `/api/auth/[...nextauth]` | NextAuth sign-in/callback | No |
| `POST` | `/api/auth/register` | Register a new user | No |

### User APIs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/requests` | List user's payment requests | Yes |
| `POST` | `/api/requests` | Create a new payment request | Yes |
| `GET` | `/api/requests/:id` | Get request detail | Yes (owner) |
| `POST` | `/api/requests/:id/proof` | Upload payment proof | Yes (owner) |
| `GET` | `/api/profile` | Get user profile | Yes |
| `PATCH` | `/api/profile` | Update user profile | Yes |
| `GET` | `/api/notifications` | Get user notifications | Yes |

### Admin APIs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/admin/stats` | Dashboard statistics | Admin |
| `GET` | `/api/admin/requests` | List all requests (with status filter) | Admin |
| `PATCH` | `/api/admin/requests/:id` | Approve, complete, or reject request | Admin |
| `GET` | `/api/admin/users` | List all users with stats | Admin |

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
