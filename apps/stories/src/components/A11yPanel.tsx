import React from 'react';
import type { ComponentStoryMeta } from '../types';

export interface A11yPanelProps {
  story: ComponentStoryMeta;
}

export const A11yPanel: React.FC<A11yPanelProps> = ({ story }) => {
  const { a11y } = story;

  return (
    <div className="a11y-panel" role="region" aria-label="Accessibility Guidelines">
      {/* ARIA Role & Focus Indicator */}
      <div className="a11y-grid">
        <div className="a11y-card">
          <span className="a11y-card-label">ARIA SEMANTICS</span>
          <div className="a11y-card-value">
            <code>role="{a11y.role || 'none'}"</code>
          </div>
          {a11y.ariaAttributes && a11y.ariaAttributes.length > 0 && (
            <ul className="a11y-list">
              {a11y.ariaAttributes.map((attr, idx) => (
                <li key={idx}><code>{attr}</code></li>
              ))}
            </ul>
          )}
        </div>

        <div className="a11y-card">
          <span className="a11y-card-label">FOCUS INDICATOR (WCAG 2.4.7)</span>
          <p className="a11y-text">
            {a11y.focusIndicatorNote || 'Maintains 2px visible outline using var(--border-focus) with 2px offset on :focus-visible.'}
          </p>
        </div>
      </div>

      {/* Keyboard Navigation Matrix */}
      {a11y.keyboardShortcuts && a11y.keyboardShortcuts.length > 0 && (
        <div className="a11y-keyboard-section">
          <span className="a11y-section-title">KEYBOARD INTERACTIONS (WCAG 2.1.1)</span>
          <div className="keyboard-matrix">
            {a11y.keyboardShortcuts.map((kb, idx) => (
              <div key={idx} className="keyboard-row">
                <kbd className="keyboard-key">{kb.key}</kbd>
                <span className="keyboard-desc">{kb.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
