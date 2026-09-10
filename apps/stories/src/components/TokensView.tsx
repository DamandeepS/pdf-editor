import React, { useState } from 'react';
import { DESIGN_TOKENS } from '../registry';

export const TokensView: React.FC = () => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [sampleText, setSampleText] = useState('Google Labs & Gemini Design Language');

  const handleCopy = (variable: string) => {
    navigator.clipboard.writeText(`var(${variable})`);
    setCopiedToken(variable);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const brandTokens = DESIGN_TOKENS.filter((t) => t.category === 'brand');
  const semanticTokens = DESIGN_TOKENS.filter((t) => t.category === 'semantic');
  const surfaceTokens = DESIGN_TOKENS.filter((t) => t.category === 'surface');
  const textTokens = DESIGN_TOKENS.filter((t) => t.category === 'text');
  const elevationTokens = DESIGN_TOKENS.filter((t) => t.category === 'elevation');
  const radiusTokens = DESIGN_TOKENS.filter((t) => t.category === 'radius');

  return (
    <div className="tokens-view" role="main" aria-label="Design Tokens Studio">
      {/* View Header */}
      <div className="tokens-header">
        <div className="tokens-header-top">
          <span className="tokens-tag">STYLE DICTIONARY V4</span>
          <h1 className="tokens-title">Design Tokens Studio</h1>
        </div>
        <p className="tokens-subtitle">
          Explore the atomic design tokens powering `@inq/tokens` and `@inq/ui`. Click any swatch or card to copy its CSS variable name.
        </p>
      </div>

      {copiedToken && (
        <div className="copied-toast">
          ✓ Copied <code>var({copiedToken})</code> to clipboard!
        </div>
      )}

      {/* 1. BRAND PALETTE */}
      <section className="tokens-section">
        <div className="section-title-row">
          <h2 className="section-title">Brand Palette</h2>
          <span className="section-badge">Google 4-Color</span>
        </div>
        <p className="section-desc">Core primary hues established for brand presence, active highlights, and status signifiers.</p>
        <div className="swatch-grid">
          {brandTokens.map((t) => (
            <div
              key={t.cssVariable}
              className="swatch-card"
              onClick={() => handleCopy(t.cssVariable)}
              title="Click to copy CSS variable"
            >
              <div
                className="swatch-color"
                style={{ backgroundColor: `var(${t.cssVariable})` }}
              />
              <div className="swatch-info">
                <span className="swatch-name">{t.name}</span>
                <code className="swatch-code">{t.cssVariable}</code>
                <span className="swatch-val">{t.value}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. SEMANTIC ROLES */}
      <section className="tokens-section">
        <div className="section-title-row">
          <h2 className="section-title">Semantic Roles</h2>
          <span className="section-badge">Status & Meaning</span>
        </div>
        <p className="section-desc">Standard semantic roles mapping to action, validation, warning, and error states.</p>
        <div className="swatch-grid">
          {semanticTokens.map((t) => (
            <div
              key={t.cssVariable}
              className="swatch-card"
              onClick={() => handleCopy(t.cssVariable)}
              title="Click to copy CSS variable"
            >
              <div
                className="swatch-color"
                style={{ backgroundColor: `var(${t.cssVariable})` }}
              />
              <div className="swatch-info">
                <span className="swatch-name">{t.name}</span>
                <code className="swatch-code">{t.cssVariable}</code>
                <span className="swatch-val">{t.description}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SURFACES & BACKGROUNDS */}
      <section className="tokens-section">
        <div className="section-title-row">
          <h2 className="section-title">Surfaces & Containers</h2>
          <span className="section-badge">Dark / Light Responsive</span>
        </div>
        <p className="section-desc">Dynamic backgrounds and card surfaces responding to Google Labs Light & Gemini Dark modes.</p>
        <div className="swatch-grid">
          {surfaceTokens.map((t) => (
            <div
              key={t.cssVariable}
              className="swatch-card"
              onClick={() => handleCopy(t.cssVariable)}
              title="Click to copy CSS variable"
            >
              <div
                className="swatch-color surface-sample"
                style={{ backgroundColor: `var(${t.cssVariable})`, border: '1px solid var(--border-subtle)' }}
              />
              <div className="swatch-info">
                <span className="swatch-name">{t.name}</span>
                <code className="swatch-code">{t.cssVariable}</code>
                <span className="swatch-val">{t.description}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. TEXT & TYPOGRAPHY SCALE */}
      <section className="tokens-section">
        <div className="section-title-row">
          <h2 className="section-title">Typography Scale Matrix</h2>
          <span className="section-badge">Type Scale</span>
        </div>
        <div className="sample-text-editor">
          <span className="sample-text-label">Live Preview Text:</span>
          <input
            type="text"
            className="sample-text-input"
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
          />
        </div>

        <div className="type-scale-list">
          {[
            { token: '--typography-font-size-4xl', size: '36px', weight: '700', label: '4XL / Display' },
            { token: '--typography-font-size-3xl', size: '28px', weight: '700', label: '3XL / Hero' },
            { token: '--typography-font-size-2xl', size: '22px', weight: '600', label: '2XL / H1' },
            { token: '--typography-font-size-xl', size: '18px', weight: '600', label: 'XL / H2' },
            { token: '--typography-font-size-lg', size: '16px', weight: '600', label: 'LG / Subtitle' },
            { token: '--typography-font-size-base', size: '14px', weight: '400', label: 'Base / Body' },
            { token: '--typography-font-size-sm', size: '12px', weight: '400', label: 'SM / Caption' },
            { token: '--typography-font-size-xs', size: '11px', weight: '400', label: 'XS / Badge' },
          ].map((item) => (
            <div
              key={item.token}
              className="type-scale-row"
              onClick={() => handleCopy(item.token)}
              title="Click to copy CSS variable"
            >
              <div className="type-meta">
                <span className="type-label">{item.label}</span>
                <code className="type-token">{item.token}</code>
                <span className="type-size-badge">{item.size}</span>
              </div>
              <div
                className="type-sample"
                style={{ fontSize: `var(${item.token})`, fontWeight: item.weight as any }}
              >
                {sampleText}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ELEVATION & SHADOWS */}
      <section className="tokens-section">
        <div className="section-title-row">
          <h2 className="section-title">Elevation & Shadows</h2>
          <span className="section-badge">Depth Hierarchy</span>
        </div>
        <div className="elevation-grid">
          {elevationTokens.map((t) => (
            <div
              key={t.cssVariable}
              className="elevation-card"
              style={{ boxShadow: `var(${t.cssVariable})` }}
              onClick={() => handleCopy(t.cssVariable)}
            >
              <span className="elevation-name">{t.name}</span>
              <code className="elevation-code">{t.cssVariable}</code>
              <p className="elevation-desc">{t.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. BORDER RADII */}
      <section className="tokens-section">
        <div className="section-title-row">
          <h2 className="section-title">Border Radii</h2>
          <span className="section-badge">Rounding</span>
        </div>
        <div className="radii-grid">
          {radiusTokens.map((t) => (
            <div
              key={t.cssVariable}
              className="radius-box"
              style={{ borderRadius: `var(${t.cssVariable})` }}
              onClick={() => handleCopy(t.cssVariable)}
            >
              <span className="radius-name">{t.name}</span>
              <code className="radius-code">{t.cssVariable} ({t.value})</code>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
