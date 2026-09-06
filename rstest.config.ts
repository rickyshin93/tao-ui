import { fileURLToPath } from 'node:url';
import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

const shared = {
  extends: withRslibConfig(),
  exclude: { patterns: ['tests/public-types.test.tsx'] },
  setupFiles: ['./rstest.setup.ts'],
};

export default defineConfig({
  projects: [
    {
      ...shared,
      name: 'react18',
      env: { TAO_REACT_MAJOR: '18' },
      resolve: {
        alias: {
          react: fileURLToPath(
            new URL('./node_modules/react18', import.meta.url),
          ),
          'react-dom': fileURLToPath(
            new URL('./node_modules/react-dom18', import.meta.url),
          ),
        },
      },
    },
    { ...shared, name: 'react19', env: { TAO_REACT_MAJOR: '19' } },
  ],
});
