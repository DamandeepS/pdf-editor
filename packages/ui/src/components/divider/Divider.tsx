import React from 'react';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'subtle' | 'default' | 'dashed';
  label?: React.ReactNode;
  labelPosition?: 'left' | 'center' | 'right';
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'subtle',
  label,
  labelPosition = 'center',
  className = '',
  ...rest
}) => {
  const isHorizontal = orientation === 'horizontal';
  const hasLabel = isHorizontal && Boolean(label);

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={`inq-divider inq-divider--${orientation} inq-divider--${variant} ${hasLabel ? `inq-divider--with-label inq-divider--label-${labelPosition}` : ''} ${className}`.trim()}
      {...rest}
    >
      {hasLabel && (
        <>
          <div className="inq-divider-line inq-divider-line--before" />
          <span className="inq-divider-text">{label}</span>
          <div className="inq-divider-line inq-divider-line--after" />
        </>
      )}
    </div>
  );
};

Divider.displayName = 'Divider';

