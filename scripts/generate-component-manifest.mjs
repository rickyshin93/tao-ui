#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readComponentDocs, rootDir } from './read-component-docs.mjs';

const docs = readComponentDocs();
const generatedAt = new Date().toISOString();

const manifest = {
  schemaVersion: 1,
  packageName: '@rockshin/tao-ui',
  generatedAt,
  components: docs,
};

function categoryGroups() {
  const groups = new Map();

  for (const doc of docs) {
    const entries = groups.get(doc.category) ?? [];
    entries.push(doc.displayName);
    groups.set(doc.category, entries);
  }

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function renderLlmsTxt() {
  const lines = [
    '# @rockshin/tao-ui',
    '',
    '> A modern React 19 component library with semantic DOM customization and OKLCH-based theming.',
    '',
    '## Install',
    '',
    '```bash',
    'npm install @rockshin/tao-ui',
    '```',
    '',
    'Peer dependencies: `react >=19`, `react-dom >=19`, `dayjs >=1.11`.',
    'Import from the package root. The package entry imports tao-ui CSS side effects automatically.',
    '',
    '## Core Concepts',
    '',
    '- `TaoProvider` supplies size, disabled, variant, portal scope, and theme seed token defaults.',
    '- Components expose semantic DOM customization through `classNames` and `styles` props.',
    '- Theme tokens are CSS custom properties prefixed with `--tao-*`; use `tokenVar(name)` and `taoTokenNames` from the package root for typed token references.',
    '- `componentDocs` and `getComponentDoc(name)` expose machine-readable component metadata.',
    '',
    '## Component Groups',
    '',
  ];

  for (const [category, names] of categoryGroups()) {
    lines.push(`- ${category}: ${names.join(', ')}`);
  }

  lines.push('', '## Components', '');

  for (const doc of docs) {
    lines.push(
      `### ${doc.displayName}`,
      '',
      doc.description,
      '',
      `- Category: ${doc.category}`,
      `- Exports: ${doc.exports.map((name) => `\`${name}\``).join(', ')}`,
      `- Source: \`${doc.source}\``,
    );

    if (doc.story) {
      lines.push(`- Storybook: \`${doc.story}\``);
    }

    if (doc.tests.length > 0) {
      lines.push(
        `- Tests: ${doc.tests.map((testPath) => `\`${testPath}\``).join(', ')}`,
      );
    }

    if (doc.semanticParts?.length) {
      lines.push(
        `- Semantic parts: ${doc.semanticParts.map((part) => `\`${part}\``).join(', ')}`,
      );
    }

    lines.push('', doc.usage.description, '');
  }

  lines.push(
    '## Notes For Code Generation',
    '',
    '- Prefer root imports from `@rockshin/tao-ui`.',
    '- Customize internals through semantic `classNames` and `styles`, not private class names.',
    '- Prefer provider-level defaults for app-wide size, disabled, variant, and theme choices.',
    '- Use `Modal.useModal()` inside React components so dialogs inherit the surrounding provider context.',
    '',
  );

  return `${lines.join('\n').trim()}\n`;
}

writeFileSync(
  join(rootDir, 'component-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
writeFileSync(join(rootDir, 'llms.txt'), renderLlmsTxt());

console.log(
  `Generated component-manifest.json and llms.txt from ${docs.length} component docs.`,
);
