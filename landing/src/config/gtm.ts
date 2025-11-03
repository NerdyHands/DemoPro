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

// Initialize GTM
export const initializeGTM = () => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    
    // Track initial page view
    trackPageView(document.title, window.location.href);
  }
};

declare global {
  interface Window {
    dataLayer: any[];
  }
}
