# Mr Demo Pro — Website Changes Implementation Plan

> Status: PROPOSAL for review. No code has been changed. Stop-and-approve gate before any implementation.

## Tech stack (as found)

- **Frontend**: Vite 7 + React 19 SPA, `react-router-dom` v7, `react-bootstrap`, `framer-motion`.
- **Meta tags**: `react-helmet-async` via [landing/src/components/SEO.tsx](landing/src/components/SEO.tsx); per-page values in [landing/src/config/seoConfig.ts](landing/src/config/seoConfig.ts) and wired per route in [landing/src/App.tsx](landing/src/App.tsx).
- **Routing**: All routes declared in [landing/src/App.tsx](landing/src/App.tsx). Non-trailing-slash paths 301 to trailing-slash via `<Navigate>`.
- **Prerender/SEO build**: `npm run build` runs Playwright prerender ([landing/scripts/prerender-routes.js](landing/scripts/prerender-routes.js)) that writes a static `dist/<path>/index.html` per canonical route with route-specific meta baked in, then [landing/scripts/validate-prerender.js](landing/scripts/validate-prerender.js) fails the build if any canonical is missing or still points to the homepage.
- **Sitemap**: auto-generated from `App.tsx` routes via [landing/scripts/parse-routes.js](landing/scripts/parse-routes.js) + [landing/scripts/generate-sitemap.js](landing/scripts/generate-sitemap.js). Adding a route automatically adds it to the sitemap — no manual sitemap edit needed.
- **Hosting**: AWS Amplify, root dir `landing/`, build per [landing/amplify.yml](landing/amplify.yml).

---

## Phase 1 — Diagnosis: identical canonical / og:url on every route

### Root cause: hosting rewrite, NOT the app code

The meta-tag code is correct:
- [landing/src/components/SEO.tsx](landing/src/components/SEO.tsx) lines 95-107 emit `<link rel="canonical">` and `og:url` from the per-route `canonicalUrl` prop.
- Every route in [landing/src/App.tsx](landing/src/App.tsx) passes an explicit, correct `canonicalUrl` (e.g. `/services/shed-removal/` at lines 472-475).
- The prerenderer bakes these correct values into each `dist/<route>/index.html`, and `validate-prerender.js` (lines 105-107) explicitly fails the build if a non-home route's canonical equals the homepage. So the build OUTPUT is correct per route.

The breakage is at the **serving layer**. Per the repo's own [landing/AMPLIFY_SPA_ROUTING.md](landing/AMPLIFY_SPA_ROUTING.md) (lines 35-53), the Amplify "Rewrites and redirects" rule is:

```
Source: </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|eot|map|json|xml|webp)$)([^.]+$)/>
Target: /index.html
Type:   200 (Rewrite)
```

This catch-all matches **every extensionless path** (e.g. `/services/`, `/prices/`, `/services/shed-removal/`) and rewrites it to the **root** `/index.html` — which is the homepage's prerendered HTML, whose canonical/og:url is `https://mrdemopro.com/`. Result: every URL serves the homepage's static HTML, so crawlers / curl / "view source" see the homepage canonical and og:url on every route. (Client-side React + Helmet then rewrites the live DOM after hydration, which is why the page *looks* right in-browser but indexes wrong.)

Contributing factor: [landing/public/_redirects](landing/public/_redirects) is Netlify-format and is **not honored by AWS Amplify** (the file's own docs confirm this). So the per-route prerendered files (`dist/services/shed-removal/index.html`, etc.) are generated but never served while the 200-rewrite is active.

### Build-time vs runtime

This is a **runtime/hosting-config** problem. The static export is correct; Amplify just isn't serving the per-route files. No app-code change is strictly required to fix canonicals.

### Proposed fix approach

Make Amplify serve an existing prerendered file when present and only fall back to `index.html` for genuinely missing routes:

- **Primary (Amplify Console → Rewrites and redirects)**: replace the `200 (Rewrite)` catch-all with a not-found fallback rewrite, e.g. Source `/<*>`, Target `/index.html`, Type `404-200` (serve requested artifact if it exists; rewrite to index.html only on 404). This preserves prerendered `*/index.html` files while keeping SPA fallback for unknown deep links. Can also be applied via `aws amplify update-app --custom-rules`.
- Keep the existing 301 trailing-slash rules ordered before the fallback.
- **Verification**: `curl -s https://mrdemopro.com/services/shed-removal/ | grep canonical` should show the route URL, not the homepage; repeat for `/prices/`, `/faqs/`, `/services/`.

> Assumption to confirm: I cannot see the live Amplify console rule from the repo. The above is the strongest inference from `AMPLIFY_SPA_ROUTING.md` + the prerender pipeline. Step 1 of implementation is to confirm the live rule and the live served HTML before changing anything.

Optional repo-side safeguard (not the fix, but hygiene): nothing in the app code needs editing for canonicals; `SEO.tsx` and `App.tsx` are already correct.

---

## Phase 2 — Service page changes

### Existing reusable template

The newest service pages use [landing/src/components/ServiceLandingPage.tsx](landing/src/components/ServiceLandingPage.tsx) — a prop-driven template with hero/CTA, benefits, process, "what's included", optional FAQ (with FAQ JSON-LD), nearby-areas, and a `children` slot for custom sections. [landing/src/pages/ConcreteRemoval.tsx](landing/src/pages/ConcreteRemoval.tsx) is the cleanest reference. New pages should reuse this template as-is (no new variant needed).

### A) Concrete Removal — ALREADY BUILT (verify only, do not recreate)

Contrary to the task's assumption, `/services/concrete-removal/` already exists end-to-end:
- Page: [landing/src/pages/ConcreteRemoval.tsx](landing/src/pages/ConcreteRemoval.tsx) (uses `ServiceLandingPage`).
- Route: [landing/src/App.tsx](landing/src/App.tsx) lines 582-597.
- SEO: `concreteRemoval` in [landing/src/config/seoConfig.ts](landing/src/config/seoConfig.ts) lines 583-600.
- Nav dropdown: [landing/src/components/Header.tsx](landing/src/components/Header.tsx) lines 269-279.
- Services grid card: [landing/src/pages/Services.tsx](landing/src/pages/Services.tsx) lines 58-64.
- Intake form option: `'Concrete Removal'` in [landing/src/config/servicesList.ts](landing/src/config/servicesList.ts) line 10.
- Redirect: [landing/public/_redirects](landing/public/_redirects) line 28; sitemap auto-included.

**Action**: No build needed. Optional only — (a) confirm target keyword "Concrete Removal Hampton Roads VA" is reflected in `concreteRemoval` title/description, and (b) it is NOT in the homepage grid ([landing/src/pages/Home.tsx](landing/src/pages/Home.tsx) currently links shed/deck/junk/cleanout only) — add a homepage card if desired.

### B) Hoarding Cleanout — NEW PAGE

Target: `/services/hoarding-cleanout/`; keywords "hoarding cleanout" + "Hoarding Cleanout Services Hampton VA". Related to (not replacing) Cleanout Services.

Create:
- **New** `landing/src/pages/HoardingCleanout.tsx` — use `ServiceLandingPage` template (mirror `ConcreteRemoval.tsx`). Include a related-services `children` block linking to `/services/cleanout/` and `/services/junk-removal/`. Sensitive, compassionate tone; sections for process, discretion/privacy, biohazard/disposal note, FAQ.

Modify:
- **`seoConfig.ts`** — add `hoardingCleanout` entry (title/description/keywords + `Service` structured data, `canonicalUrl: https://mrdemopro.com/services/hoarding-cleanout/`), mirroring the `cleanout` entry (lines 622-639).
- **`App.tsx`** — add two routes: `/services/hoarding-cleanout` → `<Navigate to=".../" replace />` and `/services/hoarding-cleanout/` → `<SEO {...seoConfig.hoardingCleanout} canonicalUrl=".../" /> <HoardingCleanout />`, plus the import.
- **`Header.tsx`** — add a `NavDropdown.Item` for "Hoarding Cleanout" (logical placement near Cleanout Services, lines 291-301).
- **`Services.tsx`** — add a card to the `services` array (lines 8-86).
- **`Cleanout.tsx`** — add internal link(s) to `/services/hoarding-cleanout/` (see Task C section below; can share the same new related-services block).
- **`public/_redirects`** — add `\/services/hoarding-cleanout /services/hoarding-cleanout/ 301` (cosmetic/local-dev parity; real routing is Amplify console).
- Sitemap: automatic via route parsing — no manual edit.

### C) Cleanout Services — ADD "Foreclosure & REO Cleanout" section (no new page)

Target: "foreclosure cleanout" as a secondary, indexable section — no nav entry, no dedicated URL.

Modify only [landing/src/pages/Cleanout.tsx](landing/src/pages/Cleanout.tsx):
- Add a new `<section>` with an `<h2>` "Foreclosure & REO Cleanout" (and supporting copy / H3s) describing bank/REO/realtor turn-key cleanouts. The existing "Property Cleanout" card (lines 448-454) already mentions foreclosures in passing; the new section makes it distinct, indexable content.
- Add an internal cross-link to the new Hoarding Cleanout page (Task B) as a related service.

### D) House Demolition — DO NOT BUILD (on hold)

No `/services/house-demolition/` route, nav item, sitemap entry, or intake-form option exists, so there is nothing orphaned to clean up. Note: a separate `residential-demolition` page and the "house demolition" keyword already exist in `seoConfig.ts` (residential, not the on-hold capability) — leave as-is. Nothing to scaffold.

---

## Shared components: reuse vs new

- **Reuse as-is**: `ServiceLandingPage.tsx`, `SEO.tsx`, `QuoteForm.tsx`, `Header.tsx`, sitemap/prerender scripts.
- **No new shared variant required.** Hoarding Cleanout fits the existing template; the Foreclosure section is inline JSX in `Cleanout.tsx`.

---

## Open questions / assumptions

1. **Amplify rule (blocking for Phase 1)**: confirm the live Console rewrite rule and the live served HTML before changing. The fix is an Amplify config change, not a repo edit — confirm who applies it (console vs `aws amplify update-app`).
2. **Concrete Removal already exists** — confirm you want only verification/keyword polish (and optional homepage card), not a rebuild.
3. **Hoarding Cleanout template choice**: assume the `ServiceLandingPage` template (recommended) rather than a hand-built page like `Cleanout.tsx`.
4. **Intake form**: `servicesList.ts` has no "Hoarding Cleanout"/"Foreclosure Cleanout" option. Assume leads use existing "Cleanout Services" unless you want a new dropdown label added (visible label only; no backend/routing change, per instructions).
5. **Hero image** for Hoarding Cleanout — assume reuse of an existing asset (e.g. `/assets/Icons/cleanout.webp`) unless a new image is provided.
6. Minor observation (out of scope): `landing/src/pages/CabinetRemoval.tsx` exists but is not routed in `App.tsx` — flagging only.

---

## Suggested order of operations

1. **Fix the canonical/og:url hosting rule first** (Phase 1) and verify with `curl`, since it affects every page including the new ones.
2. **Confirm Concrete Removal** (2A) — verify-only / optional polish.
3. **Build Hoarding Cleanout** (2B): page → seoConfig → App.tsx routes/import → Header → Services grid → Cleanout cross-link → `_redirects`.
4. **Add Foreclosure & REO section** to Cleanout (2C).
5. Lint the touched files; run the local build once (with your go-ahead) so prerender + validate confirm route-specific canonicals and sitemap inclusion.
6. Leave **House Demolition** untouched (2D).
