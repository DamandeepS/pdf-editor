import React, { useId, useRef } from 'react';

export interface SegmentedControlOption {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  size = 'md',
  fullWidth = false,
  disabled = false,
  'aria-label': ariaLabel = 'Segmented Control',
  className = '',
  ref,
}) => {
  const generatedId = useId();
  const initialValue = defaultValue || (options.find((o) => !o.disabled)?.value ?? options[0]?.value ?? '');
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string>(initialValue);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : uncontrolledValue;
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleSelect = (val: string) => {
    if (disabled) return;
    if (!isControlled) {
      setUncontrolledValue(val);
    }
    if (onChange) {
      onChange(val);
    }
  };

  const enabledOptions = options.filter((o) => !o.disabled && !disabled);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const currentIndex = enabledOptions.findIndex((o) => o.value === currentValue);
    if (currentIndex === -1) return;

    let nextIndex = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % enabledOptions.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + enabledOptions.length) % enabledOptions.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = enabledOptions.length - 1;
    }

    if (nextIndex !== -1) {
      const nextOption = enabledOptions[nextIndex];
      handleSelect(nextOption.value);
      const originalIndex = options.findIndex((o) => o.value === nextOption.value);
      buttonRefs.current[originalIndex]?.focus();
    }
  };

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className={`inq-segmented-control inq-segmented-control--${size} ${fullWidth ? 'inq-segmented-control--full-width' : ''} ${disabled ? 'is-disabled' : ''} ${className}`.trim()}
      onKeyDown={handleKeyDown}
    >
      {options.map((option, idx) => {
        const isSelected = option.value === currentValue;
        const isOptionDisabled = disabled || option.disabled;
        const itemId = `inq-segmented-item-${generatedId}-${option.value}`;

        return (
          <button
            key={option.value}
            id={itemId}
            ref={(el) => {
              buttonRefs.current[idx] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isOptionDisabled}
            tabIndex={isSelected ? 0 : -1}
            className={`inq-segmented-item ${isSelected ? 'is-selected' : ''}`}
            onClick={() => handleSelect(option.value)}
          >
            {option.icon && <span className="inq-segmented-item-icon" aria-hidden="true">{option.icon}</span>}
            <span className="inq-segmented-item-label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
