# Mr Demo Pro Admin

Internal operator portal for **Mr Demo Pro**. Separate from the marketing site. Runs at `admin.mrdemopro.com` (local port **3002**).

This pass is **auth + shell only**. Outbound lead-gen (New Run / runs / leads) is not wired until Airtable bases and n8n webhook URLs are provided. There is no mock lead data.

## Local setup

```bash
cd work
cp .env.example .env.local
# fill secrets in .env.local — never commit it
npm install
npm run dev
```

Open http://localhost:3002 — unauthenticated requests redirect to `/login`.

Scripts:

| Command | What it does |
|---|---|
| `npm run dev` | Next.js dev server on port 3002 |
| `npm run build` | Production build |
| `npm start` | Serve the production build on 3002 |
| `npm run typecheck` | `tsc --noEmit` |

## Amplify (WEB_COMPUTE)

This is a **Next.js SSR** app (API routes + middleware). Do not deploy it as the Vite landing SPA.

1. AWS Amplify Console → **Create new app** → host from GitHub `DemoPro`.
2. Branch: `main` (or your deploy branch).
3. **App root / monorepo directory:** `work`
4. Platform: **WEB_COMPUTE** (Next.js SSR). Amplify should pick up `work/amplify.yml`.
5. Node.js **20.x** on the build image.
6. **Environment variables:** copy every key from `.env.example` into Amplify (values stay in Amplify, not git).
7. Custom domain: `admin.mrdemopro.com` (not the landing CloudFront/Amplify app).
8. `NEXT_PUBLIC_APP_URL` must be `https://admin.mrdemopro.com` in production so magic links point at the right host.

Build (`work/amplify.yml`): `npm ci` then `npm run build`; artifacts from `.next`.

## Environment variables

| Variable | Required for | Notes |
|---|---|---|
| `AIRTABLE_TOKEN` | Auth | Personal access token with data.records:read/write on the Admins base |
| `AIRTABLE_ADMINS_BASE_ID` | Auth | `app…` |
| `AIRTABLE_ADMINS_TABLE_ID` | Auth | Table id or name |
| `AIRTABLE_ADMINS_VIEW_ID` | Optional | If set, list uses this view |
| `ADMIN_SESSION_SECRET` | Auth | Long random string used to HMAC-sign `admin_session` |
| `NEXT_PUBLIC_APP_URL` | Auth | `http://localhost:3002` locally; `https://admin.mrdemopro.com` in prod |
| `RESEND_API_KEY` | Auth | Sends the magic link |
| `RESEND_FROM_EMAIL` | Auth | Default `no-reply@mrdemopro.com` (must be a verified Resend domain) |
| `AIRTABLE_LEADS_BASE_ID` | Lead-gen (later) | Unused until features are wired |
| `N8N_BASE_URL` | Lead-gen (later) | Default `https://nerdyhands.app.n8n.cloud` |
| `N8N_LEADS_WEBHOOK_URL` | Lead-gen (later) | Copy the **production** URL from the n8n Webhook node |
| `N8N_WEBHOOK_SECRET` | Lead-gen (later) | HMAC (`x-signature`, `x-timestamp`) when posting to n8n |

Missing auth vars return **503** from magic-link/verify (`Admins base not configured` / Resend / session secret). The signed-in home page lists which keys are set vs missing without showing values.

## Airtable Admins table

Used only for the magic-link allowlist. Create a table (any name; put the id in `AIRTABLE_ADMINS_TABLE_ID`).

| Field | Type | Required |
|---|---|---|
| `Name` | Single line text | Yes (display name; may contain the email) |
| `Email` | Email or text | Yes unless the email lives in `Name` |
| `Active` | Checkbox | Yes — must be true to receive a link |
| `Magic Nonce` | Single line text | Optional — written when a link is issued |
| `Magic Expires` | Date/ISO text | Optional — written when a link is issued |

Lookup: list records (view if configured), match email (case-insensitive) on `Email` or an `@` address in `Name`, require `Active = true`. Magic links still work if the nonce fields are missing; the token is HMAC-signed and expires in 20 minutes.

## Auth flow

1. `/login` — email + **Send magic link** (`onClick`, no form submit) → `POST /api/auth/magic-link`
2. Server checks Admins allowlist (`Active = true`)
3. Resend emails `{NEXT_PUBLIC_APP_URL}/verify?token=…`
4. `/verify` calls `GET /api/auth/verify` which sets httpOnly `admin_session` (HMAC, 7-day TTL)
5. Middleware blocks every other route without a valid cookie (except `/login`, `/verify`, `/api/auth/*`)
6. `GET /api/auth/me` → `{ email, name }`
7. `POST /api/auth/logout` clears the cookie

No Airtable / Resend / n8n keys are sent to the browser.

## API routes

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/magic-link` | Public | Validate email, allowlist, send Resend link |
| `GET` | `/api/auth/verify?token=` | Public | Set `admin_session` cookie |
| `GET` | `/api/auth/me` | Cookie | `{ email, name }` |
| `POST` | `/api/auth/logout` | Public | Clear cookie |

Invalid `POST` bodies return **400** with `{ error, fields }`.

## n8n (not wired yet)

When lead-gen ships:

1. Open the orchestration workflow on `https://nerdyhands.app.n8n.cloud`
2. Open the **Webhook** node → copy the **Production URL** into `N8N_LEADS_WEBHOOK_URL`
3. Share `N8N_WEBHOOK_SECRET` with the workflow HMAC check (`x-signature`, `x-timestamp`)
4. Admin app will validate input → HMAC POST → read results back from Airtable (never call n8n from the browser)

## Stack

- Next.js 15 App Router, React 19, TypeScript
- Plain CSS (no Tailwind)
- Airtable REST (`fetch`, no SDK) with 429/503 exponential backoff
- Session cookie verified in Edge middleware via Web Crypto HMAC
