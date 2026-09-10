import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  tooltip?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  active = false,
  tooltip,
  size = 'md',
  className = '',
  ...rest
}) => {
  return (
    <button
      className={`inq-icon-btn ${active ? 'inq-icon-btn--active' : ''} inq-icon-btn--${size} ${className}`}
      title={tooltip}
      {...rest}
    >
      {children}
    </button>
  );
};
