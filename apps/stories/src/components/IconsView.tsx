import React, { useState } from 'react';
import { ICON_CATALOG } from '../registry';
import { Button } from '@inq/ui/button';
import { IconButton } from '@inq/ui/icon-button';
import { ToolPill } from '@inq/ui/tool-pill';
import { Badge } from '@inq/ui/badge';
import type { IconItem } from '../types';

export const IconsView: React.FC = () => {
  // State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [iconSize, setIconSize] = useState<number>(24);
  const [iconColor, setIconColor] = useState<string>('currentColor');
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [cardStyle, setCardStyle] = useState<'card' | 'circle' | 'minimal'>('card');
  const [activeTab, setActiveTab] = useState<'grid' | 'insitu'>('grid');

  // Selected icon for modal inspection
  const [inspectingIcon, setInspectingIcon] = useState<IconItem | null>(null);
  const [modalStageBg, setModalStageBg] = useState<'canvas' | 'white' | 'dark' | 'grid'>('canvas');
  const [modalPreviewSize, setModalPreviewSize] = useState<number>(64);
  const [codeFormat, setCodeFormat] = useState<'jsx' | 'import' | 'ui' | 'svg'>('jsx');
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const categories = ['All', 'Tools', 'Actions', 'Format', 'Navigation', 'Branding', 'Feedback'];

  const getCategoryCount = (cat: string) => {
    if (cat === 'All') return ICON_CATALOG.length;
    return ICON_CATALOG.filter((i) => i.category === cat).length;
  };

  const filteredIcons = ICON_CATALOG.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.keywords.some((k) => k.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  // Generate code snippet for modal
  const getInspectCodeSnippet = (icon: IconItem): string => {
    switch (codeFormat) {
      case 'jsx':
        return `<${icon.name} size={${iconSize}} color="${iconColor}" />`;
      case 'import':
        return `import { ${icon.name} } from '@inq/icons';`;
      case 'ui':
        return `// Using with @inq/ui components:\n<IconButton size="md" tooltip="${icon.name.replace('Icon', '')}">\n  <${icon.name} size={20} />\n</IconButton>\n\n<Button variant="primary">\n  <${icon.name} size={18} />\n  <span>Action</span>\n</Button>`;
      case 'svg':
        return `<!-- Standard Google Material Symbol Vector (24x24 viewBox) -->\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}" fill="${iconColor}">\n  <!-- Rendered via @inq/icons/${icon.name} -->\n</svg>`;
    }
  };

  return (
    <div className="icons-view" role="main" aria-label="Material Icons Gallery">
      {/* View Header */}
      <div className="icons-header">
        <div className="icons-header-top">
          <span className="tokens-tag">@INQ/ICONS · GOOGLE MATERIAL SYMBOLS</span>
          <h1 className="tokens-title">Material Icons Gallery & Studio</h1>
        </div>
        <p className="tokens-subtitle">
          Pixel-perfect vector SVG icons crafted to Google Material specifications with consistent 24×24 optical bounds. Click any icon to open the deep inspector.
        </p>
      </div>

      {copiedLabel && (
        <div className="copied-toast">
          ✓ Copied {copiedLabel} to clipboard!
        </div>
      )}

      {/* Main View Mode Tabs (Grid vs In-Situ) */}
      <div className="icons-mode-tabs">
        <button
          type="button"
          className={`mode-tab-btn ${activeTab === 'grid' ? 'active' : ''}`}
          onClick={() => setActiveTab('grid')}
        >
          🔲 All Icons Grid ({filteredIcons.length})
        </button>
        <button
          type="button"
          className={`mode-tab-btn ${activeTab === 'insitu' ? 'active' : ''}`}
          onClick={() => setActiveTab('insitu')}
        >
          🧩 In-Situ Component Previews
        </button>
      </div>

      {/* Filter & Controls Toolbar */}
      <div className="icons-toolbar">
        {/* Row 1: Search, Size Presets, Color Tint, Rotation */}
        <div className="toolbar-main-row">
          {/* Search Box */}
          <div className="icons-search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="icons-search-input"
              placeholder="Search by name, tag or shortcut (e.g. zoom, stamp, undo, trash)..."
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
                ✕
              </button>
            )}
          </div>

          {/* Sizing Controls */}
          <div className="icon-ctrl-block">
            <span className="ctrl-label">Size: <strong>{iconSize}px</strong></span>
            <div className="size-presets-row">
              {[16, 20, 24, 32, 48].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`size-preset-pill ${iconSize === s ? 'active' : ''}`}
                  onClick={() => setIconSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <input
              type="range"
              className="range-input small"
              min={14}
              max={64}
              step={2}
              value={iconSize}
              onChange={(e) => setIconSize(Number(e.target.value))}
            />
          </div>

          {/* Color Tinting */}
          <div className="icon-ctrl-block">
            <span className="ctrl-label">Color Tint:</span>
            <div className="color-swatches-row">
              {[
                { label: 'Theme Default', color: 'currentColor' },
                { label: 'Google Blue', color: '#4285f4' },
                { label: 'Coral', color: '#ea4335' },
                { label: 'Amber', color: '#fbbc05' },
                { label: 'Emerald', color: '#34a853' },
                { label: 'Purple', color: '#9c27b0' },
              ].map((c) => (
                <button
                  key={c.label}
                  type="button"
                  className={`color-pill-btn ${iconColor === c.color ? 'active' : ''}`}
                  style={{ backgroundColor: c.color === 'currentColor' ? 'var(--text-primary)' : c.color }}
                  onClick={() => setIconColor(c.color)}
                  title={c.label}
                />
              ))}
              {/* Custom Color Input */}
              <label className="custom-color-picker" title="Custom Hex Color">
                <input
                  type="color"
                  value={iconColor.startsWith('#') ? iconColor : '#4285f4'}
                  onChange={(e) => setIconColor(e.target.value)}
                />
                <span className="custom-color-indicator">🎨</span>
              </label>
            </div>
          </div>

          {/* Transform & Animation */}
          <div className="icon-ctrl-block">
            <span className="ctrl-label">Transform:</span>
            <div className="transform-buttons-row">
              {[0, 90, 180, 270].map((deg) => (
                <button
                  key={deg}
                  type="button"
                  className={`transform-pill ${rotation === deg ? 'active' : ''}`}
                  onClick={() => setRotation(deg)}
                  title={`Rotate ${deg} degrees`}
                >
                  {deg}°
                </button>
              ))}
              <button
                type="button"
                className={`transform-pill spin-toggle ${isSpinning ? 'active' : ''}`}
                onClick={() => setIsSpinning(!isSpinning)}
                title="Toggle continuous rotation animation"
              >
                🔄 Spin
              </button>
            </div>
          </div>

          {/* Card Presentation Style */}
          <div className="icon-ctrl-block">
            <span className="ctrl-label">Card Style:</span>
            <div className="pill-toggle-group small">
              {(['card', 'circle', 'minimal'] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  className={`pill-toggle ${cardStyle === style ? 'active' : ''}`}
                  onClick={() => setCardStyle(style)}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Category Filter Pills */}
        <div className="icons-category-filter-row">
          {categories.map((cat) => {
            const count = getCategoryCount(cat);
            return (
              <button
                key={cat}
                type="button"
                className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <span>{cat}</span>
                <span className="cat-count-tag">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: ALL ICONS GRID */}
      {activeTab === 'grid' && (
        <div className="icons-grid-container">
          <div className="icons-grid">
            {filteredIcons.map((item) => {
              const IconComp = item.component;
              return (
                <div
                  key={item.name}
                  className={`icon-grid-item style-${cardStyle}`}
                  onClick={() => setInspectingIcon(item)}
                  title={`Click to inspect & copy ${item.name}`}
                >
                  <div
                    className={`icon-glyph-wrapper ${isSpinning ? 'animate-spin' : ''}`}
                    style={{
                      color: iconColor,
                      transform: `rotate(${rotation}deg)`,
                    }}
                  >
                    <IconComp size={iconSize} />
                  </div>
                  <span className="icon-name-text">{item.name}</span>
                  <span className="icon-category-text">{item.category}</span>
                </div>
              );
            })}
          </div>

          {filteredIcons.length === 0 && (
            <div className="icons-empty-state">
              <div className="empty-icon-graphic">🔍</div>
              <p className="empty-title">No icons found</p>
              <p className="empty-desc">No icons match "{search}" in category "{selectedCategory}".</p>
              <button
                type="button"
                className="reset-search-btn"
                onClick={() => { setSearch(''); setSelectedCategory('All'); }}
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: IN-SITU COMPONENT PREVIEWS */}
      {activeTab === 'insitu' && (
        <div className="insitu-container">
          <div className="insitu-header-card">
            <h3>Living Integration in `@inq/ui` Components</h3>
            <p>
              Icons scale cleanly, maintain stroke legibility, and preserve optical alignment when used inside real buttons, pills, and badges.
            </p>
          </div>

          <div className="insitu-grid">
            {filteredIcons.slice(0, 8).map((item) => {
              const IconComp = item.component;
              return (
                <div key={item.name} className="insitu-card">
                  <div className="insitu-card-title">
                    <span className="insitu-name">{item.name}</span>
                    <span className="insitu-cat">{item.category}</span>
                  </div>

                  <div className="insitu-components-row">
                    {/* 1. Inside IconButton Default */}
                    <div className="insitu-item">
                      <span className="insitu-item-label">IconButton (Default)</span>
                      <IconButton
                        size="md"
                        aria-label={item.name}
                      >
                        <IconComp size={18} />
                      </IconButton>
                    </div>

                    {/* 2. Inside IconButton Active */}
                    <div className="insitu-item">
                      <span className="insitu-item-label">IconButton (Active)</span>
                      <IconButton
                        size="md"
                        active
                        aria-label={item.name}
                      >
                        <IconComp size={18} />
                      </IconButton>
                    </div>

                    {/* 3. Inside Button with label */}
                    <div className="insitu-item">
                      <span className="insitu-item-label">Button</span>
                      <Button variant="secondary" size="sm">
                        <IconComp size={16} />
                        <span style={{ marginLeft: '6px' }}>Action</span>
                      </Button>
                    </div>

                    {/* 4. Inside ToolPill */}
                    <div className="insitu-item">
                      <span className="insitu-item-label">ToolPill</span>
                      <ToolPill
                        icon={<IconComp size={18} />}
                        label={item.name.replace('Icon', '')}
                        active={false}
                        onClick={() => {}}
                      />
                    </div>

                    {/* 5. Inside Badge */}
                    <div className="insitu-item">
                      <span className="insitu-item-label">Badge</span>
                      <Badge>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <IconComp size={12} />
                          <span>Active</span>
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: DEEP ICON INSPECTOR DRAWER */}
      {inspectingIcon && (
        <div className="icon-inspector-overlay" onClick={() => setInspectingIcon(null)}>
          <div
            className="icon-inspector-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Inspect ${inspectingIcon.name}`}
          >
            {/* Modal Header */}
            <div className="inspector-modal-header">
              <div className="inspector-modal-title-group">
                <h2 className="inspector-modal-title">{inspectingIcon.name}</h2>
                <span className="inspector-category-badge">{inspectingIcon.category}</span>
              </div>
              <button
                type="button"
                className="inspector-close-btn"
                onClick={() => setInspectingIcon(null)}
                aria-label="Close inspector"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="inspector-modal-body">
              {/* Left Column: Scalable Preview on Multiple Backdrops */}
              <div className="inspector-preview-col">
                <div className={`inspector-stage bg-${modalStageBg}`}>
                  <div
                    className={`inspector-stage-glyph ${isSpinning ? 'animate-spin' : ''}`}
                    style={{
                      color: iconColor,
                      transform: `rotate(${rotation}deg)`,
                    }}
                  >
                    {React.createElement(inspectingIcon.component, { size: modalPreviewSize })}
                  </div>
                </div>

                {/* Stage Backdrop Switcher */}
                <div className="stage-controls-row">
                  <div className="bg-buttons-group">
                    {(['canvas', 'white', 'dark', 'grid'] as const).map((bg) => (
                      <button
                        key={bg}
                        type="button"
                        className={`bg-toggle-btn ${modalStageBg === bg ? 'active' : ''}`}
                        onClick={() => setModalStageBg(bg)}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>

                  {/* Preview Zoom Slider */}
                  <div className="modal-zoom-group">
                    <span>{modalPreviewSize}px</span>
                    <input
                      type="range"
                      className="range-input small"
                      min={24}
                      max={128}
                      step={8}
                      value={modalPreviewSize}
                      onChange={(e) => setModalPreviewSize(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Metadata & Code Generator */}
              <div className="inspector-meta-col">
                {/* Meta details */}
                <div className="meta-details-card">
                  <div className="meta-row">
                    <span className="meta-label">Optical ViewBox:</span>
                    <code className="meta-val">0 0 24 24</code>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Export Package:</span>
                    <code className="meta-val">@inq/icons</code>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Search Keywords:</span>
                    <div className="keywords-wrap">
                      {inspectingIcon.keywords.map((k) => (
                        <span key={k} className="keyword-tag">{k}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Code Format Switcher */}
                <div className="code-format-tabs">
                  <button
                    type="button"
                    className={`format-tab ${codeFormat === 'jsx' ? 'active' : ''}`}
                    onClick={() => setCodeFormat('jsx')}
                  >
                    React JSX
                  </button>
                  <button
                    type="button"
                    className={`format-tab ${codeFormat === 'import' ? 'active' : ''}`}
                    onClick={() => setCodeFormat('import')}
                  >
                    ES Import
                  </button>
                  <button
                    type="button"
                    className={`format-tab ${codeFormat === 'ui' ? 'active' : ''}`}
                    onClick={() => setCodeFormat('ui')}
                  >
                    @inq/ui Usage
                  </button>
                  <button
                    type="button"
                    className={`format-tab ${codeFormat === 'svg' ? 'active' : ''}`}
                    onClick={() => setCodeFormat('svg')}
                  >
                    Raw SVG
                  </button>
                </div>

                {/* Code Block & Copy Button */}
                <div className="inspector-code-block-wrapper">
                  <pre className="inspector-code-block">
                    <code>{getInspectCodeSnippet(inspectingIcon)}</code>
                  </pre>
                  <button
                    type="button"
                    className="modal-copy-btn"
                    onClick={() => handleCopy(getInspectCodeSnippet(inspectingIcon), `${codeFormat.toUpperCase()} snippet`)}
                  >
                    📋 Copy Snippet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
