#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readComponentDocs, rootDir } from './read-component-docs.mjs';

const docs = readComponentDocs();
const indexSource = readFileSync(join(rootDir, 'src/index.tsx'), 'utf8');
const violations = [];

const ignoredValueExports = new Set([
  'cx',
  'componentDocs',
  'getComponentDoc',
  'taoTokenNames',
  'taoTokenVars',
  'tokenVar',
  'useNumberInput',
  'useTaoConfig',
]);

function addViolation(scope, message) {
  violations.push({ scope, message });
}

function pathExists(relativePath) {
  return existsSync(join(rootDir, relativePath));
}

function parseValueExports() {
  const values = new Set();
  const exportBlocks = indexSource.matchAll(
    /export\s*\{([\s\S]*?)\}\s*from\s*["'][^"']+["'];/g,
  );

  for (const block of exportBlocks) {
    for (const rawPart of block[1].split(',')) {
      const line = rawPart.replace(/\/\/.*$/, '').trim();

      if (line === '' || line.startsWith('type ')) {
        continue;
      }

      const exportedName = line
        .split(/\s+as\s+/)
        .at(-1)
        ?.trim();

      if (exportedName && /^[A-Z]/.test(exportedName)) {
        values.add(exportedName);
      }
    }
  }

  return values;
}

const documentedExports = new Set(docs.flatMap((doc) => doc.exports));
const valueExports = parseValueExports();

for (const exportName of valueExports) {
  if (ignoredValueExports.has(exportName)) {
    continue;
  }

  if (!documentedExports.has(exportName)) {
    addViolation(
      'src/index.tsx',
      `Export "${exportName}" is missing from component docs.`,
    );
  }
}

for (const doc of docs) {
  if (!doc.name || !doc.displayName || !doc.description) {
    addViolation(
      doc.name || '(unknown)',
      'Doc must include name, displayName, and description.',
    );
  }

  if (!pathExists(doc.source)) {
    addViolation(doc.displayName, `Missing source file: ${doc.source}`);
  }

  if (doc.story && !pathExists(doc.story)) {
    addViolation(doc.displayName, `Missing Storybook story: ${doc.story}`);
  }

  for (const testPath of doc.tests ?? []) {
    if (!pathExists(testPath)) {
      addViolation(doc.displayName, `Missing test file: ${testPath}`);
    }
  }

  for (const exportName of doc.exports) {
    if (!indexSource.includes(exportName)) {
      addViolation(
        doc.displayName,
        `Documented export "${exportName}" is not exported from src/index.tsx.`,
      );
    }
  }
}

if (violations.length > 0) {
  console.error(`Found ${violations.length} component sync issue(s):\n`);

  for (const violation of violations) {
    console.error(`- ${violation.scope}: ${violation.message}`);
  }

  process.exit(1);
}

console.log(`Component sync is clean (${docs.length} docs checked).`);
