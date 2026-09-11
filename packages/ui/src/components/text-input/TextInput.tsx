import React, { useId, forwardRef } from 'react';
import { CloseIcon } from '@inq/icons';

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled';
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
  id: customId,
  label,
  helperText,
  error,
  size = 'md',
  variant = 'outlined',
  prefixIcon,
  suffixIcon,
  clearable = false,
  onClear,
  value,
  defaultValue,
  disabled = false,
  required = false,
  className = '',
  onChange,
  ...rest
}, ref) => {
  const generatedId = useId();
  const inputId = customId || `inq-text-input-${generatedId.replace(/:/g, '')}`;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  const hasValue = value !== undefined ? Boolean(value) : false;

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClear) onClear();
  };

  const describedBy = error ? errorId : helperText ? helperId : undefined;

  return (
    <div className={`inq-text-field-container inq-text-field--${size} inq-text-field--${variant} ${disabled ? 'is-disabled' : ''} ${error ? 'has-error' : ''} ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="inq-text-field-label">
          {label}
          {required && <span className="inq-text-field-required" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="inq-text-field-box">
        {prefixIcon && <span className="inq-text-field-prefix" aria-hidden="true">{prefixIcon}</span>}

        <input
          ref={ref}
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={onChange}
          className="inq-text-field-input"
          {...rest}
        />

        {clearable && hasValue && !disabled && (
          <button
            type="button"
            className="inq-text-field-clear"
            onClick={handleClear}
            aria-label="Clear input"
            tabIndex={-1}
          >
            <CloseIcon size={14} />
          </button>
        )}

        {suffixIcon && <span className="inq-text-field-suffix" aria-hidden="true">{suffixIcon}</span>}
      </div>

      {error ? (
        <div id={errorId} className="inq-text-field-error" role="alert">
          {error}
        </div>
      ) : helperText ? (
        <div id={helperId} className="inq-text-field-helper">
          {helperText}
        </div>
      ) : null}
    </div>
  );
});

TextInput.displayName = 'TextInput';
