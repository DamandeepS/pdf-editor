import React from 'react';

export interface BrandBadgeProps {
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

export const BrandBadge: React.FC<BrandBadgeProps> = ({
  label = 'PDF Editor',
  size = 'md',
  className = '',
  ref,
}) => {
  return (
    <div
      ref={ref}
      className={`inq-brand-badge ${className}`.trim()}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
    >
      <div style={{ display: 'flex', gap: '3px' }} aria-hidden="true">
        <span className="inq-brand-dot inq-brand-dot--primary" />
        <span className="inq-brand-dot inq-brand-dot--coral" />
        <span className="inq-brand-dot inq-brand-dot--amber" />
        <span className="inq-brand-dot inq-brand-dot--emerald" />
      </div>
      {label && (
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: size === 'sm' ? '13px' : '15px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.2px',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

BrandBadge.displayName = 'BrandBadge';
