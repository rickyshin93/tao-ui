import { spawnSync } from 'node:child_process';
import { mkdir, writeFile, readFile, rm, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const artifacts = path.join(root, 'artifacts');
const budgets = JSON.parse(await readFile(path.join(root, 'tests/fixtures/budgets.json'), 'utf8'));
const packageName = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).name;
await mkdir(artifacts, { recursive: true });
// The clean consumer project must live outside the monorepo tree: TypeScript
// and Next walk every ancestor node_modules, and the workspace root ships its
// own @types packages (react18/react-dom18 aliases), which would leak duplicate
// React types into these fixtures. TAO_ICONS_WORK_DIR overrides the location.
const workRoot = process.env.TAO_ICONS_WORK_DIR || path.join(tmpdir(), 'tao-icons-work');
const env = { ...process.env, npm_config_cache: process.env.npm_config_cache || path.join(workRoot, 'npm-cache'), npm_config_fund: 'false', npm_config_audit: 'false' };
function run(cmd, args, cwd = root) {
  const result = spawnSync(cmd, args, { cwd, env, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024, timeout: 300_000, killSignal: 'SIGTERM' });
  if (result.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
const packed = JSON.parse(run('npm', ['pack', '--ignore-scripts', '--pack-destination', artifacts, '--json']))[0];
const tarball = path.join(artifacts, packed.filename);
assert.equal(packed.files.filter(x => /^dist\/icons\/.*\.js$/.test(x.path)).length, budgets.iconCount);
assert.equal(packed.files.filter(x => /^dist\/icons\/.*\.d\.ts$/.test(x.path)).length, budgets.iconCount);
assert.equal(packed.files.filter(x => /^svg\/.*\.svg$/.test(x.path)).length, budgets.iconCount);
assert.ok(packed.files.every(x => !/node_modules|tests\/|scripts\/|src\/|\.work/.test(x.path)));
const results = [];
const insurance = JSON.parse(await readFile(path.join(root, 'tests/fixtures/insurance-candidates.json'), 'utf8'));
const generic = JSON.parse(await readFile(path.join(root, 'tests/fixtures/generic-candidates.json'), 'utf8'));
const representatives = [...insurance.representativeIcons, ...generic.representativeIcons];
const manifest = JSON.parse(await readFile(path.join(root, 'data/manifest.json'), 'utf8'));


for (const matrix of [
  { fixture: 'react-18', react: '18.3.1', typesReact: '18.3.31' },
  { fixture: 'react-19', react: '19.3.1', typesReact: '19.3.0' },
]) {
  const fixture = path.join(workRoot, `react-${matrix.react}`);
  await rm(fixture, { force: true, recursive: true });
  await mkdir(fixture, { recursive: true });
  for (const file of ['package.json', 'package-lock.json']) await copyFile(path.join(root, 'tests/fixtures', matrix.fixture, file), path.join(fixture, file));
  const fixturePackage = await readFile(path.join(fixture, 'package.json'), 'utf8');
  const fixtureLock = await readFile(path.join(fixture, 'package-lock.json'), 'utf8');
  await copyFile(tarball, path.join(fixture, 'icon-package.tgz'));
  run('npm', ['ci', '--no-audit', '--no-fund'], fixture);
  run('npm', ['install', '--no-save', '--package-lock=false', '--no-audit', '--no-fund', './icon-package.tgz'], fixture);
  assert.equal(await readFile(path.join(fixture, 'package.json'), 'utf8'), fixturePackage, 'Local package install must not rewrite the fixture manifest');
  assert.equal(await readFile(path.join(fixture, 'package-lock.json'), 'utf8'), fixtureLock, 'Local package install must not rewrite the fixture lock');
  for (const [name, version] of Object.entries(JSON.parse(fixturePackage).dependencies)) {
    const installed = JSON.parse(await readFile(path.join(fixture, 'node_modules', name, 'package.json'), 'utf8'));
    assert.equal(installed.version, version, `${name} must resolve to the exact pinned version`);
  }
  const runtime = `
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import React, { createRef } from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import * as icons from '${packageName}';
import { SearchIcon as DirectSearch } from '${packageName}/icons/search';
const manifest = JSON.parse(readFileSync(import.meta.resolve('${packageName}/manifest.json').replace('file://', ''), 'utf8'));
assert.equal(React.version, '${matrix.react}');
assert.equal(Object.keys(icons).length, ${budgets.iconCount});
assert.equal(icons.SearchIcon, DirectSearch);
const Representative = icons['${manifest.icons.find(i => i.name === representatives[0]).component}'];
for (const entry of manifest.icons) {
  const direct = await import('${packageName}/icons/' + entry.name);
  assert.equal(direct[entry.component], icons[entry.component]);
  const html = renderToStaticMarkup(React.createElement(icons[entry.component], { title: entry.labelZh }));
  assert.match(html, /<svg/); assert.match(html, /role="img"/); assert.match(html, /aria-label=/);
  assert.doesNotMatch(html, /aria-hidden="true"/);
}
const dom = new JSDOM('<!doctype html><html><body></body></html>');
globalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const act = React.act;
const container = document.createElement('div');
const root = createRoot(container); const ref = createRef(); let clicks = 0;
await act(() => root.render(React.createElement(DirectSearch, { ref, title: 'Search', onClick: () => clicks++ })));
assert.ok(ref.current instanceof window.SVGElement);
await act(() => ref.current.dispatchEvent(new window.MouseEvent('click', { bubbles: true })));
assert.equal(clicks, 1); await act(() => root.unmount()); assert.equal(ref.current, null);
const insuranceContainer = document.createElement('div');
const insuranceRoot = createRoot(insuranceContainer); const insuranceRef = createRef(); let insuranceClicks = 0;
await act(() => insuranceRoot.render(React.createElement(Representative, { ref: insuranceRef, title: 'Insurance', onClick: () => insuranceClicks++ })));
assert.ok(insuranceRef.current instanceof window.SVGElement);
await act(() => insuranceRef.current.dispatchEvent(new window.MouseEvent('click', { bubbles: true })));
assert.equal(insuranceClicks, 1); await act(() => insuranceRoot.unmount()); assert.equal(insuranceRef.current, null);
// 全部导出分别验证 ref / 原生事件；全部组件同一 SSR 树进行 hydration。
const allContainer = document.createElement('div');
const allRoot = createRoot(allContainer);
for (const entry of manifest.icons) {
  const direct = await import('${packageName}/icons/' + entry.name);
  const iconRef = createRef(); let count = 0;
  await act(() => allRoot.render(React.createElement(direct[entry.component], { ref: iconRef, title: entry.labelZh, onClick: () => count++ })));
  assert.ok(iconRef.current instanceof window.SVGElement, entry.name);
  await act(() => iconRef.current.dispatchEvent(new window.MouseEvent('click', { bubbles: true })));
  assert.equal(count, 1, entry.name);
}
await act(() => allRoot.unmount());
const element = React.createElement('main', null, ...manifest.icons.map(entry => React.createElement(icons[entry.component], { key: entry.name, title: entry.labelZh, titleId: 'hydrate-' + entry.name })));
const ssr = renderToString(element); container.innerHTML = ssr; const errors = []; let hydrated;
await act(() => { hydrated = hydrateRoot(container, element, { onRecoverableError: e => errors.push(e.message) }); });
assert.deepEqual(errors, []); assert.equal(container.innerHTML, ssr); await act(() => hydrated.unmount());
console.log('React ${matrix.react}: ${budgets.iconCount} packed exports/direct imports + SSR + ref + event + hydration PASS');
`;
  await writeFile(path.join(fixture, 'runtime.mjs'), runtime);
  const runtimeResult = run(process.execPath, ['runtime.mjs'], fixture).trim();
  await writeFile(path.join(fixture, 'usage.tsx'), `
import { createRef } from 'react';
import { SearchIcon, type IconProps } from '${packageName}';
import { HomeIcon } from '${packageName}/icons/home';
import { ${manifest.icons.find(i => i.name === representatives[0]).component} } from '${packageName}';
import { ${manifest.icons.find(i => i.name === representatives[1]).component} } from '${packageName}/icons/${representatives[1]}';
const ref = createRef<SVGSVGElement>();
const props: IconProps = { size: '1em', title: 'Search', strokeWidth: 2, 'aria-label': 'Find', onClick: event => event.currentTarget.focus() };
export const sample = <><SearchIcon {...props} ref={ref} /><HomeIcon width={20} height={24} titleId="home-title" title="Home" /></>;
export const insuranceSample = <><${manifest.icons.find(i => i.name === representatives[0]).component} ref={ref} title="保单" /><${manifest.icons.find(i => i.name === representatives[1]).component} size={20} /></>;
// @ts-expect-error Size is a string or a number
const badSize = <SearchIcon size={{}} />;
// @ts-expect-error Title must be text
const badTitle = <SearchIcon title={42} />;
// @ts-expect-error An SVG ref is required
const badRef = <SearchIcon ref={createRef<HTMLDivElement>()} />;
// @ts-expect-error Fixed icon geometry cannot be replaced with inner HTML
const badHtml = <SearchIcon dangerouslySetInnerHTML={{ __html: '' }} />;
`);
  // 对每个 root / subpath 的声明、SVG ref 和事件类型做严格编译。
  const allTypes = manifest.icons.map((icon, index) => `import { ${icon.component} as Root${index} } from '${packageName}';\nimport { ${icon.component} as Direct${index} } from '${packageName}/icons/${icon.name}';\nexport const typed${index} = <><Root${index} ref={ref} onClick={event => event.currentTarget.focus()} /><Direct${index} size={18} ref={ref} title="${icon.name}" /></>;`).join('\n');
  await writeFile(path.join(fixture, 'usage.tsx'), (await readFile(path.join(fixture, 'usage.tsx'), 'utf8')) + '\n' + allTypes);
  for (const resolution of ['Bundler', 'NodeNext']) {
    await writeFile(path.join(fixture, 'tsconfig.json'), JSON.stringify({ compilerOptions: { noEmit: true, strict: true, skipLibCheck: false, jsx: 'react-jsx', target: 'ES2020', module: resolution === 'NodeNext' ? 'NodeNext' : 'ESNext', moduleResolution: resolution }, include: ['usage.tsx'] }));
    run(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '-p', 'tsconfig.json'], fixture);
  }
  const bundles = [];
  for (const iconName of ['search', ...representatives]) for (const entryKind of ['root', 'subpath']) {
    const component = manifest.icons.find(i => i.name === iconName).component;
    const artifactKey = `${iconName}-${entryKind}`;
    const entry = path.join(fixture, `${artifactKey}.mjs`);
    await writeFile(entry, `export { ${component} } from '${packageName}${entryKind === 'subpath' ? '/icons/' + iconName : ''}';\n`);
    const result = await build({ entryPoints: [entry], bundle: true, minify: true, treeShaking: true, format: 'esm', platform: 'browser', target: 'es2020', external: ['react', 'react/*'], write: false, metafile: true, outfile: path.join(fixture, `${artifactKey}.bundle.js`), logLevel: 'silent' });
    const contributions = Object.values(result.metafile.outputs).flatMap(output => Object.entries(output.inputs)).filter(([name, info]) => /dist\/icons\/.+\.js$/.test(name) && info.bytesInOutput > 0);
    assert.equal(contributions.length, 1, `${entryKind} includes extra icon modules`);
    assert.ok(contributions[0][0].endsWith('/' + iconName + '.js'));
    const text = result.outputFiles[0].text;
    assert.ok(!text.includes('M2.75 10.8 11.45 3.8'), 'Home geometry must be excluded');
    assert.match(text, /react/);
    const minifiedLimit = iconName === 'search' ? budgets.searchMinifiedBytes : (generic.svgSha256[iconName] ? budgets.genericMinifiedBytes : budgets.insuranceMinifiedBytes);
    const gzipLimit = iconName === 'search' ? budgets.searchGzipBytes : (generic.svgSha256[iconName] ? budgets.genericGzipBytes : budgets.insuranceGzipBytes);
    const metrics = { icon: iconName, entry: entryKind, iconModulesContributingBytes: 1, excludedIcons: budgets.iconCount - 1, bytes: Buffer.byteLength(text), gzipBytes: gzipSync(text).length, reactExternal: true };
    assert.ok(metrics.bytes <= minifiedLimit, `${entryKind}: ${metrics.bytes} bytes exceeds ${minifiedLimit}`);
    assert.ok(metrics.gzipBytes <= gzipLimit, `${entryKind}: ${metrics.gzipBytes} gzip bytes exceeds ${gzipLimit}`);
    bundles.push(metrics);
    await writeFile(path.join(artifacts, `tree-shaking-react-${matrix.react}-${artifactKey}.json`), JSON.stringify({ metrics, metafile: result.metafile }, null, 2));
    await writeFile(path.join(artifacts, `tree-shaking-react-${matrix.react}-${artifactKey}.js`), text);
  }
  for (let index = 0; index < bundles.length; index += 2) assert.equal(bundles[index].bytes, bundles[index + 1].bytes);
  results.push({ react: matrix.react, types: matrix.typesReact, rootAndSubpathExports: budgets.iconCount, ssr: true, ref: true, event: true, hydration: true, allIconRuntimeCount: manifest.count, allIconTypeCount: manifest.count, typeResolutions: ['Bundler', 'NodeNext'], bundles });
  console.log(runtimeResult);
  console.log(JSON.stringify(bundles));
}
await writeFile(path.join(artifacts, 'consumer-results.json'), JSON.stringify({ node: process.version, package: packed.name, version: packed.version, tarball: packed.filename, packageBytes: packed.size, unpackedBytes: packed.unpackedSize, fileCount: packed.entryCount, results }, null, 2));
console.log(`PASS: clean tarball installs, React 18/19, TS consumers and real bundler tree-shaking (${packed.filename}).`);
