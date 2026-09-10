import React from 'react';

export interface StatusBarProps {
  currentPage: number;
  totalPages: number;
  scale: number;
  totalEdits: number;
  ipcStatus: 'connected' | 'offline' | 'checking';
  onOpenShortcuts: () => void;
  onOpenPrivacy?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  currentPage,
  totalPages,
  scale,
  totalEdits,
  ipcStatus,
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
          href={import.meta.env.DEV ? 'http://localhost:3001' : '/stories'}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--text-secondary)',
            fontSize: '11px',
            textDecoration: 'underline',
          }}
          title="Explore Living Design System & Component Stories Workbench"
        >
          Design System ↗
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

        <div
          className="ipc-status-pill"
          title={
            ipcStatus === 'connected'
              ? 'tRPC IPC server connected'
              : 'Client-side vector engine active. Documents are processed 100% locally in your browser.'
          }
        >
          <span
            className="status-dot"
            style={{
              backgroundColor:
                ipcStatus === 'connected'
                  ? 'var(--color-brand-emerald)'
                  : ipcStatus === 'checking'
                  ? 'var(--color-brand-amber)'
                  : 'var(--color-brand-primary)',
            }}
          />
          <span>
            {ipcStatus === 'connected'
              ? 'tRPC IPC: Connected'
              : ipcStatus === 'checking'
              ? 'Connecting...'
              : 'Vector Engine: Local'}
          </span>
        </div>
      </div>
    </footer>
  );
};
