import React from 'react';

export interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  unit = '',
  className = '',
}) => {
  return (
    <div className={`inq-slider-container ${className}`}>
      {label && <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{label}</span>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="inq-slider"
      />
      <span style={{ fontSize: '11px', minWidth: '24px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
        {value}{unit}
      </span>
    </div>
  );
};
