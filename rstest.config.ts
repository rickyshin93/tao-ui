import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  extends: withRslibConfig(),
  exclude: { patterns: ['tests/public-types.test.tsx'] },
  setupFiles: ['./rstest.setup.ts'],
});
