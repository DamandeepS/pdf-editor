import type { ComponentStoryMeta } from '../../../../apps/stories/src/types';
import { Divider } from './Divider';

export const DividerStory: ComponentStoryMeta = {
  id: 'divider',
  name: 'Divider',
  category: 'General',
  description: 'Divider component description and usage guidelines.',
  component: Divider,
  defaultProps: {},
  controls: {},
  a11y: {
    role: 'region',
    focusIndicatorNote: 'Maintains 2px visible focus ring on :focus-visible',
    keyboardShortcuts: [],
  },
};
