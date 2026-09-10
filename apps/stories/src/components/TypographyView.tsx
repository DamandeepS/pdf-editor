import React, { useState } from 'react';
import { CheckIcon } from '@inq/icons';

interface TypeScaleSpecimen {
  token: string;
  size: string;
  rem: string;
  lineHeight: string;
  weight: string;
  recommendedRole: string;
  cssVar: string;
}

const TYPE_SCALE: TypeScaleSpecimen[] = [
  { token: '4XL / Display', size: '36px', rem: '2.25rem', lineHeight: '44px', weight: '700', recommendedRole: 'Hero titles, invoice total displays', cssVar: '--typography-font-size-4xl' },
  { token: '3XL / Title 1', size: '28px', rem: '1.75rem', lineHeight: '36px', weight: '700', recommendedRole: 'Document headers, main sections', cssVar: '--typography-font-size-3xl' },
  { token: '2XL / Title 2', size: '22px', rem: '1.375rem', lineHeight: '28px', weight: '600', recommendedRole: 'Card titles, dialog headings', cssVar: '--typography-font-size-2xl' },
  { token: 'XL / Title 3', size: '18px', rem: '1.125rem', lineHeight: '24px', weight: '600', recommendedRole: 'Subheadings, toolbar groupings', cssVar: '--typography-font-size-xl' },
  { token: 'LG / Subtitle', size: '16px', rem: '1rem', lineHeight: '22px', weight: '500', recommendedRole: 'Lead paragraphs, primary buttons', cssVar: '--typography-font-size-lg' },
  { token: 'Base / Body', size: '14px', rem: '0.875rem', lineHeight: '20px', weight: '400', recommendedRole: 'Standard body text, inputs, data cells', cssVar: '--typography-font-size-base' },
  { token: 'SM / Caption', size: '12px', rem: '0.75rem', lineHeight: '16px', weight: '400', recommendedRole: 'Captions, helper texts, table headers', cssVar: '--typography-font-size-sm' },
  { token: 'XS / Badge', size: '11px', rem: '0.6875rem', lineHeight: '14px', weight: '500', recommendedRole: 'Pills, status tags, micro labels', cssVar: '--typography-font-size-xs' },
];

const PRESET_TEXTS = [
  { label: 'Alphabet & Numbers', text: 'The quick brown fox jumps over the lazy dog · 0123456789' },
  { label: 'Invoice & Financial', text: 'INVOICE #INV-2026-9481 · Subtotal: $1,420.00 · VAT (14%): $198.80 · Total: $1,618.80' },
  { label: 'Product Statement', text: 'Inq PDF Editor: High-performance, in-place vector PDF editing with Google aesthetic.' },
  { label: 'Code & Tokens', text: 'export const theme = { primary: "var(--color-brand-primary)", radius: "8px" };' },
];

export const TypographyView: React.FC = () => {
  // Playground state
  const [selectedFamily, setSelectedFamily] = useState<'brand' | 'base' | 'mono'>('brand');
  const [fontSize, setFontSize] = useState<number>(24);
  const [fontWeight, setFontWeight] = useState<number>(600);
  const [lineHeight, setLineHeight] = useState<number>(1.4);
  const [letterSpacing, setLetterSpacing] = useState<number>(-0.02);
  const [textColor, setTextColor] = useState<string>('var(--text-primary)');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [textTransform, setTextTransform] = useState<'none' | 'uppercase' | 'lowercase' | 'capitalize'>('none');
  const [customText, setCustomText] = useState<string>(PRESET_TEXTS[0].text);
  const [showBaselineGrid, setShowBaselineGrid] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const getFontFamilyVar = (family: 'brand' | 'base' | 'mono') => {
    switch (family) {
      case 'brand': return 'var(--font-family-brand)';
      case 'base': return 'var(--font-family-base)';
      case 'mono': return 'var(--font-family-mono)';
    }
  };

  const getFontFamilyName = (family: 'brand' | 'base' | 'mono') => {
    switch (family) {
      case 'brand': return 'Google Sans';
      case 'base': return 'Inter';
      case 'mono': return 'Roboto Mono';
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(label);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const generatedCss = `font-family: ${getFontFamilyVar(selectedFamily)};
font-size: ${fontSize}px;
font-weight: ${fontWeight};
line-height: ${lineHeight};
letter-spacing: ${letterSpacing}em;
color: ${textColor};
text-transform: ${textTransform};
text-align: ${textAlign};`;

  return (
    <div className="typography-view" role="main" aria-label="Typography Studio">
      {/* Header */}
      <div className="typography-header">
        <div className="typography-header-top">
          <span className="tokens-tag">@INQ/TOKENS TYPOGRAPHY</span>
          <h1 className="tokens-title">Typography & Type Scale Studio</h1>
        </div>
        <p className="tokens-subtitle">
          Comprehensive typographic hierarchy combining <strong>Google Sans</strong> (Display & Brand), <strong>Inter</strong> (UI & Body), and <strong>Roboto Mono</strong> (Financial & Coordinates).
        </p>
      </div>

      {copiedToken && (
        <div className="copied-toast">
          <CheckIcon size={14} />
          <span>Copied {copiedToken} to clipboard</span>
        </div>
      )}

      {/* 1. THREE FONT FAMILIES CARDS */}
      <section className="type-section">
        <div className="section-title-row">
          <h2 className="section-title">The Three Typefaces</h2>
          <span className="section-badge">Harmonious Hierarchy</span>
        </div>
        <p className="section-desc">Each typeface serves a clear optical and semantic role in the Inq design system.</p>

        <div className="font-family-cards-grid">
          {/* Google Sans */}
          <div
            className={`font-family-card ${selectedFamily === 'brand' ? 'active' : ''}`}
            onClick={() => setSelectedFamily('brand')}
          >
            <div className="font-card-header">
              <span className="font-role-tag">HEADINGS & BRAND</span>
              <code className="font-css-var">--font-family-brand</code>
            </div>
            <h3 className="font-card-name" style={{ fontFamily: 'var(--font-family-brand)' }}>
              Google Sans
            </h3>
            <p className="font-card-desc">
              Geometric sans-serif with friendly curves, open apertures, and exceptional clarity for high-impact titles and dialog headers.
            </p>
            <div className="font-card-alphabet" style={{ fontFamily: 'var(--font-family-brand)' }}>
              Aa Bb Gg Rr 1 2 3 &
            </div>
          </div>

          {/* Inter */}
          <div
            className={`font-family-card ${selectedFamily === 'base' ? 'active' : ''}`}
            onClick={() => setSelectedFamily('base')}
          >
            <div className="font-card-header">
              <span className="font-role-tag">UI CONTROLS & BODY</span>
              <code className="font-css-var">--font-family-base</code>
            </div>
            <h3 className="font-card-name" style={{ fontFamily: 'var(--font-family-base)' }}>
              Inter
            </h3>
            <p className="font-card-desc">
              Tall x-height, neutral letterforms, and optimized legibility at small sizes for toolbars, inputs, buttons, and dense bill metadata.
            </p>
            <div className="font-card-alphabet" style={{ fontFamily: 'var(--font-family-base)' }}>
              Aa Bb Gg Rr 1 2 3 &
            </div>
          </div>

          {/* Roboto Mono */}
          <div
            className={`font-family-card ${selectedFamily === 'mono' ? 'active' : ''}`}
            onClick={() => setSelectedFamily('mono')}
          >
            <div className="font-card-header">
              <span className="font-role-tag">DATA & NUMERICS</span>
              <code className="font-css-var">--font-family-mono</code>
            </div>
            <h3 className="font-card-name" style={{ fontFamily: 'var(--font-family-mono)' }}>
              Roboto Mono
            </h3>
            <p className="font-card-desc">
              Monospaced tabular digits and code alignment ideal for vector coordinates, monetary calculations, invoice lines, and timestamps.
            </p>
            <div className="font-card-alphabet" style={{ fontFamily: 'var(--font-family-mono)' }}>
              Aa Bb Gg Rr 1 2 3 &
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE TYPE PLAYGROUND */}
      <section className="type-section">
        <div className="section-title-row">
          <h2 className="section-title">Interactive Typographic Playground</h2>
          <span className="section-badge">Live Controls</span>
        </div>
        <p className="section-desc">Adjust size, weight, leading, tracking, and alignment to test optical balance in real-time.</p>

        {/* Playground Controls Toolbar */}
        <div className="type-playground-controls">
          {/* Row 1: Presets & Family */}
          <div className="controls-row">
            <div className="control-group">
              <span className="control-label">Typeface:</span>
              <div className="pill-toggle-group">
                <button
                  type="button"
                  className={`pill-toggle ${selectedFamily === 'brand' ? 'active' : ''}`}
                  onClick={() => setSelectedFamily('brand')}
                >
                  Google Sans
                </button>
                <button
                  type="button"
                  className={`pill-toggle ${selectedFamily === 'base' ? 'active' : ''}`}
                  onClick={() => setSelectedFamily('base')}
                >
                  Inter
                </button>
                <button
                  type="button"
                  className={`pill-toggle ${selectedFamily === 'mono' ? 'active' : ''}`}
                  onClick={() => setSelectedFamily('mono')}
                >
                  Roboto Mono
                </button>
              </div>
            </div>

            <div className="control-group">
              <span className="control-label">Preset Text:</span>
              <select
                className="type-select"
                onChange={(e) => setCustomText(e.target.value)}
                value={customText}
              >
                {PRESET_TEXTS.map((p) => (
                  <option key={p.label} value={p.text}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label className="checkbox-control">
                <input
                  type="checkbox"
                  checked={showBaselineGrid}
                  onChange={(e) => setShowBaselineGrid(e.target.checked)}
                />
                <span>Baseline Grid (8px)</span>
              </label>
            </div>
          </div>

          {/* Row 2: Sliders for Size, Weight, Leading, Tracking */}
          <div className="controls-row sliders-row">
            {/* Font Size */}
            <div className="slider-control">
              <div className="slider-header">
                <span className="slider-label">Font Size</span>
                <span className="slider-val">{fontSize}px ({(fontSize / 16).toFixed(2)}rem)</span>
              </div>
              <input
                type="range"
                className="range-input"
                min={11}
                max={72}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
            </div>

            {/* Font Weight */}
            <div className="slider-control">
              <div className="slider-header">
                <span className="slider-label">Font Weight</span>
                <span className="slider-val">{fontWeight}</span>
              </div>
              <div className="pill-toggle-group small">
                {[300, 400, 500, 600, 700].map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={`pill-toggle ${fontWeight === w ? 'active' : ''}`}
                    onClick={() => setFontWeight(w)}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Height */}
            <div className="slider-control">
              <div className="slider-header">
                <span className="slider-label">Line Height</span>
                <span className="slider-val">{lineHeight}</span>
              </div>
              <input
                type="range"
                className="range-input"
                min={1.0}
                max={2.4}
                step={0.05}
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
              />
            </div>

            {/* Letter Spacing */}
            <div className="slider-control">
              <div className="slider-header">
                <span className="slider-label">Letter Spacing</span>
                <span className="slider-val">{letterSpacing}em</span>
              </div>
              <input
                type="range"
                className="range-input"
                min={-0.05}
                max={0.2}
                step={0.01}
                value={letterSpacing}
                onChange={(e) => setLetterSpacing(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Row 3: Colors, Align & Transform */}
          <div className="controls-row">
            {/* Color Tint */}
            <div className="control-group">
              <span className="control-label">Color:</span>
              <div className="color-swatches-row">
                {[
                  { label: 'Primary', val: 'var(--text-primary)' },
                  { label: 'Secondary', val: 'var(--text-secondary)' },
                  { label: 'Muted', val: 'var(--text-muted)' },
                  { label: 'Google Blue', val: 'var(--color-brand-primary, #4285f4)' },
                  { label: 'Coral', val: 'var(--color-brand-coral, #ea4335)' },
                  { label: 'Emerald', val: 'var(--color-brand-emerald, #34a853)' },
                ].map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    className={`color-swatch-dot ${textColor === c.val ? 'active' : ''}`}
                    style={{ backgroundColor: c.val }}
                    onClick={() => setTextColor(c.val)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Alignment */}
            <div className="control-group">
              <span className="control-label">Align:</span>
              <div className="pill-toggle-group small">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    className={`pill-toggle ${textAlign === align ? 'active' : ''}`}
                    onClick={() => setTextAlign(align)}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            {/* Transform */}
            <div className="control-group">
              <span className="control-label">Transform:</span>
              <div className="pill-toggle-group small">
                {(['none', 'uppercase', 'capitalize'] as const).map((tr) => (
                  <button
                    key={tr}
                    type="button"
                    className={`pill-toggle ${textTransform === tr ? 'active' : ''}`}
                    onClick={() => setTextTransform(tr)}
                  >
                    {tr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Playground Stage with optional baseline grid */}
        <div className={`type-playground-stage ${showBaselineGrid ? 'with-grid' : ''}`}>
          <div
            className="type-rendered-text"
            style={{
              fontFamily: getFontFamilyVar(selectedFamily),
              fontSize: `${fontSize}px`,
              fontWeight: fontWeight,
              lineHeight: lineHeight,
              letterSpacing: `${letterSpacing}em`,
              color: textColor,
              textAlign: textAlign,
              textTransform: textTransform,
            }}
          >
            {customText}
          </div>

          <div className="type-input-footer">
            <input
              type="text"
              className="type-live-input"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type custom text to preview here..."
            />
          </div>
        </div>

        {/* Generated CSS Snippet */}
        <div className="type-css-card">
          <div className="type-css-header">
            <span className="type-css-label">Generated CSS Specifications</span>
            <button
              type="button"
              className="copy-css-btn"
              onClick={() => handleCopy(generatedCss, 'CSS rule')}
            >
              Copy CSS Rule
            </button>
          </div>
          <pre className="type-css-code">
            <code>{generatedCss}</code>
          </pre>
        </div>
      </section>

      {/* 3. TYPE SCALE SPECIMEN MATRIX */}
      <section className="type-section">
        <div className="section-title-row">
          <h2 className="section-title">Design Token Type Scale Matrix</h2>
          <span className="section-badge">8 Step Standard</span>
        </div>
        <p className="section-desc">Standard type scale definitions from 4XL (36px) to XS (11px). Click any row to copy its CSS variable.</p>

        <div className="type-specimen-table">
          <div className="specimen-header-row">
            <div className="col-token">TOKEN / LEVEL</div>
            <div className="col-metrics">SIZE / REM</div>
            <div className="col-sample">SPECIMEN PREVIEW</div>
          </div>

          {TYPE_SCALE.map((spec) => (
            <div
              key={spec.cssVar}
              className="specimen-row"
              onClick={() => handleCopy(`var(${spec.cssVar})`, spec.cssVar)}
              title="Click to copy CSS variable"
            >
              <div className="col-token">
                <span className="specimen-token-name">{spec.token}</span>
                <code className="specimen-var-code">{spec.cssVar}</code>
                <span className="specimen-role-hint">{spec.recommendedRole}</span>
              </div>

              <div className="col-metrics">
                <span className="metric-pill">{spec.size}</span>
                <span className="metric-rem">{spec.rem}</span>
                <span className="metric-lead">LH: {spec.lineHeight}</span>
              </div>

              <div className="col-sample">
                <div
                  className="specimen-text-sample"
                  style={{
                    fontSize: `var(${spec.cssVar})`,
                    lineHeight: spec.lineHeight,
                    fontWeight: spec.weight as any,
                    fontFamily: getFontFamilyVar(selectedFamily),
                  }}
                >
                  Document Title & Vector PDF Glyph Bounding Boxes
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. REAL-WORLD COMPOSITE DOCUMENT SPECIMEN */}
      <section className="type-section">
        <div className="section-title-row">
          <h2 className="section-title">In-Situ Document Composition</h2>
          <span className="section-badge">Harmonious Pairing</span>
        </div>
        <p className="section-desc">Demonstration of all 3 font families cooperating seamlessly inside a bill layout.</p>

        <div className="composite-invoice-card">
          {/* Header */}
          <div className="invoice-head">
            <div>
              <div className="invoice-brand" style={{ fontFamily: 'var(--font-family-brand)' }}>
                Acme Cloud Services
              </div>
              <div className="invoice-meta" style={{ fontFamily: 'var(--font-family-base)' }}>
                100 Innovation Way, Suite 400 · San Francisco, CA
              </div>
            </div>
            <div className="invoice-title-block">
              <span className="invoice-badge" style={{ fontFamily: 'var(--font-family-mono)' }}>PAID</span>
              <div className="invoice-num" style={{ fontFamily: 'var(--font-family-mono)' }}>
                INV-2026-0841
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="invoice-table">
            <div className="invoice-row invoice-th" style={{ fontFamily: 'var(--font-family-base)' }}>
              <span>DESCRIPTION</span>
              <span className="align-right">HOURS</span>
              <span className="align-right">RATE</span>
              <span className="align-right">AMOUNT</span>
            </div>
            <div className="invoice-row" style={{ fontFamily: 'var(--font-family-base)' }}>
              <span>GPU Compute Cluster (vLLM Engine)</span>
              <span className="align-right font-mono" style={{ fontFamily: 'var(--font-family-mono)' }}>120 hrs</span>
              <span className="align-right font-mono" style={{ fontFamily: 'var(--font-family-mono)' }}>$12.50</span>
              <span className="align-right font-mono font-bold" style={{ fontFamily: 'var(--font-family-mono)' }}>$1,500.00</span>
            </div>
            <div className="invoice-row" style={{ fontFamily: 'var(--font-family-base)' }}>
              <span>Cloud Storage Vector Archive</span>
              <span className="align-right font-mono" style={{ fontFamily: 'var(--font-family-mono)' }}>500 GB</span>
              <span className="align-right font-mono" style={{ fontFamily: 'var(--font-family-mono)' }}>$0.08</span>
              <span className="align-right font-mono font-bold" style={{ fontFamily: 'var(--font-family-mono)' }}>$40.00</span>
            </div>
          </div>

          {/* Total Row */}
          <div className="invoice-foot">
            <div className="invoice-notes" style={{ fontFamily: 'var(--font-family-base)' }}>
              Payment processed via Wire Transfer · Vector PDF verified with lossless fonts
            </div>
            <div className="invoice-totals">
              <div className="total-label" style={{ fontFamily: 'var(--font-family-brand)' }}>Total Due:</div>
              <div className="total-amount" style={{ fontFamily: 'var(--font-family-mono)' }}>$1,540.00</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
