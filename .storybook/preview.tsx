import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-mono/400.css';
import type { Preview } from '@storybook/react';

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: '亮色/暗色模式',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, context) => (
      <div
        data-tao-theme={context.globals.theme}
        style={{
          background: 'var(--tao-color-bg-base)',
          color: 'var(--tao-color-text)',
          minHeight: '100vh',
          fontFamily: 'var(--tao-font-family)',
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
