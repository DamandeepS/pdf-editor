import React from 'react';
import { useWorkbench } from '../context/WorkbenchContext';
import { COMPONENT_STORIES, DESIGN_TOKENS, ICON_CATALOG } from '../registry';
import { LayersIcon, TextEditIcon, AutoFitIcon, CloseIcon } from '@inq/icons';

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeSection,
    setActiveSection,
    activeComponentId,
    setActiveComponentId,
    searchQuery,
    setSearchQuery,
    setCurrentProps,
  } = useWorkbench();

  // Filter components by search query
  const filteredComponents = COMPONENT_STORIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectComponent = (id: string) => {
    setActiveSection('component');
    setActiveComponentId(id);
    const story = COMPONENT_STORIES.find((s) => s.id === id);
    if (story) {
      setCurrentProps(story.defaultProps);
    }
    onClose?.();
  };

  const handleSelectFoundation = (section: 'tokens' | 'typography' | 'icons') => {
    setActiveSection(section);
    onClose?.();
  };

  return (
    <aside className={`stories-sidebar ${isOpen ? 'drawer-open' : ''}`} role="navigation" aria-label="Component Navigation">
      {/* Mobile Drawer Header */}
      <div className="sidebar-drawer-header">
        <div className="drawer-header-left">
          <div className="google-color-bar">
            <span className="dot blue" />
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <span className="drawer-header-title">Components & Design Tokens</span>
        </div>
        <button
          type="button"
          className="drawer-close-btn"
          onClick={onClose}
          aria-label="Close Navigation"
          title="Close Navigation"
        >
          <CloseIcon size={16} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="sidebar-search-box">
        <input
          type="text"
          className="search-input"
          placeholder="Search components, tokens, icons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="clear-search-btn" onClick={() => setSearchQuery('')} title="Clear search">
            <CloseIcon size={12} />
          </button>
        )}
      </div>

      <div className="sidebar-nav-scroll">
        {/* DESIGN SYSTEM FOUNDATIONS */}
        <div className="nav-group">
          <div className="nav-group-title">FOUNDATIONS</div>

          <button
            type="button"
            className={`nav-item ${activeSection === 'tokens' ? 'active' : ''}`}
            onClick={() => handleSelectFoundation('tokens')}
          >
            <span className="nav-item-icon"><LayersIcon size={16} /></span>
            <span className="nav-item-label">Design Tokens</span>
            <span className="nav-item-badge">{DESIGN_TOKENS.length}</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeSection === 'typography' ? 'active' : ''}`}
            onClick={() => handleSelectFoundation('typography')}
          >
            <span className="nav-item-icon"><TextEditIcon size={16} /></span>
            <span className="nav-item-label">Typography Studio</span>
            <span className="nav-item-badge">3 Fonts</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeSection === 'icons' ? 'active' : ''}`}
            onClick={() => handleSelectFoundation('icons')}
          >
            <span className="nav-item-icon"><AutoFitIcon size={16} /></span>
            <span className="nav-item-label">Material Icons</span>
            <span className="nav-item-badge">{ICON_CATALOG.length}</span>
          </button>
        </div>

        {/* UI COMPONENTS LIST */}
        <div className="nav-group">
          <div className="nav-group-title">
            <span>UI COMPONENTS</span>
            <span className="group-count">({filteredComponents.length})</span>
          </div>

          {filteredComponents.map((story) => {
            const isSelected = activeSection === 'component' && activeComponentId === story.id;
            return (
              <button
                key={story.id}
                type="button"
                className={`nav-item ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelectComponent(story.id)}
              >
                <span className="nav-item-bullet" />
                <span className="nav-item-label">{story.name}</span>
                <span className="nav-item-category-tag">{story.category}</span>
              </button>
            );
          })}

          {filteredComponents.length === 0 && (
            <div className="nav-empty-state">No components match "{searchQuery}"</div>
          )}
        </div>

        {/* Mobile Tech Stack Footer */}
        <div className="sidebar-mobile-footer">
          <span className="mobile-footer-label">Built with</span>
          <div className="stack-badges-mobile">
            <span className="badge-pill">React 19</span>
            <span className="badge-pill">Vite 8</span>
            <span className="badge-pill">Turborepo 2</span>
            <span className="badge-pill">TypeScript 7</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
