/**
 * Google Analytics 4 (GA4) with Google Consent Mode v2 Helper
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export type ConsentStatus = 'accepted' | 'declined' | 'undecided';

const CONSENT_STORAGE_KEY = 'inq_cookie_consent';

/**
 * Retrieves the current cookie/analytics consent status from localStorage
 */
export function getStoredConsent(): ConsentStatus {
  if (typeof window === 'undefined') return 'undecided';
  const val = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (val === 'accepted' || val === 'declined') return val;
  return 'undecided';
}

/**
 * Updates Google Consent Mode v2 and persists user decision
 */
export function updateAnalyticsConsent(consent: 'accepted' | 'declined'): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(CONSENT_STORAGE_KEY, consent);

  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: consent === 'accepted' ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }
}

/**
 * Tracks custom anonymous interaction event in GA4
 */
export function trackEvent(eventName: string, params?: Record<string, string | number | boolean>): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, {
      ...params,
      send_to: import.meta.env.VITE_GA_MEASUREMENT_ID || undefined,
    });
  }
}

/**
 * Initializes the GA4 script if a valid VITE_GA_MEASUREMENT_ID is provided
 */
export function initGoogleAnalytics(): void {
  if (typeof window === 'undefined') return;

  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!gaId || typeof gaId !== 'string' || !gaId.startsWith('G-')) return;

  // Prevent duplicate script tag injection
  if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`)) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  if (typeof window.gtag === 'function') {
    window.gtag('config', gaId, { anonymize_ip: true });
  }
}

// Auto-run on module load
initGoogleAnalytics();

