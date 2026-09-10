import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  ref,
  ...rest
}) => {
  return (
    <div ref={ref} className={`inq-badge ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
};

Badge.displayName = 'Badge';
