// 显式导入新通用候选。冻结的原 330 枚不可改动；hash 仅记录完整性，不代表用户设计批准。
import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('../', import.meta.url));
const source = process.argv[2] && path.resolve(process.argv[2]);
const read = async file => JSON.parse(await readFile(file, 'utf8'));
const put = (file, data) => writeFile(file, JSON.stringify(data, null, 2) + '\n');
const sha = data => createHash('sha256').update(data).digest('hex');
const base = await read(path.join(root, 'tests/fixtures/approved-v1.3.0-preview.2-icons.json'));
const frozen = await read(path.join(root, 'tests/fixtures/approved-v1.3.0-preview.2-golden.json'));
const oldManifest = await read(path.join(root, 'tests/fixtures/approved-v1.3.0-preview.2-manifest.json'));
const sourceManifest = await read(source ? path.join(source, 'manifest.json') : path.join(root, 'data/generic-extension-manifest.json'));
const sourceCanonical = await read(source ? path.join(source, 'icons.json') : path.join(root, 'data/generic-extension-icons.json'));
assert.equal(sourceManifest.count, 224, '必须等待完整 224 枚新增资产冻结');
assert.equal(sourceManifest.icons.length, 224);
assert.equal(new Set(sourceManifest.icons.map(i => i.name)).size, 224);
const candidateHashes = {};
const canonical = { ...base, version: '1.4.0-preview.1', icons: { ...base.icons } };
const icons = [...oldManifest.icons];
for (const icon of sourceManifest.icons) {
  assert.ok(!(icon.name in base.icons), `${icon.name}: 不得覆盖原 330 枚`);
  const svgPath = path.join(source || root, 'svg', icon.name + '.svg');
  const svg = await readFile(svgPath);
  const body = svg.toString().match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/)?.[1];
  assert.equal(body, sourceCanonical.icons[icon.name]);
  canonical.icons[icon.name] = body;
  candidateHashes[icon.name] = sha(svg);
  const component = icon.name.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join('') + 'Icon';
  icons.push({ ...icon, component, sha256: sha(svg), approvalStatus: 'candidate-user-requested-scope' });
  if (source) await copyFile(svgPath, path.join(root, 'svg', icon.name + '.svg'));
}
for (const [name, expected] of Object.entries(frozen.svgSha256)) assert.equal(sha(await readFile(path.join(root, 'svg', name + '.svg'))), expected, `${name}: 原批准 SVG 被改动`);
const categories = [...oldManifest.categories, ...sourceManifest.categories.filter(c => !oldManifest.categories.some(x => x.id === c.id))].map(c => ({ ...c, count: icons.filter(i => i.category === c.id).length })).filter(c => c.count);
const manifest = { ...oldManifest, version: canonical.version, count: icons.length, categories, icons, reuseAliases: sourceManifest.reuseAliases || [], referenceSources: sourceManifest.referenceSources || [], provenance: { ...oldManifest.provenance,
  genericExtension: { approvalStatus: 'candidate-user-requested-scope', count: 224, scope: '用户认为通用 200 枚太少，要求覆盖主流图标库常见高频 UI 语义；自行绘制新图形，不复制第三方路径。新 224 枚尚未取得最终逐版设计确认。', frozenBaseline: 'approved-v1.3.0-preview.2: 330 unchanged icons including original beneficiary person-plus-heart', coverage: 'GENERIC-COVERAGE.md', integrationRequest: { messageId: 'sentinel_56c8be031ab48191a0684b0ae3d21095', userQuote: '你把图标全部放到刚刚的rslib项目里面给我的', scope: '全部 554 枚统一进入同一 Rslib 项目、同一 React 包与 API；不拆分为多个库。此集成请求不代表新增设计已最终确认。' } } } };
const representativeIcons = ['file-spreadsheet', 'chart-pie', 'git-pull-request'].filter(name => name in candidateHashes);
assert.equal(representativeIcons.length, 3, '代表图标必须存在');
const nextRepresentativeIcons = representativeIcons.filter(name => [...canonical.icons[name].matchAll(/\bd="([^"]+)"/g)].some(m => m[1].length > 30 && Object.values(canonical.icons).filter(body => body.includes(`d="${m[1]}"`)).length === 1));
await put(path.join(root, 'data/icons.json'), canonical);
await put(path.join(root, 'data/manifest.json'), manifest);
await put(path.join(root, 'data/generic-extension-manifest.json'), sourceManifest);
await put(path.join(root, 'data/generic-extension-icons.json'), sourceCanonical);
await put(path.join(root, 'tests/fixtures/generic-candidates.json'), { version: canonical.version, approvalStatus: 'candidate-user-requested-scope', provenance: manifest.provenance.genericExtension, iconCount: 224, representativeIcons, nextRepresentativeIcons, svgSha256: candidateHashes });
await put(path.join(root, 'tests/fixtures/geometry-golden.json'), { version: canonical.version, iconCount: icons.length, provenance: '合并完整性快照；原 330 独立批准基线保持不变。新 224 枚属于用户请求范围内的待确认候选，hash 不表示设计批准。', canonicalSha256: sha(await readFile(path.join(root, 'data/icons.json'))), svgSha256: { ...frozen.svgSha256, ...candidateHashes } });
console.log(`已导入 ${sourceManifest.count} 枚通用候选；原 ${frozen.iconCount} 枚批准资产字节不变。`);
