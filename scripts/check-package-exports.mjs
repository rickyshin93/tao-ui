import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const packageJson = JSON.parse(
  readFileSync(join(root, 'package.json'), 'utf8'),
);
const buttonEntry = Bun.resolveSync(`${packageJson.name}/button`, root);
const providerEntry = Bun.resolveSync(`${packageJson.name}/provider`, root);

for (const file of readdirSync(join(root, 'src/entries'))) {
  const name = file.replace(/\.tsx?$/, '');
  const entry = Bun.resolveSync(`${packageJson.name}/${name}`, root);
  assert.ok(
    entry.startsWith(join(root, 'dist/entries/')),
    `${name}: built entry`,
  );
  assert.ok(
    readFileSync(entry, 'utf8').includes('"use client"'),
    `${name}: client boundary`,
  );
  assert.ok(
    existsSync(entry.replace(/\.js$/, '.d.ts')),
    `${name}: public types`,
  );
}

async function bundleCss(entrypoints) {
  const result = await Bun.build({
    entrypoints,
    target: 'browser',
    format: 'esm',
    minify: true,
    external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client'],
    define: { 'process.env.NODE_ENV': '"production"' },
  });
  assert.ok(result.success, result.logs.map(String).join('\n'));
  return (
    await Promise.all(
      result.outputs
        .filter((file) => file.path.endsWith('.css'))
        .map((file) => file.text()),
    )
  ).join('\n');
}

const buttonCss = await bundleCss([buttonEntry]);
const providerCss = await bundleCss([providerEntry]);
const rootCss = await bundleCss([join(root, packageJson.exports['.'].import)]);
assert.ok(
  buttonCss.includes('--tao-color-primary'),
  'Button includes theme tokens',
);
assert.ok(
  buttonCss.includes('data-tao-control'),
  'Button includes shared control styles',
);
assert.ok(buttonCss.includes('data-tao-button'), 'Button includes its styles');
assert.ok(
  !buttonCss.includes('data-tao-table'),
  'Button excludes Table styles',
);
assert.ok(
  !buttonCss.includes('data-tao-select'),
  'Button excludes Select styles',
);
assert.ok(
  providerCss.includes('--tao-color-primary'),
  'Provider includes theme tokens',
);
assert.ok(
  !providerCss.includes('data-tao-table'),
  'Provider excludes Table styles',
);
assert.ok(
  rootCss.includes('data-tao-table'),
  'Root entry retains existing styles',
);
assert.ok(
  buttonCss.length < rootCss.length / 2,
  'Component import reduces CSS',
);
console.log(
  `Package exports passed; Button CSS ${buttonCss.length} bytes, root CSS ${rootCss.length} bytes.`,
);
