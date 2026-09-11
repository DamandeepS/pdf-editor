import React from 'react';
import { useWorkbench } from '../context/WorkbenchContext';
import { COMPONENT_STORIES, DESIGN_TOKENS, ICON_CATALOG } from '../registry';
import { LayersIcon, TextEditIcon, AutoFitIcon, CloseIcon, ZoomInIcon } from '@inq/icons';
import { TextInput } from '@inq/ui/text-input';
import { IconButton } from '@inq/ui/icon-button';
import { Badge } from '@inq/ui/badge';

const CATEGORY_ORDER = [
  'Actions',
  'Inputs',
  'Surfaces',
  'Navigation',
  'Feedback',
] as const;

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
        <IconButton
          size="sm"
          className="drawer-close-btn"
          onClick={onClose}
          aria-label="Close Navigation"
          tooltip="Close Navigation"
        >
          <CloseIcon size={16} />
        </IconButton>
      </div>

      {/* Search Bar */}
      <div className="sidebar-search-box">
        <TextInput
          size="sm"
          placeholder="Search components, tokens, icons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          clearable
          onClear={() => setSearchQuery('')}
          prefixIcon={<ZoomInIcon size={14} />}
        />
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
            <Badge className="nav-item-badge">{DESIGN_TOKENS.length}</Badge>
          </button>

          <button
            type="button"
            className={`nav-item ${activeSection === 'typography' ? 'active' : ''}`}
            onClick={() => handleSelectFoundation('typography')}
          >
            <span className="nav-item-icon"><TextEditIcon size={16} /></span>
            <span className="nav-item-label">Typography Studio</span>
            <Badge className="nav-item-badge">3 Fonts</Badge>
          </button>

          <button
            type="button"
            className={`nav-item ${activeSection === 'icons' ? 'active' : ''}`}
            onClick={() => handleSelectFoundation('icons')}
          >
            <span className="nav-item-icon"><AutoFitIcon size={16} /></span>
            <span className="nav-item-label">Material Icons</span>
            <Badge className="nav-item-badge">{ICON_CATALOG.length}</Badge>
          </button>
        </div>

        {/* UI COMPONENTS LIST GROUPED BY TYPE */}
        <div className="nav-group">
          <div className="nav-group-title">
            <span>UI COMPONENTS</span>
            <span className="group-count">({filteredComponents.length})</span>
          </div>

          {CATEGORY_ORDER.map((category) => {
            const categoryComponents = filteredComponents
              .filter((c) => c.category === category)
              .sort((a, b) => a.name.localeCompare(b.name));

            if (categoryComponents.length === 0) return null;

            return (
              <div key={category} className="nav-category-section">
                <div className="nav-category-header">
                  <span className="nav-category-name">{category}</span>
                  <span className="nav-category-count">{categoryComponents.length}</span>
                </div>
                <div className="nav-category-list">
                  {categoryComponents.map((story) => {
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
                      </button>
                    );
                  })}
                </div>
              </div>
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
            <Badge className="badge-pill">React 19</Badge>
            <Badge className="badge-pill">Vite 8</Badge>
            <Badge className="badge-pill">Turborepo 2</Badge>
            <Badge className="badge-pill">TypeScript 7</Badge>
          </div>
        </div>
      </div>
    </aside>
  );
};
