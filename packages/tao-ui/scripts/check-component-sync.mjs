#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
// TypeScript 7 (the native port) no longer ships the JS compiler API that this
// semantic contract check needs (`ts.createProgram`, `ts.sys`, `getTypeChecker`),
// and the `typescript/unstable/*` API is not stable enough to gate CI on. The
// package type-checks and builds with TS 7; this check keeps using the TS 6
// compiler via the `typescript-compiler` alias.
import ts from 'typescript-compiler';
import { readComponentDocs, rootDir } from './read-component-docs.mjs';

const docs = readComponentDocs();
const indexSource = readFileSync(join(rootDir, 'src/index.tsx'), 'utf8');
const violations = [];
const semanticDomExemptions = new Set(['HeadlessInputNumber', 'TaoProvider']);
const tsConfig = ts.readConfigFile(
  join(rootDir, 'tsconfig.json'),
  ts.sys.readFile,
);
const parsedTsConfig = ts.parseJsonConfigFileContent(
  tsConfig.config,
  ts.sys,
  rootDir,
);
const program = ts.createProgram(
  parsedTsConfig.fileNames,
  parsedTsConfig.options,
);
const typeChecker = program.getTypeChecker();
const publicModule = typeChecker.getSymbolAtLocation(
  program.getSourceFile(join(rootDir, 'src/index.tsx')),
);
const publicExports = new Set(
  typeChecker.getExportsOfModule(publicModule).map((symbol) => symbol.name),
);

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

function semanticPartsFromType(node) {
  const type = typeChecker.getTypeFromTypeNode(node);
  const types = type.isUnion() ? type.types : [type];
  return types
    .filter((candidate) => candidate.flags & ts.TypeFlags.StringLiteral)
    .map((candidate) => candidate.value);
}

function exportedDeclaration(sourceFile, exportName, predicate) {
  const moduleSymbol = typeChecker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) return undefined;
  const exportedSymbol = typeChecker
    .getExportsOfModule(moduleSymbol)
    .find((symbol) => symbol.name === exportName);
  if (!exportedSymbol) return undefined;
  const symbol =
    exportedSymbol.flags & ts.SymbolFlags.Alias
      ? typeChecker.getAliasedSymbol(exportedSymbol)
      : exportedSymbol;
  return symbol.declarations?.find(predicate);
}

function checkSemanticContract(doc) {
  if (!doc.semanticParts?.length) {
    if (!semanticDomExemptions.has(doc.displayName)) {
      addViolation(
        doc.displayName,
        'Rendered components must document a SemanticPart contract.',
      );
    }
    return;
  }

  const sourceFile = program.getSourceFile(join(rootDir, doc.source));
  if (!sourceFile) {
    addViolation(doc.displayName, 'Source is missing from TypeScript program.');
    return;
  }
  const semanticTypeName = `${doc.displayName}SemanticPart`;
  const propsTypeName = `${doc.displayName}Props`;
  const semanticType = exportedDeclaration(
    sourceFile,
    semanticTypeName,
    ts.isTypeAliasDeclaration,
  );
  const propsType = exportedDeclaration(
    sourceFile,
    propsTypeName,
    (node) =>
      ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node),
  );

  if (!semanticType) {
    addViolation(doc.displayName, `Missing ${semanticTypeName} type.`);
    return;
  }

  const implementedParts = new Set(semanticPartsFromType(semanticType.type));
  const missingParts = doc.semanticParts.filter(
    (part) => !implementedParts.has(part),
  );
  const undocumentedParts = [...implementedParts].filter(
    (part) => !doc.semanticParts.includes(part),
  );
  if (missingParts.length > 0 || undocumentedParts.length > 0) {
    addViolation(
      doc.displayName,
      `Semantic parts differ from ${semanticTypeName}. Unimplemented: ${
        missingParts.join(', ') || 'none'
      }. Undocumented: ${undocumentedParts.join(', ') || 'none'}.`,
    );
  }

  if (!propsType) {
    addViolation(doc.displayName, `Missing ${propsTypeName} type.`);
    return;
  }

  for (const propName of ['classNames', 'styles']) {
    const member = typeChecker
      .getTypeAtLocation(propsType)
      .getProperty(propName);
    if (!member) {
      addViolation(
        doc.displayName,
        `Missing ${propName} prop for ${semanticTypeName}.`,
      );
    }
  }
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
    if (!publicExports.has(exportName)) {
      addViolation(
        doc.displayName,
        `Documented export "${exportName}" is not exported from src/index.tsx.`,
      );
    }
  }

  checkSemanticContract(doc);
}

if (violations.length > 0) {
  console.error(`Found ${violations.length} component sync issue(s):\n`);

  for (const violation of violations) {
    console.error(`- ${violation.scope}: ${violation.message}`);
  }

  process.exit(1);
}

console.log(`Component sync is clean (${docs.length} docs checked).`);
