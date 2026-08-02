# GA4 Custom Event Schema — Mr Demo Pro (mrdemopro.com)

Container: **GTM-593BSRJT**  
Implementation: [`landing/src/config/gtm.ts`](../src/config/gtm.ts) + GTM addon tags

## Conversion events (mark as key events in GA4 Admin)

### `generate_lead`

Fired on successful form submit (before thank-you redirect).

| Parameter | Type | Expected values |
|-----------|------|-----------------|
| `form_id` | string | `home_hero_quote`, `quote_{service}_{inline\|block}`, `contact_form`, `diy_quiz_lead` |
| `page_path` | string | e.g. `/`, `/services/shed-removal/`, `/contact/` |
| `service_type` | string | Always `demolition` |
| `lead_type` | string | `quote_request`, `contact_form`, `quiz_submission` |
| `service_name` | string | Human-readable service label |
| `utm_source` | string | From session UTMs when present |
| `utm_medium` | string | e.g. `cpc`, `email`, `sms` |
| `utm_campaign` | string | Campaign slug |
| `utm_content` | string | Ad/content variant |

**Legacy:** Also fires `form_submit` for existing GTM tags — do not remove.

### `phone_call_click`

Fired on every tracked `tel:` link click.

| Parameter | Type | Expected values |
|-----------|------|-----------------|
| `phone_number` | string | `757-848-4559` |
| `page_path` | string | Current pathname |
| `click_location` | string | `header`, `footer`, `cta` |

**Legacy:** Also fires `phone_click` and `cta_click` — existing GTM tags unchanged.

---

## Engagement events

### `service_view`

Fired once per SPA navigation to a service URL.

| Parameter | Type | Expected values |
|-----------|------|-----------------|
| `service_name` | string | `shed_removal`, `deck_removal`, `fence_removal`, `interior_demo`, `kitchen_demolition`, etc. |
| `page_path` | string | e.g. `/services/interior-demo/` |

### `faq_expand`

Fired when user expands an FAQ accordion.

| Parameter | Type | Expected values |
|-----------|------|-----------------|
| `question_text` | string | Full question string |
| `page_path` | string | e.g. `/faqs/`, `/services/shed-removal/` |

### `scroll_depth`

Fired at 25%, 50%, 75%, 90% scroll (once each per page view).

| Parameter | Type | Expected values |
|-----------|------|-----------------|
| `percent_scrolled` | number | `25`, `50`, `75`, `90` |
| `page_path` | string | Current pathname |
| `page_type` | string | `home`, `service`, `contact`, etc. |

### `email_click`

| Parameter | Type | Expected values |
|-----------|------|-----------------|
| `email_address` | string | `info@mrdemopro.com` |
| `page_path` | string | Current pathname |

### `page_metadata`

Fired on every route change.

| Parameter | Type | Expected values |
|-----------|------|-----------------|
| `page_type` | string | `homepage`, `service`, `faq`, `blog`, `location`, `pricing`, `contact`, `conversion`, `landing_tool`, `other` |
| `brand` | string | `mrdemopro` |
| `service_category` | string | `demolition` |
| `page_path` | string | Current pathname |
| `utm_source` | string | Parsed from URL, session-persisted |
| `utm_medium` | string | e.g. `cpc` |
| `utm_campaign` | string | Campaign name |
| `utm_content` | string | Content variant |

---

## Events kept for backward compatibility (do not mark as conversions)

| Event | Notes |
|-------|-------|
| `phone_click` | Legacy name; superseded by `phone_call_click` in reports |
| `form_submit` | Legacy duplicate of `generate_lead` |
| `thank_you` | Thank-you page view — **not** a conversion (avoids double-counting) |
| `cta_click` | Nested on phone/email taps |
| `page_view` | SPA route changes |

---

## GA4 custom dimensions (register in Admin → Custom definitions)

Event-scoped: `form_id`, `click_location`, `service_name`, `service_type`, `percent_scrolled`, `page_type`, `brand`, `service_category`, `question_text`, `utm_campaign`, `utm_medium`, `utm_source`

---

## Conflicts flagged

1. **Dual phone events:** `phone_click` + `phone_call_click` fire together — use `phone_call_click` for conversion reporting.
2. **Dual lead events:** `generate_lead` + `form_submit` — use `generate_lead` only for conversions.
3. **thank_you vs generate_lead:** Only mark `generate_lead` as conversion.
4. **GA4 Enhanced Measurement scroll:** May duplicate generic scroll events — prefer `scroll_depth` custom event in reports.
