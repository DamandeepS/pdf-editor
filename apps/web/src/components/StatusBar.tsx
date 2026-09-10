import React from 'react';

export interface StatusBarProps {
  currentPage: number;
  totalPages: number;
  scale: number;
  totalEdits: number;
  ipcStatus: 'connected' | 'offline' | 'checking';
  onOpenShortcuts: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  currentPage,
  totalPages,
  scale,
  totalEdits,
  ipcStatus,
  onOpenShortcuts,
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
