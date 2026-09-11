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
import { TextInput } from '@inq/ui/text-input';
import { Checkbox } from '@inq/ui/checkbox';
import { Switch } from '@inq/ui/switch';
import { Select } from '@inq/ui/select';
import { RadioGroup } from '@inq/ui/radio-group';
import { Toast } from '@inq/ui/toast';
import { Spinner } from '@inq/ui/spinner';
import { ProgressBar } from '@inq/ui/progress-bar';
import { Tooltip } from '@inq/ui/tooltip';
import { Drawer } from '@inq/ui/drawer';
import { Accordion } from '@inq/ui/accordion';
import { Divider } from '@inq/ui/divider';
import { Avatar } from '@inq/ui/avatar';
import { Tabs } from '@inq/ui/tabs';
import { Skeleton } from '@inq/ui/skeleton';

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
  InfoIcon,
  AlertCircleIcon,
  AlertTriangleIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
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
  {
    id: 'text-input',
    name: 'TextInput',
    category: 'Inputs',
    description: 'Accessible text input field with floating/resting labels, prefix/suffix adornments, clear button, and error alerts.',
    component: (props: any) => {
      const [val, setVal] = React.useState(props.defaultValue || 'Inq Document 2026.pdf');
      return (
        <div style={{ maxWidth: '380px', width: '100%' }}>
          <TextInput
            {...props}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onClear={() => setVal('')}
          />
        </div>
      );
    },
    controls: {
      label: { type: 'text', label: 'Label', defaultValue: 'Document Title' },
      placeholder: { type: 'text', label: 'Placeholder', defaultValue: 'Enter title...' },
      helperText: { type: 'text', label: 'Helper Text', defaultValue: 'Appears on exported PDF header' },
      error: { type: 'text', label: 'Error Message', defaultValue: '' },
      variant: {
        type: 'select',
        label: 'Variant',
        options: ['outlined', 'filled'],
        defaultValue: 'outlined',
      },
      size: {
        type: 'select',
        label: 'Size',
        options: ['sm', 'md', 'lg'],
        defaultValue: 'md',
      },
      clearable: { type: 'boolean', label: 'Clearable', defaultValue: true },
      disabled: { type: 'boolean', label: 'Disabled', defaultValue: false },
      required: { type: 'boolean', label: 'Required', defaultValue: true },
    },
    defaultProps: {
      label: 'Document Title',
      defaultValue: 'Quarterly Statement 2026',
      placeholder: 'Enter title...',
      helperText: 'Appears on exported PDF header',
      error: '',
      variant: 'outlined',
      size: 'md',
      clearable: true,
      disabled: false,
      required: true,
    },
    a11y: {
      role: 'textbox',
      keyboardShortcuts: [
        { key: 'Tab', description: 'Focuses input element' },
        { key: 'Escape', description: 'Clears input when clearable' },
      ],
      focusIndicatorNote: 'High contrast focus ring with --border-focus and subtle primary blue shadow',
      ariaAttributes: ['aria-invalid="true" when error present', 'aria-describedby linked to helper/error id'],
    },
    variants: [
      { name: 'Standard Outlined', props: { variant: 'outlined', label: 'Invoice Number', defaultValue: 'INV-2026-0042' } },
      { name: 'Filled Variant', props: { variant: 'filled', label: 'Tax ID', defaultValue: 'GB-99218274' } },
      { name: 'Validation Error', props: { label: 'Amount Due', defaultValue: 'invalid_number', error: 'Please enter a valid currency amount' } },
      { name: 'Disabled Field', props: { label: 'Audit Timestamp', defaultValue: '2026-09-11 12:00 UTC', disabled: true } },
    ],
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    category: 'Inputs',
    description: 'Accessible multi-state checkbox with custom SVG checkmark and indeterminate state support.',
    component: (props: any) => {
      const [checked, setChecked] = React.useState(props.defaultChecked ?? true);
      return (
        <Checkbox
          {...props}
          checked={checked}
          onChange={(next) => setChecked(next)}
        />
      );
    },
    controls: {
      label: { type: 'text', label: 'Label', defaultValue: 'Whiteout background text during export' },
      helperText: { type: 'text', label: 'Helper Text', defaultValue: 'Ensures original text layer is redacted' },
      error: { type: 'text', label: 'Error Message', defaultValue: '' },
      indeterminate: { type: 'boolean', label: 'Indeterminate', defaultValue: false },
      size: {
        type: 'select',
        label: 'Size',
        options: ['sm', 'md', 'lg'],
        defaultValue: 'md',
      },
      disabled: { type: 'boolean', label: 'Disabled', defaultValue: false },
    },
    defaultProps: {
      label: 'Whiteout background text during export',
      helperText: 'Ensures original text layer is redacted',
      error: '',
      indeterminate: false,
      size: 'md',
      disabled: false,
    },
    a11y: {
      role: 'checkbox',
      keyboardShortcuts: [
        { key: 'Space', description: 'Toggles checkbox checked/unchecked state' },
      ],
      ariaAttributes: ['aria-checked="true | false | mixed"'],
    },
    variants: [
      { name: 'Standard Checked', props: { label: 'Preserve Original Fonts', defaultChecked: true } },
      { name: 'Indeterminate Selection', props: { label: 'Select All 12 Fields', indeterminate: true } },
      { name: 'Validation Error', props: { label: 'Agree to export license', error: 'You must accept the terms to proceed' } },
      { name: 'Small Option', props: { label: 'Compact option', size: 'sm', defaultChecked: false } },
    ],
  },
  {
    id: 'switch',
    name: 'Switch',
    category: 'Inputs',
    description: 'Fluid toggle switch with elevated thumb and spring physics for instant boolean toggling.',
    component: (props: any) => {
      const [checked, setChecked] = React.useState(props.defaultChecked ?? true);
      return (
        <Switch
          {...props}
          checked={checked}
          onChange={(next) => setChecked(next)}
        />
      );
    },
    controls: {
      label: { type: 'text', label: 'Label', defaultValue: 'Real-time Vector Preview' },
      labelPosition: {
        type: 'select',
        label: 'Label Position',
        options: ['end', 'start'],
        defaultValue: 'end',
      },
      helperText: { type: 'text', label: 'Helper Text', defaultValue: 'Renders modified font glyphs instantly' },
      size: {
        type: 'select',
        label: 'Size',
        options: ['sm', 'md', 'lg'],
        defaultValue: 'md',
      },
      disabled: { type: 'boolean', label: 'Disabled', defaultValue: false },
    },
    defaultProps: {
      label: 'Real-time Vector Preview',
      labelPosition: 'end',
      helperText: 'Renders modified font glyphs instantly',
      size: 'md',
      disabled: false,
    },
    a11y: {
      role: 'switch',
      keyboardShortcuts: [
        { key: 'Space / Enter', description: 'Toggles switch between on and off states' },
      ],
      ariaAttributes: ['aria-checked="true | false"'],
    },
    variants: [
      { name: 'Standard Switch', props: { label: 'Show Page Grid', defaultChecked: true } },
      { name: 'Small Toggle', props: { label: 'Snapping', size: 'sm', defaultChecked: true } },
      { name: 'Large Toggle', props: { label: 'High Contrast Canvas', size: 'lg', defaultChecked: false } },
    ],
  },
  {
    id: 'select',
    name: 'Select',
    category: 'Inputs',
    description: 'Accessible native-wrapped select dropdown with custom chevron indicator and Google styling.',
    component: (props: any) => {
      const [val, setVal] = React.useState(props.defaultValue || 'arial');
      return (
        <div style={{ maxWidth: '340px', width: '100%' }}>
          <Select
            {...props}
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
        </div>
      );
    },
    controls: {
      label: { type: 'text', label: 'Label', defaultValue: 'Font Family' },
      helperText: { type: 'text', label: 'Helper Text', defaultValue: 'Loaded from embedded PDF font table' },
      error: { type: 'text', label: 'Error Message', defaultValue: '' },
      variant: {
        type: 'select',
        label: 'Variant',
        options: ['outlined', 'filled'],
        defaultValue: 'outlined',
      },
      size: {
        type: 'select',
        label: 'Size',
        options: ['sm', 'md', 'lg'],
        defaultValue: 'md',
      },
      disabled: { type: 'boolean', label: 'Disabled', defaultValue: false },
      required: { type: 'boolean', label: 'Required', defaultValue: false },
    },
    defaultProps: {
      label: 'Font Family',
      helperText: 'Loaded from embedded PDF font table',
      error: '',
      variant: 'outlined',
      size: 'md',
      disabled: false,
      required: false,
      options: [
        { value: 'helvetica', label: 'Helvetica Neue' },
        { value: 'arial', label: 'Arial Regular' },
        { value: 'roboto', label: 'Roboto Mono' },
        { value: 'georgia', label: 'Georgia Serif' },
      ],
    },
    a11y: {
      role: 'combobox',
      keyboardShortcuts: [
        { key: 'ArrowDown / ArrowUp', description: 'Cycles through dropdown options' },
        { key: 'Enter', description: 'Confirms selected option' },
      ],
      ariaAttributes: ['aria-invalid', 'aria-describedby'],
    },
    variants: [
      { name: 'Standard Outlined', props: { variant: 'outlined', label: 'Export Format' } },
      { name: 'Filled Variant', props: { variant: 'filled', label: 'Color Space' } },
      { name: 'Validation Error', props: { label: 'Paper Size', error: 'Unsupported paper size selected' } },
    ],
  },
  {
    id: 'radio-group',
    name: 'RadioGroup',
    category: 'Inputs',
    description: 'Radio buttons with mutually exclusive state and roving arrow key navigation.',
    component: (props: any) => {
      const [val, setVal] = React.useState(props.defaultValue || 'vector');
      return (
        <RadioGroup
          {...props}
          value={val}
          onChange={(newVal) => setVal(newVal)}
        />
      );
    },
    controls: {
      label: { type: 'text', label: 'Group Label', defaultValue: 'Export Pipeline Engine' },
      orientation: {
        type: 'select',
        label: 'Orientation',
        options: ['vertical', 'horizontal'],
        defaultValue: 'vertical',
      },
      size: {
        type: 'select',
        label: 'Size',
        options: ['sm', 'md', 'lg'],
        defaultValue: 'md',
      },
      helperText: { type: 'text', label: 'Helper Text', defaultValue: 'Determines resolution fidelity' },
      disabled: { type: 'boolean', label: 'Disabled', defaultValue: false },
    },
    defaultProps: {
      label: 'Export Pipeline Engine',
      orientation: 'vertical',
      size: 'md',
      helperText: 'Determines resolution fidelity',
      disabled: false,
      options: [
        { value: 'vector', label: 'Pure Vector (pdf-lib & fontkit)', helperText: 'Sharp text at any scale' },
        { value: 'hybrid', label: 'Hybrid Vector + Flattened Stamp', helperText: 'Maintains stamps as raster layers' },
        { value: 'raster', label: 'Full Flattened Image (300 DPI)', disabled: true },
      ],
    },
    a11y: {
      role: 'radiogroup',
      keyboardShortcuts: [
        { key: 'ArrowDown / ArrowRight', description: 'Selects next available radio option' },
        { key: 'ArrowUp / ArrowLeft', description: 'Selects previous available radio option' },
      ],
      ariaAttributes: ['aria-checked', 'role="radiogroup"'],
    },
    variants: [
      { name: 'Vertical Stack', props: { orientation: 'vertical' } },
      { name: 'Horizontal Inline', props: { orientation: 'horizontal' } },
    ],
  },
  {
    id: 'toast',
    name: 'Toast',
    category: 'Feedback',
    description: 'Floating notification alerts with semantic color accents, auto-dismiss timers, and action buttons.',
    component: (props: any) => {
      const [visible, setVisible] = React.useState(true);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          {!visible && (
            <Button variant="secondary" size="sm" onClick={() => setVisible(true)}>
              Show Toast Again
            </Button>
          )}
          {visible && (
            <Toast
              {...props}
              onClose={() => setVisible(false)}
            />
          )}
        </div>
      );
    },
    controls: {
      title: { type: 'text', label: 'Title', defaultValue: 'Document Saved' },
      message: { type: 'text', label: 'Message', defaultValue: 'Exported vector PDF to local storage successfully.' },
      variant: {
        type: 'select',
        label: 'Variant',
        options: ['info', 'success', 'warning', 'danger'],
        defaultValue: 'success',
      },
      actionLabel: { type: 'text', label: 'Action Label', defaultValue: 'View File' },
    },
    defaultProps: {
      title: 'Document Saved',
      message: 'Exported vector PDF to local storage successfully.',
      variant: 'success',
      actionLabel: 'View File',
      onAction: () => alert('Action clicked'),
    },
    a11y: {
      role: 'status / alert',
      focusIndicatorNote: 'Auto-reads notification message via aria-live announcement',
      ariaAttributes: ['aria-live="polite" (info/success)', 'aria-live="assertive" (danger)'],
    },
    variants: [
      { name: 'Success Confirmation', props: { variant: 'success', title: 'Export Complete', message: 'PDF generated with clean vector layers.' } },
      { name: 'Warning Alert', props: { variant: 'warning', title: 'Unsaved Changes', message: 'You have 3 unsaved text modifications.' } },
      { name: 'Danger Error', props: { variant: 'danger', title: 'Parse Failure', message: 'Invalid font table detected in page 2.' } },
      { name: 'Info Notification', props: { variant: 'info', title: 'Auto-save Enabled', message: 'Backups saved every 2 minutes.' } },
    ],
  },
  {
    id: 'spinner',
    name: 'Spinner',
    category: 'Feedback',
    description: 'Smooth rotating circular progress indicators in Google 4-color brand and monochrome styles.',
    component: Spinner,
    controls: {
      size: {
        type: 'select',
        label: 'Size',
        options: ['xs', 'sm', 'md', 'lg', 'xl'],
        defaultValue: 'md',
      },
      variant: {
        type: 'select',
        label: 'Variant',
        options: ['brand', 'primary', 'neutral'],
        defaultValue: 'brand',
      },
      label: { type: 'text', label: 'Label', defaultValue: 'Compiling vector tree...' },
      labelPosition: {
        type: 'select',
        label: 'Label Position',
        options: ['right', 'bottom'],
        defaultValue: 'right',
      },
    },
    defaultProps: {
      size: 'md',
      variant: 'brand',
      label: 'Compiling vector tree...',
      labelPosition: 'right',
    },
    a11y: {
      role: 'progressbar',
      focusIndicatorNote: 'Provides aria-busy="true" for assistive screen readers',
      ariaAttributes: ['role="progressbar"', 'aria-busy="true"', 'aria-label'],
    },
    variants: [
      { name: 'Brand 4-Color Sequence', props: { variant: 'brand', size: 'lg' } },
      { name: 'Primary Google Blue', props: { variant: 'primary', size: 'md' } },
      { name: 'Small Inline', props: { variant: 'primary', size: 'xs', label: '' } },
    ],
  },
  {
    id: 'progress-bar',
    name: 'ProgressBar',
    category: 'Feedback',
    description: 'Determinate and indeterminate progress indicators with smooth gradient shimmers and token styling.',
    component: ProgressBar,
    controls: {
      value: { type: 'number', label: 'Value (0-100)', min: 0, max: 100, step: 5, defaultValue: 70 },
      indeterminate: { type: 'boolean', label: 'Indeterminate', defaultValue: false },
      variant: {
        type: 'select',
        label: 'Variant',
        options: ['primary', 'success', 'warning', 'danger', 'brand'],
        defaultValue: 'brand',
      },
      size: {
        type: 'select',
        label: 'Size',
        options: ['xs', 'sm', 'md', 'lg'],
        defaultValue: 'md',
      },
      label: { type: 'text', label: 'Label', defaultValue: 'Generating PDF vectors' },
      showValue: { type: 'boolean', label: 'Show Percentage', defaultValue: true },
    },
    defaultProps: {
      value: 70,
      indeterminate: false,
      variant: 'brand',
      size: 'md',
      label: 'Generating PDF vectors',
      showValue: true,
    },
    a11y: {
      role: 'progressbar',
      ariaAttributes: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
    },
    variants: [
      { name: 'Brand Multi-Color 70%', props: { variant: 'brand', value: 70, showValue: true } },
      { name: 'Indeterminate Shimmer', props: { indeterminate: true, label: 'Connecting to PDF engine...' } },
      { name: 'Success Completed', props: { variant: 'success', value: 100, label: 'Export Finished', showValue: true } },
    ],
  },
  {
    id: 'tooltip',
    name: 'Tooltip',
    category: 'Surfaces',
    description: 'Contextual floating hint with arrow pointer, responsive placement, and keyboard Escape dismiss.',
    component: (props: any) => (
      <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
        <Tooltip {...props}>
          <Button variant="secondary" size="md">
            Hover or Focus Me
          </Button>
        </Tooltip>
      </div>
    ),
    controls: {
      content: { type: 'text', label: 'Hint Content', defaultValue: 'Whiteout text area (Ctrl + W)' },
      placement: {
        type: 'select',
        label: 'Placement',
        options: ['top', 'bottom', 'left', 'right'],
        defaultValue: 'top',
      },
      delay: { type: 'number', label: 'Delay (ms)', min: 0, max: 1000, step: 50, defaultValue: 100 },
      disabled: { type: 'boolean', label: 'Disabled', defaultValue: false },
    },
    defaultProps: {
      content: 'Whiteout text area (Ctrl + W)',
      placement: 'top',
      delay: 100,
      disabled: false,
    },
    a11y: {
      role: 'tooltip',
      keyboardShortcuts: [
        { key: 'Tab', description: 'Focuses trigger button and displays tooltip' },
        { key: 'Escape', description: 'Dismisses open tooltip immediately' },
      ],
      ariaAttributes: ['aria-describedby linked to tooltip id'],
    },
    variants: [
      { name: 'Top Placement', props: { placement: 'top', content: 'Top tooltip hint' } },
      { name: 'Bottom Placement', props: { placement: 'bottom', content: 'Bottom shortcut hint' } },
      { name: 'Right Placement', props: { placement: 'right', content: 'Right helper note' } },
    ],
  },
  {
    id: 'drawer',
    name: 'Drawer',
    category: 'Surfaces',
    description: 'Slide-over dialog panel with frosted backdrop blur, keyboard dismiss, and customizable placement.',
    component: (props: any) => {
      const [open, setOpen] = React.useState(false);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Button variant="primary" onClick={() => setOpen(true)}>
            Open Side Drawer
          </Button>
          <Drawer
            {...props}
            open={open}
            onClose={() => setOpen(false)}
            footer={
              <>
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={() => setOpen(false)}>
                  Save Preferences
                </Button>
              </>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                Drawers slide in smoothly from the edge of the viewport. They maintain focus management and dismiss gracefully on Escape or backdrop click.
              </p>
              <TextInput label="Document Author" defaultValue="Damandeep Singh" />
              <Select label="Resolution" defaultValue="300" options={[{ value: '150', label: '150 DPI Draft' }, { value: '300', label: '300 DPI Print' }, { value: '600', label: '600 DPI Archival' }]} />
            </div>
          </Drawer>
        </div>
      );
    },
    controls: {
      title: { type: 'text', label: 'Drawer Title', defaultValue: 'Document Settings' },
      description: { type: 'text', label: 'Description', defaultValue: 'Manage export and layout options' },
      placement: {
        type: 'select',
        label: 'Placement',
        options: ['right', 'left', 'bottom'],
        defaultValue: 'right',
      },
      size: {
        type: 'select',
        label: 'Size',
        options: ['sm', 'md', 'lg'],
        defaultValue: 'md',
      },
    },
    defaultProps: {
      title: 'Document Settings',
      description: 'Manage export and layout options',
      placement: 'right',
      size: 'md',
    },
    a11y: {
      role: 'dialog',
      keyboardShortcuts: [
        { key: 'Escape', description: 'Closes drawer immediately' },
      ],
      ariaAttributes: ['role="dialog"', 'aria-modal="true"', 'aria-labelledby'],
    },
    variants: [
      { name: 'Right Side Panel (md)', props: { placement: 'right', size: 'md' } },
      { name: 'Left Sidebar (sm)', props: { placement: 'left', size: 'sm', title: 'Navigation' } },
      { name: 'Wide Configuration (lg)', props: { placement: 'right', size: 'lg', title: 'Advanced Config' } },
    ],
  },
  {
    id: 'accordion',
    name: 'Accordion',
    category: 'Surfaces',
    description: 'Collapsible disclosure items with animated chevron indicators and keyboard accessibility.',
    component: Accordion,
    controls: {
      variant: {
        type: 'select',
        label: 'Variant',
        options: ['bordered', 'flush'],
        defaultValue: 'bordered',
      },
      allowMultiple: { type: 'boolean', label: 'Allow Multiple Open', defaultValue: false },
    },
    defaultProps: {
      variant: 'bordered',
      allowMultiple: false,
      defaultExpandedIds: ['1'],
      items: [
        { id: '1', title: 'How does vector replacement preserve quality?', content: 'Inq preserves the vector geometry of the original PDF without downsampling to raster bitmaps, ensuring 100% vector fidelity.' },
        { id: '2', title: 'Which font formats are supported?', content: 'Standard TrueType (TTF), OpenType (OTF), and embedded CID/Type0 font subsets are fully handled by fontkit.' },
        { id: '3', title: 'Can I redact sensitive information?', content: 'Yes, using the Whiteout tool replaces the target bounding box with an opaque vector mask.' },
      ],
    },
    a11y: {
      role: 'region',
      keyboardShortcuts: [
        { key: 'Enter / Space', description: 'Expands or collapses selected accordion section' },
        { key: 'Tab', description: 'Navigates between accordion header buttons' },
      ],
      ariaAttributes: ['aria-expanded', 'aria-controls', 'role="region"'],
    },
    variants: [
      { name: 'Bordered Group', props: { variant: 'bordered' } },
      { name: 'Flush Group', props: { variant: 'flush' } },
    ],
  },
  {
    id: 'divider',
    name: 'Divider',
    category: 'Surfaces',
    description: 'Horizontal or vertical line separator using token borders with optional centered label.',
    component: (props: any) => (
      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Section Header Above</p>
        <Divider {...props} />
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Section Content Below</p>
      </div>
    ),
    controls: {
      variant: {
        type: 'select',
        label: 'Style Variant',
        options: ['subtle', 'default', 'dashed'],
        defaultValue: 'subtle',
      },
      label: { type: 'text', label: 'Optional Label', defaultValue: 'OR' },
      labelPosition: {
        type: 'select',
        label: 'Label Alignment',
        options: ['center', 'left', 'right'],
        defaultValue: 'center',
      },
    },
    defaultProps: {
      orientation: 'horizontal',
      variant: 'subtle',
      label: 'OR',
      labelPosition: 'center',
    },
    a11y: {
      role: 'separator',
      ariaAttributes: ['role="separator"', 'aria-orientation="horizontal | vertical"'],
    },
    variants: [
      { name: 'Subtle Horizontal Line', props: { label: '', variant: 'subtle' } },
      { name: 'Centered Label Text', props: { label: 'CONTINUE WITH', variant: 'default' } },
      { name: 'Dashed Separator', props: { label: '', variant: 'dashed' } },
    ],
  },
  {
    id: 'avatar',
    name: 'Avatar',
    category: 'Feedback',
    description: 'User and identity circle with image loading fallback, computed initials, and presence indicator dots.',
    component: Avatar,
    controls: {
      name: { type: 'text', label: 'User Name', defaultValue: 'Damandeep Singh' },
      size: {
        type: 'select',
        label: 'Size',
        options: ['xs', 'sm', 'md', 'lg', 'xl'],
        defaultValue: 'lg',
      },
      shape: {
        type: 'select',
        label: 'Shape',
        options: ['circle', 'rounded'],
        defaultValue: 'circle',
      },
      status: {
        type: 'select',
        label: 'Status Indicator',
        options: ['online', 'busy', 'away', 'offline'],
        defaultValue: 'online',
      },
    },
    defaultProps: {
      name: 'Damandeep Singh',
      size: 'lg',
      shape: 'circle',
      status: 'online',
    },
    a11y: {
      role: 'img',
      focusIndicatorNote: 'Accessible text label provided via aria-label with initials fallback',
      ariaAttributes: ['role="img"', 'aria-label'],
    },
    variants: [
      { name: 'Initials with Online Dot', props: { name: 'Ada Lovelace', status: 'online', size: 'lg' } },
      { name: 'Rounded Profile (xl)', props: { name: 'Google Labs', shape: 'rounded', size: 'xl' } },
      { name: 'Busy Indicator', props: { name: 'Editor Agent', status: 'busy', size: 'md' } },
    ],
  },
  {
    id: 'tabs',
    name: 'Tabs',
    category: 'Navigation',
    description: 'Tabbed navigation with active underline/pill, panel switching, and roving arrow keyboard navigation.',
    component: (props: any) => {
      const [active, setActive] = React.useState('editor');
      return (
        <div style={{ width: '100%', maxWidth: '520px' }}>
          <Tabs
            {...props}
            activeId={active}
            onChange={(id) => setActive(id)}
          />
        </div>
      );
    },
    controls: {
      variant: {
        type: 'select',
        label: 'Variant',
        options: ['underline', 'pill'],
        defaultValue: 'underline',
      },
      size: {
        type: 'select',
        label: 'Size',
        options: ['sm', 'md', 'lg'],
        defaultValue: 'md',
      },
    },
    defaultProps: {
      variant: 'underline',
      size: 'md',
      tabs: [
        { id: 'editor', label: 'PDF Canvas', content: <div style={{ padding: '16px', background: 'var(--surface-hover)', borderRadius: '8px', fontSize: '13px' }}>Active PDF Vector Canvas with live text replacement overlay.</div> },
        { id: 'tokens', label: 'Design Tokens', content: <div style={{ padding: '16px', background: 'var(--surface-hover)', borderRadius: '8px', fontSize: '13px' }}>Style Dictionary v4 CSS Custom Properties and color definitions.</div> },
        { id: 'metadata', label: 'Document Metadata', content: <div style={{ padding: '16px', background: 'var(--surface-hover)', borderRadius: '8px', fontSize: '13px' }}>Producer: pdf-lib 1.17, Title: Statement Q3, Pages: 1.</div> },
      ],
    },
    a11y: {
      role: 'tablist',
      keyboardShortcuts: [
        { key: 'ArrowRight / ArrowLeft', description: 'Cycles between tabs and reveals corresponding panel' },
        { key: 'Home / End', description: 'Jumps to first or last available tab' },
      ],
      ariaAttributes: ['role="tablist"', 'role="tab"', 'role="tabpanel"', 'aria-selected'],
    },
    variants: [
      { name: 'Underline Tabs', props: { variant: 'underline' } },
      { name: 'Segmented Pill Tabs', props: { variant: 'pill' } },
    ],
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    category: 'Feedback',
    description: 'Animated placeholder shimmer with wave and pulse physics for seamless progressive content loading.',
    component: Skeleton,
    controls: {
      variant: {
        type: 'select',
        label: 'Shape',
        options: ['text', 'rectangular', 'circular'],
        defaultValue: 'text',
      },
      animation: {
        type: 'select',
        label: 'Animation',
        options: ['wave', 'pulse'],
        defaultValue: 'wave',
      },
      lines: { type: 'number', label: 'Text Lines', min: 1, max: 6, step: 1, defaultValue: 3 },
    },
    defaultProps: {
      variant: 'text',
      animation: 'wave',
      lines: 3,
    },
    a11y: {
      role: 'presentation',
      focusIndicatorNote: 'Marked aria-hidden="true" to prevent screen reader noise; respects prefers-reduced-motion',
      ariaAttributes: ['aria-hidden="true"'],
    },
    variants: [
      { name: 'Paragraph Lines', props: { variant: 'text', lines: 3, animation: 'wave' } },
      { name: 'Rectangular Card', props: { variant: 'rectangular', height: 140, animation: 'wave' } },
      { name: 'Circular Avatar Placeholder', props: { variant: 'circular', width: 48, height: 48, animation: 'pulse' } },
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
  { name: 'InfoIcon', category: 'Feedback', component: InfoIcon, keywords: ['info', 'information', 'details', 'help', 'notice'] },
  { name: 'AlertCircleIcon', category: 'Feedback', component: AlertCircleIcon, keywords: ['alert', 'circle', 'danger', 'error', 'failed'] },
  { name: 'AlertTriangleIcon', category: 'Feedback', component: AlertTriangleIcon, keywords: ['alert', 'warning', 'caution', 'triangle'] },
  { name: 'ChevronRightIcon', category: 'Navigation', component: ChevronRightIcon, keywords: ['chevron', 'right', 'next', 'arrow'] },
  { name: 'ShieldCheckIcon', category: 'Feedback', component: ShieldCheckIcon, keywords: ['shield', 'check', 'verified', 'secure', 'privacy'] },
];

