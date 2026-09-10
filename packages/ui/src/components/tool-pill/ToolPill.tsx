import React from 'react';

export interface ToolPillProps {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

export const ToolPill: React.FC<ToolPillProps> = ({
  label,
  icon,
  shortcut,
  active = false,
  onClick,
  className = '',
  ref,
}) => {
  return (
    <button
      ref={ref}
      type="button"
      className={`inq-pill ${active ? 'inq-pill--active' : ''} ${className}`.trim()}
      onClick={onClick}
      aria-pressed={active}
    >
      {icon && <span className="inq-pill-icon" aria-hidden="true">{icon}</span>}
      <span className="inq-pill-label">{label}</span>
      {shortcut && <span className="inq-pill-badge">{shortcut}</span>}
    </button>
  );
};

ToolPill.displayName = 'ToolPill';
