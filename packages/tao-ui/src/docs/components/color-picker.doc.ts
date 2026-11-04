import type { ComponentDoc } from '../component-doc';
export const colorPickerDoc = {
  name: 'color-picker',
  displayName: 'ColorPicker',
  category: 'Data Entry',
  description:
    'Choose single or gradient colors with hex, RGB, HSB and alpha controls.',
  exports: ['ColorPicker'],
  source: 'src/components/color-picker/color-picker.tsx',
  story: 'stories/color-picker.stories.tsx',
  tests: ['tests/color-picker/color-picker.test.tsx'],
  semanticParts: [
    'root',
    'body',
    'content',
    'description',
    'popup.root',
    'popup.container',
  ],
  keywords: ['color', 'palette', 'gradient', 'hex', 'rgb', 'hsb'],
  related: ['Popover', 'Input'],
  usage: {
    description:
      'Keep the returned Color object when precision matters and call toCssString for use in CSS.',
    bestPractices: [
      'Use presets for a constrained brand palette.',
      'Use disabledAlpha when transparency is not supported.',
      'Use onChangeComplete when a finished edit should be committed.',
    ],
    avoid: [
      'Do not discard the Color object during a drag if precision matters.',
    ],
  },
} satisfies ComponentDoc;
