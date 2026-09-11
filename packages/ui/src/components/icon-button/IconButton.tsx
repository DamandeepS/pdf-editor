import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  tooltip?: string;
  size?: 'sm' | 'md' | 'lg';
  ref?: React.Ref<HTMLButtonElement>;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  active = false,
  tooltip,
  size = 'md',
  className = '',
  ref,
  ...rest
}) => {
  return (
    <button
      ref={ref}
      className={`inq-icon-btn ${active ? 'inq-icon-btn--active' : ''} inq-icon-btn--${size} ${className}`.trim()}
      title={tooltip}
      aria-label={rest['aria-label'] || tooltip}
      aria-pressed={active ? true : undefined}
      {...rest}
    >
      {children}
    </button>
  );
};

IconButton.displayName = 'IconButton';
