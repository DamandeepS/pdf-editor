import type { ComponentStoryMeta } from '../../../../apps/stories/src/types';
import { Skeleton } from './Skeleton';

export const SkeletonStory: ComponentStoryMeta = {
  id: 'skeleton',
  name: 'Skeleton',
  category: 'General',
  description: 'Skeleton component description and usage guidelines.',
  component: Skeleton,
  defaultProps: {},
  controls: {},
  a11y: {
    role: 'region',
    focusIndicatorNote: 'Maintains 2px visible focus ring on :focus-visible',
    keyboardShortcuts: [],
  },
};
