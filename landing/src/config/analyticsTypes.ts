export type PageType =
  | 'home'
  | 'service'
  | 'location'
  | 'pricing'
  | 'contact'
  | 'blog'
  | 'landing_tool'
  | 'conversion'
  | 'other';

/** Marketing segmentation for page_metadata (GA4 / GTM). */
export type MarketingPageType =
  | 'homepage'
  | 'service'
  | 'faq'
  | 'blog'
  | 'location'
  | 'pricing'
  | 'contact'
  | 'conversion'
  | 'landing_tool'
  | 'other';

export type ClickLocation = 'header' | 'footer' | 'cta';

export type CtaType = 'quote' | 'call' | 'email' | 'sms' | 'nav';

export type ScrollDepthPercent = 25 | 50 | 75 | 90;
