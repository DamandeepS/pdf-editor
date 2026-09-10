import React from 'react';

export interface FloatingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className = '',
  ...rest
}) => {
  return (
    <div className={`inq-floating-card ${className}`} {...rest}>
      {children}
    </div>
  );
};
