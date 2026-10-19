import { defineConfig } from '@rslib/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  source: { entry: { index: ['src/**'] } },
  lib: [{ format: 'esm', bundle: false, outBase: 'src', dts: true, output: { distPath: { root: 'dist' } } }],
  output: { target: 'web', externals: [/^react(?:\/.*)?$/] },
  plugins: [pluginReact()],
});
