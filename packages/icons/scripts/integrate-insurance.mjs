// Explicit integration utility. Run only after candidate artwork is finalized; never changes approved fixtures.
import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.resolve(process.argv[2] || '../insurance-icons');
const read = async file => JSON.parse(await readFile(file, 'utf8'));
const put = (file, data) => writeFile(file, JSON.stringify(data, null, 2) + '\n');
const sha = data => createHash('sha256').update(data).digest('hex');
const base = await read(path.join(root, 'tests/fixtures/approved-v1.2.0-icons.json'));
const frozen = await read(path.join(root, 'tests/fixtures/approved-v1.2.0-golden.json'));
const oldManifest = await read(path.join(root, 'data/manifest.json'));
const sourceManifest = await read(path.join(source, 'manifest.json'));
const sourceCanonical = await read(path.join(source, 'icons.json'));
const additions = sourceManifest.icons.filter(icon => !(icon.name in base.icons));
assert.ok(additions.length >= 100 && additions.length <= 150, 'Expected 100–150 candidate insurance icons');
const candidateHashes = {};
const canonical = { ...base, version: '1.3.0-preview.2', icons: { ...base.icons } };
const icons = oldManifest.icons.filter(icon => icon.name in base.icons);
for (const icon of additions) {
  const svg = await readFile(path.join(source, 'svg', icon.name + '.svg'));
  const body = svg.toString().match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/)?.[1];
  assert.equal(body, sourceCanonical.icons[icon.name]);
  canonical.icons[icon.name] = body;
  candidateHashes[icon.name] = sha(svg);
  const component = icon.name.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join('') + 'Icon';
  icons.push({ ...icon, component, sha256: sha(svg), approvalStatus: 'approved-user-revision' });
  await copyFile(path.join(source, 'svg', icon.name + '.svg'), path.join(root, 'svg', icon.name + '.svg'));
}
const categories = [...oldManifest.categories.filter(category => !sourceManifest.categories.some(item => item.id === category.id)), ...sourceManifest.categories].map(category => ({ ...category, count: icons.filter(icon => icon.category === category.id).length })).filter(category => category.count);
const manifest = { ...oldManifest, version: canonical.version, count: icons.length, categories, icons,
  provenance: { approvedBaseline: 'v1.2.0: 200 original icons; immutable independent fixtures', extension: 'User-requested insurance extension; preview.2 geometry confirmed by user, with original beneficiary retained', candidateCount: additions.length, finalApproval: { messageId: 'sentinel_fab5418a302481919a430455020bb31f', userQuote: '受益人，这个可以保留。其他的不错', scope: 'Restore the original beneficiary person-plus-heart; retain other simplified icons. 128 changed and 2 retained relative to preview.1.' }, latestRevision: { request: 'Simplify all 130 insurance candidates to align with the original 200-icon visual language', messageId: 'sentinel_b304e700a16c8191ad9b30dd55f5cb93', approvalStatus: 'approved-user-revision', previousCandidateBaseline: 'tests/fixtures/insurance-preview.1-candidates.json' }, styleApproval: { status: 'approved-first-16-study-style', userQuote: 'OK，风格不错，继续做整套。', messageId: 'sentinel_b1505c8ea0f0819183149cf908a1220c', scope: 'Historical initial-study approval; superseded by the explicit preview.2 confirmation below' } } };
await put(path.join(root, 'data/icons.json'), canonical);
await put(path.join(root, 'data/manifest.json'), manifest);
const representativeIcons = process.argv.slice(3);
assert.ok(representativeIcons.length >= 3, 'Supply at least three representative candidate IDs');
for (const name of representativeIcons) assert.ok(name in candidateHashes);
await put(path.join(root, 'tests/fixtures/insurance-candidates.json'), { version: canonical.version, approvalStatus: 'approved-user-revision', provenance: 'Final user confirmation sentinel_fab5418a302481919a430455020bb31f approves this revision with beneficiary restored to the original person-plus-heart. Latest user request sentinel_b304e700a16c8191ad9b30dd55f5cb93 explicitly authorizes global simplification of the 130 insurance candidates. Prior candidate baseline retained as insurance-preview.1-candidates.json; the subsequent final confirmation applies to preview.2 only. User originally requested insurance extension and approved the first 16-study style/continuation (sentinel_b1505c8ea0f0819183149cf908a1220c); final preview.2 glyphs are confirmed with the beneficiary exception. Frozen original 200 maintained separately. These hashes record generated candidate assets, and the explicit final user decision is recorded separately.', iconCount: additions.length, representativeIcons, nextRepresentativeIcons: ['coverage', 'policy-issue'], svgSha256: candidateHashes });
await put(path.join(root, 'tests/fixtures/geometry-golden.json'), { version: canonical.version, iconCount: icons.length, provenance: 'Combined build-integrity snapshot; approved-v1.2.0-golden.json remains the independent approval baseline. Insurance preview.2 revision confirmed in sentinel_fab5418a302481919a430455020bb31f with beneficiary retained.', canonicalSha256: sha(await readFile(path.join(root, 'data/icons.json'))), svgSha256: { ...frozen.svgSha256, ...candidateHashes } });
const budgets = await read(path.join(root, 'tests/fixtures/budgets.json'));
// Whole-package budgets scale only for the explicitly requested new independently importable assets.
await put(path.join(root, 'tests/fixtures/budgets.json'), { ...budgets, iconCount: icons.length, maxPackedBytes: 200000, maxUnpackedBytes: 850000, insuranceMinifiedBytes: 1600, insuranceGzipBytes: 850, rationale: '200 -> '+icons.length+' independent modules/SVGs. Original Search 1200/700 byte limits unchanged; insurance 1600/850 limits allow multi-part workflow geometry, still exactly one module in output.' });
console.log(`Integrated ${additions.length} user-confirmed revision icons; preserved ${Object.keys(base.icons).length} approved icons.`);
