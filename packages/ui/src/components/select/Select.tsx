import React, { useId, forwardRef } from 'react';
import { ChevronDownIcon } from '@inq/icons';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled';
  options?: SelectOption[];
  prefixIcon?: React.ReactNode;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  id: customId,
  label,
  helperText,
  error,
  size = 'md',
  variant = 'outlined',
  options,
  prefixIcon,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  children,
  value,
  defaultValue,
  onChange,
  ...rest
}, ref) => {
  const generatedId = useId();
  const selectId = customId || `inq-select-${generatedId.replace(/:/g, '')}`;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;

  const describedBy = error ? errorId : helperText ? helperId : undefined;

  return (
    <div className={`inq-select-container inq-select--${size} inq-select--${variant} ${disabled ? 'is-disabled' : ''} ${error ? 'has-error' : ''} ${className}`.trim()}>
      {label && (
        <label htmlFor={selectId} className="inq-select-label">
          {label}
          {required && <span className="inq-select-required" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="inq-select-box">
        {prefixIcon && <span className="inq-select-prefix" aria-hidden="true">{prefixIcon}</span>}

        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          value={value}
          defaultValue={defaultValue}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={onChange}
          className="inq-select-element"
          {...rest}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}

          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <span className="inq-select-chevron" aria-hidden="true">
          <ChevronDownIcon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
        </span>
      </div>

      {error ? (
        <div id={errorId} className="inq-select-error" role="alert">
          {error}
        </div>
      ) : helperText ? (
        <div id={helperId} className="inq-select-helper">
          {helperText}
        </div>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';

