import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

// Workspaces hoist dependencies to the repository root, so resolve the React 18
// aliases instead of assuming a package-local node_modules directory.
const require = createRequire(import.meta.url);
const resolvePackageDir = (specifier: string): string =>
  dirname(require.resolve(`${specifier}/package.json`));

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
          react: resolvePackageDir('react18'),
          'react-dom': resolvePackageDir('react-dom18'),
        },
      },
    },
    { ...shared, name: 'react19', env: { TAO_REACT_MAJOR: '19' } },
  ],
});
