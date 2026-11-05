/* Home direction: component specimen book, landing cut (code-led, Motion).
 * THESIS: real components prove the claims; one seed retunes everything.
 * OWN-WORLD: neutral proof paper, hairlines, a Pantone-style seed chip; the seed is the
 *   only hue and floods the headline, floating specimens, phone and tester.
 * STORY: hero of live floating components -> one-seed theming -> semantic parts ->
 *   everyday details -> index -> mobile drawers in a real phone -> install.
 * FORM: type-foundry specimen sheet (candidate 5), seed key 4caf06d0.
 */
import {
  Button,
  CheckableTag,
  Checkbox,
  Input,
  Segmented,
  Select,
  Slider,
  Switch,
  TaoProvider,
  zhCN,
} from '@rockshin/tao-ui';
import { useDark, useFrontmatter, useLang } from '@rspress/core/runtime';
import { Link } from '@rspress/core/theme';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import enMeta from '../en/components/_meta.json';
import zhMeta from '../zh/components/_meta.json';
import { CopyButton } from './copy-button';
import { HomeBento } from './home-bento';
import { HomeMobile } from './home-mobile';
import { HomeResize } from './home-resize';

type Size = 'small' | 'medium' | 'large';
type Part = 'root' | 'prefix' | 'input' | 'suffix';

const ease = [0.16, 1, 0.3, 1] as const;

const seeds = [
  {
    id: 'cobalt',
    zh: '钴蓝',
    en: 'Cobalt',
    light: 'oklch(0.5 0.19 258)',
    dark: 'oklch(0.74 0.13 255)',
  },
  {
    id: 'vermilion',
    zh: '朱砂',
    en: 'Vermilion',
    light: 'oklch(0.55 0.19 32)',
    dark: 'oklch(0.74 0.14 34)',
  },
  {
    id: 'teal',
    zh: '青碧',
    en: 'Teal',
    light: 'oklch(0.5 0.09 195)',
    dark: 'oklch(0.78 0.1 192)',
  },
  {
    id: 'ochre',
    zh: '赭石',
    en: 'Ochre',
    light: 'oklch(0.55 0.13 60)',
    dark: 'oklch(0.8 0.12 70)',
  },
  {
    id: 'moss',
    zh: '苔绿',
    en: 'Moss',
    light: 'oklch(0.5 0.11 145)',
    dark: 'oklch(0.79 0.13 145)',
  },
  {
    id: 'ink',
    zh: '墨',
    en: 'Ink',
    light: 'oklch(0.24 0.01 260)',
    dark: 'oklch(0.92 0.005 260)',
  },
];

const heights: Record<Size, number> = { small: 28, medium: 32, large: 36 };

const derived = [
  ['primary', '--tao-primary'],
  ['hover', '--tao-primary-hover'],
  ['active', '--tao-primary-active'],
  ['bg', '--tao-primary-bg'],
  ['border', '--tao-primary-border'],
] as const;

const highlights = {
  zh: [
    'OKLCH 种子主题',
    '深色模式穿透浮层',
    '语义 DOM',
    'llms.txt 与组件清单',
    '按组件引入',
    'React 18.2 / 19',
    '中英文 locale',
    '紧凑密度',
    'TypeScript',
    'Select 移动端抽屉',
    'DatePicker 移动端抽屉',
    '多选草稿确认',
    '44px 触控目标',
  ],
  en: [
    'OKLCH seed theming',
    'Dark mode in popups',
    'Semantic DOM',
    'llms.txt and manifest',
    'Component imports',
    'React 18.2 / 19',
    'English and Chinese locales',
    'Compact density',
    'TypeScript',
    'Mobile Select drawer',
    'Mobile DatePicker drawer',
    'Draft-then-Done multi-select',
    '44px touch targets',
  ],
};

type MetaEntry = { type: string; label: string; name?: string };

function groupMeta(meta: MetaEntry[]) {
  const groups: {
    title: string;
    items: { path: string; name: string; label: string }[];
  }[] = [];
  for (const entry of meta) {
    if (entry.type === 'section-header') {
      groups.push({ title: entry.label, items: [] });
    } else if (entry.name) {
      const [name, ...rest] = entry.label.split(' ');
      groups
        .at(-1)
        ?.items.push({ path: entry.name, name, label: rest.join(' ') });
    }
  }
  return groups;
}

function Arrow() {
  return (
    <svg
      className="tao-home-arrow"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 10h12m-5-5 5 5-5 5" />
    </svg>
  );
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function HomePage() {
  const zh = useLang() === 'zh';
  const dark = useDark();
  const { frontmatter } = useFrontmatter();
  const hero = frontmatter.hero!;
  if (!hero.text) {
    throw new Error('The home page requires hero.text in its frontmatter.');
  }
  const prefix = zh ? '/zh' : '';
  const reduced = useReducedMotion();

  const [seedIndex, setSeedIndex] = useState(0);
  const [radius, setRadius] = useState(6);
  const [size, setSize] = useState<Size>('medium');
  const [stageDark, setStageDark] = useState(dark);
  const [touched, setTouched] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [inView, setInView] = useState({ hero: true, tester: false });
  const heroRef = useRef<HTMLElement>(null);
  const testerRef = useRef<HTMLElement>(null);

  const [published, setPublished] = useState<'idle' | 'loading' | 'done'>(
    'idle',
  );
  const [handle, setHandle] = useState('tao-ui');
  const [framework, setFramework] = useState<string | undefined>('react');
  const [alerts, setAlerts] = useState(true);
  const [checks, setChecks] = useState({ a11y: true, rtl: false });
  const [topics, setTopics] = useState(['design', 'code']);
  const [volume, setVolume] = useState(64);
  const [range, setRange] = useState('week');
  const [part, setPart] = useState<Part>('prefix');

  useEffect(() => setStageDark(dark), [dark]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        setInView((current) => {
          const next = { ...current };
          for (const entry of entries) {
            next[entry.target === heroRef.current ? 'hero' : 'tester'] =
              entry.isIntersecting;
          }
          return next;
        }),
      { threshold: 0.3 },
    );
    observer.observe(heroRef.current!);
    observer.observe(testerRef.current!);
    return () => observer.disconnect();
  }, []);

  const cycling =
    !touched && !hovering && (inView.hero || inView.tester) && !reduced;
  useEffect(() => {
    if (!cycling) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setSeedIndex((index) => (index + 1) % seeds.length);
      }
    }, 2800);
    return () => window.clearInterval(timer);
  }, [cycling]);

  useEffect(() => {
    if (published !== 'loading') return;
    const timer = window.setTimeout(() => setPublished('done'), 900);
    return () => window.clearTimeout(timer);
  }, [published]);

  const seed = seeds[seedIndex];
  const pageSeed = dark ? seed.dark : seed.light;
  const stageSeed = stageDark ? seed.dark : seed.light;
  const providerLine = `<TaoProvider size="${size}" theme={{ mode: '${stageDark ? 'dark' : 'light'}', token: { colorPrimary: '${stageSeed}', borderRadius: ${radius} } }}>`;
  const providerCode = `<TaoProvider\n  size="${size}"\n  theme={{\n    mode: '${stageDark ? 'dark' : 'light'}',\n    token: {\n      colorPrimary: '${stageSeed}',\n      borderRadius: ${radius},\n    },\n  }}\n>`;
  const groups = groupMeta((zh ? zhMeta : enMeta) as MetaEntry[]);
  const componentCount = groups.reduce(
    (sum, group) => sum + group.items.length,
    0,
  );
  const ticker = zh ? highlights.zh : highlights.en;

  const parts: { id: Part; zh: string; en: string }[] = [
    {
      id: 'root',
      zh: '外层容器：边框、圆角、尺寸与状态。',
      en: 'Outer frame: border, radius, size and state.',
    },
    {
      id: 'prefix',
      zh: '前缀：图标、协议或单位。',
      en: 'Prefix: an icon, protocol or unit.',
    },
    {
      id: 'input',
      zh: '原生 input：文字、光标与选区。',
      en: 'The native input: text, caret and selection.',
    },
    {
      id: 'suffix',
      zh: '后缀：清除、计数或补全。',
      en: 'Suffix: clear, count or completion.',
    },
  ];
  const partClass = (id: Part) => (part === id ? 'tao-anatomy-on' : undefined);

  return (
    <main
      className="tao-home"
      style={{ '--home-seed': pageSeed } as CSSProperties}
    >
      <section
        ref={heroRef}
        className="tao-hero"
        aria-labelledby="tao-home-title"
      >
        <div className="tao-hero-copy">
          <h1 id="tao-home-title">
            {hero.text.split('\n').map((line, index) => (
              <span key={line} className="tao-hero-line">
                <motion.span
                  className={index === 1 ? 'tao-home-title-accent' : undefined}
                  initial={{ y: '108%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 1, delay: 0.1 + index * 0.12, ease }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.div
            className="tao-hero-lede"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease }}
          >
            <p>{hero.tagline}</p>
            <div className="tao-home-actions">
              {hero.actions?.map((action) => (
                <Link
                  key={action.link}
                  href={action.link}
                  className={`tao-home-link tao-home-link--${action.theme}`}
                >
                  {action.text}
                  <Arrow />
                </Link>
              ))}
            </div>
            <div className="tao-install">
              <code>
                <span aria-hidden="true">$ </span>npm install @rockshin/tao-ui
              </code>
              <CopyButton
                text="npm install @rockshin/tao-ui"
                label={zh ? '复制' : 'Copy'}
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.55, ease }}
        >
          <HomeResize seed={pageSeed} />
        </motion.div>
      </section>

      <div className="tao-marquee">
        <motion.ul
          aria-label={zh ? '亮点' : 'Highlights'}
          animate={reduced ? undefined : { x: ['0%', '-50%'] }}
          transition={{
            duration: 46,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
        >
          {[...ticker, ...ticker].map((item, index) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: the list is duplicated for a seamless loop
              key={index}
              aria-hidden={index >= ticker.length || undefined}
            >
              <svg viewBox="0 0 8 8" aria-hidden="true">
                <circle cx="4" cy="4" r="3" />
              </svg>
              {item}
            </li>
          ))}
        </motion.ul>
      </div>

      <section className="tao-theme" aria-labelledby="tao-theme-title">
        <Reveal className="tao-section-head">
          <h2 id="tao-theme-title">
            {zh ? '一处配置，整套主题。' : 'One configuration. One theme.'}
          </h2>
          <p>
            {zh
              ? '下面每一种颜色都只来自一个 colorPrimary。悬停、按下、浅底与描边由 CSS 原生派生，没有运行时计算；圆角、尺寸与深浅色也通过 TaoProvider 一起调整。'
              : 'Every colour below comes from a single colorPrimary. Hover, pressed, tint and border are derived natively in CSS with no runtime; radius, size and appearance move together through TaoProvider.'}
          </p>
        </Reveal>

        <TaoProvider
          locale={zh ? zhCN : undefined}
          size={size}
          theme={{
            mode: stageDark ? 'dark' : 'light',
            token: { colorPrimary: stageSeed, borderRadius: radius },
          }}
        >
          <motion.section
            ref={testerRef}
            className="tao-tester"
            aria-label={zh ? '主题样本台' : 'Theme specimen'}
            onPointerDown={() => setTouched(true)}
            onFocus={() => setTouched(true)}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 1, ease }}
          >
            <div className="tao-chip">
              <div className="tao-chip-field">
                <div>
                  <span>{zh ? '种子色' : 'Seed'}</span>
                  <span>colorPrimary</span>
                </div>
                <span className="tao-chip-note" aria-live="polite">
                  {cycling
                    ? zh
                      ? '自动轮播 · 点击接管'
                      : 'Cycling · click to take over'
                    : null}
                </span>
              </div>
              <div className="tao-chip-card">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={seed.id + String(stageDark)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.45, ease }}
                  >
                    <p className="tao-chip-name">
                      {zh ? seed.zh : seed.en}
                      <span>{zh ? seed.en : null}</span>
                    </p>
                    <code className="tao-chip-value">{stageSeed}</code>
                  </motion.div>
                </AnimatePresence>
                <ul
                  className="tao-chip-derived"
                  aria-label={zh ? '自动派生' : 'Derived tokens'}
                >
                  {derived.map(([name, variable]) => (
                    <li key={name}>
                      <span style={{ background: `var(${variable})` }} />
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="tao-tester-body">
              <div className="tao-axes">
                <div
                  className="tao-axis tao-axis--seeds"
                  role="radiogroup"
                  aria-labelledby="tao-seed-label"
                >
                  <span id="tao-seed-label">{zh ? '色卡' : 'Seed'}</span>
                  <div className="tao-swatches">
                    {seeds.map((item, index) => (
                      <label
                        key={item.id}
                        className="tao-swatch"
                        title={zh ? item.zh : item.en}
                      >
                        <input
                          type="radio"
                          name="home-seed"
                          checked={index === seedIndex}
                          onChange={() => {
                            setTouched(true);
                            setSeedIndex(index);
                          }}
                        />
                        <span
                          style={{
                            background: stageDark ? item.dark : item.light,
                          }}
                        />
                        {index === seedIndex ? (
                          <motion.i
                            layoutId="tao-swatch-ring"
                            className="tao-swatch-ring"
                            transition={{
                              type: 'spring',
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        ) : null}
                        <span className="tao-visually-hidden">
                          {zh ? item.zh : item.en}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="tao-axis tao-axis--radius">
                  <span id="tao-radius-label">{zh ? '圆角' : 'Radius'}</span>
                  <Slider
                    min={0}
                    max={16}
                    value={radius}
                    onChange={setRadius}
                    ariaLabelledByForHandle="tao-radius-label"
                    tooltip={{ open: false }}
                  />
                  <output>{radius}px</output>
                </div>
                <div className="tao-axis">
                  <span id="tao-size-label">{zh ? '尺寸' : 'Size'}</span>
                  <Segmented
                    aria-labelledby="tao-size-label"
                    value={size}
                    onChange={(value) => setSize(value as Size)}
                    options={[
                      { label: zh ? '小' : 'S', value: 'small' },
                      { label: zh ? '中' : 'M', value: 'medium' },
                      { label: zh ? '大' : 'L', value: 'large' },
                    ]}
                  />
                </div>
                <div className="tao-axis">
                  <span id="tao-mode-label">{zh ? '明暗' : 'Mode'}</span>
                  <Segmented
                    aria-labelledby="tao-mode-label"
                    value={stageDark ? 'dark' : 'light'}
                    onChange={(value) => setStageDark(value === 'dark')}
                    options={[
                      { label: zh ? '浅' : 'Light', value: 'light' },
                      { label: zh ? '深' : 'Dark', value: 'dark' },
                    ]}
                  />
                </div>
              </div>

              <div className="tao-specimens">
                <Specimen
                  index={0}
                  name="Button"
                  spec={`h${heights[size]} · r${radius}`}
                >
                  <div className="tao-specimen-row">
                    <Button
                      loading={published === 'loading'}
                      onClick={() =>
                        setPublished(published === 'done' ? 'idle' : 'loading')
                      }
                    >
                      {published === 'done'
                        ? zh
                          ? '已发布'
                          : 'Published'
                        : zh
                          ? '发布'
                          : 'Publish'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setPublished('idle')}
                    >
                      {zh ? '撤回' : 'Undo'}
                    </Button>
                  </div>
                </Specimen>
                <Specimen index={1} name="Input" spec="prefix">
                  <Input
                    aria-label={zh ? '用户名' : 'Handle'}
                    prefix="@"
                    value={handle}
                    onChange={(event) => setHandle(event.target.value)}
                    style={{ width: '100%' }}
                  />
                </Specimen>
                <Specimen index={2} name="Select" spec="showSearch">
                  <Select
                    aria-label={zh ? '框架' : 'Framework'}
                    value={framework}
                    onChange={(value) => setFramework(value as string)}
                    showSearch
                    style={{ width: '100%' }}
                    options={[
                      { label: 'React', value: 'react' },
                      { label: 'Next.js', value: 'next' },
                      { label: 'Remix', value: 'remix' },
                      { label: 'Astro', value: 'astro' },
                    ]}
                  />
                </Specimen>
                <Specimen index={3} name="Switch" spec={alerts ? 'on' : 'off'}>
                  <div className="tao-specimen-row tao-specimen-label">
                    <Switch
                      id="tao-alerts"
                      aria-labelledby="tao-alerts-label"
                      checked={alerts}
                      onChange={setAlerts}
                    />
                    <label id="tao-alerts-label" htmlFor="tao-alerts">
                      {zh ? '发布后通知我' : 'Notify me'}
                    </label>
                  </div>
                </Specimen>
                <Specimen
                  index={4}
                  name="Checkbox"
                  spec={`${Object.values(checks).filter(Boolean).length} / 2`}
                >
                  <div className="tao-specimen-stack">
                    <Checkbox
                      checked={checks.a11y}
                      onChange={(event) =>
                        setChecks({ ...checks, a11y: event.target.checked })
                      }
                    >
                      {zh ? '无障碍检查' : 'Accessibility'}
                    </Checkbox>
                    <Checkbox
                      checked={checks.rtl}
                      onChange={(event) =>
                        setChecks({ ...checks, rtl: event.target.checked })
                      }
                    >
                      {zh ? '从右到左' : 'Right-to-left'}
                    </Checkbox>
                  </div>
                </Specimen>
                <Specimen index={5} name="Tag" spec="checkable">
                  <div className="tao-specimen-row tao-specimen-wrap">
                    {[
                      ['design', zh ? '设计' : 'Design'],
                      ['code', zh ? '开发' : 'Code'],
                      ['docs', zh ? '文档' : 'Docs'],
                    ].map(([value, label]) => (
                      <CheckableTag
                        key={value}
                        checked={topics.includes(value)}
                        onChange={(on) =>
                          setTopics(
                            on
                              ? [...topics, value]
                              : topics.filter((topic) => topic !== value),
                          )
                        }
                      >
                        {label}
                      </CheckableTag>
                    ))}
                  </div>
                </Specimen>
                <Specimen index={6} name="Slider" spec={`${volume}`}>
                  <Slider
                    value={volume}
                    onChange={setVolume}
                    ariaLabelForHandle={zh ? '音量' : 'Volume'}
                    tooltip={{ open: false }}
                  />
                </Specimen>
                <Specimen index={7} name="Segmented" spec={range}>
                  <Segmented
                    aria-label={zh ? '时间范围' : 'Range'}
                    value={range}
                    onChange={(value) => setRange(value as string)}
                    options={[
                      { label: zh ? '日' : 'Day', value: 'day' },
                      { label: zh ? '周' : 'Week', value: 'week' },
                      { label: zh ? '月' : 'Month', value: 'month' },
                    ]}
                  />
                </Specimen>
              </div>

              <div className="tao-tester-code">
                <pre>
                  <code>{providerLine}</code>
                </pre>
                <CopyButton
                  text={providerCode}
                  label={zh ? '复制配置' : 'Copy config'}
                />
              </div>
            </div>
          </motion.section>
        </TaoProvider>
      </section>

      <section className="tao-anatomy" aria-labelledby="tao-anatomy-title">
        <Reveal className="tao-anatomy-copy">
          <h2 id="tao-anatomy-title">
            {zh ? '每个部件，都有名字。' : 'Every part has a name.'}
          </h2>
          <p>
            {zh
              ? '用类型化的 classNames 与 styles 定制需要的语义部件。同样的名字写进 component-manifest.json 与 llms.txt，人和智能体读的是同一份契约。'
              : 'Typed classNames and styles target the semantic parts you need. The same names ship in component-manifest.json and llms.txt, so people and agents read one contract.'}
          </p>
          <div className="tao-parts">
            {parts.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={part === item.id}
                className="tao-part"
                onClick={() => setPart(item.id)}
                onMouseEnter={() => setPart(item.id)}
                onFocus={() => setPart(item.id)}
              >
                {part === item.id ? (
                  <motion.span
                    layoutId="tao-part-bg"
                    className="tao-part-bg"
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  />
                ) : null}
                <code>{item.id}</code>
                <span>{zh ? item.zh : item.en}</span>
              </button>
            ))}
          </div>
        </Reveal>
        <Reveal className="tao-anatomy-proof" delay={0.1}>
          <TaoProvider
            size="large"
            theme={{
              mode: dark ? 'dark' : 'light',
              token: { colorPrimary: pageSeed, borderRadius: radius },
            }}
          >
            <div className="tao-anatomy-stage">
              <Input
                aria-label={zh ? '站点地址' : 'Site address'}
                prefix="https://"
                suffix=".dev"
                defaultValue="tao-ui"
                classNames={{
                  root: partClass('root'),
                  prefix: partClass('prefix'),
                  input: partClass('input'),
                  suffix: partClass('suffix'),
                }}
                style={{ width: '100%', maxWidth: 420 }}
              />
            </div>
          </TaoProvider>
          <pre className="tao-anatomy-code">
            <code>
              <span>{'<Input'}</span>
              <span>{'  prefix="https://"'}</span>
              <span>{'  suffix=".dev"'}</span>
              <span>{'  classNames={{'}</span>
              {parts.map((item) => (
                <span key={item.id} data-active={part === item.id || undefined}>
                  {`    ${item.id}: '${item.id === 'root' ? 'field' : `field-${item.id}`}',`}
                </span>
              ))}
              <span>{'  }}'}</span>
              <span>{'/>'}</span>
            </code>
          </pre>
        </Reveal>
      </section>

      <HomeBento seed={seed} dark={dark} />

      <HomeMobile seed={pageSeed} />

      <section className="tao-close" aria-labelledby="tao-close-title">
        <motion.h2
          id="tao-close-title"
          className="tao-close-title"
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, margin: '-10%' }}
          transition={{ staggerChildren: 0.12 }}
        >
          {(zh ? ['装上，', '就能开始。'] : ['Install.', 'Begin.']).map(
            (line, index) => (
              <span key={line} className="tao-hero-line">
                <motion.span
                  className={index === 1 ? 'tao-home-title-accent' : undefined}
                  variants={{ hidden: { y: '108%' }, shown: { y: '0%' } }}
                  transition={{ duration: 1, ease }}
                >
                  {line}
                </motion.span>
              </span>
            ),
          )}
        </motion.h2>
        <Reveal delay={0.2}>
          <div className="tao-close-install">
            <code>npm install @rockshin/tao-ui</code>
            <CopyButton
              text="npm install @rockshin/tao-ui"
              label={zh ? '复制' : 'Copy'}
            />
          </div>
          <dl className="tao-close-facts">
            <div>
              <dt>React</dt>
              <dd>
                {zh ? '最低 18.2，兼容 19' : '18.2 minimum, 19 compatible'}
              </dd>
            </div>
            <div>
              <dt>{zh ? '契约' : 'Contracts'}</dt>
              <dd>
                <Link href={`${prefix}/guide/agents`}>
                  {zh
                    ? 'Agent 接入：JSON · Markdown · API'
                    : 'Agent access: JSON · Markdown · API'}
                </Link>
              </dd>
            </div>
            <div>
              <dt>{zh ? '主题' : 'Theme'}</dt>
              <dd>
                {zh
                  ? 'OKLCH 种子 · 纯 CSS 派生 · 深色模式'
                  : 'OKLCH seeds · pure-CSS derivation · dark mode'}
              </dd>
            </div>
          </dl>
          <Link
            href={`${prefix}/guide/getting-started`}
            className="tao-home-link tao-home-link--brand"
          >
            {zh ? '开始你的第一个界面' : 'Build your first interface'}
            <Arrow />
          </Link>
        </Reveal>
      </section>

      <section className="tao-index" aria-labelledby="tao-index-title">
        <Reveal className="tao-index-heading">
          <h2 id="tao-index-title">
            {zh
              ? `${componentCount} 个条目，一页看完。`
              : `${componentCount} entries on one page.`}
          </h2>
          <p>
            {zh
              ? '每一页都有可运行示例、可复制代码与生成的 API 表。'
              : 'Every page has runnable examples, copyable code and a generated API table.'}
          </p>
        </Reveal>
        <div className="tao-index-groups">
          {groups.map((group, index) => (
            <motion.div
              key={group.title}
              className="tao-index-group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8%' }}
              transition={{ duration: 0.7, delay: (index % 4) * 0.06, ease }}
            >
              <h3>
                {group.title}
                <span>{group.items.length}</span>
              </h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item.path}>
                    <Link href={`${prefix}/components/${item.path}`}>
                      <span>{item.name}</span>
                      {item.label ? <span>{item.label}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Specimen({
  name,
  spec,
  index,
  children,
}: {
  name: string;
  spec: string;
  index: number;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="tao-specimen"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.25 + index * 0.05 }}
    >
      <div className="tao-specimen-caption">
        <span>{name}</span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={spec}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {spec}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="tao-specimen-body">{children}</div>
    </motion.div>
  );
}
