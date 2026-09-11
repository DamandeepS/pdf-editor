import type { ComponentStoryMeta } from '../../../../apps/stories/src/types';
import { Switch } from './Switch';

export const SwitchStory: ComponentStoryMeta = {
  id: 'switch',
  name: 'Switch',
  category: 'General',
  description: 'Switch component description and usage guidelines.',
  component: Switch,
  defaultProps: {},
  controls: {},
  a11y: {
    role: 'region',
    focusIndicatorNote: 'Maintains 2px visible focus ring on :focus-visible',
    keyboardShortcuts: [],
  },
};
