import type { ComponentDoc } from '../component-doc';

export const timePickerDoc = {
  name: 'time-picker',
  displayName: 'TimePicker',
  category: 'Data Entry',
  description:
    'Select or type a time, or a time range, with Day.js values and configurable precision.',
  exports: ['TimePicker', 'TimeRangePicker'],
  source: 'src/components/time-picker/time-picker.tsx',
  story: 'stories/time-picker.stories.tsx',
  tests: ['tests/time-picker/time-picker.test.tsx'],
  semanticParts: ['root', 'prefix', 'input', 'suffix', 'popup'],
  keywords: ['time', 'hours', 'minutes', 'range', 'dayjs'],
  related: ['DatePicker', 'RangePicker'],
  usage: {
    description:
      'Use TimePicker when a form needs a time without a calendar date; use TimePicker.RangePicker for start and end times.',
    bestPractices: [
      'Use format and step intervals that match the task.',
      'Express unavailable times with disabledTime.',
      'Keep controlled values synchronized in onChange.',
    ],
    avoid: ['Do not treat a timezone-free time as a complete timestamp.'],
  },
} satisfies ComponentDoc;
