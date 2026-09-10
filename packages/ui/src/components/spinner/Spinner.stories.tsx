import type { ComponentStoryMeta } from '../../../../apps/stories/src/types';
import { Spinner } from './Spinner';

export const SpinnerStory: ComponentStoryMeta = {
  id: 'spinner',
  name: 'Spinner',
  category: 'General',
  description: 'Spinner component description and usage guidelines.',
  component: Spinner,
  defaultProps: {},
  controls: {},
  a11y: {
    role: 'region',
    focusIndicatorNote: 'Maintains 2px visible focus ring on :focus-visible',
    keyboardShortcuts: [],
  },
};
