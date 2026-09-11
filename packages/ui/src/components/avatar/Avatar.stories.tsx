import type { ComponentStoryMeta } from '../../../../apps/stories/src/types';
import { Avatar } from './Avatar';

export const AvatarStory: ComponentStoryMeta = {
  id: 'avatar',
  name: 'Avatar',
  category: 'General',
  description: 'Avatar component description and usage guidelines.',
  component: Avatar,
  defaultProps: {},
  controls: {},
  a11y: {
    role: 'region',
    focusIndicatorNote: 'Maintains 2px visible focus ring on :focus-visible',
    keyboardShortcuts: [],
  },
};
