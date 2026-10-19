import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));

test('generated-source drift is caught without silently regenerating it', async () => {
  const fixture = await mkdtemp(path.join(tmpdir(), 'rounded-generator-'));
  try {
    for (const directory of ['src', 'data', 'svg', 'scripts']) await cp(path.join(root, directory), path.join(fixture, directory), { recursive: true });
    const before = spawnSync(process.execPath, ['scripts/generate.mjs', '--check'], { cwd: fixture, encoding: 'utf8' });
    assert.equal(before.status, 0, before.stderr);
    const file = path.join(fixture, 'src/icons/search.tsx');
    await writeFile(file, (await readFile(file, 'utf8')) + '// accidental manual edit\n');
    const after = spawnSync(process.execPath, ['scripts/generate.mjs', '--check'], { cwd: fixture, encoding: 'utf8' });
    assert.notEqual(after.status, 0, 'Generator check must reject edited generated source');
    assert.match(after.stderr, /Stale generated file: src\/icons\/search\.tsx/);
    assert.match(await readFile(file, 'utf8'), /accidental manual edit/);
  } finally { await rm(fixture, { recursive: true, force: true }); }
});

test('release guard passes for the publishable @rockshin/tao-icons metadata', async () => {
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.name, '@rockshin/tao-icons');
  assert.equal(pkg.license, 'MIT');
  assert.notEqual(pkg.private, true);
  assert.doesNotMatch(pkg.name, /preview/);
  assert.doesNotMatch(pkg.version, /preview/);
  const result = spawnSync(process.execPath, ['scripts/release-guard.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /This does not authorize publication/);
});

test('通用导入器可从本仓库数据重现合并结果且不改原批准基线', async () => {
  const fixture = await mkdtemp(path.join(tmpdir(), 'rounded-import-'));
  try {
    for (const directory of ['data', 'svg', 'scripts', 'tests/fixtures']) await cp(path.join(root, directory), path.join(fixture, directory), { recursive: true });
    const files = ['data/icons.json', 'data/manifest.json', 'tests/fixtures/geometry-golden.json', 'tests/fixtures/generic-candidates.json', 'tests/fixtures/approved-v1.3.0-preview.2-icons.json', 'tests/fixtures/approved-v1.3.0-preview.2-manifest.json', 'tests/fixtures/approved-v1.3.0-preview.2-golden.json'];
    const before = await Promise.all(files.map(file => readFile(path.join(fixture, file), 'utf8')));
    const result = spawnSync(process.execPath, ['scripts/integrate-generic.mjs'], { cwd: fixture, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    for (const [index, file] of files.entries()) assert.equal(await readFile(path.join(fixture, file), 'utf8'), before[index], file + ': 导入结果不可漂移');
  } finally { await rm(fixture, { recursive: true, force: true }); }
});
