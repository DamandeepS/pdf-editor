import type { ComponentStoryMeta } from '../../../../apps/stories/src/types';
import { Drawer } from './Drawer';

export const DrawerStory: ComponentStoryMeta = {
  id: 'drawer',
  name: 'Drawer',
  category: 'General',
  description: 'Drawer component description and usage guidelines.',
  component: Drawer,
  defaultProps: {},
  controls: {},
  a11y: {
    role: 'region',
    focusIndicatorNote: 'Maintains 2px visible focus ring on :focus-visible',
    keyboardShortcuts: [],
  },
};
