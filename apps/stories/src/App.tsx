import React, { useState, useEffect } from 'react';
import { useWorkbench } from './context/WorkbenchContext';
import { COMPONENT_STORIES } from './registry';
import { Sidebar } from './components/Sidebar';
import { StoryCanvas } from './components/StoryCanvas';
import { ControlsPanel } from './components/ControlsPanel';
import { CodeInspector } from './components/CodeInspector';
import { A11yPanel } from './components/A11yPanel';
import { TokensView } from './components/TokensView';
import { IconsView } from './components/IconsView';
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

  const activeStory =
    COMPONENT_STORIES.find((s) => s.id === activeComponentId) || COMPONENT_STORIES[0];

  // Initialize props on first mount or when component changes
  useEffect(() => {
    if (activeStory && Object.keys(currentProps).length === 0) {
      setCurrentProps(activeStory.defaultProps);
    }
  }, [activeStory, currentProps, setCurrentProps]);

  return (
    <div className="stories-app-shell">
      {/* Top Application Bar */}
      <header className="stories-header">
        <div className="header-left">
          <div className="brand-badge-group">
            <div className="google-color-bar">
              <span className="dot blue" />
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <span className="brand-title">Inq Stories</span>
            <span className="brand-tag">Design System & UI Workbench</span>
          </div>
        </div>

        <div className="header-center">
          <div className="stack-badges">
            <span className="badge-pill">React 19</span>
            <span className="badge-pill">Vite 8</span>
            <span className="badge-pill">Turborepo 2</span>
            <span className="badge-pill">TypeScript 7</span>
          </div>
        </div>

        <div className="header-right">
          {/* Theme Toggle Button */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle light/dark theme"
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>

          {/* External Link to BillEditor web app */}
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="app-link-btn"
            title="Open Inq BillEditor App"
          >
            <span>BillEditor App</span>
            <span className="external-arrow">↗</span>
          </a>
        </div>
      </header>

      {/* Main App Layout */}
      <div className="stories-body">
        {/* Left Nav Sidebar */}
        <Sidebar />

        {/* Right Stage & Inspector Workspace */}
        <main className="stories-workspace">
          {activeSection === 'tokens' && <TokensView />}
          {activeSection === 'icons' && <IconsView />}
          {activeSection === 'component' && activeStory && (
            <div className="component-workbench-layout">
              {/* Top: Responsive Sandbox Stage */}
              <div className="canvas-section">
                <StoryCanvas story={activeStory} />
              </div>

              {/* Bottom: Tabs & Inspector Panels */}
              <div className="inspector-section">
                <div className="inspector-tabs-bar" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'controls'}
                    className={`inspector-tab ${activeTab === 'controls' ? 'active' : ''}`}
                    onClick={() => setActiveTab('controls')}
                  >
                    ⚙️ Controls & Knobs
                    <span className="tab-badge">
                      {Object.keys(activeStory.controls).length}
                    </span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'code'}
                    className={`inspector-tab ${activeTab === 'code' ? 'active' : ''}`}
                    onClick={() => setActiveTab('code')}
                  >
                    💻 JSX Code
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'a11y'}
                    className={`inspector-tab ${activeTab === 'a11y' ? 'active' : ''}`}
                    onClick={() => setActiveTab('a11y')}
                  >
                    ♿ Accessibility (a11y)
                  </button>
                </div>

                <div className="inspector-content">
                  {activeTab === 'controls' && <ControlsPanel story={activeStory} />}
                  {activeTab === 'code' && <CodeInspector story={activeStory} />}
                  {activeTab === 'a11y' && <A11yPanel story={activeStory} />}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
