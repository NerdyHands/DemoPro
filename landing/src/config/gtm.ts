/**
 * GTM / GA4 dataLayer utilities
 *
 * Core conversion events (mark as GA4 key events):
 * - generate_lead: form_id, page_path, service_type
 * - phone_call_click: phone_number, page_path, click_location
 *
 * Engagement events:
 * - service_view, faq_expand, scroll_depth (25/50/75/90), page_metadata
 *
 * Legacy (keep for existing GTM tags — do not remove):
 * - phone_click, form_submit, thank_you, cta_click
 */
import type {
  ClickLocation,
  CtaType,
  MarketingPageType,
  PageType,
  ScrollDepthPercent
} from './analyticsTypes';
import {capturePostHogEvent, capturePostHogPageview} from './posthog';

export const GTM_ID = 'GTM-593BSRJT';

export const GTM_EVENTS = {
  FORM_SUBMIT: 'form_submit',
  PAGE_VIEW: 'page_view',
  QUOTE_REQUEST: 'quote_request',
  CONTACT_FORM: 'contact_form'
} as const;

export const DEFAULT_PHONE = '757-848-4559';
export const DEFAULT_EMAIL = 'info@mrdemopro.com';

const CALL_CONVERSION_CONFIG = {
  sendTo: 'AW-17674065434/OP5hCIuRgLwbEJqs0-tB',
  value: 1.0,
  currency: 'USD'
};

const SESSION_LANDING_KEY = 'analytics_session_landing_full';
const UTM_SESSION_KEY = 'analytics_utm_params';

export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
};

export function captureSessionLandingPage(): void {
  if (typeof window === 'undefined') return;
  try {
    if (!sessionStorage.getItem(SESSION_LANDING_KEY)) {
      sessionStorage.setItem(
        SESSION_LANDING_KEY,
        `${window.location.pathname}${window.location.search}`
      );
    }
  } catch {
    /* ignore private mode */
  }
}

export function getSessionLandingPage(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return sessionStorage.getItem(SESSION_LANDING_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

/** Parse UTMs from URL and persist for the session (first-touch within session). */
export function captureUtmParams(search?: string): UtmParams {
  if (typeof window === 'undefined') return {};
  const qs = search ?? window.location.search;
  const params = new URLSearchParams(qs);
  const utm: UtmParams = {};
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const;
  let hasNew = false;
  for (const key of keys) {
    const val = params.get(key);
    if (val) {
      utm[key] = val;
      hasNew = true;
    }
  }
  try {
    if (hasNew) {
      sessionStorage.setItem(UTM_SESSION_KEY, JSON.stringify(utm));
    }
  } catch {
    /* ignore */
  }
  return hasNew ? utm : getStoredUtmParams();
}

export function getStoredUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(UTM_SESSION_KEY);
    return raw ? (JSON.parse(raw) as UtmParams) : {};
  } catch {
    return {};
  }
}

/** Rough page template for segmentation (maps pathname). */
export function getPageTypeFromPath(pathname: string): PageType {
  const p = pathname.replace(/\/$/, '') || '/';
  if (p === '/' || p === '') return 'home';
  if (p.startsWith('/blog')) return 'blog';
  if (p.startsWith('/diy-vs-pro-demolition')) return 'landing_tool';
  if (p.startsWith('/services/')) return 'service';
  if (
    p.startsWith('/demolition-contractor-') ||
    p.startsWith('/building-demolition') ||
    p.startsWith('/demolition-services') ||
    p === '/service-area' ||
    p.startsWith('/service-area/')
  ) {
    return 'location';
  }
  if (
    [
      '/services',
      '/concrete-demolition',
      '/residential-demolition',
      '/garage-demolition',
      '/commercial-demolition',
      '/tenant-clean-out',
      '/property-managers',
      '/contractors'
    ].some(x => p === x || p.startsWith(`${x}/`))
  ) {
    return 'service';
  }
  if (p === '/prices') return 'pricing';
  if (p === '/contact') return 'contact';
  if (p === '/thank-you') return 'conversion';
  return 'other';
}

/** Marketing page_type for page_metadata event. */
export function getMarketingPageType(pathname: string): MarketingPageType {
  const p = pathname.replace(/\/$/, '') || '/';
  if (p === '/' || p === '') return 'homepage';
  if (p === '/faqs') return 'faq';
  if (p.startsWith('/blog')) return 'blog';
  if (p.startsWith('/diy-vs-pro-demolition')) return 'landing_tool';
  if (p === '/prices') return 'pricing';
  if (p === '/contact') return 'contact';
  if (p === '/thank-you' || p.includes('/thank-you')) return 'conversion';
  if (
    p.startsWith('/demolition-contractor-') ||
    p === '/service-area' ||
    p.startsWith('/service-area/')
  ) {
    return 'location';
  }
  if (
    p.startsWith('/services') ||
    [
      '/building-demolition',
      '/demolition-services',
      '/concrete-demolition',
      '/residential-demolition',
      '/garage-demolition',
      '/commercial-demolition',
      '/tenant-clean-out',
      '/property-managers',
      '/contractors'
    ].some(x => p === x || p.startsWith(`${x}/`))
  ) {
    return 'service';
  }
  return 'other';
}

/** Map cta_location strings to GA4 click_location enum. */
export function mapClickLocation(ctaLocation: string): ClickLocation {
  if (ctaLocation === 'site_footer') return 'footer';
  if (ctaLocation.includes('header')) return 'header';
  return 'cta';
}

/** Service path → service_name slug for service_view. */
const SERVICE_PATH_SLUGS: Record<string, string> = {
  '/services/shed-removal': 'shed_removal',
  '/services/deck-removal': 'deck_removal',
  '/services/fence-removal': 'fence_removal',
  '/services/interior-demo': 'interior_demo',
  '/services/kitchen-demolition': 'kitchen_demolition',
  '/services/bathroom-demolition': 'bathroom_demolition',
  '/services/garage-demolition': 'garage_demolition',
  '/services/concrete-removal': 'concrete_removal',
  '/services/commercial-interior-demolition': 'commercial_interior_demolition',
  '/services/cleanout': 'cleanout',
  '/services/construction-debris-removal': 'construction_debris_removal',
  '/services/junk-removal': 'junk_removal',
  '/services': 'services_overview',
  '/building-demolition': 'building_demolition',
  '/demolition-services': 'demolition_services',
  '/concrete-demolition': 'concrete_demolition',
  '/residential-demolition': 'residential_demolition',
  '/garage-demolition': 'garage_demolition',
  '/commercial-demolition': 'commercial_demolition',
  '/tenant-clean-out': 'tenant_clean_out',
  '/property-managers': 'property_managers',
  '/contractors': 'contractors'
};

export function getServiceNameFromPath(pathname: string): string | null {
  const p = pathname.replace(/\/$/, '') || '/';
  if (SERVICE_PATH_SLUGS[p]) return SERVICE_PATH_SLUGS[p];
  if (p.startsWith('/services/')) {
    const segment = p.replace('/services/', '');
    return segment.replace(/-/g, '_') || null;
  }
  if (getMarketingPageType(pathname) === 'service') {
    const slug = p.replace(/^\//, '').replace(/-/g, '_');
    return slug || null;
  }
  return null;
}

export function isServicePath(pathname: string): boolean {
  return getServiceNameFromPath(pathname) !== null;
}

/**
 * GTM-only events: page_view is sent to PostHog as $pageview; form_submit and phone_click
 * duplicate generate_lead / phone_call_click and exist only for legacy GTM triggers.
 */
const GTM_ONLY_EVENTS = new Set<string>([
  GTM_EVENTS.PAGE_VIEW,
  GTM_EVENTS.FORM_SUBMIT,
  'phone_click'
]);

export const trackEvent = (
  eventName: string,
  eventData?: Record<string, unknown>
) => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...eventData
  });

  if (!GTM_ONLY_EVENTS.has(eventName)) {
    capturePostHogEvent(eventName, eventData);
  }
};

export type LeadType =
  | 'quote_request'
  | 'contact_form'
  | 'quiz_submission';

/** GA4 recommended lead event + legacy form_submit for existing GTM triggers. */
export function trackGenerateLead(
  params: Record<string, unknown> & {
    lead_type: LeadType;
    form_id: string;
    method?: string;
    service_name?: string;
    page_path?: string;
    page_type?: PageType;
    session_landing_page?: string;
  }
) {
  const path =
    params.page_path ??
    (typeof window !== 'undefined' ? window.location.pathname : '');
  const pageType =
    params.page_type ?? getPageTypeFromPath(path);
  const landing =
    params.session_landing_page ?? getSessionLandingPage();
  const utm = getStoredUtmParams();

  trackEvent('generate_lead', {
    ...params,
    ...utm,
    page_path: path,
    page_type: pageType,
    service_type: 'demolition',
    session_landing_page: landing,
    method: params.method ?? 'form'
  });

  trackEvent(GTM_EVENTS.FORM_SUBMIT, {
    form_type:
      params.lead_type === 'quiz_submission'
        ? GTM_EVENTS.CONTACT_FORM
        : params.lead_type === 'quote_request'
          ? GTM_EVENTS.QUOTE_REQUEST
          : GTM_EVENTS.CONTACT_FORM,
    page_path: path,
    ...params
  });
}

/** @deprecated Prefer trackGenerateLead — kept for gradual migration */
export function trackFormSubmission(
  formType: 'quote_request' | 'contact_form',
  formData?: Record<string, unknown>
) {
  trackGenerateLead({
    lead_type: formType,
    form_id: 'legacy_form',
    ...formData
  });
}

export function trackPageView(pageName: string, pageUrl: string) {
  captureSessionLandingPage();
  const pagePath =
    typeof window !== 'undefined' ? window.location.pathname : undefined;
  const pageType = pagePath ? getPageTypeFromPath(pagePath) : undefined;
  trackEvent(GTM_EVENTS.PAGE_VIEW, {
    page_name: pageName,
    page_url: pageUrl,
    page_path: pagePath,
    page_type: pageType
  });
  capturePostHogPageview({
    $current_url: pageUrl,
    title: pageName,
    page_type: pageType
  });
}

export function trackPageMetadata(pathname?: string, search?: string) {
  const path =
    pathname ??
    (typeof window !== 'undefined' ? window.location.pathname : '/');
  const utm = captureUtmParams(search);
  trackEvent('page_metadata', {
    page_type: getMarketingPageType(path),
    brand: 'mrdemopro',
    service_category: 'demolition',
    page_path: path,
    ...utm
  });
}

export function trackServiceView(serviceName: string, pagePath?: string) {
  const path =
    pagePath ??
    (typeof window !== 'undefined' ? window.location.pathname : '');
  trackEvent('service_view', {
    service_name: serviceName,
    page_path: path
  });
}

export function trackThankYou(params?: {
  thank_you_variant?: 'standard' | 'diy_quiz';
  page_path?: string;
  lead_source?: string;
}) {
  const path =
    params?.page_path ??
    (typeof window !== 'undefined' ? window.location.pathname : '');
  trackEvent('thank_you', {
    page_path: path,
    page_type: getPageTypeFromPath(path),
    thank_you_variant: params?.thank_you_variant ?? 'standard',
    lead_source: params?.lead_source,
    session_landing_page: getSessionLandingPage()
  });
}

export function trackCtaClick(params: {
  cta_label: string;
  cta_location: string;
  cta_type: CtaType;
  page_type?: PageType;
  service_name?: string;
  page_path?: string;
}) {
  const path =
    params.page_path ??
    (typeof window !== 'undefined' ? window.location.pathname : '');
  trackEvent('cta_click', {
    ...params,
    page_path: path,
    page_type: params.page_type ?? getPageTypeFromPath(path)
  });
}

/** GA4 conversion event — phone_call_click (spec). Keeps legacy phone_click. */
export function trackPhoneCallClick(params: {
  click_location: ClickLocation;
  phone_number?: string;
  page_path?: string;
  cta_location?: string;
}) {
  const path =
    params.page_path ??
    (typeof window !== 'undefined' ? window.location.pathname : '');
  const phone = params.phone_number ?? DEFAULT_PHONE;
  const utm = getStoredUtmParams();

  trackEvent('phone_call_click', {
    phone_number: phone,
    page_path: path,
    click_location: params.click_location,
    ...utm
  });
}

export function trackPhoneClick(params: {
  cta_label?: string;
  cta_location: string;
  page_type?: PageType;
  service_name?: string;
  page_path?: string;
  click_location?: ClickLocation;
}) {
  const path =
    params.page_path ??
    (typeof window !== 'undefined' ? window.location.pathname : '');
  const clickLoc =
    params.click_location ?? mapClickLocation(params.cta_location);

  trackEvent('phone_click', {
    link_url: `tel:${DEFAULT_PHONE}`,
    cta_label: params.cta_label ?? 'Call (757) 848 4559',
    cta_location: params.cta_location,
    page_path: path,
    page_type: params.page_type ?? getPageTypeFromPath(path),
    service_name: params.service_name
  });
  trackCtaClick({
    cta_label: params.cta_label ?? 'Call (757) 848 4559',
    cta_location: params.cta_location,
    cta_type: 'call',
    page_type: params.page_type,
    service_name: params.service_name,
    page_path: path
  });
  trackPhoneCallClick({
    click_location: clickLoc,
    phone_number: DEFAULT_PHONE,
    page_path: path,
    cta_location: params.cta_location
  });
}

export function trackEmailClick(params: {
  cta_label?: string;
  cta_location: string;
  email_address?: string;
  page_type?: PageType;
  service_name?: string;
  page_path?: string;
}) {
  const path =
    params.page_path ??
    (typeof window !== 'undefined' ? window.location.pathname : '');
  const email = params.email_address ?? DEFAULT_EMAIL;

  trackEvent('email_click', {
    link_url: `mailto:${email}`,
    email_address: email,
    cta_label: params.cta_label ?? 'Email',
    cta_location: params.cta_location,
    page_path: path,
    page_type: params.page_type ?? getPageTypeFromPath(path),
    service_name: params.service_name
  });
  trackCtaClick({
    cta_label: params.cta_label ?? 'Email',
    cta_location: params.cta_location,
    cta_type: 'email',
    page_type: params.page_type,
    service_name: params.service_name,
    page_path: path
  });
}

export function trackSmsClick(params: {
  cta_label?: string;
  cta_location: string;
  page_type?: PageType;
  service_name?: string;
  page_path?: string;
}) {
  const path =
    params.page_path ??
    (typeof window !== 'undefined' ? window.location.pathname : '');
  trackEvent('sms_click', {
    cta_label: params.cta_label ?? 'SMS',
    cta_location: params.cta_location,
    page_path: path,
    page_type: params.page_type ?? getPageTypeFromPath(path),
    service_name: params.service_name
  });
  trackCtaClick({
    cta_label: params.cta_label ?? 'SMS',
    cta_location: params.cta_location,
    cta_type: 'sms',
    page_type: params.page_type,
    service_name: params.service_name,
    page_path: path
  });
}

export function trackFormStart(params: {
  form_id: string;
  form_type: LeadType | 'quote_request' | 'contact_form';
  page_path?: string;
  service_name?: string;
}) {
  const path =
    params.page_path ??
    (typeof window !== 'undefined' ? window.location.pathname : '');
  trackEvent('form_start', {
    form_id: params.form_id,
    form_type: params.form_type,
    page_path: path,
    page_type: getPageTypeFromPath(path),
    service_name: params.service_name
  });
}

export function trackFormAbandon(params: {
  form_id: string;
  form_type: LeadType | 'quote_request' | 'contact_form';
  page_path?: string;
  service_name?: string;
  last_field?: string;
  seconds_on_form?: number;
}) {
  const path =
    params.page_path ??
    (typeof window !== 'undefined' ? window.location.pathname : '');
  trackEvent('form_abandon', {
    form_id: params.form_id,
    form_type: params.form_type,
    page_path: path,
    page_type: getPageTypeFromPath(path),
    service_name: params.service_name,
    last_field: params.last_field,
    seconds_on_form: params.seconds_on_form
  });
}

type FormFunnelParams = {
  form_id: string;
  form_type: LeadType;
  service_name?: string;
};

function formFunnelProps(params: FormFunnelParams) {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  return {
    form_id: params.form_id,
    form_type: params.form_type,
    service_name: params.service_name,
    page_path: path,
    page_type: getPageTypeFromPath(path)
  };
}

/** Funnel step: lead form scrolled into view (once per mount). */
export function trackFormView(params: FormFunnelParams) {
  trackEvent('form_view', formFunnelProps(params));
}

/** Funnel step: submit pressed, before validation / network. */
export function trackFormSubmitAttempt(params: FormFunnelParams) {
  trackEvent('form_submit_attempt', formFunnelProps(params));
}

/** Submit blocked by validation or failed in transit. */
export function trackFormError(
  params: FormFunnelParams & {
    error_type: 'validation' | 'network';
    error_field?: string;
    error_message?: string;
  }
) {
  trackEvent('form_error', {
    ...formFunnelProps(params),
    error_type: params.error_type,
    error_field: params.error_field,
    error_message: params.error_message
  });
}

export function trackFaqExpand(params: {
  question_text: string;
  page_path?: string;
}) {
  const path =
    params.page_path ??
    (typeof window !== 'undefined' ? window.location.pathname : '');
  trackEvent('faq_expand', {
    question_text: params.question_text,
    page_path: path
  });
}

export function trackScrollDepth(params: {
  percent_scrolled: ScrollDepthPercent;
  page_path?: string;
  page_type?: PageType;
}) {
  const path =
    params.page_path ??
    (typeof window !== 'undefined' ? window.location.pathname : '');
  trackEvent('scroll_depth', {
    percent_scrolled: params.percent_scrolled,
    page_path: path,
    page_type: params.page_type ?? getPageTypeFromPath(path)
  });
}

export function trackCalculatorInteraction(params: {
  step: string;
  outcome?: string;
  page_path?: string;
}) {
  const path =
    params.page_path ??
    (typeof window !== 'undefined' ? window.location.pathname : '');
  trackEvent('calculator_interaction', {
    step: params.step,
    outcome: params.outcome,
    page_path: path,
    page_type: 'landing_tool'
  });
}

export const reportCallConversion = (url?: string) => {
  const callback = () => {
    if (typeof url !== 'undefined') {
      window.location.href = url;
    }
  };

  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', {
      send_to: CALL_CONVERSION_CONFIG.sendTo,
      value: CALL_CONVERSION_CONFIG.value,
      currency: CALL_CONVERSION_CONFIG.currency,
      event_callback: callback
    });
  } else {
    callback();
  }

  return false;
};

/** Sets dataLayer + Google Ads phone callback. Does not send page_view (App handles SPA views). */
export function initializeGTM() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag_report_conversion = reportCallConversion;
  captureSessionLandingPage();
  captureUtmParams();
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    gtag_report_conversion?: typeof reportCallConversion;
  }
}
