import type { ComponentStoryMeta } from '../../../../apps/stories/src/types';
import { Select } from './Select';

export const SelectStory: ComponentStoryMeta = {
  id: 'select',
  name: 'Select',
  category: 'General',
  description: 'Select component description and usage guidelines.',
  component: Select,
  defaultProps: {},
  controls: {},
  a11y: {
    role: 'region',
    focusIndicatorNote: 'Maintains 2px visible focus ring on :focus-visible',
    keyboardShortcuts: [],
  },
};
