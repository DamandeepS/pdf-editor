import React from 'react';
import { BoldIcon, ItalicIcon, TrashIcon, PlusIcon, MinusIcon } from '@inq/icons';
import { IconButton } from '@inq/ui/icon-button';
import { ColorPickerPill } from '@inq/ui/color-picker-pill';

export interface FloatingFormatToolbarProps {
  position: { top: number; left: number };
  type: 'text' | 'whiteout' | 'image';
  // Text formatting
  fontFamily?: string;
  onFontFamilyChange?: (font: string) => void;
  fontSize?: number;
  onFontSizeChange?: (size: number) => void;
  isBold?: boolean;
  onToggleBold?: () => void;
  isItalic?: boolean;
  onToggleItalic?: () => void;
  color?: string;
  onColorChange?: (color: string) => void;
  // Whiteout formatting
  fillColor?: string;
  onFillColorChange?: (color: string) => void;
  // Action
  onDelete: () => void;
}

const PRESET_COLORS = [
  '#1f1f1f', // Dark Gray / Black
  '#4285f4', // Google Blue
  '#ea4335', // Google Coral
  '#fbbc05', // Google Amber
  '#34a853', // Google Emerald
  '#ffffff', // White
];

export const FloatingFormatToolbar: React.FC<FloatingFormatToolbarProps> = ({
  position,
  type,
  fontFamily = 'Helvetica',
  onFontFamilyChange,
  fontSize = 12,
  onFontSizeChange,
  isBold = false,
  onToggleBold,
  isItalic = false,
  onToggleItalic,
  color = '#1f1f1f',
  onColorChange,
  fillColor = '#ffffff',
  onFillColorChange,
  onDelete,
}) => {
  return (
    <div
      className="floating-toolbar"
      style={{
        top: `${Math.max(10, position.top)}px`,
        left: `${Math.max(10, position.left)}px`,
      }}
      role="toolbar"
      aria-label="Format Selection"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {type === 'text' && (
        <>
          {/* Font Family */}
          <select
            className="font-select"
            value={fontFamily}
            onChange={(e) => onFontFamilyChange?.(e.target.value)}
            title="Font Family"
          >
            <option value="Helvetica">Helvetica (Sans)</option>
            <option value="Times-Roman">Times New Roman (Serif)</option>
            <option value="Courier">Courier (Monospace)</option>
          </select>

          {/* Font Size controls */}
          <div className="size-input-wrapper">
            <IconButton
              tooltip="Decrease Font Size"
              size="sm"
              onClick={() => onFontSizeChange?.(Math.max(6, (fontSize || 12) - 1))}
            >
              <MinusIcon size={14} />
            </IconButton>
            <input
              type="number"
              className="size-number-input"
              value={fontSize}
              onChange={(e) => onFontSizeChange?.(Number(e.target.value) || 12)}
              min={6}
              max={72}
              title="Font Size (pt)"
            />
            <IconButton
              tooltip="Increase Font Size"
              size="sm"
              onClick={() => onFontSizeChange?.(Math.min(72, (fontSize || 12) + 1))}
            >
              <PlusIcon size={14} />
            </IconButton>
          </div>

          {/* Bold & Italic */}
          <IconButton
            tooltip="Bold"
            active={isBold}
            size="sm"
            onClick={onToggleBold}
          >
            <BoldIcon size={15} />
          </IconButton>
          <IconButton
            tooltip="Italic"
            active={isItalic}
            size="sm"
            onClick={onToggleItalic}
          >
            <ItalicIcon size={15} />
          </IconButton>

          {/* Color Picker Pill */}
          <ColorPickerPill
            color={color}
            onChange={(newColor) => onColorChange?.(newColor)}
            presetColors={PRESET_COLORS}
          />
        </>
      )}

      {type === 'whiteout' && (
        <>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Whiteout Fill:
          </span>
          <ColorPickerPill
            color={fillColor}
            onChange={(c) => onFillColorChange?.(c)}
            presetColors={['#ffffff', '#f8fafd', '#fdfbf7', '#e8f0fe', '#1e1f20']}
          />
        </>
      )}

      {/* Delete Item */}
      <IconButton
        tooltip={type === 'text' ? 'Whiteout / Erase Text' : 'Delete'}
        size="sm"
        onClick={onDelete}
      >
        <TrashIcon size={15} />
      </IconButton>
    </div>
  );
};
