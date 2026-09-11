import React, { useState, useRef, useEffect } from 'react';
import { EyedropperIcon } from '@inq/icons';

export interface ColorPickerPillProps {
  color: string;
  onChange: (color: string) => void;
  presetColors?: string[];
  className?: string;
  title?: string;
  ref?: React.Ref<HTMLDivElement>;
}

const DEFAULT_PRESETS = [
  '#1f1f1f', // Charcoal
  '#4285f4', // Primary Blue
  '#ea4335', // Coral Red
  '#fbbc05', // Amber Yellow
  '#34a853', // Emerald Green
  '#5f6368', // Medium Gray
  '#e8f0fe', // Soft Blue Tint
  '#fce8e6', // Soft Red Tint
  '#ffffff', // White
  '#747775', // Muted Gray
];

export const ColorPickerPill: React.FC<ColorPickerPillProps> = ({
  color,
  onChange,
  presetColors = DEFAULT_PRESETS,
  className = '',
  title = 'Select color',
  ref,
}) => {
  const [open, setOpen] = useState(false);
  const [hexVal, setHexVal] = useState(color);
  const internalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHexVal(color);
  }, [color]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (internalRef.current && !internalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleEyedropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          onChange(result.sRGBHex);
          setHexVal(result.sRGBHex);
          setOpen(false);
        }
      } catch {
        // User cancelled sampling or pressed Esc
      }
    }
  };

  const hasNativeEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

  return (
    <div
      ref={(node) => {
        (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
      style={{ position: 'relative', display: 'inline-flex' }}
      className={className}
    >
      <button
        type="button"
        className="inq-color-picker-trigger"
        style={{ backgroundColor: color }}
        onClick={() => setOpen(!open)}
        title={title}
        aria-label={title}
        aria-haspopup="dialog"
        aria-expanded={open}
      />

      {open && (
        <div className="inq-color-popover" role="dialog" aria-modal="true" aria-label="Color Palette">
          <div className="inq-color-grid">
            {presetColors.map((c) => (
              <button
                key={c}
                type="button"
                className={`inq-color-swatch ${color.toLowerCase() === c.toLowerCase() ? 'active' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => {
                  onChange(c);
                  setHexVal(c);
                  setOpen(false);
                }}
                title={c}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>

          <div className="inq-color-tools-bar">
            {hasNativeEyeDropper && (
              <button
                type="button"
                className="inq-color-eyedropper-btn"
                onClick={handleEyedropper}
                title="Eyedropper (Pick color from screen / PDF)"
                aria-label="Pick color with eyedropper"
              >
                <EyedropperIcon size={14} />
              </button>
            )}

            <div className="inq-color-hex-field">
              <span className="inq-color-hex-prefix">#</span>
              <input
                type="text"
                className="inq-color-hex-input"
                value={hexVal.replace(/^#/, '')}
                maxLength={6}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  setHexVal(`#${val}`);
                  if (/^[0-9A-Fa-f]{6}$/.test(val)) {
                    onChange(`#${val}`);
                  }
                }}
                placeholder="000000"
                aria-label="Hex color code"
              />
            </div>

            <label className="inq-color-native-label" title="Custom color picker">
              <input
                type="color"
                className="inq-color-native-input"
                value={color.startsWith('#') && color.length === 7 ? color : '#000000'}
                onChange={(e) => {
                  onChange(e.target.value);
                  setHexVal(e.target.value);
                }}
              />
              <span className="inq-color-native-preview" style={{ backgroundColor: color }} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

ColorPickerPill.displayName = 'ColorPickerPill';
