import React, { useState } from 'react';
import { ICON_CATALOG } from '../registry';

export const IconsView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [iconSize, setIconSize] = useState<number>(24);
  const [iconColor, setIconColor] = useState<string>('currentColor');
  const [copiedIcon, setCopiedIcon] = useState<string | null>(null);

  const categories = ['All', 'Tools', 'Actions', 'Format', 'Navigation', 'Branding'];

  const filteredIcons = ICON_CATALOG.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.keywords.some((k) => k.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (iconName: string) => {
    const code = `import { ${iconName} } from '@inq/icons';\n\n<${iconName} size={${iconSize}} />`;
    navigator.clipboard.writeText(code);
    setCopiedIcon(iconName);
    setTimeout(() => setCopiedIcon(null), 2000);
  };

  return (
    <div className="icons-view" role="main" aria-label="Material Icons Gallery">
      {/* View Header */}
      <div className="icons-header">
        <div className="icons-header-top">
          <span className="tokens-tag">@INQ/ICONS</span>
          <h1 className="tokens-title">Google Material Icons Gallery</h1>
        </div>
        <p className="tokens-subtitle">
          Pure SVG icons modeled after Google Material Symbols with standardized bounding boxes and optical alignment. Click any icon to copy its JSX snippet.
        </p>
      </div>

      {copiedIcon && (
        <div className="copied-toast">
          ✓ Copied <code>&lt;{copiedIcon} size={'{'}{iconSize}{'}'} /&gt;</code> to clipboard!
        </div>
      )}

      {/* Filter & Controls Toolbar */}
      <div className="icons-toolbar">
        {/* Search */}
        <div className="icons-search-wrapper">
          <input
            type="text"
            className="icons-search-input"
            placeholder="Search 20+ icons by name or keyword (e.g. undo, stamp, zoom)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Dynamic Size Slider */}
        <div className="icon-slider-group">
          <span className="icon-control-label">Size: {iconSize}px</span>
          <input
            type="range"
            className="range-input"
            min={14}
            max={64}
            step={2}
            value={iconSize}
            onChange={(e) => setIconSize(Number(e.target.value))}
          />
        </div>

        {/* Color Tint Quick Switcher */}
        <div className="icon-color-group">
          <span className="icon-control-label">Color:</span>
          <div className="icon-color-pills">
            {[
              { label: 'Current', color: 'currentColor' },
              { label: 'Blue', color: '#4285f4' },
              { label: 'Coral', color: '#ea4335' },
              { label: 'Amber', color: '#fbbc05' },
              { label: 'Emerald', color: '#34a853' },
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
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="icon-category-pills">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Icon Cards Grid */}
      <div className="icons-grid">
        {filteredIcons.map((item) => {
          const IconComp = item.component;
          return (
            <div
              key={item.name}
              className="icon-card"
              onClick={() => handleCopy(item.name)}
              title={`Click to copy import & JSX for ${item.name}`}
            >
              <div className="icon-preview-box" style={{ color: iconColor }}>
                <IconComp size={iconSize} />
              </div>
              <span className="icon-card-name">{item.name}</span>
              <span className="icon-card-cat">{item.category}</span>
            </div>
          );
        })}

        {filteredIcons.length === 0 && (
          <div className="icons-empty-state">
            No icons found matching "{search}".
          </div>
        )}
      </div>
    </div>
  );
};
