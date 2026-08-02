/**
 * Google Places API (New) — PlaceAutocompleteElement on quote forms.
 * Set VITE_GOOGLE_PLACES_API_KEY in Amplify / .env (restrict key to your domains).
 * Requires Maps JavaScript API + Places API (New) enabled on the GCP project.
 */

export const GOOGLE_PLACES_API_KEY =
  import.meta.env.VITE_GOOGLE_PLACES_API_KEY ?? '';

const SCRIPT_ID = 'google-maps-places-script';
const CALLBACK_NAME = '__googleMapsApiOnLoad';
const LOAD_TIMEOUT_MS = 10000;

export type PlaceAddressComponent = {
  longText?: string | null;
  shortText?: string | null;
  types?: string[];
};

export type PlaceAutocompleteElementInstance = HTMLElement & {
  placeholder?: string;
  value?: string;
  name?: string;
  disabled?: boolean;
  includedRegionCodes?: string[];
  includedPrimaryTypes?: string[];
  focus?: () => void;
};

export type PlacePredictionSelectEvent = Event & {
  placePrediction?: {
    toPlace: () => {
      id?: string;
      formattedAddress?: string | null;
      addressComponents?: PlaceAddressComponent[];
      fetchFields: (opts: { fields: string[] }) => Promise<void>;
    };
  };
};

type PlacesLibrary = {
  PlaceAutocompleteElement: new (opts?: Record<string, unknown>) => PlaceAutocompleteElementInstance;
};

declare global {
  interface Window {
    google?: {
      maps: {
        importLibrary?: (name: string) => Promise<PlacesLibrary>;
        places?: unknown;
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
let placesLibraryPromise: Promise<PlacesLibrary> | null = null;

function mapsBootstrapReady(): boolean {
  return typeof window.google?.maps?.importLibrary === 'function';
}

export function loadGooglePlacesScript(): Promise<void> {
  if (!isGooglePlacesConfigured()) {
    return Promise.reject(new Error('Google Places API key not configured'));
  }

  if (mapsBootstrapReady()) {
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
      const poll = () => {
        if (settled) return;
        if (mapsBootstrapReady()) {
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_PLACES_API_KEY)}&loading=async&callback=${CALLBACK_NAME}`;
    script.onerror = () =>
      finish(() => reject(new Error('Failed to load Google Places script')));
    document.head.appendChild(script);
  }).catch(err => {
    loadPromise = null;
    throw err;
  });

  return loadPromise;
}

/** Loads Maps JS bootstrap + the places library (PlaceAutocompleteElement). */
export function loadPlacesLibrary(): Promise<PlacesLibrary> {
  if (placesLibraryPromise) return placesLibraryPromise;

  placesLibraryPromise = (async () => {
    await loadGooglePlacesScript();
    const importLibrary = window.google?.maps?.importLibrary;
    if (!importLibrary) {
      throw new Error('google.maps.importLibrary unavailable');
    }
    const lib = await importLibrary('places');
    if (!lib?.PlaceAutocompleteElement) {
      throw new Error('PlaceAutocompleteElement unavailable');
    }
    return lib;
  })().catch(err => {
    placesLibraryPromise = null;
    throw err;
  });

  return placesLibraryPromise;
}
