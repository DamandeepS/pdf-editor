import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  ...rest
}) => {
  return (
    <div className={`inq-badge ${className}`} {...rest}>
      {children}
    </div>
  );
};
