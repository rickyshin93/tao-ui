import { readFile } from 'node:fs/promises';
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const expectedName = '@rockshin/tao-icons';
const blockers = [];
if (pkg.private) blockers.push('package.json private:true still prevents publication');
if (pkg.license !== 'MIT') blockers.push('package.json license must be MIT');
if (pkg.name !== expectedName) blockers.push(`package.json name must be ${expectedName}`);
if (pkg.name.includes('preview')) blockers.push('the provisional preview package name must be replaced');
if (pkg.version.includes('preview')) blockers.push('the release version is still a local preview');
if (blockers.length) {
  console.error('Release blocked:\n- ' + blockers.join('\n- ') + '\nConfirm these decisions and explicit publication authorization before any npm publish. See README.md.');
  process.exitCode = 1;
} else console.log('Package metadata checks passed. This does not authorize publication; run full verification and obtain owner approval.');
