/**
 * PostHog product analytics (runs alongside GTM / GA4).
 *
 * Env (Vite, public): VITE_POSTHOG_KEY (phc_...), VITE_POSTHOG_HOST.
 * No key → PostHog stays off. The library is loaded lazily so it stays out of the main bundle.
 */
import type {PostHog} from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY?.trim();
const POSTHOG_HOST =
  import.meta.env.VITE_POSTHOG_HOST?.trim() || 'https://us.i.posthog.com';

let client: Promise<PostHog | null> | null = null;

/** Build-time prerender (Playwright, Googlebot UA) must not create analytics traffic. */
function isAutomatedBrowser(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.webdriver === true || /bot|crawl|spider/i.test(navigator.userAgent);
}

export function initPostHog(): void {
  if (client || typeof window === 'undefined') return;
  if (!POSTHOG_KEY || isAutomatedBrowser()) {
    client = Promise.resolve(null);
    return;
  }

  client = import('posthog-js')
    .then(({default: posthog}) => {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: 'identified_only',
        // App.tsx sends $pageview on every SPA route change
        capture_pageview: false,
        capture_pageleave: true
      });
      return posthog;
    })
    .catch(err => {
      console.warn('PostHog failed to load:', err);
      return null;
    });
}

export function capturePostHogEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  client?.then(posthog => posthog?.capture(eventName, properties));
}

export function capturePostHogPageview(properties?: Record<string, unknown>): void {
  capturePostHogEvent('$pageview', properties);
}

/**
 * Link the anonymous visitor to a lead so prior page views join the person in funnels.
 * Keyed by email, else phone digits, so repeat submissions merge into one person.
 */
export function identifyPostHogLead(lead: {
  email?: string;
  phone?: string;
  name?: string;
  lead_type: string;
  service_name?: string;
  form_id: string;
}): void {
  const email = lead.email?.trim().toLowerCase();
  const phoneDigits = lead.phone?.replace(/\D/g, '');
  const distinctId = email || (phoneDigits ? `phone:${phoneDigits}` : undefined);
  if (!distinctId) return;

  const pagePath = typeof window !== 'undefined' ? window.location.pathname : undefined;
  client?.then(posthog =>
    posthog?.identify(
      distinctId,
      {
        name: lead.name?.trim() || undefined,
        email: email || undefined,
        phone: phoneDigits || undefined,
        last_lead_type: lead.lead_type,
        last_lead_service: lead.service_name,
        last_lead_form: lead.form_id
      },
      {
        first_lead_type: lead.lead_type,
        first_lead_page: pagePath,
        first_lead_at: new Date().toISOString()
      }
    )
  );
}
