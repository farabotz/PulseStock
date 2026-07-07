# PulseStock

Multi-Warehouse Inventory & Analytics Dashboard SaaS.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts, and Supabase (Auth + PostgreSQL).

## Features

- Role-Based Access Control: Admin, Warehouse Manager, Staff
- Dashboard KPIs and interactive charts
- Multi-warehouse CRUD
- Product/SKU management
- Stock transfers with audit logging
- Supabase Auth integration

## Tech Stack

- Framework: Next.js 16 App Router
- Language: TypeScript (strict)
- Styling: Tailwind CSS + shadcn/ui
- Database: Supabase PostgreSQL
- Auth: Supabase Auth
- Charts: Recharts

## Live URL

https://pulsestock-6b6zit9ws-farabotz.vercel.app

> Auto-deployed from GitHub via Vercel Git Integration. Every push to `main` triggers a new production deployment.

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| `admin@pulsestock.com` | `admin123` | Admin |
| `manager@pulsestock.com` | `manager123` | Warehouse Manager |
| `staff@pulsestock.com` | `staff123` | Staff |

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Seeding

```bash
npx tsx src/lib/db/seed.ts
```

## License

MIT
