import type { ComponentStoryMeta } from '../../../../apps/stories/src/types';
import { Tooltip } from './Tooltip';

export const TooltipStory: ComponentStoryMeta = {
  id: 'tooltip',
  name: 'Tooltip',
  category: 'General',
  description: 'Tooltip component description and usage guidelines.',
  component: Tooltip,
  defaultProps: {},
  controls: {},
  a11y: {
    role: 'region',
    focusIndicatorNote: 'Maintains 2px visible focus ring on :focus-visible',
    keyboardShortcuts: [],
  },
};
