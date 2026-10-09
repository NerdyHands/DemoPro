# Demolition and Cleanouts Without the Runaround

Prepared October 9, 2026. Page /.

- Live URL: https://mrdemopro.com/
- HTTP status from a fresh GET: 200
- Match status: Ploy counterpart available
- Live page title: Demolition Company in Hampton Roads | Mr Demo Pro – Free Estimates
- Live H1: Demolition and Cleanouts Without the Runaround
- Repository: https://github.com/NerdyHands/DemoPro
- Repository files to inspect:
  - landing/src/pages/Home.tsx
  - landing/src/pages/Home.css

## Evidence and limits

Sitemap and live GET checks were refreshed October 9. This is an instruction sheet, not a website edit or a claim of tested lead delivery. Historical database review/transfer checkboxes remain untouched. Repository references were read from main; verify current paths and working tree before editing.

Ploy desktop target, 1280px viewport: https://storage.googleapis.com/ployai/46fc852a-8ef2-4bf6-800d-b7d20be7f179/internal/images/screenshot-1791538320439.jpg
Ploy mobile target, 390px viewport: https://storage.googleapis.com/ployai/46fc852a-8ef2-4bf6-800d-b7d20be7f179/internal/images/screenshot-1791538338352.jpg
Desktop/mobile visual evidence is available. Address lookup and successful lead delivery were not tested.

## Copy into Cursor

```text
Work in NerdyHands/DemoPro. Align only https://mrdemopro.com/ with its dated Ploy visual references. Make minimal local edits for review. Do not alter other pages.
Start by inspecting landing/src/pages/Home.tsx, landing/src/pages/Home.css.
Desktop target: https://storage.googleapis.com/ployai/46fc852a-8ef2-4bf6-800d-b7d20be7f179/internal/images/screenshot-1791538320439.jpg
Mobile target: https://storage.googleapis.com/ployai/46fc852a-8ef2-4bf6-800d-b7d20be7f179/internal/images/screenshot-1791538338352.jpg
If references are inaccessible, request screenshot attachments before guessing. Recheck the current live output and skip already resolved differences.

Align the homepage hero layout, spacing and text scale with its targets. The desktop grid already uses 7:5, so do not treat that ratio as missing. Move the single existing See Our Services link below both columns, centered on desktop and after the form on mobile, preserving #services and its scroll handler. Match orange field outlines without replacing the live form. Keep serviceType/businessName, the website honeypot, AddressAutocomplete, reCAPTCHA, existing Google Apps Script delivery, loading/success/error states and tracking.
Add the 4px service-card top accent, linear-gradient(90deg,#ec4100,#f27c50), only if still missing. Preserve all six cards, exact text, assets and quote links. Ploy card references use 128px artwork, 24px titles, 16px/26px body and 40px buttons; check actual fit rather than clipping to those sizes. Match section-specific text scale and spacing across the existing sections. Preserve the live header phone button and footer legal links, even though Ploy lacks them. Keep the existing construction-debris illustration. Do not copy preview noindex flags or /_ploy/form-submit.

Preserve all other routes, existing navigation and root-qualified homepage anchors, tel:757-848-4559, /terms/ and /privacy/, public canonical host, current indexing settings, schema, sitemap/robots, share images, tracking and consent. Preserve form integrations and feedback. No commits, push, deployment, DNS, secrets exposure, real lead submissions or unrequested migrations. No Astro/Tailwind or platform-only API transplant into landing/'s React/TypeScript/Vite/Bootstrap app.
Inspect scripts before running lint, type checks or local compilation. The full build includes external sync, generated SEO writes and HTTP audits; do not run side effects blindly. Do not change package/config/lock files for convenience. Check desktop 1280px, tablet and mobile 390px, full-page layout, overflow, anchors, mobile menu, phone links and accessibility states without submitting a real quote. Test shared-template users for regressions. Report skipped/blocked checks honestly.
For EVERY file added or changed, immediately report its exact path, purpose/change summary, dependencies, import/mount/style wiring and checks. Follow that file's summary with a separate copy-ready Cursor integration/follow-up prompt for that exact file and its preservation rules. If it is already integrated, say so rather than inventing another import. Finish with the minimal diff and remaining differences. Never claim a live change when you only prepared local edits or instructions.
```
