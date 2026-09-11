import type { ComponentStoryMeta } from '../../../../apps/stories/src/types';
import { RadioGroup } from './RadioGroup';

export const RadioGroupStory: ComponentStoryMeta = {
  id: 'radio-group',
  name: 'RadioGroup',
  category: 'General',
  description: 'RadioGroup component description and usage guidelines.',
  component: RadioGroup,
  defaultProps: {},
  controls: {},
  a11y: {
    role: 'region',
    focusIndicatorNote: 'Maintains 2px visible focus ring on :focus-visible',
    keyboardShortcuts: [],
  },
};
