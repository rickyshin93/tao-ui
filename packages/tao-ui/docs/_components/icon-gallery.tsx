import {
  Button,
  enUS,
  Input,
  Pagination,
  Select,
  TaoProvider,
  zhCN,
} from '@rockshin/tao-ui';
import { useDark } from '@rspress/core/runtime';
import { useEffect, useId, useRef, useState } from 'react';
import manifest from '../../../icons/data/manifest.json';
import * as icons from '../../../icons/src/index';
import galleryCategories from './icon-gallery-categories.json';
import './icon-gallery.css';

type Locale = 'en' | 'zh';
const pageSize = 96;
const previewSize = 6;

const categoryByName = new Map(
  galleryCategories.groups.flatMap(({ id, names }) =>
    names.map((name) => [name, id] as const),
  ),
);
const catalog = manifest.icons.map((icon) => ({
  ...icon,
  galleryCategory: categoryByName.get(icon.name) ?? icon.category,
}));
const categories = new Map(
  [...manifest.categories, ...galleryCategories.groups].map((group) => [
    group.id,
    group,
  ]),
);
const groups = [...categories.values()]
  .map(({ id, label, labelZh }) => ({
    id,
    label,
    labelZh,
    icons: catalog.filter((icon) => icon.galleryCategory === id),
  }))
  .filter((group) => group.icons.length > 0);

export function IconGallery({ locale }: { locale: Locale }) {
  const dark = useDark();
  const [interactive, setInteractive] = useState(false);
  useEffect(() => {
    // Rspress also renders Markdown in a DOM without browser element classes.
    setInteractive(typeof HTMLElement !== 'undefined');
  }, []);
  const galleryRef = useRef<HTMLDivElement>(null);
  const searchId = useId();
  const categoryId = useId();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState('');
  const zh = locale === 'zh';
  const search = query.trim().toLowerCase();
  const browseByCategory = category === 'all' && !search;
  const results = catalog.filter(
    (icon) =>
      (category === 'all' || icon.galleryCategory === category) &&
      [icon.name, icon.component, icon.label, icon.labelZh, ...icon.tags].some(
        (value) => value.toLowerCase().includes(search),
      ),
  );

  const visibleIcons = results.slice((page - 1) * pageSize, page * pageSize);

  function selectCategory(value: string) {
    setCategory(value);
    setPage(1);
  }

  async function copy(component: string) {
    try {
      await navigator.clipboard.writeText(
        `import { ${component} } from '@rockshin/tao-icons';`,
      );
      setNotice(
        zh
          ? `已复制 ${component} 的导入语句`
          : `Copied import for ${component}`,
      );
    } catch {
      setNotice(
        zh
          ? '复制失败，请手动复制图标名称。'
          : 'Copy failed. Please copy the icon name manually.',
      );
    }
  }

  function renderGrid(entries: typeof catalog) {
    return (
      <div className="icon-gallery-grid">
        {entries.map((icon) => {
          const Icon = icons[icon.component as keyof typeof icons];
          return (
            <button
              type="button"
              key={icon.name}
              onClick={() => void copy(icon.component)}
              title={
                zh
                  ? `复制 ${icon.component} 导入语句`
                  : `Copy ${icon.component} import`
              }
            >
              <Icon size={26} />
              <span>{icon.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="icon-gallery" ref={galleryRef}>
      {interactive && (
        <TaoProvider
          locale={zh ? zhCN : enUS}
          theme={{ mode: dark ? 'dark' : 'light' }}
        >
          <div className="icon-gallery-controls">
            <div className="icon-gallery-field">
              <label htmlFor={searchId}>
                {zh ? '搜索图标' : 'Search icons'}
              </label>
              <Input
                id={searchId}
                type="search"
                size="large"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder={zh ? '名称、关键词…' : 'Name or keyword…'}
                style={{ width: '100%' }}
              />
            </div>
            <div className="icon-gallery-field">
              <label htmlFor={categoryId}>{zh ? '分类' : 'Category'}</label>
              <Select
                id={categoryId}
                aria-label={zh ? '分类' : 'Category'}
                size="large"
                value={category}
                onChange={(value) => selectCategory(value as string)}
                style={{ width: '100%' }}
                options={[
                  { value: 'all', label: zh ? '全部分类' : 'All categories' },
                  ...groups.map((item) => ({
                    value: item.id,
                    label: zh ? item.labelZh : item.label,
                  })),
                ]}
              />
            </div>
          </div>
        </TaoProvider>
      )}
      <div className="icon-gallery-meta">
        <span>
          {zh
            ? `${results.length} / ${manifest.count} 个图标`
            : `${results.length} / ${manifest.count} icons`}
        </span>
        <span role="status" aria-live="polite">
          {notice}
        </span>
      </div>
      {browseByCategory ? (
        <div className="icon-gallery-groups">
          {groups.map((group) => {
            const label = zh ? group.labelZh : group.label;
            return (
              <section key={group.id} aria-labelledby={searchId + group.id}>
                <div className="icon-gallery-group-header">
                  <h3 id={searchId + group.id}>{label}</h3>
                  <span>
                    {zh
                      ? group.icons.length + ' 个'
                      : group.icons.length + ' icons'}
                  </span>
                  {interactive && group.icons.length > previewSize && (
                    <TaoProvider
                      locale={zh ? zhCN : enUS}
                      theme={{ mode: dark ? 'dark' : 'light' }}
                    >
                      <Button
                        size="small"
                        variant="secondary"
                        aria-label={
                          zh
                            ? '查看全部' + label + '图标'
                            : 'View all ' + label + ' icons'
                        }
                        onClick={() => {
                          selectCategory(group.id);
                          galleryRef.current?.scrollIntoView({
                            block: 'start',
                          });
                        }}
                      >
                        {zh ? '查看全部' : 'View all'}
                      </Button>
                    </TaoProvider>
                  )}
                </div>
                {renderGrid(group.icons.slice(0, previewSize))}
              </section>
            );
          })}
        </div>
      ) : results.length ? (
        renderGrid(visibleIcons)
      ) : (
        <p>
          {zh
            ? '没有匹配的图标，请尝试其他关键词。'
            : 'No matching icons. Try another search.'}
        </p>
      )}
      {!browseByCategory && results.length > pageSize && (
        <TaoProvider
          locale={zh ? zhCN : enUS}
          theme={{ mode: dark ? 'dark' : 'light' }}
        >
          <Pagination
            className="icon-gallery-pagination"
            current={page}
            pageSize={pageSize}
            total={results.length}
            onChange={setPage}
            showSizeChanger={false}
            size="small"
          />
        </TaoProvider>
      )}
    </div>
  );
}
