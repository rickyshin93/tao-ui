import {
  Button,
  DatePicker,
  enUS,
  Input,
  Segmented,
  Select,
  Switch,
  TaoProvider,
  zhCN,
} from '@rockshin/tao-ui';
import { useLang } from '@rspress/core/runtime';
import { motion, useReducedMotion } from 'motion/react';
import { type ReactNode, useEffect, useState } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;

function Tile({
  className,
  index,
  title,
  body,
  children,
}: {
  className: string;
  index: number;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <motion.article
      className={`tao-tile ${className}`}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.8, delay: (index % 2) * 0.08, ease }}
    >
      <div className="tao-tile-demo">{children}</div>
      <div className="tao-tile-copy">
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </motion.article>
  );
}

const keys = ['Tab', '↓', '↓', 'Enter', 'Esc'];

function KeyboardDemo() {
  const reduced = useReducedMotion();
  const [pressed, setPressed] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(
      () => setPressed((value) => (value + 1) % keys.length),
      900,
    );
    return () => window.clearInterval(timer);
  }, [reduced]);
  const focusIndex = [0, 1, 2, 2, 0][pressed];
  return (
    <div className="tao-keys-demo" aria-hidden="true">
      <div className="tao-keys">
        {keys.map((key, index) => (
          <motion.kbd
            // biome-ignore lint/suspicious/noArrayIndexKey: repeated keys are positional
            key={index}
            animate={{
              y: pressed === index ? 2 : 0,
              opacity: pressed === index ? 1 : 0.55,
            }}
            transition={{ duration: 0.18 }}
          >
            {key}
          </motion.kbd>
        ))}
      </div>
      <div className="tao-keys-list">
        {['React', 'Vue', 'Svelte'].map((item, index) => (
          <span key={item}>
            {focusIndex === index ? (
              <motion.span
                layoutId="tao-keys-focus"
                className="tao-keys-focus"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            ) : null}
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function HomeBento({
  seed,
  dark,
}: {
  seed: { light: string; dark: string };
  dark: boolean;
}) {
  const siteTheme = {
    mode: dark ? ('dark' as const) : ('light' as const),
    token: { colorPrimary: dark ? seed.dark : seed.light },
  };
  const zh = useLang() === 'zh';
  const [tileDark, setTileDark] = useState(!dark);
  const [chinese, setChinese] = useState(zh);
  const [compact, setCompact] = useState(true);
  useEffect(() => setTileDark(!dark), [dark]);
  useEffect(() => setChinese(zh), [zh]);

  return (
    <section className="tao-bento" aria-labelledby="tao-bento-title">
      <motion.h2
        id="tao-bento-title"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ duration: 0.8, ease }}
      >
        {zh
          ? '那些不起眼，却天天用到的细节。'
          : 'The quiet details you use every day.'}
      </motion.h2>
      <div className="tao-bento-grid">
        <Tile
          className="tao-tile--wide"
          index={0}
          title={
            zh ? '深色模式，一路跟到浮层' : 'Dark mode, all the way into popups'
          }
          body={
            zh
              ? '在 Provider 上切换 mode；通过 Portal 渲染的下拉、抽屉与日历也继承同一主题。打开下拉看看。'
              : 'Switch mode on the Provider; dropdowns, drawers and calendars rendered through portals inherit it. Open the dropdown.'
          }
        >
          <TaoProvider
            theme={{
              mode: tileDark ? 'dark' : 'light',
              token: { colorPrimary: tileDark ? seed.dark : seed.light },
            }}
          >
            <div className="tao-mode-panel">
              <div className="tao-tile-row">
                <Switch
                  checked={tileDark}
                  onChange={setTileDark}
                  aria-label={zh ? '深色' : 'Dark'}
                />
                {tileDark ? (zh ? '深色' : 'Dark') : zh ? '浅色' : 'Light'}
              </div>
              <Select
                aria-label={zh ? '状态' : 'Status'}
                defaultValue="review"
                style={{ width: 180 }}
                options={[
                  { label: zh ? '草稿' : 'Draft', value: 'draft' },
                  { label: zh ? '审核中' : 'In review', value: 'review' },
                  { label: zh ? '已发布' : 'Published', value: 'live' },
                ]}
              />
              <Button>{zh ? '提交' : 'Submit'}</Button>
            </div>
          </TaoProvider>
        </Tile>

        <Tile
          className="tao-tile--narrow"
          index={1}
          title={zh ? '中英文，一行切换' : 'Two languages, one prop'}
          body={
            zh
              ? 'locale 驱动内置按钮、占位与日历标签；嵌套 Provider 只覆盖你给出的键，日期格式与 Day.js 全局不受影响。'
              : 'locale drives built-in buttons, placeholders and calendar labels. Nested providers override only the keys you pass.'
          }
        >
          <TaoProvider locale={chinese ? zhCN : enUS} theme={siteTheme}>
            <div className="tao-tile-stack">
              <Segmented
                aria-label={zh ? '语言' : 'Language'}
                value={chinese ? 'zh' : 'en'}
                onChange={(value) => setChinese(value === 'zh')}
                options={[
                  { label: '中文', value: 'zh' },
                  { label: 'English', value: 'en' },
                ]}
              />
              <DatePicker
                aria-label={zh ? '日期' : 'Date'}
                style={{ width: 200 }}
              />
            </div>
          </TaoProvider>
        </Tile>

        <Tile
          className="tao-tile--narrow"
          index={2}
          title={zh ? '紧凑密度' : 'Compact density'}
          body={
            zh
              ? '一个开关，控件高度 32→28，内外边距各降一档；纯 CSS 实现，浮层同样透传。'
              : 'One switch: controls go from 32 to 28px and spacing drops a step. Pure CSS, carried into popups.'
          }
        >
          <div className="tao-tile-stack">
            <div className="tao-tile-row">
              <Switch
                checked={compact}
                onChange={setCompact}
                aria-label={zh ? '紧凑' : 'Compact'}
              />
              {compact ? (zh ? '紧凑' : 'Compact') : zh ? '默认' : 'Default'}
            </div>
            <TaoProvider theme={{ ...siteTheme, compact }}>
              <motion.div
                layout
                className="tao-density-form"
                transition={{ duration: 0.4, ease }}
              >
                <Input
                  aria-label={zh ? '名称' : 'Name'}
                  defaultValue={zh ? '季度报告' : 'Quarterly report'}
                />
                <div className="tao-tile-row">
                  <Button>{zh ? '保存' : 'Save'}</Button>
                  <Button variant="secondary">{zh ? '取消' : 'Cancel'}</Button>
                </div>
              </motion.div>
            </TaoProvider>
          </div>
        </Tile>

        <Tile
          className="tao-tile--wide"
          index={3}
          title={
            zh
              ? '按组件引入，样式自动按需'
              : 'Import a component, get only its styles'
          }
          body={
            zh
              ? '组件入口只加载对应组件及其依赖的样式，并自动带上公共主题，无需另外引入 CSS；根入口照常可用。'
              : 'Component entries load only that component, its dependencies and the shared theme. No CSS import; the root entry still works.'
          }
        >
          <pre className="tao-import-code">
            <code>
              {[
                ['button', 'Button'],
                ['select', 'Select'],
                ['date-picker', 'DatePicker'],
                ['provider', 'TaoProvider'],
              ].map(([entry, name], index) => (
                <motion.span
                  key={entry}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: 0.2 + index * 0.12,
                    ease,
                  }}
                >
                  <i>import</i> {`{ ${name} }`} <i>from</i>{' '}
                  <b>{`'@rockshin/tao-ui/${entry}'`}</b>
                  {';'}
                </motion.span>
              ))}
            </code>
          </pre>
        </Tile>

        <Tile
          className="tao-tile--half"
          index={4}
          title={zh ? '键盘就能走完全程' : 'All the way by keyboard'}
          body={
            zh
              ? '字段、选择器、浮层与选择都带完整 ARIA 语义和可见焦点；打开、浏览、选择、关闭，不必碰鼠标。'
              : 'Fields, pickers, overlays and selections carry ARIA semantics and visible focus. Open, browse, pick and close without a mouse.'
          }
        >
          <KeyboardDemo />
        </Tile>

        <Tile
          className="tao-tile--half"
          index={5}
          title={
            zh ? 'React 18.2 与 19，类型完整' : 'React 18.2 and 19, fully typed'
          }
          body={
            zh
              ? '两个主版本同跑检查；Props、语义部件与 token 全部导出类型，编辑器即文档。'
              : 'Both majors are checked. Props, semantic parts and tokens all export types, so the editor is the docs.'
          }
        >
          <div className="tao-versions" aria-hidden="true">
            <span>18.2</span>
            <span>19</span>
            <code>SelectSemanticPart</code>
          </div>
        </Tile>
      </div>
    </section>
  );
}
