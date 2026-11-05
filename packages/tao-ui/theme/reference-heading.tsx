import { useLang, usePage } from '@rspress/core/runtime';
import { FallbackHeading as OriginalHeading } from '@rspress/core/theme-original';
import type { ComponentProps } from 'react';
import enMeta from '../docs/en/components/_meta.json';
import zhMeta from '../docs/zh/components/_meta.json';

export function FallbackHeading(props: ComponentProps<typeof OriginalHeading>) {
  const { page } = usePage();
  const zh = useLang() === 'zh';
  const name = page.routePath.match(/\/components\/([^/]+?)(?:\.html)?$/)?.[1];
  const meta = zh ? zhMeta : enMeta;
  const index = meta.findIndex((item) => item.name === name);

  if (!name || props.level !== 1 || index < 0)
    return <OriginalHeading {...props} />;

  const category = meta
    .slice(0, index)
    .reverse()
    .find((item) => item.type === 'section-header')?.label;
  const links = page.toc.filter(
    (heading) =>
      heading.text === 'API' || heading.text === (zh ? '代码演示' : 'Examples'),
  );

  return (
    <header className="tao-reference-heading">
      <OriginalHeading {...props} />
      <div className="tao-reference-context rp-not-doc">
        <div className="tao-reference-category">
          <span>{category}</span>
          <code>@rockshin/tao-ui</code>
        </div>
        {links.length > 0 && (
          <nav aria-label={zh ? '组件快捷导航' : 'Component shortcuts'}>
            {links.map((heading) => (
              <a key={heading.id} href={`#${heading.id}`}>
                {heading.text}
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 3v10m-4-4 4 4 4-4" />
                </svg>
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
