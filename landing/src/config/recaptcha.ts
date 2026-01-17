/**
 * Google reCAPTCHA v3 Configuration
 * 
 * This file handles reCAPTCHA v3 token generation for form submissions.
 * reCAPTCHA v3 runs in the background and doesn't interrupt the user experience.
 */

export const RECAPTCHA_SITE_KEY = '6LcmDkssAAAAAGvQQhoS1gwUGGNHlKyRbaUod_Vh';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

/**
 * Load reCAPTCHA script if not already loaded
 */
export const loadRecaptchaScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.grecaptcha) {
      resolve();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');
    if (existingScript) {
      // Wait for grecaptcha to be available
      const checkInterval = setInterval(() => {
        if (window.grecaptcha) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.grecaptcha) {
          reject(new Error('reCAPTCHA failed to load'));
        }
      }, 5000);
      return;
    }

    // Create and append script tag
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.grecaptcha) {
        resolve();
      } else {
        reject(new Error('reCAPTCHA script loaded but grecaptcha object not found'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load reCAPTCHA script'));
    };
    document.head.appendChild(script);
  });
};

/**
 * Get reCAPTCHA token for form submission
 * @param action - The action name (e.g., 'submit_form', 'contact_form')
 * @returns Promise that resolves to the reCAPTCHA token
 */
export const getRecaptchaToken = async (action: string = 'submit'): Promise<string> => {
  try {
    // Ensure script is loaded
    await loadRecaptchaScript();

    // Wait for grecaptcha to be ready
    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(RECAPTCHA_SITE_KEY, { action })
          .then((token: string) => {
            resolve(token);
          })
          .catch((error: any) => {
            console.error('reCAPTCHA execution error:', error);
            reject(error);
          });
      });
    });
  } catch (error) {
    console.error('Error getting reCAPTCHA token:', error);
    throw error;
  }
};
