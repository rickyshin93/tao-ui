import type { ComponentDoc } from '../component-doc';

export const datePickerDoc = {
  name: 'date-picker',
  displayName: 'DatePicker',
  category: 'Data Entry',
  description:
    'Lets users enter or choose a single date, with optional time selection.',
  exports: ['DatePicker'],
  source: 'src/components/date-picker/date-picker.tsx',
  story: 'stories/date-picker.stories.tsx',
  tests: [
    'tests/date-picker/date-picker.test.tsx',
    'tests/date-picker/use-calendar.test.ts',
  ],
  semanticParts: ['root', 'input', 'popup', 'calendar', 'cell', 'footer'],
  keywords: ['date', 'calendar', 'time'],
  related: ['RangePicker', 'Input'],
  usage: {
    description:
      'Use DatePicker when free text date input would be error-prone or when users benefit from calendar context.',
    bestPractices: [
      'Support keyboard entry for known dates.',
      'Use presets for common relative choices when helpful.',
    ],
    avoid: [
      'Do not force calendar navigation for dates far in the past without typed input.',
    ],
  },
} satisfies ComponentDoc;
