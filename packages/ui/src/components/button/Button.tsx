import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  className = '',
  disabled,
  ...rest
}) => {
  return (
    <button
      className={`inq-btn inq-btn--${variant} inq-btn--${size} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="inq-btn-spinner" />
      ) : (
        <>
          {icon && <span className="inq-btn-icon">{icon}</span>}
          {children && <span>{children}</span>}
          {iconRight && <span className="inq-btn-icon-right">{iconRight}</span>}
        </>
      )}
    </button>
  );
};
