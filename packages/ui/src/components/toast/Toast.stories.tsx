import type { ComponentStoryMeta } from '../../../../apps/stories/src/types';
import { Toast } from './Toast';

export const ToastStory: ComponentStoryMeta = {
  id: 'toast',
  name: 'Toast',
  category: 'General',
  description: 'Toast component description and usage guidelines.',
  component: Toast,
  defaultProps: {},
  controls: {},
  a11y: {
    role: 'region',
    focusIndicatorNote: 'Maintains 2px visible focus ring on :focus-visible',
    keyboardShortcuts: [],
  },
};
