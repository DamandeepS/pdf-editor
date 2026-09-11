import React, { useId, forwardRef, useEffect, useRef } from 'react';
import { CheckIcon, MinusIcon } from '@inq/icons';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  label?: React.ReactNode;
  helperText?: string;
  error?: string;
  indeterminate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  id: customId,
  label,
  helperText,
  error,
  indeterminate = false,
  checked,
  defaultChecked,
  disabled = false,
  size = 'md',
  className = '',
  onChange,
  ...rest
}, ref) => {
  const generatedId = useId();
  const inputId = customId || `inq-checkbox-${generatedId.replace(/:/g, '')}`;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  const innerRef = useRef<HTMLInputElement>(null);
  const resolvedRef = (ref || innerRef) as React.MutableRefObject<HTMLInputElement | null>;

  useEffect(() => {
    if (resolvedRef.current) {
      resolvedRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate, resolvedRef]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (onChange) {
      onChange(e.target.checked, e);
    }
  };

  const describedBy = error ? errorId : helperText ? helperId : undefined;

  return (
    <div className={`inq-checkbox-wrapper inq-checkbox--${size} ${disabled ? 'is-disabled' : ''} ${error ? 'has-error' : ''} ${className}`.trim()}>
      <label htmlFor={inputId} className="inq-checkbox-label-container">
        <span className="inq-checkbox-control">
          <input
            ref={resolvedRef}
            id={inputId}
            type="checkbox"
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            aria-checked={indeterminate ? 'mixed' : Boolean(checked)}
            aria-describedby={describedBy}
            aria-invalid={Boolean(error)}
            onChange={handleChange}
            className="inq-checkbox-native-input"
            {...rest}
          />
          <span className="inq-checkbox-indicator" aria-hidden="true">
            {indeterminate ? (
              <MinusIcon size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} strokeWidth={3} />
            ) : (
              <CheckIcon size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} strokeWidth={3} />
            )}
          </span>
        </span>

        {label && <span className="inq-checkbox-text">{label}</span>}
      </label>

      {error ? (
        <div id={errorId} className="inq-checkbox-error" role="alert">
          {error}
        </div>
      ) : helperText ? (
        <div id={helperId} className="inq-checkbox-helper">
          {helperText}
        </div>
      ) : null}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

