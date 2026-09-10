import React, { useState, useEffect } from 'react';
import { Button } from '@inq/ui';
import { getStoredConsent, updateAnalyticsConsent, trackEvent } from '../utils/analytics';

export interface CookieConsentBannerProps {
  onOpenPrivacy: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const status = getStoredConsent();
    if (status === 'undecided') {
      // Small delay for smooth entry animation
      const timer = setTimeout(() => setIsVisible(true), 600);
      return () => {
        clearTimeout(timer);
      };
    }
    return undefined;
  }, []);

  const handleAccept = () => {
    updateAnalyticsConsent('accepted');
    setIsVisible(false);
    trackEvent('cookie_consent_decision', { decision: 'accepted' });
  };

  const handleDecline = () => {
    updateAnalyticsConsent('declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      className="cookie-consent-banner"
      role="region"
      aria-label="Cookie & Privacy Preferences"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '740px',
        backgroundColor: 'var(--surface-elevated)',
        borderRadius: '16px',
        padding: '16px 20px',
        boxShadow: 'var(--elevation-3, 0 12px 32px rgba(0,0,0,0.15))',
        border: '1px solid var(--border-default)',
        backdropFilter: 'blur(16px)',
        zIndex: 9999,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        animation: 'consentSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ flex: '1 1 380px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Brand indicator dots */}
        <div style={{ display: 'flex', gap: '3px', marginTop: '4px', flexShrink: 0 }}>
          <span className="brand-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-brand-primary)' }} />
          <span className="brand-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-brand-coral)' }} />
          <span className="brand-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-brand-amber)' }} />
          <span className="brand-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-brand-emerald)' }} />
        </div>

        <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '13.5px', marginBottom: '2px' }}>
            Privacy by Design: 100% Client-Side Processing
          </strong>
          <span>
            Your documents are processed purely in your browser memory and never uploaded to our servers. We use optional anonymous analytics to measure usage.{' '}
            <button
              type="button"
              onClick={onOpenPrivacy}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'var(--color-brand-primary)',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '13px',
                fontFamily: 'inherit',
              }}
            >
              Privacy Policy
            </button>
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <Button variant="secondary" size="sm" onClick={handleDecline}>
          Essential Only
        </Button>
        <Button variant="primary" size="sm" onClick={handleAccept}>
          Accept Analytics
        </Button>
      </div>

      <style>{`
        @keyframes consentSlideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </aside>
  );
};
