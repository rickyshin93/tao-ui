import assert from 'node:assert/strict';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { rootDir } from './read-component-docs.mjs';

const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
const manifest = JSON.parse(
  readFileSync(join(rootDir, 'component-manifest.json'), 'utf8'),
);
const output = join(rootDir, 'doc_build');
const origin = process.env.RSPRESS_SITE_ORIGIN ?? '';
const base = process.env.RSPRESS_BASE ?? '/';
const site = `${origin}${base}`;
const url = (path) => `${site}${path}`;
const importNames = {
  'tao-provider': 'provider',
  'headless-input-number': 'number-input',
};
const components = manifest.components.map((component) => {
  const entry = importNames[component.name] ?? component.name;
  assert.ok(
    existsSync(join(rootDir, `src/entries/${entry}.ts`)),
    `${component.name}: public entry`,
  );
  return {
    name: component.name,
    displayName: component.displayName,
    description: component.description,
    category: component.category,
    import: `${pkg.name}/${entry}`,
    exports: component.exports,
    docs: {
      en: url(`components/${component.name}`),
      zh: url(`zh/components/${component.name}`),
    },
    markdown: {
      en: url(`components/${component.name}.md`),
      zh: url(`zh/components/${component.name}.md`),
    },
  };
});
const agentManifest = {
  schemaVersion: 1,
  package: {
    name: pkg.name,
    version: pkg.version,
    license: pkg.license,
    peerDependencies: pkg.peerDependencies,
  },
  description:
    'Project-specific discovery index. Read generated Markdown for API tables and runnable examples; installed declarations are authoritative for exact types.',
  repository: 'https://github.com/rickyshin93/tao-ui',
  website: site,
  metadata: url('component-manifest.json'),
  guides: { en: url('guide/agents.md'), zh: url('zh/guide/agents.md') },
  indexes: {
    en: { index: url('llms.txt'), full: url('llms-full.txt') },
    zh: { index: url('zh/llms.txt'), full: url('zh/llms-full.txt') },
  },
  sitemap: url('sitemap.xml'),
  components,
};
writeFileSync(
  join(output, 'agent-manifest.json'),
  `${JSON.stringify(agentManifest, null, 2)}\n`,
);
copyFileSync(
  join(rootDir, 'component-manifest.json'),
  join(output, 'component-manifest.json'),
);

// Keep framework-generated page indexes; add the package contracts to both locales.
for (const lang of ['', 'zh/']) {
  const file = join(output, lang, 'llms.txt');
  const text = readFileSync(file, 'utf8').replace(
    /\n## Package contracts[\s\S]*$/,
    '',
  );
  writeFileSync(
    file,
    `${text.trim()}\n\n## Package contracts\n\n- [Agent discovery index](${url('agent-manifest.json')}): ${pkg.name} ${pkg.version}, imports and bilingual documentation URLs.\n- [Component metadata](${url('component-manifest.json')}): semantic parts, usage guidance and selected props.\n`,
  );
  // Rspress's home Markdown renderer only reads hero frontmatter and leaves
  // action links relative to the host root. Supply the visible package facts
  // and base-aware links for both single-page and full-document readers.
  const homeFile = join(output, lang, 'index.md');
  const home = readFileSync(homeFile, 'utf8');
  const homeText = home
    .replace(/\n## Package contract[\s\S]*$/, '')
    .replace(
      /\]\((\/(?!\/)[^)]+)\)/g,
      (_, href) =>
        `](${origin}${href.startsWith(base) ? href : `${base}${href.slice(1)}`})`,
    );
  const facts = `${homeText.trim()}\n\n## Package contract\n\n- ${pkg.name} ${pkg.version} · ${pkg.license}\n- React: ${pkg.peerDependencies.react}; React DOM: ${pkg.peerDependencies['react-dom']}\n- npm install ${pkg.name}\n- [${lang ? 'AI Agent 接入指南' : 'AI agent guide'}](${url(`${lang}guide/agents.md`)})\n- [JSON discovery](${url('agent-manifest.json')})\n`;
  writeFileSync(homeFile, facts);
  const fullFile = join(output, lang, 'llms-full.txt');
  const full = readFileSync(fullFile, 'utf8');
  assert.ok(
    full.includes(home.trim()),
    `${lang}: home in full Markdown bundle`,
  );
  writeFileSync(fullFile, full.replace(home.trim(), facts.trim()));
}

// Check real generated artifacts, including the non-obvious provider/number-input entries.
const paths = [
  '',
  'zh/',
  'guide/getting-started',
  'zh/guide/getting-started',
  'guide/agents',
  'zh/guide/agents',
  'components/util',
  'zh/components/util',
  ...components.flatMap((c) => [
    `components/${c.name}`,
    `zh/components/${c.name}`,
  ]),
];
const sitemap = readFileSync(join(output, 'sitemap.xml'), 'utf8');
for (const path of paths) {
  const name = path.endsWith('/') || !path ? `${path}index` : path;
  const html = readFileSync(join(output, `${name}.html`), 'utf8');
  const markdown = readFileSync(join(output, `${name}.md`), 'utf8');
  assert.match(html, /<title>[^<]+<\/title>/, `${path}: title`);
  assert.match(
    html,
    /<meta[^>]*name="description"[^>]*content="[^"]+"/,
    `${path}: description`,
  );
  const canonical =
    html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/g) ?? [];
  assert.equal(canonical.length, 1, `${path}: one canonical`);
  assert.ok(
    canonical[0].includes(`href="${url(path)}"`),
    `${path}: canonical URL`,
  );
  assert.ok(html.includes('property="og:title"'), `${path}: social metadata`);
  assert.ok(
    html.includes('hreflang="en"') && html.includes('hreflang="zh"'),
    `${path}: bilingual alternate URLs`,
  );
  const structured = [
    ...html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].map((m) => JSON.parse(m[1]));
  assert.equal(structured.length, 1, `${path}: one JSON-LD graph`);
  assert.equal(
    structured[0]['@graph'][2].version,
    pkg.version,
    `${path}: package version`,
  );
  assert.ok(
    sitemap.includes(`<loc>${url(path)}</loc>`),
    `${path}: sitemap entry`,
  );
  assert.ok(markdown.length > 100, `${path}: readable Markdown`);
  if (!path || path === 'zh/') {
    assert.ok(
      markdown.includes(`${pkg.name} ${pkg.version}`),
      `${path}: home package facts`,
    );
    assert.ok(
      markdown.includes(url(`${path}guide/agents.md`)),
      `${path}: home agent guide`,
    );
  }
  if (path.includes('components/'))
    assert.ok(markdown.includes('```'), `${path}: code examples`);
}
for (const lang of ['', 'zh/']) {
  const index = readFileSync(join(output, lang, 'llms.txt'), 'utf8');
  for (const match of index.matchAll(/\]\(([^)]+)\)/g)) {
    const href = match[1];
    assert.ok(href.startsWith(site), `Index link outside site: ${href}`);
    assert.ok(
      existsSync(join(output, href.slice(site.length))),
      `Broken index link: ${href}`,
    );
  }
}
assert.ok(
  existsSync(join(output, 'llms-full.txt')),
  'Full documentation export',
);
assert.match(
  readFileSync(join(output, '404.html'), 'utf8'),
  /name="robots" content="noindex"/,
  '404 is not indexable',
);
console.log(
  `Discovery passed: ${paths.length} bilingual pages, ${components.length} import contracts, JSON-LD/canonical/hreflang/sitemap/Markdown and llms links.`,
);
