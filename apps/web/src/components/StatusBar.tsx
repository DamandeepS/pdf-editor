import React from 'react';

export interface StatusBarProps {
  currentPage: number;
  totalPages: number;
  scale: number;
  totalEdits: number;
  onOpenShortcuts: () => void;
  onOpenPrivacy?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  currentPage,
  totalPages,
  scale,
  totalEdits,
  onOpenShortcuts,
  onOpenPrivacy,
}) => {
  return (
    <footer className="status-bar" role="contentinfo">
      <div className="status-left">
        <span>Page {currentPage} of {Math.max(1, totalPages)}</span>
        <span>•</span>
        <span className="status-zoom-desktop">Zoom: {Math.round(scale * 100)}%</span>
        <span className="status-zoom-mobile">{Math.round(scale * 100)}%</span>
        <span className="status-edits-desktop">
          <span>•</span>
          <span>{totalEdits === 0 ? 'No changes' : `${totalEdits} vector modification${totalEdits > 1 ? 's' : ''}`}</span>
        </span>
        {totalEdits > 0 && (
          <span className="status-edits-mobile">
            <span>•</span>
            <span>{totalEdits} edit{totalEdits > 1 ? 's' : ''}</span>
          </span>
        )}
      </div>

      <div className="status-right">
        {onOpenPrivacy && (
          <button
            type="button"
            className="status-link-btn"
            onClick={onOpenPrivacy}
            title="View Privacy Policy & Data Ethics"
          >
            Privacy
          </button>
        )}

        <a
          href={import.meta.env.DEV ? 'http://localhost:3001' : '/design-system'}
          target="_blank"
          rel="noopener noreferrer"
          className="status-link"
          title="Explore Inq UI Components & Design Tokens Workbench"
        >
          Design System ↗
        </a>

        <a
          href="https://github.com/DamandeepS/pdf-editor"
          target="_blank"
          rel="noopener noreferrer"
          className="status-link"
          title="View source repository on GitHub"
        >
          GitHub ↗
        </a>

        <button
          type="button"
          className="status-shortcut-btn"
          onClick={onOpenShortcuts}
          title="Keyboard shortcuts (⌘/)"
        >
          Shortcuts (⌘/)
        </button>
      </div>
    </footer>
  );
};
