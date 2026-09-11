import type { ComponentStoryMeta } from '../../../../apps/stories/src/types';
import { ProgressBar } from './ProgressBar';

export const ProgressBarStory: ComponentStoryMeta = {
  id: 'progress-bar',
  name: 'ProgressBar',
  category: 'General',
  description: 'ProgressBar component description and usage guidelines.',
  component: ProgressBar,
  defaultProps: {},
  controls: {},
  a11y: {
    role: 'region',
    focusIndicatorNote: 'Maintains 2px visible focus ring on :focus-visible',
    keyboardShortcuts: [],
  },
};
