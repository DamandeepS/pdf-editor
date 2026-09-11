import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@inq/ui';
import { ShieldCheckIcon } from '@inq/icons';
import { getStoredConsent, updateAnalyticsConsent, type ConsentStatus } from '../utils/analytics';

export interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>('undecided');

  useEffect(() => {
    if (isOpen) {
      setConsentStatus(getStoredConsent());
    }
  }, [isOpen]);

  const handleToggleConsent = (newStatus: 'accepted' | 'declined') => {
    updateAnalyticsConsent(newStatus);
    setConsentStatus(newStatus);
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Privacy Policy & Data Ethics"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="primary" size="sm" onClick={onClose}>
            Understood
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-primary)', fontSize: '13px', lineHeight: '1.6' }}>
        
        {/* Core Guarantee Callout */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '14px 16px',
            backgroundColor: 'rgba(66, 133, 244, 0.08)',
            border: '1px solid rgba(66, 133, 244, 0.25)',
            borderRadius: '10px',
          }}
        >
          <div style={{ flexShrink: 0, marginTop: '2px' }}>
            <ShieldCheckIcon size={22} color="var(--color-brand-primary)" />
          </div>
          <div>
            <strong style={{ color: 'var(--color-brand-primary)', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
              Zero Document Transmission Guarantee
            </strong>
            <span>
              All document rendering, text glyph extraction, editing, redactions, and vector PDF compilation occur 
              <strong> 100% inside your web browser</strong>. Your files are never uploaded, stored, or processed on any remote server.
            </span>
          </div>
        </div>

        {/* Section 1: In-Browser Architecture */}
        <div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            1. How Inq PDF Editor Works
          </h4>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            We utilize native browser WebAssembly and JavaScript engines (<code style={{ fontSize: '12px', padding: '2px 4px', background: 'var(--surface-active)', borderRadius: '4px' }}>pdf-lib</code> and <code style={{ fontSize: '12px', padding: '2px 4px', background: 'var(--surface-active)', borderRadius: '4px' }}>PDF.js</code>). When you open an invoice, bill, or contract, the file remains strictly in your device's memory. Even if you disconnect your network, the editor continues to function normally.
          </p>
        </div>

        {/* Section 2: Analytics & Telemetry */}
        <div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            2. Google Analytics & Telemetry
          </h4>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            To improve the user experience and resolve bugs, we may collect anonymous aggregate telemetry via Google Analytics 4. We strictly implement <strong>Google Consent Mode v2</strong>. Tracking is blocked by default until you grant consent. Document contents, text modifications, and filenames are <strong>strictly excluded</strong> from all analytics payloads.
          </p>
        </div>

        {/* Section 3: Cookies & Local Storage */}
        <div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            3. Local Storage & Cookies
          </h4>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            We use your browser's local storage solely to retain your application preferences:
          </p>
          <ul style={{ margin: '6px 0 0 18px', padding: 0, color: 'var(--text-secondary)' }}>
            <li><code>inq_theme</code>: Remembers Light or Dark mode.</li>
            <li><code>inq_cookie_consent</code>: Stores your cookie preference (<span style={{ fontStyle: 'italic' }}>accepted</span> or <span style={{ fontStyle: 'italic' }}>declined</span>).</li>
          </ul>
        </div>

        {/* Section 4: GDPR & CCPA/CPRA Compliance */}
        <div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            4. GDPR & CCPA/CPRA Compliance
          </h4>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Under European (GDPR) and California (CCPA/CPRA) laws, you have full control over your telemetry preferences. Because we do not store documents or personal accounts on any server, there are no remote user databases or document logs to request deletion for.
          </p>

          <div
            style={{
              marginTop: '12px',
              padding: '12px 14px',
              backgroundColor: 'var(--surface-hover)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Telemetry Status:</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: consentStatus === 'declined' ? 'var(--text-muted)' : 'var(--color-brand-emerald)' }}>
                {consentStatus === 'declined'
                  ? 'Disabled (Essential Only)'
                  : consentStatus === 'accepted'
                  ? 'Active (Anonymous Analytics Granted)'
                  : 'Active (Standard Anonymous Telemetry)'}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleToggleConsent(consentStatus === 'declined' ? 'accepted' : 'declined')}
            >
              {consentStatus === 'declined' ? 'Enable Anonymous Analytics' : 'Disable Anonymous Analytics'}
            </Button>
          </div>
        </div>

        {/* Section 5: Open Source License */}
        <div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            5. Open Source License
          </h4>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Inq PDF Editor is open-source software provided under the <strong>MIT License</strong>. View source code and contribute on{' '}
            <a
              href="https://github.com/DamandeepS/pdf-editor"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-brand-primary)', textDecoration: 'underline' }}
            >
              GitHub ↗
            </a>.
          </p>
        </div>
      </div>
    </Modal>
  );
};
