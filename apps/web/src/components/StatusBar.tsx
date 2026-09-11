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
        <span>Zoom: {Math.round(scale * 100)}%</span>
        <span>•</span>
        <span>{totalEdits === 0 ? 'No changes' : `${totalEdits} vector modification${totalEdits > 1 ? 's' : ''}`}</span>
      </div>

      <div className="status-right">
        {onOpenPrivacy && (
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: '11px',
              textDecoration: 'underline',
            }}
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
          style={{
            color: 'var(--text-secondary)',
            fontSize: '11px',
            textDecoration: 'underline',
          }}
          title="Explore Inq UI Components & Design Tokens Workbench"
        >
          Design System ↗
        </a>

        <a
          href="https://github.com/DamandeepS/pdf-editor"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--text-secondary)',
            fontSize: '11px',
            textDecoration: 'underline',
          }}
          title="View source repository on GitHub"
        >
          GitHub ↗
        </a>

        <button
          type="button"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-brand-primary)',
            fontSize: '11px',
            textDecoration: 'underline',
          }}
          onClick={onOpenShortcuts}
        >
          Shortcuts (⌘/)
        </button>
      </div>
    </footer>
  );
};
