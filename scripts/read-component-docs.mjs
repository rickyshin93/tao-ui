import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const rootDir = resolve(__dirname, '..');
export const componentDocsDir = join(rootDir, 'src/docs/components');

function readDocFile(filePath) {
  const source = readFileSync(filePath, 'utf8');
  const match = source.match(
    /export const \w+Doc = ([\s\S]*?\n}) satisfies ComponentDoc;/,
  );

  if (!match) {
    throw new Error(`Could not read component doc object from ${filePath}`);
  }

  return vm.runInNewContext(`(${match[1]})`, Object.freeze({}));
}

export function readComponentDocs() {
  if (!existsSync(componentDocsDir)) {
    throw new Error(`Missing component docs directory: ${componentDocsDir}`);
  }

  return readdirSync(componentDocsDir)
    .filter((fileName) => fileName.endsWith('.doc.ts'))
    .sort()
    .map((fileName) => readDocFile(join(componentDocsDir, fileName)))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}
