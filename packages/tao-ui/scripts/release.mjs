#!/usr/bin/env node
// Release @rockshin/tao-ui from the bun workspaces monorepo.
//
// Usage (from the repo root, or from packages/tao-ui):
//   bun run release <version>
//   cd packages/tao-ui && bun scripts/release.mjs <version>
//
// Paths are resolved from this script, not from process.cwd(), so the release
// always targets packages/tao-ui whichever directory it was started from. The
// release commit only records the version bump plus the root lockfile (the one
// lockfile shared by every workspace); it never sweeps other workspaces in.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { fetchPublishedVersion } from './npm-registry.mjs';

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));
const packageJsonPath = join(packageDir, 'package.json');
const releaseWorkflowFile = 'release.yml';

const version = process.argv[2];
const npmCache = process.env.npm_config_cache || '/private/tmp/npm-cache';
const tag = version ? `v${version}` : undefined;

function usage() {
  console.error('Usage (from the repo root): bun run release <version>');
  console.error('Usage (from packages/tao-ui): bun run release <version>');
  console.error('Example: bun run release 0.0.40');
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    cwd: packageDir,
    env: { ...process.env, npm_config_cache: npmCache },
    ...options,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function read(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    cwd: packageDir,
    env: { ...process.env, npm_config_cache: npmCache },
    ...options,
  }).trim();
}

function commandExists(command) {
  const result = spawnSync(command, ['--version'], {
    stdio: 'ignore',
    cwd: packageDir,
    env: { ...process.env, npm_config_cache: npmCache },
  });
  return result.status === 0;
}

function refExists(args, cwd) {
  const result = spawnSync('git', args, {
    stdio: 'ignore',
    cwd,
    env: { ...process.env, npm_config_cache: npmCache },
  });
  return result.status === 0;
}

function assert(condition, message) {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
}

function readChangelogEntry(locale, repoRoot) {
  const path = relative(
    repoRoot,
    join(packageDir, 'docs', locale, 'guide', 'changelog.md'),
  );
  const source = `HEAD:${path}`;
  assert(
    refExists(['cat-file', '-e', source], repoRoot),
    `Commit ${path} before releasing.`,
  );
  const entry = read('git', ['show', source], { cwd: repoRoot })
    .split(/^## /m)
    .slice(1)
    .filter((section) => section.split('\n', 1)[0].trim() === version);
  const body = entry[0]?.split('\n').slice(1).join('\n').trim();
  assert(
    entry.length === 1 &&
      /^\d{4}-\d{2}-\d{2}\n/.test(body ?? '') &&
      /^- \S/m.test(body ?? ''),
    `Commit one dated "## ${version}" section with change entries in ${path} before releasing.`,
  );
  return body;
}

if (!version) {
  usage();
  process.exit(1);
}

assert(
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version),
  `Invalid semver version: ${version}`,
);

for (const command of ['git', 'gh', 'bun', 'npm']) {
  assert(commandExists(command), `Required command not found: ${command}`);
}

// In the monorepo this script lives in packages/tao-ui/scripts; every git/gh
// command runs from the repository root, every package command from the
// package directory.
const repoRoot = read('git', ['rev-parse', '--show-toplevel']);
assert(repoRoot.length > 0, 'Could not determine the git repository root.');
assert(
  existsSync(join(repoRoot, '.github', 'workflows', releaseWorkflowFile)),
  `Missing release workflow: .github/workflows/${releaseWorkflowFile}`,
);

const stagedBeforeRelease = read('git', ['diff', '--cached', '--name-only'], {
  cwd: repoRoot,
})
  .split('\n')
  .filter(Boolean);
const stagedPreview = stagedBeforeRelease.slice(0, 3).join(', ');
assert(
  stagedBeforeRelease.length === 0,
  `The git index already has staged changes (${stagedPreview}${stagedBeforeRelease.length > 3 ? ', ...' : ''}). A release commit only contains the version bump; commit or stash them first.`,
);

const branch = read('git', ['branch', '--show-current'], { cwd: repoRoot });
assert(
  branch === 'main',
  `Release must run from main, current branch is ${branch}`,
);

const englishNotes = readChangelogEntry('en', repoRoot);
readChangelogEntry('zh', repoRoot);
const docsUrl = 'https://rickyshin93.github.io/tao-ui';
const releaseNotes = `${englishNotes.replace(/\]\(\/(?!\/)/g, `](${docsUrl}/`)}\n\n[简体中文更新日志](${docsUrl}/zh/guide/changelog)\n`;

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
assert(
  packageJson.version !== version,
  `package.json is already at version ${version}`,
);

assert(
  !refExists(['rev-parse', '-q', '--verify', `refs/tags/${tag}`], repoRoot),
  `Local tag already exists: ${tag}`,
);

assert(
  !refExists(['ls-remote', '--exit-code', '--tags', 'origin', tag], repoRoot),
  `Remote tag already exists: ${tag}`,
);

packageJson.version = version;
writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
// The root lockfile is the only lockfile for the whole workspace, so install
// from the repo root: this keeps that lockfile authoritative, while `bun run`
// scripts below still execute against packages/tao-ui.
run('bun', ['install'], { cwd: repoRoot });

console.log(`\nPreparing ${packageJson.name}@${version}`);

try {
  const publishedVersion = read('npm', ['view', packageJson.name, 'version']);
  assert(
    publishedVersion !== version,
    `${packageJson.name}@${version} is already published to npm`,
  );
} catch (error) {
  if (error.status === 1) {
    console.warn('Unable to verify npm version; continuing with local checks.');
  } else {
    throw error;
  }
}

run('bun', ['run', 'lint']);
run('bun', ['run', 'typecheck']);
run('bun', ['run', 'test:types']);
run('bun', ['run', 'check:components']);
run('bun', ['run', 'docs:check']);
run('bun', ['run', 'test']);
run('bun', ['run', 'build']);
run('bun', ['run', 'test:package']);
run('bun', ['run', 'build:storybook']);
run('bun', ['run', 'doc:build']);
run('npm', ['pack', '--dry-run']);

// Stage only the version bump and (if bun rewrote it) the root lockfile.
// `git add -A` without a pathspec is tree-wide even from a subdirectory, which
// in a monorepo would sweep unrelated workspace changes into the release.
const packageJsonRelative = relative(repoRoot, packageJsonPath);
const lockfiles = ['bun.lockb', 'bun.lock'].filter((file) =>
  existsSync(join(repoRoot, file)),
);

run('git', ['add', '--', packageJsonRelative], { cwd: repoRoot });
for (const lockfile of lockfiles) {
  const status = read('git', ['status', '--porcelain', '--', lockfile], {
    cwd: repoRoot,
  });
  if (status.length > 0) {
    run('git', ['add', '--', lockfile], { cwd: repoRoot });
  }
}

const stagedFiles = read('git', ['diff', '--cached', '--name-only'], {
  cwd: repoRoot,
})
  .split('\n')
  .filter(Boolean);
assert(stagedFiles.length > 0, 'No staged changes to commit.');

const allowedFiles = new Set([packageJsonRelative, ...lockfiles]);
for (const file of stagedFiles) {
  assert(
    allowedFiles.has(file),
    `Refusing to commit ${file}: a release commit only contains the version bump and the root lockfile. Commit or stash other changes first.`,
  );
}

run('git', ['commit', '-m', `chore: release ${tag}`], { cwd: repoRoot });
run('git', ['tag', tag], { cwd: repoRoot });
run('git', ['push', 'origin', 'main'], { cwd: repoRoot });
run('git', ['push', 'origin', tag], { cwd: repoRoot });

run('gh', ['release', 'create', tag, '--title', tag, '--notes-file', '-'], {
  cwd: repoRoot,
  input: releaseNotes,
  stdio: ['pipe', 'inherit', 'inherit'],
});

let runId;
for (let attempt = 0; attempt < 20; attempt++) {
  await delay(3000);
  const runs = JSON.parse(
    read(
      'gh',
      [
        'run',
        'list',
        '--workflow',
        releaseWorkflowFile,
        '--event',
        'release',
        '--json',
        'databaseId,headBranch,event,status,conclusion,displayTitle',
        '--limit',
        '20',
      ],
      { cwd: repoRoot },
    ),
  );
  const releaseRun = runs.find((candidate) => candidate.headBranch === tag);
  if (releaseRun) {
    runId = String(releaseRun.databaseId);
    break;
  }
}

assert(runId, `Could not find release workflow run for ${tag}`);
run('gh', ['run', 'watch', runId, '--exit-status'], { cwd: repoRoot });

// The release workflow finishes as soon as npm accepts the tarball, but the
// registry can keep serving the previous packument for a minute or two while
// it processes the upload. Poll instead of failing the whole release on that
// propagation lag.
const registry = packageJson.publishConfig?.registry;
console.log(`\nWaiting for npm to serve ${packageJson.name}@${version}...`);
let publishedVersion;
for (let attempt = 0; attempt < 30; attempt++) {
  try {
    publishedVersion = await fetchPublishedVersion(
      packageJson.name,
      version,
      registry,
    );
  } catch (error) {
    console.warn(`Registry check failed: ${error.message}`);
  }
  if (publishedVersion === version) {
    break;
  }
  await delay(10000);
}

assert(
  publishedVersion === version,
  `Expected npm version ${version}, got ${publishedVersion ?? 'nothing'} after 5 minutes`,
);

console.log(`\nReleased ${packageJson.name}@${version}`);
