/**
 * Google Tag Manager Configuration
 * Replace GTM-XXXXXXX with your actual GTM container ID
 */

export const GTM_ID = 'GTM-593BSRJT';

// GTM Events for form submissions
export const GTM_EVENTS = {
  FORM_SUBMIT: 'form_submit',
  QUOTE_REQUEST: 'quote_request',
  CONTACT_FORM: 'contact_form',
  PAGE_VIEW: 'page_view'
};

// Google Ads click-to-call conversion ID
const CALL_CONVERSION_CONFIG = {
  sendTo: 'AW-17674065434/OP5hCIuRgLwbEJqs0-tB',
  value: 1.0,
  currency: 'USD'
};

// GTM Data Layer Events
export const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventData
    });
  }
};

// Track form submissions
export const trackFormSubmission = (formType: 'quote_request' | 'contact_form', formData?: Record<string, any>) => {
  trackEvent(GTM_EVENTS.FORM_SUBMIT, {
    form_type: formType,
    ...formData
  });
};

// Track page views
export const trackPageView = (pageName: string, pageUrl: string) => {
  trackEvent(GTM_EVENTS.PAGE_VIEW, {
    page_name: pageName,
    page_url: pageUrl
  });
};

// Google Ads click-to-call conversion tracking
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

// Initialize GTM
export const initializeGTM = () => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.gtag_report_conversion = reportCallConversion;
    
    // Track initial page view
    trackPageView(document.title, window.location.href);
  }
};

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    gtag_report_conversion?: typeof reportCallConversion;
  }
}
