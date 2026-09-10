import React from 'react';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  min?: number;
  max?: number;
  indeterminate?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'brand';
  label?: string;
  showValue?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  min = 0,
  max = 100,
  indeterminate = false,
  size = 'md',
  variant = 'primary',
  label,
  showValue = false,
  className = '',
  'aria-label': customAriaLabel,
  ref,
  ...rest
}) => {
  const isIndeterminate = indeterminate || value === undefined;
  const clampedValue = value !== undefined ? Math.min(Math.max(value, min), max) : undefined;
  const percentage = clampedValue !== undefined ? Math.round(((clampedValue - min) / (max - min)) * 100) : 0;

  return (
    <div ref={ref} className={`inq-progress-wrapper inq-progress--${size} inq-progress--${variant} ${isIndeterminate ? 'is-indeterminate' : ''} ${className}`.trim()}>
      {(label || showValue) && (
        <div className="inq-progress-header">
          {label && <span className="inq-progress-label">{label}</span>}
          {showValue && !isIndeterminate && (
            <span className="inq-progress-value-text">{percentage}%</span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-label={customAriaLabel || label || 'Progress'}
        aria-valuemin={isIndeterminate ? undefined : min}
        aria-valuemax={isIndeterminate ? undefined : max}
        aria-valuenow={isIndeterminate ? undefined : clampedValue}
        className="inq-progress-track"
        {...rest}
      >
        <div
          className="inq-progress-fill"
          style={!isIndeterminate ? { width: `${percentage}%` } : undefined}
        />
      </div>
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';

