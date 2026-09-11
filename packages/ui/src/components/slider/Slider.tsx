import React, { useId } from 'react';

export interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
  disabled?: boolean;
  className?: string;
  ref?: React.Ref<HTMLInputElement>;
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  unit = '',
  disabled = false,
  className = '',
  ref,
}) => {
  const generatedId = useId();
  const sliderId = `inq-slider-${generatedId.replace(/:/g, '')}`;

  return (
    <div className={`inq-slider-container ${disabled ? 'is-disabled' : ''} ${className}`.trim()}>
      {label && (
        <label htmlFor={sliderId} className="inq-slider-label" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={!label ? 'Slider control' : undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value}${unit}`}
        onChange={(e) => onChange(Number(e.target.value))}
        className="inq-slider"
      />
      <span style={{ fontSize: '11px', minWidth: '24px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
        {value}{unit}
      </span>
    </div>
  );
};

Slider.displayName = 'Slider';
