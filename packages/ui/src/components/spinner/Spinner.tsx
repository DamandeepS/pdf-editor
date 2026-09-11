import React from 'react';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'brand' | 'primary' | 'neutral' | 'white';
  label?: React.ReactNode;
  labelPosition?: 'right' | 'bottom';
  ref?: React.Ref<HTMLDivElement>;
}

const sizePixels: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number> = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 36,
  xl: 48,
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  label,
  labelPosition = 'right',
  className = '',
  'aria-label': customAriaLabel,
  ref,
  ...rest
}) => {
  const px = sizePixels[size];
  const strokeWidth = size === 'xs' || size === 'sm' ? 2.5 : 3;
  const radius = (px - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-busy="true"
      aria-label={customAriaLabel || (typeof label === 'string' ? label : 'Loading')}
      className={`inq-spinner-wrapper inq-spinner--${size} inq-spinner--${variant} inq-spinner--label-${labelPosition} ${className}`.trim()}
      {...rest}
    >
      <svg
        className="inq-spinner-svg"
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          className="inq-spinner-track"
          cx={px / 2}
          cy={px / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="inq-spinner-arc"
          cx={px / 2}
          cy={px / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.7}
          strokeLinecap="round"
        />
      </svg>

      {label && <span className="inq-spinner-label">{label}</span>}
    </div>
  );
};

Spinner.displayName = 'Spinner';

