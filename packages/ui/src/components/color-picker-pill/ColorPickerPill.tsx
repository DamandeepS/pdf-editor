import React, { useState, useRef, useEffect } from 'react';

export interface ColorPickerPillProps {
  color: string;
  onChange: (color: string) => void;
  presetColors?: string[];
  className?: string;
}

const DEFAULT_PRESETS = [
  '#1f1f1f', // Charcoal
  '#4285f4', // Primary Blue
  '#ea4335', // Coral Red
  '#fbbc05', // Amber Yellow
  '#34a853', // Emerald Green
  '#5f6368', // Medium Gray
  '#1a73e8', // Deep Blue
  '#d93025', // Deep Red
  '#ffffff', // White
  '#747775', // Muted Gray
];

export const ColorPickerPill: React.FC<ColorPickerPillProps> = ({
  color,
  onChange,
  presetColors = DEFAULT_PRESETS,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-flex' }} className={className}>
      <button
        type="button"
        className="inq-color-picker-trigger"
        style={{ backgroundColor: color }}
        onClick={() => setOpen(!open)}
        title="Select color"
      />

      {open && (
        <div className="inq-color-popover">
          {presetColors.map((c) => (
            <button
              key={c}
              type="button"
              className="inq-color-swatch"
              style={{ backgroundColor: c }}
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
