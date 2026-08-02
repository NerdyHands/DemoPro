# Client Application Overview

This document describes the **`client/`** React frontend (Create React App + PWA template). For a single-file deep dive (for example only `App.jsx`), open that file directly.

## What the client is

**Mr Demo Pro** (`mr-demo-pro-client`) is a **single-page React 19 app** (`react-router-dom` v7) that talks to a backend at **`http://localhost:5000`** (via `package.json` **proxy** and `REACT_APP_API_URL`). It uses **Google OAuth** (`@react-oauth/google`) wrapped around the whole router. **`jwt-decode`** is available for token handling where pages need it.

## Entry and shell (`src/index.jsx`)

- Renders `<App />` under **`React.StrictMode`**.
- Registers **web vitals** and leaves the **service worker unregistered** (PWA hooks present but off by default).
- Adds **global error / `unhandledrejection` filters** so noisy messages from browser extensions (disconnected ports, extension context, etc.) do not clutter the console.

## Routing and features (`src/App.jsx`)

The app maps URLs to page components. High-level areas:

| Area | Routes (examples) | Purpose |
|------|-------------------|---------|
| Auth | `/auth`, `/login`, `/signup` | Login/signup flows |
| Workspace | `/dashboard`, `/project-dashboard`, `/admin`, `/project-details/:projectId` | Main dashboard and project detail |
| Upload / docs | `/upload`, `/my-documents`, `/picra-upload` | Inspection/report uploads and user documents |
| Admin | `/admin/pipeline`, `/admin/quotes`, … | Pipeline + quotes CRUD behind **`RequireAdmin`** |
| CRM / sales | `/customers`, `/estimates`, `/contracts`, `/amendments/*` | Customers, estimates, contracts, amendments |
| Inspections | `/inspection-report/*`, `/prework-inspection/*`, `/prework-inspections` | Inspection and pre-work inspection workflows |
| Sharing | `/client-reports/:reportId` | Client-facing report view |
| MLS | `/properties` | Property listings UI backed by API |

The **default route `/`** **`Navigate`s to `/auth`**.

## Configuration (`src/config/config.jsx`)

Central **app metadata**, **API base URL**, timeouts/retries, **feature flags** (service worker/analytics/debug), **`REACT_APP_USE_FAKE_DATA`**, file limits/types, **localStorage keys**, and a catalog of **named routes/endpoints** (some overlap conceptually with what `api.jsx` actually calls).

## API layer (`src/services/api.jsx`)

A **singleton `ApiService`** using **`fetch`**:

- Builds URLs from `REACT_APP_API_URL` (default `http://localhost:5000`).
- Attaches **`Authorization: Bearer`** from `localStorage.authToken` unless body is **`FormData`** (then `Content-Type` is left to the browser).
- On **401**, clears auth storage and redirects to **`/auth`** when not already on auth pages.
- Optionally delegates to **`FakeDataService`** when `config.useFakeData` is true.

It exposes methods for **health**, **OTP/auth/register/Google**, **users**, **projects**, **reports** (including uploads), **PICRA processing**, **quotes**, **ChatGPT repair-item extraction**, and **MLS pending properties**.

## How you run it (`package.json` + `start-client.js`)

- **`npm start` / `npm run dev`**: copies `.env.development` → `.env`, then runs **`start-client.js`**, which forces **`PORT=3001`** and spawns **`react-scripts start`**.
- **`npm run build`**: copies production env then **`react-scripts build`**; **`build:ci`** skips the env copy.

## Summary

The client is the **browser UI** for Demo Pro: authenticated access (OTP + Google), dashboards and projects, **quotes/admin** tooling, **customers → estimates → contracts → amendments**, **inspection / pre-work / PICRA** flows, **client reports**, and **MLS listings**, all driven by a shared **`api.jsx`** service against the Node API on port 5000.
