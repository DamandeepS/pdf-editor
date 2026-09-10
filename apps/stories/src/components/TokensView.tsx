import React, { useState } from 'react';
import { CheckIcon, CloseIcon } from '@inq/icons';

interface TokenSpec {
  name: string;
  cssVariable: string;
  value: string;
  rgb?: string;
  category: 'brand' | 'semantic' | 'surface' | 'text' | 'elevation' | 'radius';
  description: string;
  contrastRatio?: string;
}

const ALL_TOKENS: TokenSpec[] = [
  // Brand Palette
  { name: 'Brand Primary', cssVariable: '--color-brand-primary', value: '#4285f4', rgb: 'rgb(66, 133, 244)', category: 'brand', description: 'Core Google Blue brand identity and primary interaction state', contrastRatio: '4.6:1 (AA)' },
  { name: 'Brand Primary Hover', cssVariable: '--color-brand-primary-hover', value: '#1a73e8', rgb: 'rgb(26, 115, 232)', category: 'brand', description: 'Darkened blue for hover and active button states', contrastRatio: '5.2:1 (AA)' },
  { name: 'Brand Primary Light', cssVariable: '--color-brand-primary-light', value: '#e8f0fe', rgb: 'rgb(232, 240, 254)', category: 'brand', description: 'Toned container background for active selections and badges', contrastRatio: '1.2:1' },
  { name: 'Brand Coral', cssVariable: '--color-brand-coral', value: '#ea4335', rgb: 'rgb(234, 67, 53)', category: 'brand', description: 'Google Coral Red for destructive actions, errors, and void stamps', contrastRatio: '4.8:1 (AA)' },
  { name: 'Brand Coral Hover', cssVariable: '--color-brand-coral-hover', value: '#d93025', rgb: 'rgb(217, 48, 37)', category: 'brand', description: 'Darkened coral for danger hover states', contrastRatio: '5.6:1 (AA)' },
  { name: 'Brand Amber', cssVariable: '--color-brand-amber', value: '#fbbc05', rgb: 'rgb(251, 188, 5)', category: 'brand', description: 'Google Amber Yellow for warnings, caution badges, and pending indicators', contrastRatio: '8.2:1 (AAA)' },
  { name: 'Brand Emerald', cssVariable: '--color-brand-emerald', value: '#34a853', rgb: 'rgb(52, 168, 83)', category: 'brand', description: 'Google Emerald Green for success confirmations, paid stamps, and audits', contrastRatio: '4.5:1 (AA)' },

  // Semantic Roles
  { name: 'Semantic Primary', cssVariable: '--color-semantic-primary', value: 'var(--color-brand-primary)', category: 'semantic', description: 'Action triggers, selection outlines, and primary links' },
  { name: 'Semantic Danger', cssVariable: '--color-semantic-danger', value: 'var(--color-brand-coral)', category: 'semantic', description: 'Destructive confirmations, critical errors, and cancellations' },
  { name: 'Semantic Warning', cssVariable: '--color-semantic-warning', value: 'var(--color-brand-amber)', category: 'semantic', description: 'Attention prompts, unsaved state warnings, and pending badges' },
  { name: 'Semantic Success', cssVariable: '--color-semantic-success', value: 'var(--color-brand-emerald)', category: 'semantic', description: 'Completed transactions, verified timestamps, and success alerts' },
  { name: 'Semantic Info', cssVariable: '--color-semantic-info', value: 'var(--color-brand-primary)', category: 'semantic', description: 'Informational callouts and guidance tooltips' },

  // Surfaces & Backgrounds
  { name: 'Surface Canvas', cssVariable: '--surface-canvas', value: '#f8fafd / #131314', category: 'surface', description: 'Base application canvas and viewport backdrop' },
  { name: 'Surface Card', cssVariable: '--surface-card', value: '#ffffff / #1e1f20', category: 'surface', description: 'Container panels, inspector drawers, and content cards' },
  { name: 'Surface Elevated', cssVariable: '--surface-elevated', value: '#ffffff / #282a2c', category: 'surface', description: 'Floating format bars, popovers, and modal dialogs' },
  { name: 'Surface Hover', cssVariable: '--surface-hover', value: '#f1f3f4 / #333538', category: 'surface', description: 'Interactive row hover and subtle button hover states' },
  { name: 'Surface Active', cssVariable: '--surface-active', value: '#e8f0fe / #004a77', category: 'surface', description: 'Selected navigation items and active tool pills' },

  // Text & Borders
  { name: 'Text Primary', cssVariable: '--text-primary', value: '#1f1f1f / #e3e3e3', category: 'text', description: 'High-contrast headings, active button labels, and primary bill text' },
  { name: 'Text Secondary', cssVariable: '--text-secondary', value: '#444746 / #c4c7c5', category: 'text', description: 'Body paragraphs, table cells, and secondary descriptions' },
  { name: 'Text Muted', cssVariable: '--text-muted', value: '#747775 / #8e918f', category: 'text', description: 'Placeholder strings, keyboard shortcut tags, and micro metadata' },
  { name: 'Border Subtle', cssVariable: '--border-subtle', value: '#e0e2e6 / #333538', category: 'text', description: 'Dividers, table gridlines, and card perimeter strokes' },
  { name: 'Border Default', cssVariable: '--border-default', value: '#c4c7c5 / #444746', category: 'text', description: 'Input borders and neutral interactive component boundaries' },
  { name: 'Border Focus', cssVariable: '--border-focus', value: '#4285f4 / #8ab4f8', category: 'text', description: 'WCAG 2.4.7 focus indicator ring on keyboard navigation' },

  // Elevation
  { name: 'Shadow SM', cssVariable: '--elevation-shadow-sm', value: '0 1px 3px rgba(0,0,0,0.08)', category: 'elevation', description: 'Subtle resting depth for cards and input controls' },
  { name: 'Shadow MD', cssVariable: '--elevation-shadow-md', value: '0 4px 6px -1px rgba(0,0,0,0.08)', category: 'elevation', description: 'Medium lift for dropdown menus and contextual toolbars' },
  { name: 'Shadow LG', cssVariable: '--elevation-shadow-lg', value: '0 10px 15px -3px rgba(0,0,0,0.1)', category: 'elevation', description: 'High lift for floating palettes and focused sheets' },
  { name: 'Shadow Floating', cssVariable: '--elevation-shadow-floating', value: '0 8px 32px rgba(0,0,0,0.12)', category: 'elevation', description: 'Maximum depth for modal dialogs and overlay backdrops' },

  // Radii
  { name: 'Radius SM', cssVariable: '--border-radius-sm', value: '4px', category: 'radius', description: 'Compact pills, status indicators, and tight numeric inputs' },
  { name: 'Radius MD', cssVariable: '--border-radius-md', value: '8px', category: 'radius', description: 'Standard buttons, dropdowns, and form inputs' },
  { name: 'Radius LG', cssVariable: '--border-radius-lg', value: '12px', category: 'radius', description: 'Floating action cards, toolbar panels, and modal containers' },
  { name: 'Radius Card', cssVariable: '--border-radius-card', value: '16px', category: 'radius', description: 'Major content cards and workbench sections' },
  { name: 'Radius Full', cssVariable: '--border-radius-full', value: '9999px', category: 'radius', description: 'Pills, circular icon buttons, and rounded tool capsules' },
];

export const TokensView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Tokens', count: ALL_TOKENS.length },
    { id: 'brand', label: 'Brand Palette', count: ALL_TOKENS.filter((t) => t.category === 'brand').length },
    { id: 'semantic', label: 'Semantic Roles', count: ALL_TOKENS.filter((t) => t.category === 'semantic').length },
    { id: 'surface', label: 'Surfaces', count: ALL_TOKENS.filter((t) => t.category === 'surface').length },
    { id: 'text', label: 'Text & Borders', count: ALL_TOKENS.filter((t) => t.category === 'text').length },
    { id: 'elevation', label: 'Elevation', count: ALL_TOKENS.filter((t) => t.category === 'elevation').length },
    { id: 'radius', label: 'Radii', count: ALL_TOKENS.filter((t) => t.category === 'radius').length },
  ];

  const filteredTokens = ALL_TOKENS.filter((t) => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.cssVariable.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.value.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(label);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="tokens-studio-shell" role="main" aria-label="Design Tokens Studio">
      {/* Studio Header */}
      <div className="tokens-studio-header">
        <div className="tokens-title-group">
          <span className="tokens-spec-tag">STYLE DICTIONARY V4 · W3C DTCG SPEC</span>
          <h1 className="tokens-studio-title">Design Tokens Studio</h1>
        </div>
        <p className="tokens-studio-desc">
          The atomic design token system powering <code>@inq/tokens</code> and <code>@inq/ui</code>. Engineered with strict Google Labs Light & Gemini Dark theme responsiveness.
        </p>
      </div>

      {copiedToken && (
        <div className="tokens-toast" role="status" aria-live="polite">
          <CheckIcon size={14} />
          <span>Copied {copiedToken} to clipboard</span>
        </div>
      )}

      {/* Control & Filter Toolbar */}
      <div className="tokens-controls-bar">
        {/* Row 1: Search & View Switcher */}
        <div className="tokens-toolbar-top">
          {/* Search Box */}
          <div className="tokens-search-field">
            <input
              type="text"
              className="tokens-search-input"
              placeholder="Search by token name, CSS variable, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearch('')}
                title="Clear search"
              >
                <CloseIcon size={12} />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="tokens-view-switcher">
            <button
              type="button"
              className={`view-switch-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              Specimen Cards
            </button>
            <button
              type="button"
              className={`view-switch-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              Spec Sheet Table
            </button>
          </div>
        </div>

        {/* Row 2: Category Filter Pills */}
        <div className="tokens-cat-row">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`tokens-cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span>{cat.label}</span>
              <span className="cat-count-badge">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: SPECIMEN CARDS */}
      {viewMode === 'cards' && (
        <div className="tokens-cards-layout">
          {/* 1. BRAND PALETTE */}
          {(selectedCategory === 'all' || selectedCategory === 'brand') && (
            <section className="token-category-block">
              <div className="token-block-head">
                <div className="block-title-row">
                  <h2 className="block-title">Brand Palette</h2>
                  <span className="block-badge">Google 4-Color Base</span>
                </div>
                <p className="block-desc">Primary hues calibrated for optical clarity, brand presence, and key interactive focal points.</p>
              </div>

              <div className="swatches-grid">
                {filteredTokens.filter((t) => t.category === 'brand').map((t) => (
                  <div key={t.cssVariable} className="color-specimen-card">
                    {/* Swatch Preview Bar */}
                    <div
                      className="color-swatch-canvas"
                      style={{ backgroundColor: `var(${t.cssVariable})` }}
                    >
                      <div className="swatch-overlay-chip">
                        <span className="swatch-hex-pill">{t.value}</span>
                        {t.contrastRatio && (
                          <span className="swatch-contrast-pill">{t.contrastRatio}</span>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="color-specimen-body">
                      <div className="specimen-title-row">
                        <span className="specimen-name">{t.name}</span>
                      </div>
                      <code className="specimen-var">{t.cssVariable}</code>
                      <p className="specimen-desc">{t.description}</p>

                      <div className="specimen-actions-row">
                        <button
                          type="button"
                          className="copy-chip-btn"
                          onClick={() => handleCopy(`var(${t.cssVariable})`, t.cssVariable)}
                          title="Copy CSS variable"
                        >
                          Copy var()
                        </button>
                        <button
                          type="button"
                          className="copy-chip-btn hex"
                          onClick={() => handleCopy(t.value, t.value)}
                          title="Copy Hex Code"
                        >
                          Copy Hex
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 2. SEMANTIC ROLES */}
          {(selectedCategory === 'all' || selectedCategory === 'semantic') && (
            <section className="token-category-block">
              <div className="token-block-head">
                <div className="block-title-row">
                  <h2 className="block-title">Semantic Roles</h2>
                  <span className="block-badge">Meaning & Status</span>
                </div>
                <p className="block-desc">Semantic abstractions decoupling functional roles (success, warning, danger) from direct color values.</p>
              </div>

              <div className="swatches-grid">
                {filteredTokens.filter((t) => t.category === 'semantic').map((t) => (
                  <div key={t.cssVariable} className="color-specimen-card semantic">
                    <div
                      className="color-swatch-canvas semantic-strip"
                      style={{ backgroundColor: `var(${t.cssVariable})` }}
                    />
                    <div className="color-specimen-body">
                      <div className="specimen-title-row">
                        <span className="specimen-name">{t.name}</span>
                      </div>
                      <code className="specimen-var">{t.cssVariable}</code>
                      <p className="specimen-desc">{t.description}</p>
                      <div className="specimen-actions-row">
                        <button
                          type="button"
                          className="copy-chip-btn"
                          onClick={() => handleCopy(`var(${t.cssVariable})`, t.cssVariable)}
                        >
                          Copy var()
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. SURFACES & CONTAINERS */}
          {(selectedCategory === 'all' || selectedCategory === 'surface') && (
            <section className="token-category-block">
              <div className="token-block-head">
                <div className="block-title-row">
                  <h2 className="block-title">Surfaces & Containers</h2>
                  <span className="block-badge">Dynamic Theming</span>
                </div>
                <p className="block-desc">
                  Adaptive background surfaces responding seamlessly to Light and Gemini Dark themes with live embedded readability samples.
                </p>
              </div>

              <div className="surfaces-grid">
                {filteredTokens.filter((t) => t.category === 'surface').map((t) => (
                  <div
                    key={t.cssVariable}
                    className="surface-specimen-card"
                    style={{ backgroundColor: `var(${t.cssVariable})` }}
                  >
                    <div className="surface-card-header">
                      <div>
                        <span className="surface-title">{t.name}</span>
                        <code className="surface-code">{t.cssVariable}</code>
                      </div>
                      <button
                        type="button"
                        className="copy-chip-btn"
                        onClick={() => handleCopy(`var(${t.cssVariable})`, t.cssVariable)}
                      >
                        Copy var()
                      </button>
                    </div>

                    {/* Embedded Live Contrast Sample */}
                    <div className="surface-contrast-demo">
                      <div className="contrast-line primary">Primary text legibility sample</div>
                      <div className="contrast-line secondary">Secondary text and metadata sample</div>
                      <div className="contrast-line muted">Muted helper text and shortcut indicator</div>
                    </div>

                    <p className="surface-desc">{t.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. TEXT & BORDERS */}
          {(selectedCategory === 'all' || selectedCategory === 'text') && (
            <section className="token-category-block">
              <div className="token-block-head">
                <div className="block-title-row">
                  <h2 className="block-title">Text & Borders</h2>
                  <span className="block-badge">Contrast Hierarchy</span>
                </div>
                <p className="block-desc">Standard typographic weights and boundary strokes maintaining WCAG AA contrast standards.</p>
              </div>

              <div className="text-tokens-grid">
                {filteredTokens.filter((t) => t.category === 'text').map((t) => (
                  <div key={t.cssVariable} className="text-token-card">
                    <div className="text-token-head">
                      <span className="text-token-name">{t.name}</span>
                      <code className="text-token-var">{t.cssVariable}</code>
                    </div>
                    <div className="text-token-preview">
                      {t.cssVariable.startsWith('--text') ? (
                        <span style={{ color: `var(${t.cssVariable})`, fontSize: '15px', fontWeight: 600 }}>
                          Invoice Statement Header Sample
                        </span>
                      ) : (
                        <div
                          style={{
                            height: '8px',
                            width: '100%',
                            borderRadius: '4px',
                            background: `var(${t.cssVariable})`,
                          }}
                        />
                      )}
                    </div>
                    <p className="text-token-desc">{t.description}</p>
                    <button
                      type="button"
                      className="copy-chip-btn full"
                      onClick={() => handleCopy(`var(${t.cssVariable})`, t.cssVariable)}
                    >
                      Copy var({t.cssVariable})
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. ELEVATION & DEPTH */}
          {(selectedCategory === 'all' || selectedCategory === 'elevation') && (
            <section className="token-category-block">
              <div className="token-block-head">
                <div className="block-title-row">
                  <h2 className="block-title">Elevation & Shadows</h2>
                  <span className="block-badge">Layering Z-Index</span>
                </div>
                <p className="block-desc">Physical spatial depth conveying hierarchy and interactivity across stacked surfaces.</p>
              </div>

              <div className="elevation-cards-grid">
                {filteredTokens.filter((t) => t.category === 'elevation').map((t) => (
                  <div key={t.cssVariable} className="elevation-stage-card">
                    {/* Shadow preview element */}
                    <div className="elevation-sandbox-box">
                      <div
                        className="elevation-floating-slab"
                        style={{ boxShadow: `var(${t.cssVariable})` }}
                      >
                        <span className="floating-slab-text">{t.name}</span>
                      </div>
                    </div>

                    <div className="elevation-meta">
                      <div className="elevation-title-row">
                        <span className="elevation-title">{t.name}</span>
                        <code className="elevation-var">{t.cssVariable}</code>
                      </div>
                      <p className="elevation-desc">{t.description}</p>
                      <button
                        type="button"
                        className="copy-chip-btn full"
                        onClick={() => handleCopy(`var(${t.cssVariable})`, t.cssVariable)}
                      >
                        Copy var()
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 6. BORDER RADII */}
          {(selectedCategory === 'all' || selectedCategory === 'radius') && (
            <section className="token-category-block">
              <div className="token-block-head">
                <div className="block-title-row">
                  <h2 className="block-title">Border Radii</h2>
                  <span className="block-badge">Geometric Curvature</span>
                </div>
                <p className="block-desc">Corner rounding standards providing smooth, harmonious geometry across cards, inputs, and pills.</p>
              </div>

              <div className="radii-cards-grid">
                {filteredTokens.filter((t) => t.category === 'radius').map((t) => (
                  <div key={t.cssVariable} className="radius-specimen-card">
                    {/* Visual Corner Representation */}
                    <div className="radius-shape-stage">
                      <div
                        className="radius-shape-box"
                        style={{ borderRadius: `var(${t.cssVariable})` }}
                      >
                        <span className="radius-val-tag">{t.value}</span>
                      </div>
                    </div>

                    <div className="radius-card-meta">
                      <span className="radius-name">{t.name}</span>
                      <code className="radius-var">{t.cssVariable}</code>
                      <p className="radius-desc">{t.description}</p>
                      <button
                        type="button"
                        className="copy-chip-btn full"
                        onClick={() => handleCopy(`var(${t.cssVariable})`, t.cssVariable)}
                      >
                        Copy var()
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* VIEW 2: DEVELOPER SPEC SHEET TABLE */}
      {viewMode === 'table' && (
        <div className="tokens-table-container">
          <div className="tokens-spec-table">
            <div className="tokens-th-row">
              <div className="th-col th-name">TOKEN NAME</div>
              <div className="th-col th-cat">CATEGORY</div>
              <div className="th-col th-var">CSS VARIABLE</div>
              <div className="th-col th-val">COMPUTED VALUE</div>
              <div className="th-col th-desc">ROLE / USAGE</div>
              <div className="th-col th-action">ACTION</div>
            </div>

            {filteredTokens.map((t) => (
              <div key={t.cssVariable} className="tokens-tr-row">
                <div className="td-col td-name">
                  <span className="table-token-name">{t.name}</span>
                </div>
                <div className="td-col td-cat">
                  <span className="table-cat-badge">{t.category}</span>
                </div>
                <div className="td-col td-var">
                  <code className="table-var-code">{t.cssVariable}</code>
                </div>
                <div className="td-col td-val">
                  {t.category === 'brand' ? (
                    <div className="table-color-chip">
                      <span className="chip-dot" style={{ backgroundColor: `var(${t.cssVariable})` }} />
                      <code>{t.value}</code>
                    </div>
                  ) : (
                    <code>{t.value}</code>
                  )}
                </div>
                <div className="td-col td-desc">
                  <span className="table-desc-text">{t.description}</span>
                </div>
                <div className="td-col td-action">
                  <button
                    type="button"
                    className="copy-chip-btn"
                    onClick={() => handleCopy(`var(${t.cssVariable})`, t.cssVariable)}
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
