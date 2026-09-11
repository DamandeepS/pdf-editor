import type { ComponentStoryMeta } from '../../../../../apps/stories/src/types';
import { Textarea } from './Textarea';

export const TextareaStory: ComponentStoryMeta = {
  id: 'textarea',
  name: 'Textarea',
  category: 'General',
  description: 'Textarea component description and usage guidelines.',
  component: Textarea,
  defaultProps: {},
  controls: {},
  a11y: {
    role: 'region',
    focusIndicatorNote: 'Maintains 2px visible focus ring on :focus-visible',
    keyboardShortcuts: [],
  },
};
