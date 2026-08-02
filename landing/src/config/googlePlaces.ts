/**
 * Google Places API — address autocomplete on quote forms.
 * Set VITE_GOOGLE_PLACES_API_KEY in Amplify / .env (restrict key to your domains).
 */

export const GOOGLE_PLACES_API_KEY =
  import.meta.env.VITE_GOOGLE_PLACES_API_KEY ?? '';

const SCRIPT_ID = 'google-maps-places-script';

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
              address_components?: unknown[];
            };
          };
        };
        event: {
          clearListeners: (instance: unknown, event: string) => void;
        };
      };
    };
  }
}

export function isGooglePlacesConfigured(): boolean {
  return Boolean(GOOGLE_PLACES_API_KEY?.trim());
}

export function loadGooglePlacesScript(): Promise<void> {
  if (!isGooglePlacesConfigured()) {
    return Promise.reject(new Error('Google Places API key not configured'));
  }

  if (window.google?.maps?.places) {
    return Promise.resolve();
  }

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const tick = () => {
        if (window.google?.maps?.places) {
          resolve();
          return;
        }
        if (Date.now() > deadline) {
          reject(new Error('Google Places API timed out'));
          return;
        }
        setTimeout(tick, 100);
      };
      tick();
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_PLACES_API_KEY)}&libraries=places`;
    script.onload = () => {
      if (window.google?.maps?.places) {
        resolve();
      } else {
        reject(new Error('Google Places script loaded but API unavailable'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Google Places script'));
    document.head.appendChild(script);
  });
}
