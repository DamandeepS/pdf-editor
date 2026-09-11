import type { ComponentStoryMeta } from '../../../../apps/stories/src/types';
import { Checkbox } from './Checkbox';

export const CheckboxStory: ComponentStoryMeta = {
  id: 'checkbox',
  name: 'Checkbox',
  category: 'General',
  description: 'Checkbox component description and usage guidelines.',
  component: Checkbox,
  defaultProps: {},
  controls: {},
  a11y: {
    role: 'region',
    focusIndicatorNote: 'Maintains 2px visible focus ring on :focus-visible',
    keyboardShortcuts: [],
  },
};
