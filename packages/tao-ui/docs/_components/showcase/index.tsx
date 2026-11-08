import {
  ActivityIcon,
  BellIcon,
  ChartColumnIcon,
  CheckCheckIcon,
  ChevronsUpDownIcon,
  CompassIcon,
  HelpCircleIcon,
  LayersIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MoonIcon,
  PackageIcon,
  ReceiptIcon,
  SearchIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StoreIcon,
  SunIcon,
  TruckIcon,
  UserGroupIcon,
  UserIcon,
  UsersIcon,
  WalletIcon,
} from '@rockshin/tao-icons';
import {
  Avatar,
  Badge,
  BorderBeam,
  Breadcrumb,
  Button,
  Dropdown,
  Empty,
  enUS,
  FloatButton,
  Input,
  Listy,
  Popover,
  Progress,
  Segmented,
  Sonner,
  TaoProvider,
  Tooltip,
  Tour,
  toast,
  zhCN,
} from '@rockshin/tao-ui';
import { useDark, useLang } from '@rspress/core/runtime';
import { Link } from '@rspress/core/theme';
import {
  type ComponentType,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react';

import { OverviewPage } from './overview';
import {
  accents,
  type Copy,
  copy,
  makeOrders,
  people,
  SwitchRow,
} from './shared';

const CustomersPage = lazy(() =>
  import('./customers').then((m) => ({ default: m.CustomersPage })),
);
const FinancePage = lazy(() =>
  import('./misc').then((m) => ({ default: m.FinancePage })),
);
const ReportsPage = lazy(() =>
  import('./misc').then((m) => ({ default: m.ReportsPage })),
);
const OrdersPage = lazy(() =>
  import('./orders').then((m) => ({ default: m.OrdersPage })),
);
const ProductsPage = lazy(() =>
  import('./products').then((m) => ({ default: m.ProductsPage })),
);
const SettingsPage = lazy(() =>
  import('./settings').then((m) => ({ default: m.SettingsPage })),
);
const TeamPage = lazy(() =>
  import('./team').then((m) => ({ default: m.TeamPage })),
);

/* ---------- page ---------- */

export function Showcase() {
  const lang = useLang() === 'zh' ? 'zh' : 'en';
  const t = copy[lang];
  const siteDark = useDark();
  const [dark, setDark] = useState(siteDark);
  const [accentId, setAccentId] = useState<string>('ink');
  const [compact, setCompact] = useState(false);
  useEffect(() => setDark(siteDark), [siteDark]);

  const accent = accents.find((a) => a.id === accentId) ?? accents[0];
  const colorPrimary = dark ? accent.dark : accent.light;
  const prefix = lang === 'zh' ? '/zh' : '';

  return (
    <div className="tao-showcase-app">
      <header className="tao-showcase-app-header">
        <Link className="tao-showcase-back" href={`${prefix}/showcase`}>
          {lang === 'zh' ? '← 返回示例' : '← All showcases'}
        </Link>
        <Link
          className="tao-showcase-language"
          href={lang === 'zh' ? '/showcase/commerce' : '/zh/showcase/commerce'}
          lang={lang === 'zh' ? 'en' : 'zh'}
        >
          {lang === 'zh' ? 'English' : '中文'}
        </Link>
        <TaoProvider
          locale={lang === 'zh' ? zhCN : enUS}
          theme={{ mode: siteDark ? 'dark' : 'light' }}
          size="small"
        >
          <div className="tao-showcase-controls">
            <div className="tao-showcase-accent">
              <Segmented
                aria-label={t.accent}
                value={accentId}
                onChange={(v) => setAccentId(String(v))}
                options={accents.map((a) => ({
                  value: a.id,
                  label: a[lang],
                  icon: (
                    <span
                      className="tao-showcase-dot"
                      style={{ background: a.light ?? 'oklch(0.24 0.01 260)' }}
                    />
                  ),
                }))}
              />
            </div>
            <Segmented
              aria-label={t.mode}
              value={dark ? 'dark' : 'light'}
              onChange={(v) => setDark(v === 'dark')}
              options={[
                { value: 'light', label: t.light, icon: <SunIcon size={14} /> },
                { value: 'dark', label: t.dark, icon: <MoonIcon size={14} /> },
              ]}
            />
            <SwitchRow
              label={t.compact}
              checked={compact}
              onChange={setCompact}
            />
          </div>
        </TaoProvider>
      </header>

      <div className="tao-showcase-app-content">
        <TaoProvider
          locale={lang === 'zh' ? zhCN : enUS}
          theme={{
            mode: dark ? 'dark' : 'light',
            compact,
            token: colorPrimary ? { colorPrimary } : {},
          }}
        >
          <Console
            t={t}
            lang={lang}
            dark={dark}
            onToggleDark={() => setDark((d) => !d)}
          />
          <Sonner position="top-right" />
        </TaoProvider>
      </div>
    </div>
  );
}

/* ---------- console ---------- */

type NavKey = keyof Copy['nav'];
const navMain: [NavKey, ComponentType<{ size?: number }>][] = [
  ['overview', LayoutDashboardIcon],
  ['orders', ReceiptIcon],
  ['customers', UsersIcon],
  ['products', PackageIcon],
  ['finance', WalletIcon],
  ['reports', ChartColumnIcon],
];
const navOrg: [NavKey, ComponentType<{ size?: number }>][] = [
  ['team', UserGroupIcon],
  ['security', ShieldCheckIcon],
  ['settings', SettingsIcon],
];

function Console({
  t,
  lang,
  dark,
  onToggleDark,
}: {
  t: Copy;
  lang: 'zh' | 'en';
  dark: boolean;
  onToggleDark: () => void;
}) {
  const [page, setPage] = useState<NavKey>('overview');
  const [settingsTab, setSettingsTab] = useState('general');
  const [cleared, setCleared] = useState(false);
  const [tour, setTour] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLSpanElement>(null);
  const planRef = useRef<HTMLDivElement>(null);
  const go = (key: NavKey) => {
    setPage(key);
    if (key === 'security') setSettingsTab('security');
    if (key === 'settings') setSettingsTab('general');
  };
  const L = (zh: string, en: string) => (lang === 'zh' ? zh : en);
  const [orders, setOrders] = useState(() => makeOrders(lang));
  const [workspace, setWorkspace] = useState('a');
  useEffect(() => setOrders(makeOrders(lang)), [lang]);
  const pendingCount = orders.filter((o) => o.status === 'paid').length;

  const navItem = ([key, Icon]: [NavKey, ComponentType<{ size?: number }>]) => (
    <button
      key={key}
      type="button"
      aria-label={t.nav[key]}
      className="tao-console-nav-item"
      aria-current={page === key ? 'page' : undefined}
      onClick={() => go(key)}
    >
      <Icon size={18} />
      <span>{t.nav[key]}</span>
      {key === 'orders' ? <Badge count={pendingCount} size="small" /> : null}
    </button>
  );

  return (
    <div className="tao-console">
      <aside className="tao-console-side">
        <Dropdown
          menu={{
            items: [
              { key: 'a', label: t.workspaceA, icon: <StoreIcon size={16} /> },
              { key: 'b', label: t.workspaceB, icon: <TruckIcon size={16} /> },
            ],
            selectable: true,
            selectedKeys: [workspace],
            onClick: ({ key }) => setWorkspace(key),
          }}
        >
          <button type="button" className="tao-console-brand">
            <span className="tao-console-logo">
              <LayersIcon size={18} />
            </span>
            <span>{workspace === 'a' ? t.workspaceA : t.workspaceB}</span>
            <ChevronsUpDownIcon size={16} />
          </button>
        </Dropdown>
        <nav ref={navRef} className="tao-console-nav" aria-label="Console">
          {navMain.map(navItem)}
          <p className="tao-console-nav-group">{t.settingsGroup}</p>
          {navOrg.map(navItem)}
        </nav>
        <div ref={planRef}>
          <BorderBeam duration={6}>
            <div className="tao-console-plan">
              <div className="tao-console-plan-head">
                <SparklesIcon size={16} />
                <span>{t.plan}</span>
              </div>
              <Progress percent={72} size="small" />
              <Button
                variant="secondary"
                size="small"
                onClick={() => toast.info({ title: t.upgrade })}
              >
                {t.upgrade}
              </Button>
            </div>
          </BorderBeam>
        </div>
      </aside>

      <div className="tao-console-main">
        <header className="tao-console-bar">
          <Breadcrumb
            items={[
              { title: t.home, onClick: () => go('overview') },
              { title: t.nav[page] },
            ]}
          />
          <div ref={searchRef} className="tao-console-search">
            <Input
              prefix={<SearchIcon size={16} />}
              suffix={<kbd>⌘K</kbd>}
              placeholder={t.search}
              aria-label={t.search}
            />
          </div>
          <div className="tao-console-bar-actions">
            <Tooltip title={t.help}>
              <Button
                variant="ghost"
                icon={<HelpCircleIcon size={18} />}
                aria-label={t.help}
              />
            </Tooltip>
            <Popover
              trigger="click"
              placement="bottomRight"
              title={
                <div className="tao-console-notice-head">
                  {t.notifications}
                  <Button
                    variant="ghost"
                    size="small"
                    icon={<CheckCheckIcon size={14} />}
                    disabled={cleared}
                    onClick={() => setCleared(true)}
                  >
                    {L('全部已读', 'Mark all read')}
                  </Button>
                </div>
              }
              content={
                cleared ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={L('没有新通知', 'You are all caught up')}
                  />
                ) : (
                  <div className="tao-console-notices">
                    <Listy
                      height={260}
                      rowKey="id"
                      items={orders.slice(0, 9)}
                      group={{
                        key: (o) =>
                          o.date.isSame(orders[0].date, 'day')
                            ? 'today'
                            : 'earlier',
                        title: (k) =>
                          k === 'today'
                            ? L('今天', 'Today')
                            : L('更早', 'Earlier'),
                      }}
                      itemRender={(o) => (
                        <div className="tao-console-notice">
                          <ActivityIcon size={16} />
                          <span>
                            <strong>{o.customer}</strong> {L('下单', 'ordered')}{' '}
                            {o.product}
                          </span>
                          <time>{o.date.format('HH:mm')}</time>
                        </div>
                      )}
                    />
                  </div>
                )
              }
            >
              <Button
                variant="ghost"
                aria-label={t.notifications}
                icon={
                  <Badge dot={!cleared}>
                    <BellIcon size={18} />
                  </Badge>
                }
              />
            </Popover>
            <span ref={themeRef}>
              <Tooltip title={t.toggleTheme}>
                <Button
                  variant="ghost"
                  icon={dark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                  aria-label={t.toggleTheme}
                  onClick={onToggleDark}
                />
              </Tooltip>
            </span>
            <Dropdown
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: 'profile',
                    label: t.profile,
                    icon: <UserIcon size={16} />,
                  },
                  {
                    key: 'settings',
                    label: t.nav.settings,
                    icon: <SettingsIcon size={16} />,
                  },
                  { type: 'divider' },
                  {
                    key: 'logout',
                    label: t.logout,
                    icon: <LogOutIcon size={16} />,
                    danger: true,
                  },
                ],
                onClick: ({ key }) => key === 'settings' && go('settings'),
              }}
            >
              <button
                type="button"
                className="tao-console-me"
                aria-label={t.profile}
              >
                <Avatar size="small">{people[lang][0][0].slice(0, 1)}</Avatar>
              </button>
            </Dropdown>
          </div>
        </header>

        <main className="tao-console-body">
          <Suspense
            fallback={<div role="status">{L('加载中…', 'Loading…')}</div>}
          >
            {page === 'overview' ? <OverviewPage t={t} lang={lang} /> : null}
            {page === 'orders' ? (
              <OrdersPage
                t={t}
                lang={lang}
                orders={orders}
                setOrders={setOrders}
              />
            ) : null}
            {page === 'customers' ? <CustomersPage lang={lang} /> : null}
            {page === 'products' ? <ProductsPage lang={lang} /> : null}
            {page === 'finance' ? (
              <FinancePage onBack={() => go('overview')} />
            ) : null}
            {page === 'reports' ? <ReportsPage /> : null}
            {page === 'team' ? <TeamPage lang={lang} /> : null}
            {page === 'settings' || page === 'security' ? (
              <SettingsPage
                tab={settingsTab}
                onTab={(k) => {
                  setSettingsTab(k);
                  setPage(k === 'security' ? 'security' : 'settings');
                }}
              />
            ) : null}
          </Suspense>
        </main>
      </div>
      <FloatButton
        className="tao-console-fab"
        type="primary"
        icon={<CompassIcon size={18} />}
        tooltip={L('新手引导', 'Take the tour')}
        onClick={() => setTour(true)}
      />
      <Tour
        open={tour}
        onClose={() => setTour(false)}
        steps={[
          {
            title: L('导航', 'Navigation'),
            description: L(
              '每一项都是用 tao-ui 搭的真实页面：表单、分栏、权限树、瀑布流……',
              'Every item is a real page built with tao-ui: forms, splitters, permission trees, masonry…',
            ),
            target: () => navRef.current as HTMLElement,
          },
          {
            title: L('全局搜索', 'Search'),
            description: L(
              'Input 的 prefix / suffix 插槽，图标来自 tao-icons。',
              'Input prefix and suffix slots, icons from tao-icons.',
            ),
            target: () => searchRef.current as HTMLElement,
          },
          {
            title: L('明暗切换', 'Light and dark'),
            description: L(
              '切换 TaoProvider 的 mode，浮层也会跟着变。',
              'Flip TaoProvider mode; popups follow along.',
            ),
            target: () => themeRef.current as HTMLElement,
          },
          {
            title: L('流光边框', 'Border beam'),
            description: L(
              'BorderBeam 是 tao-ui 独有的强调效果。',
              'BorderBeam is a tao-ui original for gentle emphasis.',
            ),
            target: () => planRef.current as HTMLElement,
          },
        ]}
      />
    </div>
  );
}
