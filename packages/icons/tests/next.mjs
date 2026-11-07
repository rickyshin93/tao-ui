import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { closeSync, openSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

// Integration test of the real npm archive, never a source alias or workspace symlink.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Keep the fixture outside the monorepo tree; see tests/consumer.mjs for why.
const workRoot = process.env.TAO_ICONS_WORK_DIR || path.join(tmpdir(), 'tao-icons-work');
const work = path.join(workRoot, 'next');
const results = path.join(root, 'artifacts');
const fixture = path.join(root, 'tests/fixtures/next');
const fixturePackageText = await readFile(path.join(fixture, 'package.json'), 'utf8');
const fixturePackage = JSON.parse(fixturePackageText);
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1', NODE_ENV: 'production',
  npm_config_cache: process.env.npm_config_cache || process.env.NPM_CONFIG_CACHE || path.join(tmpdir(), 'rounded-npm-cache') };
const packageName = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).name;
const versions = { next: fixturePackage.dependencies.next, react: fixturePackage.dependencies.react, reactDom: fixturePackage.dependencies['react-dom'] };
const insurance = JSON.parse(await readFile(path.join(root, 'tests/fixtures/insurance-candidates.json'), 'utf8'));
const manifest = JSON.parse(await readFile(path.join(root, 'data/manifest.json'), 'utf8'));
// Simplified risk-score/product-builder paths are <=30 chars; keep the strict long-fingerprint threshold.
const insuranceUsed = insurance.nextRepresentativeIcons;
const generic = JSON.parse(await readFile(path.join(root, 'tests/fixtures/generic-candidates.json'), 'utf8'));
// V13 shortened git-pull-request. Use the new folder-sync's long paths to audit retention.
const genericUsed = ['chart-pie', 'folder-sync'];
const componentFor = name => manifest.icons.find(icon => icon.name === name).component;
const started = new Date().toISOString();
const checks = [];
await rm(work, { recursive: true, force: true });
await mkdir(path.join(work, 'app'), { recursive: true });
await mkdir(results, { recursive: true });

function run(args, cwd, logName) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
      cwd, env, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    child.stdout.setEncoding('utf8').on('data', text => { stdout += text; });
    child.stderr.setEncoding('utf8').on('data', text => { stderr += text; });
    const timeout = setTimeout(() => {
      timedOut = true;
      // Stop this test's complete npm/Next process group, including build workers.
      try {
        if (process.platform !== 'win32') process.kill(-child.pid, 'SIGKILL');
        else child.kill('SIGKILL');
      } catch {}
    }, 300_000);
    child.on('error', error => { clearTimeout(timeout); reject(error); });
    child.on('close', async (code, signal) => {
      clearTimeout(timeout);
      try {
        await writeFile(path.join(work, logName), stdout + (stderr ? '\n--- stderr ---\n' + stderr : ''));
        if (code === 0 && !timedOut) resolve(stdout);
        else reject(new Error(`npm ${args.join(' ')} ${timedOut ? 'timed out after 300 seconds' : `failed (${code ?? signal})`}; see ${path.join(work, logName)}\n${stderr.slice(-4000)}`));
      } catch (error) { reject(error); }
    });
  });
}

async function javascriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? javascriptFiles(file) : entry.name.endsWith('.js') ? [file] : [];
  }));
  return files.flat();
}

async function auditClientChunks({ importedIcons = ['home', 'keyboard', 'search', ...insuranceUsed, ...genericUsed], allowKnownLeak = false } = {}) {
  const canonical = JSON.parse(await readFile(path.join(root, 'data/icons.json'), 'utf8'));
  const markers = new Map();
  for (const [name, geometry] of Object.entries(canonical.icons)) {
    for (const match of geometry.matchAll(/\bd="([^"]+)"/g)) {
      if (match[1].length <= 30) continue;
      const owners = markers.get(match[1]) || new Set();
      owners.add(name);
      markers.set(match[1], owners);
    }
  }
  // Unique long SVG paths are stable fingerprints that survive JS minification.
  const unique = [...markers].filter(([, owners]) => owners.size === 1).map(([marker, owners]) => ({ marker, name: [...owners][0] }));
  const chunks = await Promise.all((await javascriptFiles(path.join(work, '.next/static/chunks'))).map(async file => ({ file, source: await readFile(file, 'utf8') })));
  const source = chunks.map(chunk => chunk.source).join('\n');
  const used = new Set(importedIcons);
  const unused = unique.filter(({ name }) => !used.has(name));
  assert.ok(new Set(unused.map(({ name }) => name)).size >= 150, 'Geometry audit unexpectedly lost coverage');
  assert.ok(unused.some(item => manifest.icons.find(icon => icon.name === item.name)?.category === 'lucide-full-coverage'), 'V13 catalog additions must participate in the unused-geometry audit');
  assert.ok(unused.some(item => generic.svgSha256[item.name]), '新通用资产必须参与 Next 未用几何审计');
  assert.ok(unused.some(item => insurance.svgSha256[item.name]), 'New insurance assets must participate in the Next unused-geometry audit');
  const leaked = unused.filter(({ marker }) => source.includes(marker));
  if (!allowKnownLeak) assert.deepEqual([...new Set(leaked.map(({ name }) => name))], [], 'Unused icons leaked into Next client chunks; check the root barrel client boundary');
  // SearchX 合法重用 Search 外轮廓；已用保留与未用排除分开检查，仍保持 >30 阈值。
  const retained = ['home', 'search', ...insuranceUsed, ...genericUsed].filter(name => used.has(name)).map(name => {
    const longPaths = [...canonical.icons[name].matchAll(/\bd="([^"]+)"/g)].map(m => m[1]).filter(marker => marker.length > 30);
    assert.ok(longPaths.length > 0, `${name}: 缺少 >30 字符保留指纹`);
    for (const marker of longPaths) assert.ok(source.includes(marker), `${name} must survive in the client bundle`);
    return { name, longPathsChecked: longPaths.length, hasUniqueLongPath: unique.some(item => item.name === name) };
  });
  const bearing = chunks.filter(chunk => unique.some(item => chunk.source.includes(item.marker)));
  return {
    importedIcons: [...used],
    retainedImportedPaths: retained,
    unusedIconsWithDistinctivePathsChecked: new Set(unused.map(({ name }) => name)).size,
    unusedPathMarkersChecked: unused.length,
    unusedGenericIconsWithDistinctivePathsChecked: new Set(unused.filter(item => generic.svgSha256[item.name]).map(item => item.name)).size,
    unusedInsuranceIconsWithDistinctivePathsChecked: new Set(unused.filter(item => insurance.svgSha256[item.name]).map(item => item.name)).size,
    leakedUnusedIcons: [...new Set(leaked.map(({ name }) => name))],
    iconBearingChunks: bearing.map(chunk => ({ file: path.relative(work, chunk.file), bytes: Buffer.byteLength(chunk.source) })),
    note: 'Regression check scans unique long path fingerprints, not a webpack module-count estimate; icons without distinctive long paths are covered by package geometry/export tests.',
  };
}

let server;
let serverLog;
try {
  await readFile(path.join(root, 'dist/index.js'));
  const packed = JSON.parse(await run(['pack', '--ignore-scripts', '--json', '--pack-destination', work], root, 'pack.log'))[0];
  await writeFile(path.join(work, 'package.json'), fixturePackageText);
  await writeFile(path.join(work, 'package-lock.json'), await readFile(path.join(fixture, 'package-lock.json')));
  await writeFile(path.join(work, 'next.config.mjs'), `import path from 'node:path';
import { fileURLToPath } from 'node:url';
export default { outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)), experimental: { cpus: 1 } };\n`);
  await writeFile(path.join(work, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { target: 'ES2020', lib: ['dom', 'dom.iterable', 'esnext'], strict: true,
      // Match Next's default: its own URLPattern declarations fail with TS 5.9.3.
      // Strict package declarations are checked with skipLibCheck:false by consumer.mjs.
      noEmit: true, esModuleInterop: true, module: 'esnext', moduleResolution: 'bundler', skipLibCheck: true,
      resolveJsonModule: true, isolatedModules: true, jsx: 'react-jsx', plugins: [{ name: 'next' }] },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'], exclude: ['node_modules'],
  }, null, 2));
  await writeFile(path.join(work, 'app/layout.tsx'), `import type { ReactNode } from 'react';
export default function Layout({children}: {children: ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}\n`);
  await writeFile(path.join(work, 'app/page.tsx'), `import { HomeIcon } from '${packageName}';
import { KeyboardIcon } from '${packageName}/icons/keyboard';
import { ${componentFor(insuranceUsed[0])} } from '${packageName}';
import { ${componentFor(insuranceUsed[1])} } from '${packageName}/icons/${insuranceUsed[1]}';
${genericUsed.map(name => `import { ${componentFor(name)} } from '${packageName}/icons/${name}';`).join('\n')}
import ClientExample from './client-example';
// This remains a Server Component: library icon modules own their client boundary.
export default function Page() {
  return <main><h1>Rounded Essentials Next integration</h1>
    <HomeIcon title="Server root import" data-testid="server-root" />
    <KeyboardIcon title="Server subpath import" titleId="keyboard-name" data-testid="server-subpath" />
    <${componentFor(insuranceUsed[0])} title="Insurance root import" data-testid="insurance-root" />
    <${componentFor(insuranceUsed[1])} title="Insurance subpath import" data-testid="insurance-subpath" />
    ${genericUsed.map(name => `<${componentFor(name)} title="通用扩展 ${name}" data-testid="generic-${name}" />`).join('\n    ')}
    <ClientExample />
  </main>;
}\n`);
  await writeFile(path.join(work, 'app/client-example.tsx'), `'use client';
import { useEffect, useRef, useState } from 'react';
import { SearchIcon } from '${packageName}/icons/search';
export default function ClientExample() {
  const ref = useRef<SVGSVGElement>(null);
  const [clicks, setClicks] = useState(0);
  const [linked, setLinked] = useState(false);
  useEffect(() => { setLinked(ref.current?.tagName.toLowerCase() === 'svg'); }, []);
  return <button type="button" aria-label="Search" data-linked={linked} data-clicks={clicks}
    onClick={() => setClicks(value => value + 1)}>
    <SearchIcon ref={ref} size={20} className="search-icon" data-testid="client-icon"
      onClick={event => { event.currentTarget.dataset.clicked = 'yes'; }} />
  </button>;
}\n`);
  await run(['ci', '--include=dev', '--ignore-scripts', '--no-audit', '--no-fund'], work, 'install.log');
  await run(['install', '--no-save', '--package-lock=false', '--include=dev', '--ignore-scripts', '--no-audit', '--no-fund', `./${packed.filename}`], work, 'install-package.log');
  assert.equal(await readFile(path.join(work, 'package.json'), 'utf8'), fixturePackageText, 'Installing the test tarball must not alter fixture metadata');
  assert.equal(await readFile(path.join(work, 'package-lock.json'), 'utf8'), await readFile(path.join(fixture, 'package-lock.json'), 'utf8'), 'Installing the test tarball must not alter the pinned dependency graph');
  // Do not silently resolve fixture tools or types from this repository's node_modules.
  for (const dependency of ['next', 'react', 'react-dom', 'typescript', '@types/react', '@types/react-dom', '@types/node']) {
    const installedDependency = JSON.parse(await readFile(path.join(work, 'node_modules', ...dependency.split('/'), 'package.json'), 'utf8'));
    assert.equal(installedDependency.version, { ...fixturePackage.dependencies, ...fixturePackage.devDependencies }[dependency], `${dependency} must match its pinned version`);
  }
  const installedPath = path.join(work, 'node_modules', ...packageName.split('/'));
  const installed = JSON.parse(await readFile(path.join(installedPath, 'package.json'), 'utf8'));
  assert.equal(installed.name, packageName);
  checks.push('Installed lockfile-pinned Next dependencies with npm ci, then the real npm tarball without changing the lockfile');
  assert.match(await readFile(path.join(installedPath, 'dist/index.js'), 'utf8'), /^['"]use client['"];?/);
  for (const icon of ['home', 'keyboard', 'search', ...insuranceUsed, ...genericUsed]) {
    const js = await readFile(path.join(installedPath, 'dist/icons', `${icon}.js`), 'utf8');
    assert.match(js, /^['"]use client['"];?/);
  }
  checks.push('Packaged component entry modules preserve use client');
  // Keep the separate-root-import case: Next 16.4.2 can over-include its client barrel.
  // Exercise vanilla single/consolidated imports as well as the recommended per-icon subpaths.
  const separatePage = await readFile(path.join(work, 'app/page.tsx'), 'utf8');
  const vanillaConfig = await readFile(path.join(work, 'next.config.mjs'), 'utf8');
  const scenarios = [];
  for (const mode of ['vanilla-single-root', 'vanilla-consolidated-root', 'vanilla-separate-root', 'vanilla-subpaths']) {
    let page = separatePage;
    if (mode === 'vanilla-single-root') page = page
      .replace(`import { ${componentFor(insuranceUsed[0])} } from '${packageName}';`, '')
      .replace(`import { ${componentFor(insuranceUsed[1])} } from '${packageName}/icons/${insuranceUsed[1]}';`, '')
      .replace(new RegExp(`    <${componentFor(insuranceUsed[0])}[^\n]+\n`), '')
      .replace(new RegExp(`    <${componentFor(insuranceUsed[1])}[^\n]+\n`), '');
    if (mode === 'vanilla-consolidated-root') page = page
      .replace(`import { HomeIcon } from '${packageName}';`, `import { HomeIcon, ${componentFor(insuranceUsed[0])} } from '${packageName}';`)
      .replace(`import { ${componentFor(insuranceUsed[0])} } from '${packageName}';`, '');
    if (mode === 'vanilla-subpaths') page = page
      .replace(`import { HomeIcon } from '${packageName}';`, `import { HomeIcon } from '${packageName}/icons/home';`)
      .replace(`import { ${componentFor(insuranceUsed[0])} } from '${packageName}';`, `import { ${componentFor(insuranceUsed[0])} } from '${packageName}/icons/${insuranceUsed[0]}';`);
    await writeFile(path.join(work, 'app/page.tsx'), page);
    await writeFile(path.join(work, 'next.config.mjs'), vanillaConfig);
    await rm(path.join(work, '.next'), { recursive: true, force: true });
    await run(['run', 'build'], work, `${mode}-build.log`);
    const audit = await auditClientChunks({ importedIcons: mode === 'vanilla-single-root' ? ['home', 'keyboard', 'search', ...genericUsed] : ['home', 'keyboard', 'search', ...insuranceUsed, ...genericUsed], allowKnownLeak: mode === 'vanilla-separate-root' });
    const scenario = { mode, productionBuild: true, unusedExclusionPassed: audit.leakedUnusedIcons.length === 0, audit };
    scenarios.push(scenario);
    await writeFile(path.join(results, `next-${mode}.json`), JSON.stringify(scenario, null, 2) + '\n');
    console.log(`Next ${mode}: build PASS; unused icon leakage ${audit.leakedUnusedIcons.length}${mode === 'vanilla-separate-root' ? ' (documented upstream behavior; use subpaths or consolidated imports)' : ''}`);
  }
  checks.push('Next production webpack builds, TypeScript, and App Router prerender succeeded across four import scenarios');
  const bundleAudit = scenarios.at(-1).audit;
  checks.push('Vanilla single/consolidated root and per-icon subpath imports exclude all unimported distinctive icon paths; vanilla separate-root behavior is reported explicitly');

  const probe = createServer();
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const port = probe.address().port;
  await new Promise((resolve, reject) => probe.close(error => error ? reject(error) : resolve()));
  serverLog = openSync(path.join(work, 'server.log'), 'w');
  server = spawn(process.execPath, [path.join(work, 'node_modules/next/dist/bin/next'), 'start', '-H', '127.0.0.1', '-p', String(port)], {
    cwd: work, env, stdio: ['ignore', serverLog, serverLog],
  });
  let response;
  const timeout = Date.now() + 60_000;
  while (Date.now() < timeout) {
    if (server.exitCode !== null || server.signalCode !== null) throw new Error(`Next server exited (${server.exitCode ?? server.signalCode})`);
    try { response = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(10_000) }); break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  assert.ok(response, 'Next server did not become reachable');
  assert.equal(response.status, 200);
  const html = await response.text();
  // 最终 SSR 比对完整几何，避免将共享轮廓误作完整图标身份。
  const canonical = JSON.parse(await readFile(path.join(root, 'data/icons.json'), 'utf8'));
  const document = new JSDOM(html).window.document;
  const geometry = element => [...element.children].filter(child => child.tagName.toLowerCase() !== 'title').map(child => [child.tagName.toLowerCase(), [...child.attributes].map(a => [a.name, a.value]).sort()]);
  for (const [testId, name] of [['server-root', 'home'], ['server-subpath', 'keyboard'], ['client-icon', 'search'], ['insurance-root', insuranceUsed[0]], ['insurance-subpath', insuranceUsed[1]], ...genericUsed.map(name => ['generic-' + name, name])]) {
    const expected = document.createElement('div'); expected.innerHTML = `<svg>${canonical.icons[name]}</svg>`;
    assert.deepEqual(geometry(document.querySelector(`[data-testid="${testId}"]`)), geometry(expected.firstElementChild), `${name}: 生产 SSR 完整几何`);
  }
  document.defaultView.close();
  await writeFile(path.join(work, 'response.html'), html);
  assert.equal((html.match(/<svg\b/g) || []).length, 5 + genericUsed.length);
  for (const name of genericUsed) assert.ok(html.includes(`data-testid="generic-${name}"`));
  for (const testId of ['server-root', 'server-subpath', 'client-icon', 'insurance-root', 'insurance-subpath']) assert.ok(html.includes(`data-testid="${testId}"`));
  assert.ok(html.includes('<title>Server root import</title>'));
  assert.ok(html.includes('aria-label="Server root import"'));
  assert.ok(html.includes('<title id="keyboard-name">Server subpath import</title>'));
  assert.ok(html.includes('aria-labelledby="keyboard-name"'));
  assert.ok(html.includes('class="search-icon"'));
  assert.ok(html.includes('aria-hidden="true"'));
  assert.ok(html.includes('width="20" height="20"'));
  checks.push('Production server returned 200 with baseline and generic SSR SVGs using per-icon subpaths (consolidated-root imports tested in a separate production build), title naming, decorative defaults, and custom size/class');
  const report = { passed: true, started, finished: new Date().toISOString(), versions,
    package: `${installed.name}@${installed.version}`, archive: packed.filename, integrity: packed.integrity,
    checks, bundleAudit, importScenarios: scenarios, limitations: ['Next 16.4.2 vanilla separate statements importing the root barrel may include all icons. Use per-icon subpaths, consolidate root imports, and do not repeat separate root imports. The final server probe uses the subpath scenario; all four scenarios are recorded.', 'Icons are Client Components with SSR and server import support; this is not a native RSC claim.',
      'Next test compiles client ref/event code and checks SSR; browser hydration and event behavior are covered separately by consumer DOM tests.',
      'Next fixture uses its default skipLibCheck:true because Next 16.4.2 references unavailable URLPatternInput/URLPatternOptions globals under TypeScript 5.9.3. React 18/19 consumer tests separately check package declarations with skipLibCheck:false.'],
    logs: ['pack.log', 'install.log', 'install-package.log', ...scenarios.map(item => `${item.mode}-build.log`), 'server.log', 'response.html'].map(name => path.join(work, name)),
  };
  await writeFile(path.join(results, 'next-results.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  await writeFile(path.join(results, 'next-results.json'), JSON.stringify({ passed: false, started, finished: new Date().toISOString(), versions, checks, error: String(error), logs: work }, null, 2) + '\n');
  throw error;
} finally {
  if (server && server.exitCode === null) {
    server.kill('SIGTERM');
    let timeout;
    await Promise.race([once(server, 'exit'), new Promise(resolve => { timeout = setTimeout(resolve, 5000); })]);
    clearTimeout(timeout);
    if (server.exitCode === null) server.kill('SIGKILL');
  }
  if (serverLog !== undefined) closeSync(serverLog);
}
