import { useHead, usePage, useSite } from '@rspress/core/runtime';
import { version } from '../../package.json';

/** Shared by static rendering and client navigation. */
export default function DiscoveryHead() {
  const { page } = usePage();
  const { site } = useSite();
  const url = `${site.siteOrigin}${site.base.replace(/\/$/, '')}${page.routePath}`;
  const root = `${site.siteOrigin}${site.base}`;
  const title =
    page.title === 'tao-ui'
      ? 'tao-ui — React component library'
      : `${page.title} — tao-ui`;
  const description = page.description || site.description;
  const is404 = page.pageType === '404';

  useHead({
    link: is404
      ? []
      : [
          { rel: 'canonical', href: url },
          {
            rel: 'alternate',
            type: 'text/markdown',
            href: `${url.endsWith('/') ? `${url}index` : url.replace(/\.html$/, '')}.md`,
            title: 'Markdown',
          },
          {
            rel: 'alternate',
            type: 'application/json',
            href: `${root}agent-manifest.json`,
            title: 'tao-ui agent manifest',
          },
        ],
    meta: [
      {
        name: 'robots',
        content: is404 ? 'noindex' : 'index,follow,max-image-preview:large',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'tao-ui' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      {
        property: 'og:locale',
        content: page.lang === 'zh' ? 'zh_CN' : 'en_US',
      },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
    ],
    script: is404
      ? []
      : [
          {
            key: 'tao-ui-structured-data',
            type: 'application/ld+json',
            innerHTML: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  '@id': `${root}#website`,
                  name: 'tao-ui',
                  url: root,
                  inLanguage: ['en', 'zh'],
                },
                {
                  '@type': page.pageType === 'home' ? 'WebPage' : 'TechArticle',
                  '@id': `${url}#page`,
                  url,
                  headline: title,
                  description,
                  inLanguage: page.lang,
                  isPartOf: { '@id': `${root}#website` },
                  about: { '@id': `${root}#software` },
                },
                {
                  '@type': 'SoftwareSourceCode',
                  '@id': `${root}#software`,
                  name: '@rockshin/tao-ui',
                  codeRepository: 'https://github.com/rickyshin93/tao-ui',
                  programmingLanguage: 'TypeScript',
                  runtimePlatform: 'React 18.2 or React 19',
                  version,
                  license: 'https://opensource.org/license/mit',
                  url: root,
                },
              ],
            }).replace(/</g, '\\u003c'),
          },
        ],
  });
  return null;
}
