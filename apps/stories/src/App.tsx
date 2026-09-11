import React, { useState, useEffect } from 'react';
import { useWorkbench } from './context/WorkbenchContext';
import { COMPONENT_STORIES } from './registry';
import { Sidebar } from './components/Sidebar';
import { StoryCanvas } from './components/StoryCanvas';
import { ControlsPanel } from './components/ControlsPanel';
import { CodeInspector } from './components/CodeInspector';
import { A11yPanel } from './components/A11yPanel';
import { TokensView } from './components/TokensView';
import { TypographyView } from './components/TypographyView';
import { IconsView } from './components/IconsView';
import { SunIcon, MoonIcon, MenuIcon } from '@inq/icons';
import { BrandBadge } from '@inq/ui/brand-badge';
import { Badge } from '@inq/ui/badge';
import { Button } from '@inq/ui/button';
import { IconButton } from '@inq/ui/icon-button';
import { Tabs } from '@inq/ui/tabs';
import './App.css';

export const App: React.FC = () => {
  const {
    activeSection,
    activeComponentId,
    currentProps,
    setCurrentProps,
    theme,
    setTheme,
  } = useWorkbench();

  const [activeTab, setActiveTab] = useState<'controls' | 'code' | 'a11y'>('controls');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const activeStory =
    COMPONENT_STORIES.find((s) => s.id === activeComponentId) || COMPONENT_STORIES[0];

  // Initialize props on first mount or when component changes
  useEffect(() => {
    if (activeStory && Object.keys(currentProps).length === 0) {
      setCurrentProps(activeStory.defaultProps);
    }
  }, [activeStory, currentProps, setCurrentProps]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileDrawerOpen) {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileDrawerOpen]);

  return (
    <div className="stories-app-shell">
      {/* Top Application Bar */}
      <header className="stories-header">
        <div className="header-left">
          <IconButton
            size="sm"
            className="mobile-nav-toggle"
            onClick={() => setIsMobileDrawerOpen((prev) => !prev)}
            aria-label="Open Navigation Drawer"
            tooltip="Browse Components & Foundations"
          >
            <MenuIcon size={18} />
          </IconButton>

          <div className="brand-badge-group">
            <BrandBadge label="Inq Stories" size="md" />
            <span className="brand-tag">Design System & UI Workbench</span>
          </div>
        </div>

        <div className="header-center">
          <div className="stack-badges">
            <Badge className="badge-pill">React 19</Badge>
            <Badge className="badge-pill">Vite 8</Badge>
            <Badge className="badge-pill">Turborepo 2</Badge>
            <Badge className="badge-pill">TypeScript 5.8</Badge>
          </div>
        </div>

        <div className="header-right">
          {/* Theme Toggle Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle light/dark theme"
            icon={theme === 'light' ? <MoonIcon size={14} /> : <SunIcon size={14} />}
          >
            <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
          </Button>

          {/* External Link to Inq PDF Editor web app */}
          <a
            href={import.meta.env.VITE_APP_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '/')}
            target="_blank"
            rel="noopener noreferrer"
            className="app-link-btn"
            title="Open Inq PDF Editor App"
          >
            <span className="app-link-label">PDF Editor</span>
            <span className="external-arrow">↗</span>
          </a>
        </div>
      </header>

      {/* Main App Layout */}
      <div className="stories-body">
        {/* Mobile Drawer Backdrop */}
        {isMobileDrawerOpen && (
          <div
            className="mobile-drawer-backdrop"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Left Nav Sidebar */}
        <Sidebar
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
        />

        {/* Right Stage & Inspector Workspace */}
        <main className="stories-workspace">
          {activeSection === 'tokens' && <TokensView />}
          {activeSection === 'typography' && <TypographyView />}
          {activeSection === 'icons' && <IconsView />}
          {activeSection === 'component' && activeStory && (
            <div className="component-workbench-layout">
              {/* Top: Responsive Sandbox Stage */}
              <div className="canvas-section">
                <StoryCanvas story={activeStory} />
              </div>

              {/* Bottom: Tabs & Inspector Panels */}
              <div className="inspector-section">
                <Tabs
                  size="sm"
                  variant="underline"
                  activeId={activeTab}
                  onChange={(id) => setActiveTab(id as 'controls' | 'code' | 'a11y')}
                  aria-label="Component Inspector Tabs"
                  tabs={[
                    {
                      id: 'controls',
                      label: `Controls & Knobs (${Object.keys(activeStory.controls).length})`,
                      content: <ControlsPanel story={activeStory} />,
                    },
                    {
                      id: 'code',
                      label: 'JSX Code',
                      content: <CodeInspector story={activeStory} />,
                    },
                    {
                      id: 'a11y',
                      label: 'Accessibility (a11y)',
                      content: <A11yPanel story={activeStory} />,
                    },
                  ]}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
