import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';

const root = new URL('../', import.meta.url);
const read = file => readFile(new URL(file, root), 'utf8');
const golden = JSON.parse(await read('tests/fixtures/geometry-golden.json'));
const canonicalText = await read('data/icons.json');
const canonical = JSON.parse(canonicalText);
const manifest = JSON.parse(await read('data/manifest.json'));
const sha256 = value => createHash('sha256').update(value).digest('hex');
const primitives = {
  path: ['d', 'fill', 'stroke'],
  circle: ['cx', 'cy', 'r', 'fill', 'stroke'],
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry', 'fill', 'stroke'],
  ellipse: ['cx', 'cy', 'rx', 'ry', 'fill', 'stroke'],
};

test('current canonical and all SVG byte hashes match provenance-separated goldens', async () => {
  assert.equal(canonical.version, golden.version);
  assert.equal(sha256(canonicalText), golden.canonicalSha256, 'Recorded canonical data changed. Review the geometry diff; never refresh the golden merely to make CI pass. See HARNESS.md.');
  assert.equal(Object.keys(canonical.icons).length, golden.iconCount);
  assert.equal(manifest.count, golden.iconCount);
  assert.equal(new Set(manifest.icons.map(i => i.name)).size, golden.iconCount);
  assert.equal(new Set(manifest.icons.map(i => i.component)).size, golden.iconCount);
  assert.deepEqual(new Set(manifest.icons.map(i => i.name)), new Set(Object.keys(canonical.icons)));
  assert.deepEqual(new Set((await readdir(new URL('svg/', root))).map(x => x.replace(/\.svg$/, ''))), new Set(Object.keys(canonical.icons)));
  for (const { name, component, sha256: expected } of manifest.icons) {
    const svg = await read(`svg/${name}.svg`);
    assert.equal(sha256(svg), golden.svgSha256[name], `${name}: recorded SVG bytes changed`);
    assert.equal(sha256(svg), expected, `${name}: manifest SHA-256 disagrees with asset`);
    assert.equal(component, name.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join('') + 'Icon');
    assert.equal(svg.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/)?.[1], canonical.icons[name], `${name}: canonical geometry and SVG differ`);
  }
});

test('SVG schema stays self-contained, safe, 24px/1.8px rounded stroke', async () => {
  for (const { name } of manifest.icons) {
    const parsed = new JSDOM(await read(`svg/${name}.svg`), { contentType: 'image/svg+xml' });
    const element = parsed.window.document.documentElement;
    assert.equal(element.tagName, 'svg', name);
    assert.equal(element.namespaceURI, 'http://www.w3.org/2000/svg', name);
    for (const [key, value] of Object.entries({ width: '24', height: '24', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.8', fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })) assert.equal(element.getAttribute(key), value, `${name}: ${key}`);
    for (const child of element.children) {
      assert.ok(primitives[child.tagName], `${name}: unsupported SVG primitive ${child.tagName}`);
      assert.equal(child.children.length, 0, `${name}: nested content is not approved`);
      for (const attribute of child.attributes) {
        assert.ok(primitives[child.tagName].includes(attribute.name), `${name}: unapproved attribute ${attribute.name}`);
        assert.ok(!/url\(|https?:|javascript:/i.test(attribute.value), `${name}: external or scripted attribute`);
        if (attribute.name === 'd') assert.match(attribute.value, /^[MmLlHhVvCcSsQqTtAaZz\d\s.,+eE-]+$/);
        else if (['fill', 'stroke'].includes(attribute.name)) assert.ok(['none', 'currentColor'].includes(attribute.value));
        else assert.ok(Number.isFinite(Number(attribute.value)), `${name}: ${attribute.name} must be numeric`);
      }
    }
    parsed.window.close();
  }
});


test('original 200 approved entries and SVG bytes remain frozen independently of candidate goldens', async () => {
  const approvedText = await read('tests/fixtures/approved-v1.2.0-icons.json');
  const approved = JSON.parse(approvedText);
  const baseline = JSON.parse(await read('tests/fixtures/approved-v1.2.0-golden.json'));
  assert.equal(baseline.iconCount, 200);
  assert.equal(sha256(approvedText), baseline.canonicalSha256);
  assert.equal(Object.keys(approved.icons).length, 200);
  for (const [name, geometry] of Object.entries(approved.icons)) {
    assert.equal(canonical.icons[name], geometry, `${name}: original canonical geometry changed`);
    assert.equal(sha256(await read(`svg/${name}.svg`)), baseline.svgSha256[name], `${name}: original SVG bytes changed`);
  }
  const candidates = JSON.parse(await read('tests/fixtures/insurance-candidates.json'));
  assert.equal(candidates.approvalStatus, 'approved-user-revision');
  assert.equal(manifest.provenance.finalApproval.messageId, 'sentinel_fab5418a302481919a430455020bb31f');
  assert.equal(candidates.iconCount, 130);
  assert.deepEqual(new Set(Object.keys(candidates.svgSha256)), new Set(Object.keys(JSON.parse(await read('tests/fixtures/approved-v1.3.0-preview.2-icons.json')).icons).filter(name => !(name in approved.icons))));
  for (const [name, expected] of Object.entries(candidates.svgSha256)) {
    assert.equal(sha256(await read(`svg/${name}.svg`)), expected);
    assert.equal(manifest.icons.find(icon => icon.name === name).approvalStatus, 'approved-user-revision');
  }
});


test('insurance simplification preserves all preview.1 icon names and public component names', async () => {
  const previous = JSON.parse(await read('tests/fixtures/insurance-preview.1-candidates.json'));
  const revised = JSON.parse(await read('tests/fixtures/insurance-candidates.json'));
  assert.equal(previous.iconCount, 130);
  assert.equal(revised.iconCount, 130);
  assert.deepEqual(new Set(Object.keys(revised.svgSha256)), new Set(Object.keys(previous.svgSha256)));
  assert.equal(manifest.provenance.latestRevision.approvalStatus, 'approved-user-revision');
  for (const name of Object.keys(previous.svgSha256)) {
    assert.equal(manifest.icons.find(icon => icon.name === name).component, name.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join('') + 'Icon');
  }
});


test('原批准 330 枚几何、SVG 字节、名称与元数据独立冻结；新通用候选分开记录', async () => {
  const approvedText = await read('tests/fixtures/approved-v1.3.0-preview.2-icons.json');
  const approved = JSON.parse(approvedText);
  const baseline = JSON.parse(await read('tests/fixtures/approved-v1.3.0-preview.2-golden.json'));
  const previousManifest = JSON.parse(await read('tests/fixtures/approved-v1.3.0-preview.2-manifest.json'));
  assert.equal(baseline.iconCount, 330);
  assert.equal(sha256(approvedText), baseline.canonicalSha256);
  for (const entry of previousManifest.icons) {
    assert.deepEqual(manifest.icons.find(i => i.name === entry.name), entry, entry.name + ': 原公开元数据不可变');
    assert.equal(canonical.icons[entry.name], approved.icons[entry.name]);
    assert.equal(sha256(await read(`svg/${entry.name}.svg`)), baseline.svgSha256[entry.name]);
  }
  const generic = JSON.parse(await read('tests/fixtures/generic-candidates.json'));
  assert.equal(generic.iconCount, 224);
  assert.equal(manifest.count, 554);
  assert.equal(generic.approvalStatus, 'candidate-user-requested-scope');
  assert.equal(manifest.reuseAliases.car, 'insurance-auto');
  assert.equal(manifest.reuseAliases['volume-high'], 'volume');
  for (const target of Object.values(manifest.reuseAliases)) assert.ok(target in canonical.icons, '别名必须指向已有图标: ' + target);
  assert.deepEqual(new Set(Object.keys(generic.svgSha256)), new Set(Object.keys(canonical.icons).filter(n => !(n in approved.icons))));
  for (const [name, expected] of Object.entries(generic.svgSha256)) {
    assert.equal(sha256(await read(`svg/${name}.svg`)), expected);
    assert.equal(manifest.icons.find(i => i.name === name).approvalStatus, 'candidate-user-requested-scope');
  }
});
