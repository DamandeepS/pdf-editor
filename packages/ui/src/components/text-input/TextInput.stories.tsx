import type { ComponentStoryMeta } from '../../../../apps/stories/src/types';
import { TextInput } from './TextInput';

export const TextInputStory: ComponentStoryMeta = {
  id: 'text-input',
  name: 'TextInput',
  category: 'General',
  description: 'TextInput component description and usage guidelines.',
  component: TextInput,
  defaultProps: {},
  controls: {},
  a11y: {
    role: 'region',
    focusIndicatorNote: 'Maintains 2px visible focus ring on :focus-visible',
    keyboardShortcuts: [],
  },
};
