#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';

const version = process.argv[2];
const npmCache = process.env.npm_config_cache || '/private/tmp/npm-cache';
const tag = version ? `v${version}` : undefined;

function usage() {
  console.error('Usage: bun run release <version>');
  console.error('Example: bun run release 0.0.8');
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
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
    env: { ...process.env, npm_config_cache: npmCache },
    ...options,
  }).trim();
}

function commandExists(command) {
  const result = spawnSync(command, ['--version'], {
    stdio: 'ignore',
    env: { ...process.env, npm_config_cache: npmCache },
  });
  return result.status === 0;
}

function refExists(args) {
  const result = spawnSync('git', args, {
    stdio: 'ignore',
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

const branch = read('git', ['branch', '--show-current']);
assert(branch === 'main', `Release must run from main, current branch is ${branch}`);

const packageJsonPath = 'package.json';
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
assert(
  packageJson.version !== version,
  `package.json is already at version ${version}`,
);

assert(
  !refExists(['rev-parse', '-q', '--verify', `refs/tags/${tag}`]),
  `Local tag already exists: ${tag}`,
);

assert(
  !refExists(['ls-remote', '--exit-code', '--tags', 'origin', tag]),
  `Remote tag already exists: ${tag}`,
);

packageJson.version = version;
writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

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

run('bun', ['run', 'test']);
run('bun', ['run', 'build']);
run('bun', ['run', 'build:storybook']);
run('npm', ['pack', '--dry-run']);

run('git', ['add', '-A']);
const stagedFiles = read('git', ['diff', '--cached', '--name-only']);
assert(stagedFiles.length > 0, 'No staged changes to commit.');

run('git', ['commit', '-m', `chore: release ${tag}`]);
run('git', ['tag', tag]);
run('git', ['push', 'origin', 'main']);
run('git', ['push', 'origin', tag]);

run('gh', ['release', 'create', tag, '--title', tag, '--notes', `Release ${tag}`]);

let runId;
for (let attempt = 0; attempt < 20; attempt++) {
  await delay(3000);
  const runs = JSON.parse(
    read('gh', [
      'run',
      'list',
      '--workflow',
      'release.yml',
      '--event',
      'release',
      '--json',
      'databaseId,headBranch,event,status,conclusion,displayTitle',
      '--limit',
      '20',
    ]),
  );
  const releaseRun = runs.find((run) => run.headBranch === tag);
  if (releaseRun) {
    runId = String(releaseRun.databaseId);
    break;
  }
}

assert(runId, `Could not find release workflow run for ${tag}`);
run('gh', ['run', 'watch', runId, '--exit-status']);

const finalPublishedVersion = read('npm', ['view', packageJson.name, 'version']);
assert(
  finalPublishedVersion === version,
  `Expected npm version ${version}, got ${finalPublishedVersion}`,
);

console.log(`\nReleased ${packageJson.name}@${version}`);
