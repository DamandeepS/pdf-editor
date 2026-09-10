import React from 'react';

export type ControlType = 'select' | 'boolean' | 'text' | 'color' | 'number';

export interface ControlDef {
  type: ControlType;
  label: string;
  options?: (string | number)[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue: any;
}

export interface A11yGuide {
  role?: string;
  keyboardShortcuts?: { key: string; description: string }[];
  focusIndicatorNote?: string;
  ariaAttributes?: string[];
}

export interface ComponentStoryMeta<TProps = any> {
  id: string;
  name: string;
  category: 'Actions' | 'Navigation' | 'Feedback' | 'Surfaces' | 'Inputs';
  description: string;
  component: React.ComponentType<TProps>;
  controls: Record<string, ControlDef>;
  defaultProps: TProps;
  a11y: A11yGuide;
  variants?: { name: string; props: Partial<TProps> }[];
}

export interface DesignTokenItem {
  name: string;
  cssVariable: string;
  value: string;
  category: 'brand' | 'semantic' | 'surface' | 'text' | 'border' | 'typography' | 'elevation' | 'spacing' | 'radius';
  description: string;
}

export interface IconItem {
  name: string;
  category: 'Tools' | 'Actions' | 'Format' | 'Navigation' | 'Branding' | 'Feedback';
  component: React.ComponentType<any>;
  keywords: string[];
}

export type ViewportMode = 'desktop' | 'laptop' | 'tablet' | 'mobile';
export type CanvasBg = 'canvas' | 'white' | 'dark' | 'grid';
