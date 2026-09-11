import React from 'react';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';
export type SkeletonAnimation = 'pulse' | 'wave' | false;

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  animation = 'wave',
  width,
  height,
  lines = 1,
  className = '',
  style,
  ...rest
}) => {
  const customStyle: React.CSSProperties = {
    ...style,
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div
        className={`inq-skeleton-group ${className}`.trim()}
        aria-hidden="true"
        {...rest}
      >
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className={`inq-skeleton inq-skeleton--text ${animation ? `inq-skeleton--${animation}` : ''} ${idx === lines - 1 ? 'inq-skeleton--last-line' : ''}`}
            style={idx === lines - 1 && !width ? { width: '75%' } : customStyle}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`inq-skeleton inq-skeleton--${variant} ${animation ? `inq-skeleton--${animation}` : ''} ${className}`.trim()}
      style={customStyle}
      {...rest}
    />
  );
};

Skeleton.displayName = 'Skeleton';

