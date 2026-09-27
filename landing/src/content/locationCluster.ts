/** Paths for local SEO location cluster (Phase 1: Hampton Roads core cities). */
export const SERVICE_AREA_HUB_PATH = '/service-area/';

/** Nested city leaves under /service-area/ (legacy /demolition-contractor-*-va/ redirect). */
export const CITY_PATHS = {
  hampton: '/service-area/hampton-va/',
  newportNews: '/service-area/newport-news-va/',
  norfolk: '/service-area/norfolk-va/',
  virginiaBeach: '/service-area/virginia-beach-va/',
  chesapeake: '/service-area/chesapeake-va/',
  portsmouth: '/service-area/portsmouth-va/',
  suffolk: '/service-area/suffolk-va/'
} as const;

/** Previous flat URLs — used for redirects / Amplify HTML fallbacks. */
export const LEGACY_CITY_PATHS = {
  hampton: '/demolition-contractor-hampton-va/',
  newportNews: '/demolition-contractor-newport-news-va/',
  norfolk: '/demolition-contractor-norfolk-va/',
  virginiaBeach: '/demolition-contractor-virginia-beach-va/',
  chesapeake: '/demolition-contractor-chesapeake-va/',
  portsmouth: '/demolition-contractor-portsmouth-va/',
  suffolk: '/demolition-contractor-suffolk-va/'
} as const;
