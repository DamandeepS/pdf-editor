import React from 'react';

export interface FloatingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className = '',
  ref,
  ...rest
}) => {
  return (
    <div ref={ref} className={`inq-floating-card ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
};

FloatingCard.displayName = 'FloatingCard';
