import type { ComponentStoryMeta } from '../../../../apps/stories/src/types';
import { Accordion } from './Accordion';

export const AccordionStory: ComponentStoryMeta = {
  id: 'accordion',
  name: 'Accordion',
  category: 'General',
  description: 'Accordion component description and usage guidelines.',
  component: Accordion,
  defaultProps: {},
  controls: {},
  a11y: {
    role: 'region',
    focusIndicatorNote: 'Maintains 2px visible focus ring on :focus-visible',
    keyboardShortcuts: [],
  },
};
