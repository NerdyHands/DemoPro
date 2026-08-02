# GTM / GA4 Verification Checklist — Mr Demo Pro

Container: **GTM-593BSRJT**  
Site: **https://mrdemopro.com**

## Pre-flight

- [ ] Export current GTM container backup (Admin → Export Container)
- [ ] Import [`gtm/GTM-593BSRJT-addon.json`](gtm/GTM-593BSRJT-addon.json) — replace `GA4_MEASUREMENT_ID` in all addon tags with your GA4 ID first
- [ ] Confirm **no existing tags were modified** — only new `(addon)` suffixed items
- [ ] Deploy landing site code with updated `gtm.ts` instrumentation

## GTM Preview mode — event verification

Open GTM → Preview → connect to mrdemopro.com (or local dev with GTM loaded).

| # | Action | Expected dataLayer event | Key parameters |
|---|--------|------------------------|--------------|
| 1 | Load homepage | `page_metadata` | `page_type: homepage`, `brand: mrdemopro`, `service_category: demolition` |
| 2 | Load homepage | `page_view` | `page_path: /` |
| 3 | Navigate to `/services/shed-removal/` | `service_view` | `service_name: shed_removal` |
| 4 | Submit homepage quote form | `generate_lead` | `form_id: home_hero_quote`, `service_type: demolition` |
| 5 | Click phone in footer | `phone_call_click` | `click_location: footer`, `phone_number: 757-848-4559` |
| 6 | Click phone in hero CTA | `phone_call_click` | `click_location: cta` |
| 7 | Click email on blog post | `email_click` | `email_address: info@mrdemopro.com` |
| 8 | Expand FAQ on `/faqs/` | `faq_expand` | `question_text` populated |
| 9 | Expand FAQ on service page | `faq_expand` | `question_text` populated |
| 10 | Scroll to 25%, 50%, 75%, 90% | `scroll_depth` | `percent_scrolled` matches threshold |
| 11 | Visit with `?utm_source=google&utm_medium=cpc&utm_campaign=test` | `page_metadata` | UTMs present |

### Legacy events (should still fire — do not break)

- [ ] Phone click also fires `phone_click` (legacy)
- [ ] Form submit also fires `form_submit` (legacy)
- [ ] Thank-you page fires `thank_you` but is **not** tagged as conversion

## GA4 DebugView (post-publish)

1. GA4 → Admin → DebugView (enable via Tag Assistant or debug param)
2. Repeat actions above
3. Confirm each custom event appears with correct parameters

## GA4 Admin — mark conversions

GA4 → Admin → Events → toggle **Mark as conversion**:

- [ ] `generate_lead`
- [ ] `phone_call_click`

Do **not** mark: `thank_you`, `form_submit`, `phone_click` (avoids double-counting).

## GA4 Admin — custom dimensions

Register event-scoped custom dimensions for:

- [ ] `form_id`
- [ ] `click_location`
- [ ] `service_name`
- [ ] `service_type`
- [ ] `percent_scrolled`
- [ ] `page_type`
- [ ] `brand`
- [ ] `service_category`
- [ ] `question_text`
- [ ] `utm_source`
- [ ] `utm_medium`
- [ ] `utm_campaign`

## GA4 Audiences (manual setup)

Create in GA4 → Admin → Audiences:

### Converters

- Users who triggered `generate_lead` OR `phone_call_click` (max membership: 540 days)

### High-Intent Non-Converters

- Condition group (AND):
  - `service_view` event OR `page_path` contains `/services/`
  - `scroll_depth` where `percent_scrolled` = 75
  - NOT `generate_lead` (exclude users)
  - NOT `phone_call_click` (exclude users)
- Lookback: 30 days

### Returning Visitors

- Built-in: Session count > 1 (or use GA4 suggested audience)

### Paid Ad Traffic

- `utm_medium` = `cpc` (session-scoped; requires UTM capture on `page_metadata`)

## Post-launch monitoring (7 days)

- [ ] Compare `generate_lead` count vs. form submissions in GAS/CRM
- [ ] Compare `phone_call_click` vs. call tracking (if available)
- [ ] Check for duplicate conversion inflation in GA4 reports
- [ ] Validate Paid Ad Traffic audience populates when using `utm_medium=cpc` links
