import React, { useId, forwardRef } from 'react';

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  label?: React.ReactNode;
  labelPosition?: 'start' | 'end';
  helperText?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (checked: boolean, event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => void;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(({
  id: customId,
  checked: controlledChecked,
  defaultChecked = false,
  label,
  labelPosition = 'end',
  helperText,
  error,
  size = 'md',
  disabled = false,
  className = '',
  onChange,
  onKeyDown,
  onClick,
  ...rest
}, ref) => {
  const generatedId = useId();
  const switchId = customId || `inq-switch-${generatedId.replace(/:/g, '')}`;
  const labelId = `${switchId}-label`;
  const helperId = `${switchId}-helper`;
  const errorId = `${switchId}-error`;

  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : uncontrolledChecked;

  const toggle = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const nextChecked = !isChecked;
    if (!isControlled) {
      setUncontrolledChecked(nextChecked);
    }
    if (onChange) {
      onChange(nextChecked, e);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    toggle(e);
    if (onClick) onClick(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle(e);
    }
    if (onKeyDown) onKeyDown(e);
  };

  const describedBy = error ? errorId : helperText ? helperId : undefined;

  return (
    <div className={`inq-switch-wrapper inq-switch--${size} inq-switch--label-${labelPosition} ${disabled ? 'is-disabled' : ''} ${error ? 'has-error' : ''} ${className}`.trim()}>
      <div className="inq-switch-container">
        {label && labelPosition === 'start' && (
          <span id={labelId} className="inq-switch-label" onClick={() => !disabled && toggle({} as any)}>
            {label}
          </span>
        )}

        <button
          ref={ref}
          id={switchId}
          type="button"
          role="switch"
          aria-checked={isChecked}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          disabled={disabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={`inq-switch-track ${isChecked ? 'is-checked' : ''}`}
          {...rest}
        >
          <span className="inq-switch-thumb" />
        </button>

        {label && labelPosition === 'end' && (
          <span id={labelId} className="inq-switch-label" onClick={() => !disabled && toggle({} as any)}>
            {label}
          </span>
        )}
      </div>

      {error ? (
        <div id={errorId} className="inq-switch-error" role="alert">
          {error}
        </div>
      ) : helperText ? (
        <div id={helperId} className="inq-switch-helper">
          {helperText}
        </div>
      ) : null}
    </div>
  );
});

Switch.displayName = 'Switch';

