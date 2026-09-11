import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
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
  ref,
  ...rest
}) => {
  return (
    <button
      ref={ref}
      className={`inq-btn inq-btn--${variant} inq-btn--${size} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading ? (
        <span className="inq-btn-spinner" aria-hidden="true" />
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

Button.displayName = 'Button';
