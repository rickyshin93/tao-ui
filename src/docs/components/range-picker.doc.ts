import type { ComponentDoc } from '../component-doc';

export const rangePickerDoc = {
  name: 'range-picker',
  displayName: 'RangePicker',
  category: 'Data Entry',
  description: 'Lets users select a start and end date as one range value.',
  exports: ['RangePicker'],
  source: 'src/components/date-picker/range-picker.tsx',
  story: 'stories/date-picker.stories.tsx',
  tests: [
    'tests/date-picker/range-picker.test.tsx',
    'tests/date-picker/use-calendar.test.ts',
  ],
  semanticParts: ['root', 'input', 'separator', 'popup', 'calendar', 'cell'],
  keywords: ['date range', 'calendar', 'time range'],
  related: ['DatePicker'],
  usage: {
    description:
      'Use RangePicker for reporting windows, booking windows, and filters with start/end dates.',
    bestPractices: [
      'Use presets for common ranges such as today, this week, or last 30 days.',
      'Make inclusive/exclusive range behavior clear when it matters.',
    ],
  },
} satisfies ComponentDoc;
