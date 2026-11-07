import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
assert.ok(process.argv[2], 'Usage: node scripts/integrate-v13.mjs <asset directory>');
const source = resolve(process.argv[2]);
const json = async path => JSON.parse(await readFile(path, 'utf8'));
const serialize = value => JSON.stringify(value, null, 2) + '\n';
const write = (path, value) => writeFile(join(root, path), serialize(value));
const sha256 = value => createHash('sha256').update(value).digest('hex');
const input = await json(join(source, 'manifest.json'));
const migration = await json(join(source, 'migration.json'));
const previous = await json(join(root, 'tests/fixtures/v0.0.1-manifest.json'));

assert.equal(input.artifactVersion, 'svg-v13-complete');
assert.equal(input.icons.length, 2165);
assert.equal(input.count, input.icons.length);
assert.equal(input.viewBox, '0 0 24 24');
assert.equal(input.defaultStrokeWidth, 1.8);
const names = new Set(input.icons.map(icon => icon.name));
assert.equal(names.size, input.count);
assert.deepEqual(new Set(await readdir(join(source, 'svg'))), new Set([...names].map(name => name + '.svg')));
assert.deepEqual(new Set(Object.keys(migration.oldToNew)), new Set(previous.icons.map(icon => icon.name)));
for (const [name, target] of Object.entries(migration.oldToNew)) {
  assert.ok(names.has(name) && names.has(target), `Missing migration entry: ${name} → ${target}`);
}

const geometry = {};
const components = new Set();
const labels = new Map(previous.categories.map(category => [category.id, category]));
labels.set('lucide-full-coverage', { id: 'lucide-full-coverage', label: 'Extended catalog', labelZh: '扩展图标' });
const counts = new Map();
const icons = [];
const svgFiles = new Map();
for (const icon of input.icons) {
  assert.match(icon.name, /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/);
  assert.equal(icon.svg, `svg/${icon.name}.svg`);
  assert.ok(labels.has(icon.category), `Unknown category: ${icon.category}`);
  const svg = await readFile(join(source, icon.svg), 'utf8');
  assert.equal(sha256(svg), icon.sha256, icon.name);
  const body = svg.match(/^<svg\b[^>]*>([\s\S]*)<\/svg>\s*$/)?.[1];
  assert.ok(body, `Missing SVG geometry: ${icon.name}`);
  geometry[icon.name] = body;
  const component = icon.name.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join('') + 'Icon';
  assert.ok(!components.has(component), `Duplicate export: ${component}`);
  components.add(component);
  counts.set(icon.category, (counts.get(icon.category) ?? 0) + 1);
  icons.push({ ...icon, component, symbol: `rounded-${icon.name}` });
  svgFiles.set(icon.svg, svg);
}

const canonical = { version: input.artifactVersion, viewBox: input.viewBox, strokeWidth: input.defaultStrokeWidth, icons: geometry };
await Promise.all([...svgFiles].map(([path, svg]) => writeFile(join(root, path), svg)));
await Promise.all([
  write('data/icons.json', canonical),
  write('data/manifest.json', {
    name: input.name,
    version: canonical.version,
    count: input.count,
    viewBox: canonical.viewBox,
    strokeWidth: canonical.strokeWidth,
    categories: [...labels.values()].filter(category => counts.has(category.id)).map(category => ({ ...category, count: counts.get(category.id) })),
    icons,
    provenance: {
      artifactVersion: input.artifactVersion,
      artworkThrough: input.artworkThrough,
      canonicalCatalog: input.canonicalCatalog,
      canonicalCount: input.canonicalCount,
      extraCount: input.extraCount,
    },
  }),
  write('data/migration.json', migration),
  write('tests/fixtures/geometry-v13.json', {
    version: canonical.version,
    iconCount: input.count,
    canonicalSha256: sha256(serialize(canonical)),
    svgSha256: Object.fromEntries(input.icons.map(icon => [icon.name, icon.sha256])),
  }),
]);
console.log(`Imported ${input.count} V13 SVGs and verified every source hash.`);
