import React, { useId, forwardRef } from 'react';

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  id: customId,
  label,
  helperText,
  error,
  size = 'md',
  variant = 'outlined',
  resize = 'vertical',
  value,
  defaultValue,
  disabled = false,
  required = false,
  rows = 3,
  className = '',
  onChange,
  ...rest
}, ref) => {
  const generatedId = useId();
  const textareaId = customId || `inq-textarea-${generatedId.replace(/:/g, '')}`;
  const helperId = `${textareaId}-helper`;
  const errorId = `${textareaId}-error`;

  const describedBy = error ? errorId : helperText ? helperId : undefined;

  return (
    <div
      className={`inq-textarea-container inq-textarea--${size} inq-textarea--${variant} ${disabled ? 'is-disabled' : ''} ${error ? 'has-error' : ''} ${className}`.trim()}
    >
      {label && (
        <label htmlFor={textareaId} className="inq-textarea-label">
          {label}
          {required && <span className="inq-textarea-required" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="inq-textarea-box">
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          rows={rows}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={onChange}
          style={{ resize }}
          className="inq-textarea-input"
          {...rest}
        />
      </div>

      {error ? (
        <div id={errorId} className="inq-textarea-error" role="alert">
          {error}
        </div>
      ) : helperText ? (
        <div id={helperId} className="inq-textarea-helper">
          {helperText}
        </div>
      ) : null}
    </div>
  );
});

Textarea.displayName = 'Textarea';
