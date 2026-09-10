import type { ComponentStoryMeta } from '../../../../apps/stories/src/types';
import { Tabs } from './Tabs';

export const TabsStory: ComponentStoryMeta = {
  id: 'tabs',
  name: 'Tabs',
  category: 'General',
  description: 'Tabs component description and usage guidelines.',
  component: Tabs,
  defaultProps: {},
  controls: {},
  a11y: {
    role: 'region',
    focusIndicatorNote: 'Maintains 2px visible focus ring on :focus-visible',
    keyboardShortcuts: [],
  },
};
