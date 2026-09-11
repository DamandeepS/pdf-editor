import type { ComponentStoryMeta } from '../../../../../apps/stories/src/types';
import { SegmentedControl } from './SegmentedControl';

export const SegmentedControlStory: ComponentStoryMeta = {
  id: 'segmented-control',
  name: 'SegmentedControl',
  category: 'General',
  description: 'SegmentedControl component description and usage guidelines.',
  component: SegmentedControl,
  defaultProps: {},
  controls: {},
  a11y: {
    role: 'region',
    focusIndicatorNote: 'Maintains 2px visible focus ring on :focus-visible',
    keyboardShortcuts: [],
  },
};
