import type { ComponentDoc } from '../component-doc';
export const calendarDoc = {
  name: 'calendar',
  displayName: 'Calendar',
  category: 'Data Display',
  description: 'Browse a month or year and place events inside date cells.',
  exports: ['Calendar'],
  source: 'src/components/calendar/calendar.tsx',
  story: 'stories/calendar.stories.tsx',
  tests: ['tests/calendar/calendar.test.tsx'],
  semanticParts: ['root', 'header', 'body', 'content', 'item', 'itemContent'],
  keywords: ['calendar', 'date', 'events', 'month', 'year'],
  related: ['DatePicker', 'TimePicker'],
  usage: {
    description:
      'Use Calendar to browse schedules and select a day without opening a popup.',
    bestPractices: [
      'Use validRange to bound the available dates.',
      'Use cellRender for date-specific events.',
      'Use fullscreen=false for compact embedded calendars.',
    ],
    avoid: ['Do not mutate the Day.js values passed to callbacks.'],
  },
} satisfies ComponentDoc;
