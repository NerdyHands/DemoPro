# Mr Demo Pro Admin

Internal operator portal for **Mr Demo Pro**. Separate from the marketing site. Runs at `admin.mrdemopro.com` (local port **3002**).

Staff CRM lives here: **Customers → Estimates → Contracts**, stored in Airtable base `appBDw3qjn76qICKH`. Magic-link login uses a separate **Admins** table in the same base. The marketing `client/` and Express `server/` apps stay as they are.

## Local setup

```bash
cd work
cp .env.example .env.local
# fill AIRTABLE_TOKEN, ADMIN_SESSION_SECRET, RESEND_API_KEY
npm install
npm run setup:airtable
npm run dev
```

Open http://localhost:3002 — unauthenticated requests redirect to `/login`.

| Command | What it does |
|---|---|
| `npm run dev` | Next.js dev server on port 3002 |
| `npm run build` | Production build |
| `npm start` | Serve the production build on 3002 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run inspect:airtable` | Print tables/fields in the CRM base |
| `npm run setup:airtable` | Create Admins/Customers/Estimates/Contracts; rename mixed table to Legacy Mixed |
| `npm run migrate:airtable:dry` | Show Mongo → Airtable upsert counts |
| `npm run migrate:airtable` | Upsert Mongo customers, estimates, contracts by `MongoId` |

## Airtable

Shared base: [appBDw3qjn76qICKH](https://airtable.com/appBDw3qjn76qICKH/tblSQLnizZs73xVd8/viwcmic8TToaIPBm0?blocks=hide)

- `tblSQLnizZs73xVd8` is the **mixed/legacy** table. Do not write new CRM there. Setup renames it **Legacy Mixed**.
- New tables: `Admins`, `Customers`, `Estimates`, `Contracts`.
- Token needs `data.records:read/write` and `schema.bases:read/write` to inspect/create tables.

Customer fields: Name (formula), First Name, Last Name, Business Name, Email, Phone, Address, Notes, Status (Lead/Active/Inactive), MongoId.

Estimate / contract line items are JSON in a **Line Items** long text field. Customer and Estimate are linked records.

## Mongo import

`MONGODB_URI` can live in `work/.env.local` or `server/.env.development`. The script upserts by `MongoId` (Mongo `_id`) so it is safe to re-run. It does not import PICRA, jobs, users, or overwrite Legacy Mixed.

```bash
npm run migrate:airtable:dry
npm run migrate:airtable
```

## Environment variables

| Variable | Required for | Notes |
|---|---|---|
| `AIRTABLE_TOKEN` | Auth + CRM | PAT for base `appBDw3qjn76qICKH` |
| `AIRTABLE_ADMINS_BASE_ID` | Auth | Default `appBDw3qjn76qICKH` |
| `AIRTABLE_ADMINS_TABLE_ID` | Auth | `Admins` name or `tbl…` id |
| `AIRTABLE_ADMINS_VIEW_ID` | Optional | If set, list uses this view |
| `AIRTABLE_CRM_BASE_ID` | CRM | Same base by default |
| `AIRTABLE_CUSTOMERS_TABLE_ID` | CRM | `Customers` or id |
| `AIRTABLE_ESTIMATES_TABLE_ID` | CRM | `Estimates` or id |
| `AIRTABLE_CONTRACTS_TABLE_ID` | CRM | `Contracts` or id |
| `ADMIN_SESSION_SECRET` | Auth | HMAC for `admin_session` |
| `NEXT_PUBLIC_APP_URL` | Auth | `http://localhost:3002` locally |
| `RESEND_API_KEY` | Auth | Magic link email |
| `RESEND_FROM_EMAIL` | Auth | Verified Resend domain |
| `MONGODB_URI` | Migration | Script only |
| `AIRTABLE_LEADS_BASE_ID` | Lead-gen (later) | Unused |
| `N8N_LEADS_WEBHOOK_URL` | Lead-gen (later) | Unused |
| `N8N_WEBHOOK_SECRET` | Lead-gen (later) | Unused |

## Auth flow

1. `/login` — email + Send magic link → `POST /api/auth/magic-link`
2. Server checks Admins allowlist (`Active = true`)
3. Resend emails `{NEXT_PUBLIC_APP_URL}/verify?token=…`
4. `/verify` sets httpOnly `admin_session` (HMAC, 7-day TTL)
5. Middleware blocks every other route without a valid cookie (except `/login`, `/verify`, `/api/auth/*`)

## CRM API

Cookie-gated. Invalid bodies return **400** `{ error, fields }`.

| Method | Path |
|---|---|
| GET/POST | `/api/customers` |
| GET/PATCH/DELETE | `/api/customers/:id` |
| GET/POST | `/api/estimates` |
| GET/PATCH/DELETE | `/api/estimates/:id` |
| GET/POST | `/api/contracts` |
| GET/PATCH/DELETE | `/api/contracts/:id` |

## Amplify (WEB_COMPUTE)

1. AWS Amplify → host from GitHub `DemoPro`, app root **`work`**
2. Platform **WEB_COMPUTE**, Node **20.x**
3. Copy env keys from `.env.example` into Amplify
4. Domain `admin.mrdemopro.com`; `NEXT_PUBLIC_APP_URL=https://admin.mrdemopro.com`

## Stack

- Next.js 15 App Router, React 19, TypeScript
- Tailwind CSS + shadcn-style components (landing orange `rgb(236, 65, 0)`)
- Airtable REST (`fetch`, no SDK) with 429/503 exponential backoff
- Session cookie verified in Edge middleware via Web Crypto HMAC
