import React, { useId, useState } from 'react';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  helperText?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name?: string;
  label?: string;
  helperText?: string;
  error?: string;
  value?: string;
  defaultValue?: string;
  options?: RadioOption[];
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  onChange?: (value: string) => void;
}

interface RadioContextType {
  name: string;
  value?: string;
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onChange: (value: string) => void;
}

export const RadioContext = React.createContext<RadioContextType | null>(null);

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  value: string;
  label?: React.ReactNode;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(({
  value: radioValue,
  label,
  helperText,
  disabled: itemDisabled,
  size: itemSize,
  className = '',
  ...rest
}, ref) => {
  const context = React.useContext(RadioContext);
  const generatedId = useId();
  const inputId = `inq-radio-${generatedId.replace(/:/g, '')}`;
  const helperId = `${inputId}-helper`;

  const isChecked = context ? context.value === radioValue : rest.checked;
  const isDisabled = (context?.disabled || itemDisabled);
  const resolvedSize = itemSize || context?.size || 'md';
  const name = context?.name || rest.name;

  const handleChange = () => {
    if (isDisabled) return;
    if (context) {
      context.onChange(radioValue);
    }
  };

  return (
    <div className={`inq-radio-wrapper inq-radio--${resolvedSize} ${isDisabled ? 'is-disabled' : ''} ${className}`.trim()}>
      <label htmlFor={inputId} className="inq-radio-label-container">
        <span className="inq-radio-control">
          <input
            ref={ref}
            id={inputId}
            type="radio"
            name={name}
            value={radioValue}
            checked={isChecked}
            disabled={isDisabled}
            onChange={handleChange}
            aria-describedby={helperText ? helperId : undefined}
            className="inq-radio-native-input"
            {...rest}
          />
          <span className="inq-radio-circle" aria-hidden="true">
            <span className="inq-radio-dot" />
          </span>
        </span>

        {label && <span className="inq-radio-text">{label}</span>}
      </label>

      {helperText && (
        <div id={helperId} className="inq-radio-helper">
          {helperText}
        </div>
      )}
    </div>
  );
});

Radio.displayName = 'Radio';

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name: customName,
  label,
  helperText,
  error,
  value: controlledValue,
  defaultValue,
  options,
  orientation = 'vertical',
  size = 'md',
  disabled = false,
  className = '',
  children,
  onChange,
}) => {
  const generatedId = useId();
  const groupName = customName || `inq-radiogroup-${generatedId.replace(/:/g, '')}`;
  const labelId = `${groupName}-label`;
  const helperId = `${groupName}-helper`;
  const errorId = `${groupName}-error`;

  const [uncontrolledValue, setUncontrolledValue] = useState<string | undefined>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = (val: string) => {
    if (disabled) return;
    if (!isControlled) {
      setUncontrolledValue(val);
    }
    if (onChange) {
      onChange(val);
    }
  };

  // Keyboard navigation across radio buttons in the group
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!options || options.length === 0) return;
    const enabledOptions = options.filter((opt) => !opt.disabled && !disabled);
    if (enabledOptions.length === 0) return;

    const currentIndex = enabledOptions.findIndex((opt) => opt.value === activeValue);

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % enabledOptions.length;
      handleValueChange(enabledOptions[nextIndex].value);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + enabledOptions.length) % enabledOptions.length;
      handleValueChange(enabledOptions[prevIndex].value);
    }
  };

  const describedBy = error ? errorId : helperText ? helperId : undefined;

  return (
    <RadioContext.Provider value={{ name: groupName, value: activeValue, size, disabled, onChange: handleValueChange }}>
      <div
        role="radiogroup"
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        onKeyDown={handleKeyDown}
        className={`inq-radio-group inq-radio-group--${orientation} inq-radio-group--${size} ${disabled ? 'is-disabled' : ''} ${error ? 'has-error' : ''} ${className}`.trim()}
      >
        {label && (
          <span id={labelId} className="inq-radio-group-label">
            {label}
          </span>
        )}

        <div className="inq-radio-group-options">
          {options
            ? options.map((opt) => (
                <Radio
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                  helperText={opt.helperText}
                  disabled={opt.disabled}
                />
              ))
            : children}
        </div>

        {error ? (
          <div id={errorId} className="inq-radio-group-error" role="alert">
            {error}
          </div>
        ) : helperText ? (
          <div id={helperId} className="inq-radio-group-helper">
            {helperText}
          </div>
        ) : null}
      </div>
    </RadioContext.Provider>
  );
};

RadioGroup.displayName = 'RadioGroup';

