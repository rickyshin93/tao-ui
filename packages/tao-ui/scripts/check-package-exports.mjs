import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const packageJson = JSON.parse(
  readFileSync(join(root, 'package.json'), 'utf8'),
);
const buttonEntry = Bun.resolveSync(`${packageJson.name}/button`, root);
const providerEntry = Bun.resolveSync(`${packageJson.name}/provider`, root);
const formEntry = Bun.resolveSync(`${packageJson.name}/form`, root);
const manifestEntry = Bun.resolveSync(
  `${packageJson.name}/component-manifest.json`,
  root,
);
assert.equal(
  JSON.parse(readFileSync(manifestEntry, 'utf8')).packageName,
  packageJson.name,
  'Public JSON metadata',
);
for (const component of JSON.parse(readFileSync(manifestEntry, 'utf8'))
  .components) {
  const entry =
    { 'tao-provider': 'provider', 'headless-input-number': 'number-input' }[
      component.name
    ] ?? component.name;
  const exports = await import(`${packageJson.name}/${entry}`);
  for (const name of component.exports)
    assert.ok(name in exports, `${entry}: documented export ${name}`);
}

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
const formCss = await bundleCss([formEntry]);
assert.match(
  formCss,
  /\[data-tao-form-error\]\{[^}]*color:var\(--tao-form-field-error-color,var\(--tao-error\)\)/,
  'Form subpath includes shared error colors',
);
assert.match(
  formCss,
  /\[data-tao-required\]\{[^}]*color:var\(--tao-form-field-label-required-mark-color,var\(--tao-error\)\)/,
  'Form subpath includes required mark colors',
);
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

const ssrBuild = await Bun.build({
  entrypoints: [join(root, 'scripts/fixtures/package-ssr.tsx')],
  target: 'node',
  format: 'esm',
  external: ['react', 'react-dom', 'react-dom/*', 'react/jsx-runtime'],
});
assert.ok(ssrBuild.success, ssrBuild.logs.map(String).join('\n'));
const ssrBundle = ssrBuild.outputs.find((file) => file.path.endsWith('.js'));
assert.ok(ssrBundle, 'Node SSR bundle exists');
const ssr = spawnSync('node', ['--input-type=module'], {
  cwd: root,
  input: await ssrBundle.text(),
  encoding: 'utf8',
});
assert.equal(ssr.status, 0, `Built package SSR failed:\n${ssr.stderr}`);
process.stdout.write(ssr.stdout);
console.log(
  `Package exports passed; Button CSS ${buttonCss.length} bytes, root CSS ${rootCss.length} bytes.`,
);
