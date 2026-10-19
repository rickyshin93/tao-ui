import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const rootDir = resolve(__dirname, '..');
export const componentDocsDir = join(rootDir, 'src/docs/components');

function readDocEntry(fileName) {
  const filePath = join(componentDocsDir, fileName);
  const source = readFileSync(filePath, 'utf8');
  const match = source.match(
    /export const (\w+Doc) = ([\s\S]*?\n}) satisfies ComponentDoc;/,
  );

  if (!match) {
    throw new Error(`Could not read component doc object from ${filePath}`);
  }

  return {
    fileName,
    exportName: match[1],
    doc: vm.runInNewContext(`(${match[2]})`, Object.freeze({})),
  };
}

export function readComponentDocEntries() {
  if (!existsSync(componentDocsDir)) {
    throw new Error(`Missing component docs directory: ${componentDocsDir}`);
  }

  return readdirSync(componentDocsDir)
    .filter((fileName) => fileName.endsWith('.doc.ts'))
    .sort()
    .map(readDocEntry)
    .sort((a, b) => a.doc.displayName.localeCompare(b.doc.displayName));
}

export function readComponentDocs() {
  return readComponentDocEntries().map((entry) => entry.doc);
}
