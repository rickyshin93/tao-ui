import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';

const root = new URL('../', import.meta.url);
const read = file => readFile(new URL(file, root), 'utf8');
const v13 = JSON.parse(await read('tests/fixtures/geometry-v13.json'));
const currentGolden = JSON.parse(await read('tests/fixtures/geometry-current.json'));
const refinement = JSON.parse(await read('tests/fixtures/geometry-refinement.1.json'));
assert.equal(refinement.baseVersion, v13.version);
const golden = {
  ...v13,
  ...refinement,
  svgSha256: { ...v13.svgSha256, ...refinement.svgSha256 },
};
const legacyText = await read('tests/fixtures/v0.0.1-icons.json');
const legacy = JSON.parse(legacyText);
const legacyManifest = JSON.parse(await read('tests/fixtures/v0.0.1-manifest.json'));
const legacyGolden = JSON.parse(await read('tests/fixtures/geometry-golden.json'));
const migration = JSON.parse(await read('data/migration.json'));
const svgOpen = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">';
const legacySvg = name => svgOpen + legacy.icons[name] + '</svg>\n';
const canonicalText = await read('data/icons.json');
const canonical = JSON.parse(canonicalText);
const manifest = JSON.parse(await read('data/manifest.json'));
const sha256 = value => createHash('sha256').update(value).digest('hex');
const primitives = {
  path: ['d', 'fill', 'stroke', 'stroke-dasharray', 'stroke-width', 'fill-rule'],
  circle: ['cx', 'cy', 'r', 'fill', 'stroke', 'stroke-dasharray'],
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry', 'fill', 'stroke', 'stroke-dasharray'],
  ellipse: ['cx', 'cy', 'rx', 'ry', 'fill', 'stroke', 'stroke-dasharray'],
};

test('current canonical and all SVG byte hashes match provenance-separated goldens', async () => {
  assert.equal(canonical.version, golden.version);
  assert.equal(sha256(canonicalText), currentGolden.canonicalSha256, 'Recorded canonical data changed. Review the geometry diff; never refresh the golden merely to make CI pass. See HARNESS.md.');
  assert.equal(Object.keys(canonical.icons).length, currentGolden.iconCount);
  assert.equal(manifest.count, currentGolden.iconCount);
  assert.equal(new Set(manifest.icons.map(i => i.name)).size, currentGolden.iconCount);
  assert.equal(new Set(manifest.icons.map(i => i.component)).size, currentGolden.iconCount);
  assert.deepEqual(new Set(manifest.icons.map(i => i.name)), new Set(Object.keys(canonical.icons)));
  assert.deepEqual(new Set(Object.keys(canonical.icons)), new Set(Object.keys(v13.svgSha256).filter(name => !currentGolden.removedLegacyNames.includes(name))));
  assert.deepEqual(new Set((await readdir(new URL('svg/', root))).map(x => x.replace(/\.svg$/, ''))), new Set(Object.keys(canonical.icons)));
  for (const [name, hash] of Object.entries(refinement.svgSha256)) {
    assert.ok(v13.svgSha256[name], name);
    assert.notEqual(hash, v13.svgSha256[name], name);
  }
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
      assert.equal(child.hasAttribute('stroke-width'), false, name + ': strokes must inherit the icon width');
      for (const attribute of child.attributes) {
        assert.ok(primitives[child.tagName].includes(attribute.name), `${name}: unapproved attribute ${attribute.name}`);
        assert.ok(!/url\(|https?:|javascript:/i.test(attribute.value), `${name}: external or scripted attribute`);
        if (attribute.name === 'd') assert.match(attribute.value, /^[MmLlHhVvCcSsQqTtAaZz\d\s.,+eE-]+$/);
        else if (['fill', 'stroke'].includes(attribute.name)) assert.ok(['none', 'currentColor'].includes(attribute.value));
        else if (attribute.name === 'fill-rule') assert.ok(['evenodd', 'nonzero'].includes(attribute.value));
        else if (attribute.name === 'stroke-dasharray') assert.match(attribute.value, /^\d+(?:\.\d+)?(?:[ ,]+\d+(?:\.\d+)?)*$/);
        else assert.ok(Number.isFinite(Number(attribute.value)), `${name}: ${attribute.name} must be numeric`);
      }
    }
    parsed.window.close();
  }
});


test('catalog aliases share geometry with a canonical entry and keep their public names', () => {
  const normalize = body => body.replace(/\s+(?=\/>)/g, '').replace(/\s+/g, ' ');
  const aliases = manifest.catalogAliases;
  assert.equal(aliases.alarm, 'alarm-clock');
  assert.equal(aliases['alarm-off'], 'alarm-clock-off');
  for (const [alias, target] of Object.entries(aliases)) {
    assert.ok(canonical.icons[alias] && canonical.icons[target], alias);
    assert.ok(!Object.hasOwn(aliases, target), target + ': aliases must resolve directly');
    assert.equal(normalize(canonical.icons[alias]), normalize(canonical.icons[target]), alias);
  }
  const visibleGeometry = new Map();
  for (const [name, body] of Object.entries(canonical.icons)) {
    if (Object.hasOwn(aliases, name)) continue;
    const geometry = normalize(body);
    assert.ok(!visibleGeometry.has(geometry), `${name} duplicates ${visibleGeometry.get(geometry)} in the catalog`);
    visibleGeometry.set(geometry, name);
  }
  for (const [a, b] of [['car-front', 'insurance-auto'], ['cross', 'insurance-health'], ['filter', 'funnel'], ['video', 'video-call']]) {
    assert.notEqual(normalize(canonical.icons[a]), normalize(canonical.icons[b]), a + ' / ' + b);
  }
});

test('historical migration baseline is frozen and compatibility icons are excluded', () => {
  assert.equal(sha256(legacyText), legacyGolden.canonicalSha256);
  assert.equal(legacyManifest.icons.length, legacyGolden.iconCount);
  assert.deepEqual(new Set(Object.keys(migration.oldToNew)), new Set(legacyManifest.icons.map(icon => icon.name)));
  for (const entry of legacyManifest.icons) {
    assert.equal(sha256(legacySvg(entry.name)), legacyGolden.svgSha256[entry.name]);
  }
  assert.deepEqual(new Set(currentGolden.removedLegacyNames), new Set(Object.values(migration.renamed)));
  assert.equal(currentGolden.removedLegacyNames.length, 39);
  for (const name of currentGolden.removedLegacyNames) assert.ok(!Object.hasOwn(canonical.icons, name), name);
});

test('original 200 approved entries and SVG bytes remain frozen independently of candidate goldens', async () => {
  const approvedText = await read('tests/fixtures/approved-v1.2.0-icons.json');
  const approved = JSON.parse(approvedText);
  const baseline = JSON.parse(await read('tests/fixtures/approved-v1.2.0-golden.json'));
  assert.equal(baseline.iconCount, 200);
  assert.equal(sha256(approvedText), baseline.canonicalSha256);
  assert.equal(Object.keys(approved.icons).length, 200);
  for (const [name, geometry] of Object.entries(approved.icons)) {
    assert.equal(legacy.icons[name], geometry, `${name}: original canonical geometry changed`);
    assert.equal(sha256(legacySvg(name)), baseline.svgSha256[name], `${name}: original SVG bytes changed`);
  }
  const candidates = JSON.parse(await read('tests/fixtures/insurance-candidates.json'));
  assert.equal(candidates.approvalStatus, 'approved-user-revision');
  assert.equal(legacyManifest.provenance.finalApproval.messageId, 'sentinel_fab5418a302481919a430455020bb31f');
  assert.equal(candidates.iconCount, 130);
  assert.deepEqual(new Set(Object.keys(candidates.svgSha256)), new Set(Object.keys(JSON.parse(await read('tests/fixtures/approved-v1.3.0-preview.2-icons.json')).icons).filter(name => !(name in approved.icons))));
  for (const [name, expected] of Object.entries(candidates.svgSha256)) {
    assert.equal(sha256(legacySvg(name)), expected);
    assert.equal(legacyManifest.icons.find(icon => icon.name === name).approvalStatus, 'approved-user-revision');
  }
});


test('insurance simplification preserves all preview.1 icon names and public component names', async () => {
  const previous = JSON.parse(await read('tests/fixtures/insurance-preview.1-candidates.json'));
  const revised = JSON.parse(await read('tests/fixtures/insurance-candidates.json'));
  assert.equal(previous.iconCount, 130);
  assert.equal(revised.iconCount, 130);
  assert.deepEqual(new Set(Object.keys(revised.svgSha256)), new Set(Object.keys(previous.svgSha256)));
  assert.equal(legacyManifest.provenance.latestRevision.approvalStatus, 'approved-user-revision');
  for (const name of Object.keys(previous.svgSha256)) {
    assert.equal(legacyManifest.icons.find(icon => icon.name === name).component, name.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join('') + 'Icon');
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
    assert.deepEqual(legacyManifest.icons.find(i => i.name === entry.name), entry, entry.name + ': 原公开元数据不可变');
    assert.equal(legacy.icons[entry.name], approved.icons[entry.name]);
    assert.equal(sha256(legacySvg(entry.name)), baseline.svgSha256[entry.name]);
  }
  const generic = JSON.parse(await read('tests/fixtures/generic-candidates.json'));
  assert.equal(generic.iconCount, 224);
  assert.equal(legacyManifest.count, 554);
  assert.equal(generic.approvalStatus, 'candidate-user-requested-scope');
  assert.equal(legacyManifest.reuseAliases.car, 'insurance-auto');
  assert.equal(legacyManifest.reuseAliases['volume-high'], 'volume');
  for (const target of Object.values(legacyManifest.reuseAliases)) assert.ok(target in legacy.icons, '别名必须指向已有图标: ' + target);
  assert.deepEqual(new Set(Object.keys(generic.svgSha256)), new Set(Object.keys(legacy.icons).filter(n => !(n in approved.icons))));
  for (const [name, expected] of Object.entries(generic.svgSha256)) {
    assert.equal(sha256(legacySvg(name)), expected);
    assert.equal(legacyManifest.icons.find(i => i.name === name).approvalStatus, 'candidate-user-requested-scope');
  }
});
