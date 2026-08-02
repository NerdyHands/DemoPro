# Mr Demo Pro Analytics

GTM container: **GTM-593BSRJT**

## Files

| File | Purpose |
|------|---------|
| [GA4_EVENT_SCHEMA.md](GA4_EVENT_SCHEMA.md) | Event names, parameters, legacy conflicts |
| [GTM_VERIFICATION_CHECKLIST.md](GTM_VERIFICATION_CHECKLIST.md) | Preview + DebugView + GA4 Admin setup |
| [UTM_CAMPAIGN_TEMPLATES.md](UTM_CAMPAIGN_TEMPLATES.md) | Google Ads / GHL / Craigslist UTM patterns |
| [gtm/GTM-593BSRJT-addon.json](gtm/GTM-593BSRJT-addon.json) | Importable GTM tags/triggers/variables (additive only) |

## Import GTM addon

1. Export current container as backup
2. Open `gtm/GTM-593BSRJT-addon.json` and replace all `GA4_MEASUREMENT_ID` with your GA4 Measurement ID (e.g. `G-XXXXXXXX`)
3. GTM → Admin → Import Container → Merge → choose workspace
4. Publish after Preview verification (see checklist)

## Code

Instrumentation lives in [`src/config/gtm.ts`](../src/config/gtm.ts). Events push to `window.dataLayer` for GTM to forward to GA4.
