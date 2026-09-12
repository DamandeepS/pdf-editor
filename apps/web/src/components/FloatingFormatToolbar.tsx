import React from 'react';
import {
  BoldIcon,
  ItalicIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ResetIcon,
} from '@inq/icons';
import { IconButton } from '@inq/ui/icon-button';
import { ColorPickerPill } from '@inq/ui/color-picker-pill';

export interface FloatingFormatToolbarProps {
  position: { top: number; left: number };
  type: 'text' | 'whiteout' | 'image' | 'new-text';
  // Text formatting
  fontFamily?: string;
  onFontFamilyChange?: (font: string) => void;
  detectedFontName?: string;
  fontSize?: number;
  onFontSizeChange?: (size: number) => void;
  isBold?: boolean;
  onToggleBold?: () => void;
  isItalic?: boolean;
  onToggleItalic?: () => void;
  textAlign?: 'left' | 'center' | 'right';
  onTextAlignChange?: (align: 'left' | 'center' | 'right') => void;
  onNudge?: (direction: 'left' | 'right' | 'up' | 'down', step?: number) => void;
  onResetPosition?: () => void;
  hasPositionOffset?: boolean;
  color?: string;
  onColorChange?: (color: string) => void;
  backgroundColor?: string;
  onBackgroundColorChange?: (color: string) => void;
  // Whiteout formatting
  fillColor?: string;
  onFillColorChange?: (color: string) => void;
  // Image / Stamp formatting
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
  // Action
  onDelete: () => void;
}

const PRESET_COLORS = [
  '#1f1f1f', // Charcoal
  '#4285f4', // Google Blue
  '#ea4335', // Google Coral
  '#fbbc05', // Google Amber
  '#34a853', // Google Emerald
  '#5f6368', // Medium Gray
  '#e8f0fe', // Soft Blue Tint
  '#ffffff', // White
];

const PRESET_BG_COLORS = [
  '#ffffff', // White paper
  '#e8f0fe', // Soft Blue container
  '#f8fafd', // Neutral surface
  '#f1f3f4', // Light Gray
  '#fef7e0', // Soft Amber container
  '#e6f4ea', // Soft Emerald container
  '#fce8e6', // Soft Red container
  '#1f1f1f', // Dark
];

export const FloatingFormatToolbar: React.FC<FloatingFormatToolbarProps> = ({
  position,
  type,
  fontFamily = 'Helvetica',
  onFontFamilyChange,
  detectedFontName,
  fontSize = 12,
  onFontSizeChange,
  isBold = false,
  onToggleBold,
  isItalic = false,
  onToggleItalic,
  textAlign = 'left',
  onTextAlignChange,
  onNudge,
  onResetPosition,
  hasPositionOffset = false,
  color = '#1f1f1f',
  onColorChange,
  backgroundColor = '#ffffff',
  onBackgroundColorChange,
  fillColor = '#ffffff',
  onFillColorChange,
  opacity = 1,
  onOpacityChange,
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
      {(type === 'text' || type === 'new-text') && (
        <>
          {/* Font Family */}
          <select
            className="font-select"
            value={fontFamily}
            onChange={(e) => onFontFamilyChange?.(e.target.value)}
            title="Font Family"
          >
            {detectedFontName && (
              <option value={fontFamily}>
                {fontFamily} (Detected)
              </option>
            )}
            <optgroup label="Standard PDF Fonts">
              <option value="Helvetica">Helvetica (Sans)</option>
              <option value="Times-Roman">Times New Roman (Serif)</option>
              <option value="Courier">Courier (Monospace)</option>
            </optgroup>
            <optgroup label="Modern Document Fonts">
              <option value="Roboto">Roboto</option>
              <option value="Inter">Inter</option>
              <option value="Roboto Mono">Roboto Mono</option>
            </optgroup>
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

          {/* Text Alignment */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            <IconButton
              tooltip="Align Left"
              active={textAlign === 'left'}
              size="sm"
              onClick={() => onTextAlignChange?.('left')}
            >
              <AlignLeftIcon size={15} />
            </IconButton>
            <IconButton
              tooltip="Align Center"
              active={textAlign === 'center'}
              size="sm"
              onClick={() => onTextAlignChange?.('center')}
            >
              <AlignCenterIcon size={15} />
            </IconButton>
            <IconButton
              tooltip="Align Right (Best for numbers/amounts)"
              active={textAlign === 'right'}
              size="sm"
              onClick={() => onTextAlignChange?.('right')}
            >
              <AlignRightIcon size={15} />
            </IconButton>
          </div>

          {/* Position Nudge Controls */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            <IconButton
              tooltip="Move Left (Alt+←, Shift: 5pt)"
              size="sm"
              onClick={(e) => onNudge?.('left', e.shiftKey ? 5 : 1)}
            >
              <ArrowLeftIcon size={14} />
            </IconButton>
            <IconButton
              tooltip="Move Right (Alt+→, Shift: 5pt)"
              size="sm"
              onClick={(e) => onNudge?.('right', e.shiftKey ? 5 : 1)}
            >
              <ArrowRightIcon size={14} />
            </IconButton>
            <IconButton
              tooltip="Move Up (Alt+↑, Shift: 5pt)"
              size="sm"
              onClick={(e) => onNudge?.('up', e.shiftKey ? 5 : 1)}
            >
              <ArrowUpIcon size={14} />
            </IconButton>
            <IconButton
              tooltip="Move Down (Alt+↓, Shift: 5pt)"
              size="sm"
              onClick={(e) => onNudge?.('down', e.shiftKey ? 5 : 1)}
            >
              <ArrowDownIcon size={14} />
            </IconButton>
            {hasPositionOffset && (
              <IconButton
                tooltip="Reset Position"
                size="sm"
                onClick={onResetPosition}
              >
                <ResetIcon size={14} />
              </IconButton>
            )}
          </div>

          {/* Text Color Picker */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Text:
            </span>
            <ColorPickerPill
              color={color}
              onChange={(newColor) => onColorChange?.(newColor)}
              presetColors={PRESET_COLORS}
              title="Text Color"
            />
          </div>

          {/* Background / Whiteout Color Picker */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Bg:
            </span>
            <ColorPickerPill
              color={backgroundColor}
              onChange={(newBg) => onBackgroundColorChange?.(newBg)}
              presetColors={PRESET_BG_COLORS}
              title="Background / Whiteout Color"
            />
          </div>
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

      {type === 'image' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Opacity: {Math.round(opacity * 100)}%
          </span>
          <IconButton
            tooltip="Decrease Opacity"
            size="sm"
            onClick={() => onOpacityChange?.(Math.max(0.2, Number((opacity - 0.15).toFixed(2))))}
          >
            <MinusIcon size={14} />
          </IconButton>
          <IconButton
            tooltip="Increase Opacity"
            size="sm"
            onClick={() => onOpacityChange?.(Math.min(1.0, Number((opacity + 0.15).toFixed(2))))}
          >
            <PlusIcon size={14} />
          </IconButton>
        </div>
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
