import React from 'react';

export interface ToolPillProps {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ToolPill: React.FC<ToolPillProps> = ({
  label,
  icon,
  shortcut,
  active = false,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      className={`inq-pill ${active ? 'inq-pill--active' : ''} ${className}`}
      onClick={onClick}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
      {shortcut && <span className="inq-pill-badge">{shortcut}</span>}
    </button>
  );
};
