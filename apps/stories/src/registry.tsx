import React from 'react';
import type { ComponentStoryMeta, DesignTokenItem, IconItem } from './types';

// UI Components
import { Button } from '@inq/ui/button';
import { IconButton } from '@inq/ui/icon-button';
import { ToolPill } from '@inq/ui/tool-pill';
import { FloatingCard } from '@inq/ui/floating-card';
import { Slider } from '@inq/ui/slider';
import { ColorPickerPill } from '@inq/ui/color-picker-pill';
import { Modal } from '@inq/ui/modal';
import { BrandBadge } from '@inq/ui/brand-badge';
import { Badge } from '@inq/ui/badge';

// Icons
import {
  SelectIcon,
  TextEditIcon,
  WhiteoutIcon,
  ImageIcon,
  UndoIcon,
  RedoIcon,
  ZoomInIcon,
  ZoomOutIcon,
  DownloadIcon,
  UploadIcon,
  TrashIcon,
  BoldIcon,
  ItalicIcon,
  PlusIcon,
  MinusIcon,
  SunIcon,
  MoonIcon,
  CheckIcon,
  CloseIcon,
  ChevronDownIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MoveIcon,
  ResetIcon,
  EyedropperIcon,
} from '@inq/icons';

// ============================================================================
// COMPONENT STORIES REGISTRY
// ============================================================================
export const COMPONENT_STORIES: ComponentStoryMeta[] = [
  {
    id: 'button',
    name: 'Button',
    category: 'Actions',
    description: 'Primary, secondary, and contextual action buttons styled with Google rounded-pill design language and fluid hover physics.',
    component: Button,
    controls: {
      children: { type: 'text', label: 'Label', defaultValue: 'Click Me' },
      variant: {
        type: 'select',
        label: 'Variant',
        options: ['primary', 'secondary', 'tertiary', 'danger', 'ghost'],
        defaultValue: 'primary',
      },
      size: {
        type: 'select',
        label: 'Size',
        options: ['sm', 'md', 'lg'],
        defaultValue: 'md',
      },
      disabled: { type: 'boolean', label: 'Disabled', defaultValue: false },
      loading: { type: 'boolean', label: 'Loading', defaultValue: false },
    },
    defaultProps: {
      children: 'Export Vector PDF',
      variant: 'primary',
      size: 'md',
      disabled: false,
      loading: false,
    },
    a11y: {
      role: 'button',
      keyboardShortcuts: [
        { key: 'Enter', description: 'Triggers button click' },
        { key: 'Space', description: 'Triggers button click' },
      ],
      focusIndicatorNote: 'Visual focus outline visible using --border-focus and 2px offset',
      ariaAttributes: ['aria-disabled when disabled', 'aria-busy when loading'],
    },
    variants: [
      { name: 'Primary Google Blue', props: { variant: 'primary', children: 'Primary Action' } },
      { name: 'Secondary Card', props: { variant: 'secondary', children: 'Secondary Action' } },
      { name: 'Tertiary Subtle', props: { variant: 'tertiary', children: 'Tertiary Action' } },
      { name: 'Danger Coral', props: { variant: 'danger', children: 'Delete Item' } },
      { name: 'Ghost', props: { variant: 'ghost', children: 'Cancel' } },
    ],
  },
  {
    id: 'icon-button',
    name: 'IconButton',
    category: 'Actions',
    description: 'Square or round icon button with built-in accessibility tooltip and active tool state indicators.',
    component: (props: any) => (
      <IconButton {...props}>
        <ZoomInIcon size={props.size === 'lg' ? 22 : props.size === 'sm' ? 14 : 18} />
      </IconButton>
    ),
    controls: {
      tooltip: { type: 'text', label: 'Tooltip', defaultValue: 'Zoom In (+)' },
      size: {
        type: 'select',
        label: 'Size',
        options: ['sm', 'md', 'lg'],
        defaultValue: 'md',
      },
      variant: {
        type: 'select',
        label: 'Variant',
        options: ['default', 'filled', 'tinted'],
        defaultValue: 'default',
      },
      active: { type: 'boolean', label: 'Active', defaultValue: false },
      disabled: { type: 'boolean', label: 'Disabled', defaultValue: false },
    },
    defaultProps: {
      tooltip: 'Zoom In (+)',
      size: 'md',
      variant: 'default',
      active: false,
      disabled: false,
    },
    a11y: {
      role: 'button',
      keyboardShortcuts: [{ key: 'Enter / Space', description: 'Triggers icon button' }],
      focusIndicatorNote: 'Focus-visible outline with --border-focus',
      ariaAttributes: ['aria-label set from tooltip', 'aria-pressed when active'],
    },
    variants: [
      { name: 'Standard Toolbar', props: { variant: 'default', active: false } },
      { name: 'Active Selected', props: { variant: 'default', active: true } },
      { name: 'Filled Pill', props: { variant: 'filled', active: false } },
    ],
  },
  {
    id: 'tool-pill',
    name: 'ToolPill',
    category: 'Navigation',
    description: 'Segmented tool switcher button featuring an icon, label, and keyboard shortcut badge.',
    component: (props: any) => (
      <ToolPill
        {...props}
        icon={<TextEditIcon size={18} />}
        label={props.label || 'Edit Text'}
        shortcut={props.shortcut || 'T'}
        onClick={() => alert(`Tool clicked: ${props.label}`)}
      />
    ),
    controls: {
      label: { type: 'text', label: 'Tool Name', defaultValue: 'Edit Text' },
      shortcut: { type: 'text', label: 'Shortcut', defaultValue: 'T' },
      active: { type: 'boolean', label: 'Active', defaultValue: true },
    },
    defaultProps: {
      label: 'Edit Text',
      shortcut: 'T',
      active: true,
    },
    a11y: {
      role: 'tab or button',
      keyboardShortcuts: [{ key: 'T / Key', description: 'Triggers tool selection globally' }],
      ariaAttributes: ['aria-pressed="true" when tool is currently active'],
    },
    variants: [
      { name: 'Active Tool', props: { active: true, label: 'Edit Text', shortcut: 'T' } },
      { name: 'Inactive Tool', props: { active: false, label: 'Select Tool', shortcut: 'V' } },
    ],
  },
  {
    id: 'floating-card',
    name: 'FloatingCard',
    category: 'Surfaces',
    description: 'Glassmorphic card surface with backdrop blur, subtle borders, and multi-tier elevation shadows.',
    component: (props: any) => (
      <FloatingCard {...props} style={{ padding: '24px', maxWidth: '380px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>Glassmorphic Card</h4>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
          Elevated surface utilizing backdrop filters and tokens for subtle dark mode depth.
        </p>
      </FloatingCard>
    ),
    controls: {
      elevation: {
        type: 'select',
        label: 'Elevation',
        options: ['low', 'medium', 'high', 'floating'],
        defaultValue: 'floating',
      },
      blur: {
        type: 'select',
        label: 'Blur Level',
        options: ['none', 'sm', 'md', 'lg'],
        defaultValue: 'md',
      },
    },
    defaultProps: {
      elevation: 'floating',
      blur: 'md',
    },
    a11y: {
      role: 'region / surface',
      focusIndicatorNote: 'High contrast borders maintain WCAG AAA visibility against canvas',
    },
    variants: [
      { name: 'Floating Glass', props: { elevation: 'floating', blur: 'md' } },
      { name: 'Subtle Card', props: { elevation: 'low', blur: 'none' } },
      { name: 'Heavy Elevated', props: { elevation: 'high', blur: 'lg' } },
    ],
  },
  {
    id: 'slider',
    name: 'Slider',
    category: 'Inputs',
    description: 'Fluid range slider with Google Material styling, value tooltip, and keyboard stepper support.',
    component: (props: any) => {
      const [val, setVal] = React.useState(props.value || 50);
      React.useEffect(() => setVal(props.value || 50), [props.value]);
      return (
        <div style={{ width: '280px' }}>
          <Slider
            {...props}
            value={val}
            onChange={(n) => {
              setVal(n);
              props.onChange?.(n);
            }}
          />
        </div>
      );
    },
    controls: {
      value: { type: 'number', label: 'Value', min: 0, max: 100, step: 1, defaultValue: 65 },
      min: { type: 'number', label: 'Min', min: 0, max: 50, step: 1, defaultValue: 0 },
      max: { type: 'number', label: 'Max', min: 50, max: 200, step: 1, defaultValue: 100 },
      step: { type: 'number', label: 'Step', min: 1, max: 10, step: 1, defaultValue: 1 },
      label: { type: 'text', label: 'Label', defaultValue: 'Zoom Level' },
    },
    defaultProps: {
      value: 65,
      min: 0,
      max: 100,
      step: 1,
      label: 'Zoom Level',
    },
    a11y: {
      role: 'slider',
      keyboardShortcuts: [
        { key: 'ArrowLeft / ArrowDown', description: 'Decreases value by step' },
        { key: 'ArrowRight / ArrowUp', description: 'Increases value by step' },
        { key: 'Home / End', description: 'Jumps to minimum / maximum' },
      ],
      ariaAttributes: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
    },
    variants: [
      { name: 'Zoom Controller', props: { label: 'Zoom Level', min: 25, max: 200, value: 125 } },
      { name: 'Opacity Stepper', props: { label: 'Stamp Opacity', min: 10, max: 100, value: 90 } },
    ],
  },
  {
    id: 'color-picker-pill',
    name: 'ColorPickerPill',
    category: 'Inputs',
    description: 'Compact color trigger pill with live color preview dot and Google curated palette dropdown popover.',
    component: (props: any) => {
      const [col, setCol] = React.useState(props.color || '#4285f4');
      React.useEffect(() => setCol(props.color || '#4285f4'), [props.color]);
      return (
        <ColorPickerPill
          {...props}
          color={col}
          onChange={(newCol) => {
            setCol(newCol);
            props.onChange?.(newCol);
          }}
        />
      );
    },
    controls: {
      color: { type: 'color', label: 'Color Hex', defaultValue: '#4285f4' },
    },
    defaultProps: {
      color: '#4285f4',
      presetColors: ['#1f1f1f', '#4285f4', '#ea4335', '#fbbc05', '#34a853', '#ffffff'],
    },
    a11y: {
      role: 'button / popover',
      keyboardShortcuts: [
        { key: 'Enter / Space', description: 'Opens palette popover' },
        { key: 'Escape', description: 'Closes palette popover' },
      ],
      ariaAttributes: ['aria-haspopup="true"', 'aria-expanded'],
    },
    variants: [
      { name: 'Google Primary Blue', props: { color: '#4285f4' } },
      { name: 'Google Coral Red', props: { color: '#ea4335' } },
      { name: 'Google Emerald Green', props: { color: '#34a853' } },
    ],
  },
  {
    id: 'modal',
    name: 'Modal',
    category: 'Surfaces',
    description: 'Accessible modal dialog with frosted backdrop, keyboard focus trapping, and ESC to dismiss.',
    component: (props: any) => {
      const [open, setOpen] = React.useState(false);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Button variant="primary" onClick={() => setOpen(true)}>
            Open Sample Modal
          </Button>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Press Esc or click backdrop to dismiss
          </span>
          <Modal
            {...props}
            isOpen={open}
            onClose={() => setOpen(false)}
            footer={
              <>
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={() => setOpen(false)}>
                  Confirm Action
                </Button>
              </>
            }
          >
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              This dialog captures user focus, prevents background interaction, and provides standard Escape key listener.
            </p>
          </Modal>
        </div>
      );
    },
    controls: {
      title: { type: 'text', label: 'Title', defaultValue: 'Document Settings' },
      size: {
        type: 'select',
        label: 'Size',
        options: ['sm', 'md', 'lg'],
        defaultValue: 'md',
      },
    },
    defaultProps: {
      title: 'Document Settings',
      size: 'md',
    },
    variants: [
      { name: 'Standard (md)', props: { title: 'Document Settings', size: 'md' } },
      { name: 'Small Confirm (sm)', props: { title: 'Confirm Deletion', size: 'sm' } },
      { name: 'Large Detailed (lg)', props: { title: 'Export Configuration', size: 'lg' } },
    ],
    a11y: {
      role: 'dialog',
      keyboardShortcuts: [
        { key: 'Escape', description: 'Closes dialog immediately' },
        { key: 'Tab', description: 'Cycles focus inside modal only' },
      ],
      ariaAttributes: ['aria-modal="true"', 'aria-labelledby'],
    },
  },
  {
    id: 'brand-badge',
    name: 'BrandBadge',
    category: 'Feedback',
    description: 'Google 4-color animated brand indicator pill with title typography.',
    component: BrandBadge,
    controls: {
      label: { type: 'text', label: 'Label', defaultValue: 'Inq PDF Editor' },
      size: {
        type: 'select',
        label: 'Size',
        options: ['sm', 'md', 'lg'],
        defaultValue: 'md',
      },
    },
    defaultProps: {
      label: 'Inq PDF Editor',
      size: 'md',
    },
    a11y: {
      role: 'status / banner',
      focusIndicatorNote: 'Visual brand anchor element',
    },
    variants: [
      { name: 'Standard Brand', props: { label: 'Inq PDF Editor', size: 'md' } },
      { name: 'Compact Brand', props: { label: 'Inq', size: 'sm' } },
      { name: 'Hero Brand', props: { label: 'Inq Workspace', size: 'lg' } },
    ],
  },
  {
    id: 'badge',
    name: 'Badge',
    category: 'Feedback',
    description: 'Categorical status and tag badge with semantic color variants.',
    component: Badge,
    controls: {
      children: { type: 'text', label: 'Badge Text', defaultValue: 'Verified' },
      variant: {
        type: 'select',
        label: 'Variant',
        options: ['brand', 'success', 'warning', 'danger', 'neutral'],
        defaultValue: 'brand',
      },
    },
    defaultProps: {
      children: 'Active Statement',
      variant: 'brand',
    },
    a11y: {
      role: 'status',
      focusIndicatorNote: 'High contrast text against soft tinted backgrounds',
    },
    variants: [
      { name: 'Brand Pill', props: { variant: 'brand', children: 'Enterprise' } },
      { name: 'Success Emerald', props: { variant: 'success', children: 'PAID' } },
      { name: 'Warning Amber', props: { variant: 'warning', children: 'PENDING' } },
      { name: 'Danger Coral', props: { variant: 'danger', children: 'VOID' } },
      { name: 'Neutral', props: { variant: 'neutral', children: 'Draft' } },
    ],
  },
];

// ============================================================================
// DESIGN TOKENS CATALOG
// ============================================================================
export const DESIGN_TOKENS: DesignTokenItem[] = [
  // Brand Palette
  { name: 'Primary Blue', cssVariable: '--color-brand-primary', value: '#4285f4', category: 'brand', description: 'Google standard primary brand blue' },
  { name: 'Coral Red', cssVariable: '--color-brand-coral', value: '#ea4335', category: 'brand', description: 'Google coral accent and danger indicator' },
  { name: 'Amber Yellow', cssVariable: '--color-brand-amber', value: '#fbbc05', category: 'brand', description: 'Google warning and stamp amber' },
  { name: 'Emerald Green', cssVariable: '--color-brand-emerald', value: '#34a853', category: 'brand', description: 'Google success and confirmation green' },

  // Semantic Roles
  { name: 'Primary Action', cssVariable: '--color-primary', value: '#4285f4', category: 'semantic', description: 'Action buttons, active highlights, key links' },
  { name: 'Success Role', cssVariable: '--color-success', value: '#34a853', category: 'semantic', description: 'Positive statuses, paid stamps, verification' },
  { name: 'Warning Role', cssVariable: '--color-warning', value: '#fbbc05', category: 'semantic', description: 'Alerts, cautions, confidential tags' },
  { name: 'Danger Role', cssVariable: '--color-danger', value: '#ea4335', category: 'semantic', description: 'Destructive actions, error states, void badges' },

  // Surfaces
  { name: 'Canvas Background', cssVariable: '--surface-canvas', value: 'Theme dependent', category: 'surface', description: 'Main application background' },
  { name: 'Card Surface', cssVariable: '--surface-card', value: 'Theme dependent', category: 'surface', description: 'Container and panel surface background' },
  { name: 'Elevated Surface', cssVariable: '--surface-elevated', value: 'Theme dependent', category: 'surface', description: 'Floating dialogs, popovers, format bars' },

  // Text & Typography
  { name: 'Text Primary', cssVariable: '--text-primary', value: 'Theme dependent', category: 'text', description: 'High emphasis headers and body content' },
  { name: 'Text Secondary', cssVariable: '--text-secondary', value: 'Theme dependent', category: 'text', description: 'Medium emphasis captions and labels' },
  { name: 'Text Muted', cssVariable: '--text-muted', value: 'Theme dependent', category: 'text', description: 'Subtle placeholder and shortcut keys' },

  // Elevation & Shadows
  { name: 'Shadow Low', cssVariable: '--elevation-shadow-low', value: '0 1px 3px rgba(0,0,0,0.12)', category: 'elevation', description: 'Cards and docked panels' },
  { name: 'Shadow Floating', cssVariable: '--elevation-shadow-floating', value: '0 8px 24px rgba(0,0,0,0.16)', category: 'elevation', description: 'Floating format toolbar and modals' },

  // Radii
  { name: 'Radius SM', cssVariable: '--border-radius-sm', value: '6px', category: 'radius', description: 'Inputs and select controls' },
  { name: 'Radius MD', cssVariable: '--border-radius-md', value: '10px', category: 'radius', description: 'Cards and dialog containers' },
  { name: 'Radius Full', cssVariable: '--border-radius-full', value: '9999px', category: 'radius', description: 'Pills, badges, and round tool buttons' },
];

// ============================================================================
// GOOGLE MATERIAL ICONS CATALOG
// ============================================================================
export const ICON_CATALOG: IconItem[] = [
  { name: 'SelectIcon', category: 'Tools', component: SelectIcon, keywords: ['cursor', 'pointer', 'arrow', 'select', 'v'] },
  { name: 'TextEditIcon', category: 'Tools', component: TextEditIcon, keywords: ['text', 'type', 'edit', 'font', 't'] },
  { name: 'WhiteoutIcon', category: 'Tools', component: WhiteoutIcon, keywords: ['whiteout', 'redact', 'erase', 'box', 'w'] },
  { name: 'ImageIcon', category: 'Tools', component: ImageIcon, keywords: ['stamp', 'image', 'photo', 'picture', 'signature', 'i'] },
  { name: 'UndoIcon', category: 'Actions', component: UndoIcon, keywords: ['undo', 'history', 'revert', 'back'] },
  { name: 'RedoIcon', category: 'Actions', component: RedoIcon, keywords: ['redo', 'history', 'forward'] },
  { name: 'ZoomInIcon', category: 'Navigation', component: ZoomInIcon, keywords: ['zoom', 'in', 'plus', 'magnify'] },
  { name: 'ZoomOutIcon', category: 'Navigation', component: ZoomOutIcon, keywords: ['zoom', 'out', 'minus', 'reduce'] },
  { name: 'DownloadIcon', category: 'Actions', component: DownloadIcon, keywords: ['download', 'export', 'save', 'pdf'] },
  { name: 'UploadIcon', category: 'Actions', component: UploadIcon, keywords: ['upload', 'file', 'open', 'import'] },
  { name: 'TrashIcon', category: 'Actions', component: TrashIcon, keywords: ['trash', 'delete', 'remove', 'bin'] },
  { name: 'BoldIcon', category: 'Format', component: BoldIcon, keywords: ['bold', 'weight', 'strong', 'format'] },
  { name: 'ItalicIcon', category: 'Format', component: ItalicIcon, keywords: ['italic', 'oblique', 'slant', 'format'] },
  { name: 'PlusIcon', category: 'Actions', component: PlusIcon, keywords: ['plus', 'add', 'create', 'increase'] },
  { name: 'MinusIcon', category: 'Actions', component: MinusIcon, keywords: ['minus', 'subtract', 'decrease'] },
  { name: 'SunIcon', category: 'Branding', component: SunIcon, keywords: ['sun', 'light', 'day', 'theme'] },
  { name: 'MoonIcon', category: 'Branding', component: MoonIcon, keywords: ['moon', 'dark', 'night', 'gemini', 'theme'] },
  { name: 'CheckIcon', category: 'Feedback', component: CheckIcon, keywords: ['check', 'confirm', 'success', 'done'] },
  { name: 'CloseIcon', category: 'Actions', component: CloseIcon, keywords: ['close', 'dismiss', 'cancel', 'x'] },
  { name: 'ChevronDownIcon', category: 'Navigation', component: ChevronDownIcon, keywords: ['chevron', 'arrow', 'dropdown', 'down'] },
  { name: 'AlignLeftIcon', category: 'Format', component: AlignLeftIcon, keywords: ['align', 'left', 'text', 'format'] },
  { name: 'AlignCenterIcon', category: 'Format', component: AlignCenterIcon, keywords: ['align', 'center', 'middle', 'text'] },
  { name: 'AlignRightIcon', category: 'Format', component: AlignRightIcon, keywords: ['align', 'right', 'amount', 'number', 'text'] },
  { name: 'ArrowLeftIcon', category: 'Navigation', component: ArrowLeftIcon, keywords: ['arrow', 'left', 'nudge', 'move', 'back'] },
  { name: 'ArrowRightIcon', category: 'Navigation', component: ArrowRightIcon, keywords: ['arrow', 'right', 'nudge', 'move', 'forward'] },
  { name: 'ArrowUpIcon', category: 'Navigation', component: ArrowUpIcon, keywords: ['arrow', 'up', 'nudge', 'move', 'top'] },
  { name: 'ArrowDownIcon', category: 'Navigation', component: ArrowDownIcon, keywords: ['arrow', 'down', 'nudge', 'move', 'bottom'] },
  { name: 'MoveIcon', category: 'Actions', component: MoveIcon, keywords: ['move', 'drag', 'position', 'reposition', 'crosshair'] },
  { name: 'ResetIcon', category: 'Actions', component: ResetIcon, keywords: ['reset', 'restore', 'revert', 'rotate', 'undo'] },
  { name: 'EyedropperIcon', category: 'Tools', component: EyedropperIcon, keywords: ['eyedropper', 'picker', 'color', 'sample'] },
];

