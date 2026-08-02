/**
 * Google Places API — address autocomplete on quote forms.
 * Set VITE_GOOGLE_PLACES_API_KEY in Amplify / .env (restrict key to your domains).
 */

export const GOOGLE_PLACES_API_KEY =
  import.meta.env.VITE_GOOGLE_PLACES_API_KEY ?? '';

const SCRIPT_ID = 'google-maps-places-script';
const CALLBACK_NAME = '__googleMapsApiOnLoad';
const LOAD_TIMEOUT_MS = 10000;

declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: Record<string, unknown>
          ) => {
            addListener: (event: string, handler: () => void) => void;
            getPlace: () => {
              formatted_address?: string;
              place_id?: string;
              geometry?: unknown;
              address_components?: Array<{
                long_name?: string;
                short_name?: string;
                types?: string[];
              }>;
            };
          };
        };
        event: {
          clearListeners: (instance: unknown, event: string) => void;
        };
      };
    };
    [CALLBACK_NAME]?: () => void;
  }
}

export function isGooglePlacesConfigured(): boolean {
  return Boolean(GOOGLE_PLACES_API_KEY?.trim());
}

/**
 * True for our own Playwright prerender pass and for real Googlebot's JS-rendering
 * crawl (both identify with "Googlebot" in the UA). Skipping the live network load in
 * that environment keeps the frozen prerendered HTML in the same "not yet loaded" state
 * that every real visitor's browser starts in, so client hydration never has to reconcile
 * against a snapshot that was captured mid-async-load (which is what causes React error
 * #418 hydration mismatches and leaves a stale, unwired <script> tag baked into the page).
 */
export function isPrerenderCrawler(): boolean {
  return typeof navigator !== 'undefined' && /Googlebot/i.test(navigator.userAgent);
}

let loadPromise: Promise<void> | null = null;

export function loadGooglePlacesScript(): Promise<void> {
  if (!isGooglePlacesConfigured()) {
    return Promise.reject(new Error('Google Places API key not configured'));
  }

  if (window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (isPrerenderCrawler()) {
    // Never resolves/rejects on purpose — no state change should ever fire during a
    // prerender/crawl pass, so the static snapshot stays identical to a real user's
    // pre-hydration first paint.
    return new Promise<void>(() => {});
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error('Google Places API timed out'));
    }, LOAD_TIMEOUT_MS);

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      fn();
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      // Leftover/duplicate script tag (e.g. a second Autocomplete mounting concurrently,
      // or a stale cached page). We can't trust that our callback was wired in time, so
      // poll for readiness instead while still respecting the shared timeout.
      const poll = () => {
        if (settled) return;
        if (window.google?.maps?.places) {
          finish(resolve);
          return;
        }
        window.setTimeout(poll, 100);
      };
      poll();
      existing.addEventListener(
        'error',
        () => finish(() => reject(new Error('Failed to load Google Places script'))),
        { once: true }
      );
      return;
    }

    window[CALLBACK_NAME] = () => {
      finish(resolve);
      delete window[CALLBACK_NAME];
    };

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_PLACES_API_KEY)}&libraries=places&loading=async&callback=${CALLBACK_NAME}`;
    script.onerror = () => finish(() => reject(new Error('Failed to load Google Places script')));
    document.head.appendChild(script);
  }).catch(err => {
    // Allow a later retry (e.g. user clicks "Retry" or reconnects) instead of caching a
    // permanently-rejected promise.
    loadPromise = null;
    throw err;
  });

  return loadPromise;
}
