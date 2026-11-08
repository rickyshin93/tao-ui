import {
  CheckCircleIcon,
  ClockIcon,
  PackageIcon,
  RotateCcwIcon,
} from '@rockshin/tao-icons';
import { Switch } from '@rockshin/tao-ui';
import { useLang } from '@rspress/core/runtime';
import dayjs, { type Dayjs } from 'dayjs';
import { type ComponentType, type ReactNode, useId } from 'react';

/* ---------- copy ---------- */

export const copy = {
  zh: {
    eyebrow: '示例',
    title: '一个完整的运营后台，只用两个包。',
    lead: '下面这一屏没有任何第三方 UI：导航、表格、抽屉、表单、提示，以及全部图标，都来自 tao-ui 与 tao-icons。它是可以操作的，点一行订单、新建一笔、切换主题试试。',
    accent: '主色',
    mode: '模式',
    light: '浅色',
    dark: '深色',
    compact: '紧凑',
    workspaceA: '青禾商城',
    workspaceB: '青禾批发',
    plan: '本月订单额度',
    upgrade: '升级套餐',
    nav: {
      overview: '概览',
      orders: '订单',
      customers: '客户',
      products: '商品',
      finance: '财务',
      reports: '报表',
      team: '团队',
      security: '安全',
      settings: '设置',
    },
    settingsGroup: '组织',
    search: '搜索订单、客户或商品',
    home: '工作台',
    help: '帮助中心',
    notifications: '通知',
    toggleTheme: '切换明暗',
    profile: '个人资料',
    logout: '退出登录',
    pageTitle: '订单',
    pageSub: '所有渠道 · 实时同步',
    export: '导出',
    exporting: '正在生成报表…',
    exported: '报表已生成',
    exportedDesc: '已发送到 lin@qinghe.shop',
    create: '新建订单',
    kpi: ['营收', '订单数', '客单价', '退款率'],
    vsLast: '较上期',
    trend: '营收趋势',
    ranges: ['7 天', '30 天', '12 个月'],
    channels: '渠道分布',
    channelNames: ['官网', '小程序', '线下门店', '分销伙伴'],
    target: '本月目标',
    targetDone: '已完成 ¥1.28M / ¥1.6M',
    tabs: {
      all: '全部',
      pending: '待支付',
      paid: '待发货',
      shipped: '已发货',
      refund: '售后',
    },
    status: {
      pending: '待支付',
      paid: '待发货',
      shipped: '已发货',
      refund: '退款中',
    },
    filterChannel: '渠道',
    clear: '清除筛选',
    selected: (n: number) => `已选 ${n} 项`,
    ship: '标记发货',
    cols: {
      id: '订单号',
      customer: '客户',
      items: '商品',
      amount: '金额',
      status: '状态',
      channel: '渠道',
      date: '下单时间',
    },
    pieces: (n: number) => `共 ${n} 件`,
    total: (n: number) => `共 ${n} 笔`,
    view: '查看详情',
    edit: '编辑',
    refund: '发起退款',
    copied: '订单号已复制',
    shipped: (n: number) => `${n} 笔订单已标记发货`,
    refunded: '已发起退款',
    detail: '订单详情',
    print: '打印',
    contact: '联系方式',
    payment: '支付方式',
    address: '收货地址',
    paymentValue: '微信支付',
    addressValue: '上海市徐汇区漕溪北路 88 号',
    history: '订单进度',
    events: ['订单创建', '支付成功', '仓库拣货', '已出库'],
    newTitle: '新建订单',
    fCustomer: '客户',
    fProduct: '商品',
    fQty: '数量',
    fChannel: '渠道',
    fNote: '备注',
    fNotify: '下单后短信通知客户',
    required: '必填',
    created: '订单已创建',
  },
  en: {
    eyebrow: 'Showcase',
    title: 'A full operations console, built from two packages.',
    lead: 'No third-party UI in the screen below: navigation, tables, drawers, forms, toasts and every icon come from tao-ui and tao-icons. It is live, so open an order, create one, or switch the theme.',
    accent: 'Accent',
    mode: 'Mode',
    light: 'Light',
    dark: 'Dark',
    compact: 'Compact',
    workspaceA: 'Fieldnote Store',
    workspaceB: 'Fieldnote Wholesale',
    plan: 'Monthly order quota',
    upgrade: 'Upgrade plan',
    nav: {
      overview: 'Overview',
      orders: 'Orders',
      customers: 'Customers',
      products: 'Products',
      finance: 'Finance',
      reports: 'Reports',
      team: 'Team',
      security: 'Security',
      settings: 'Settings',
    },
    settingsGroup: 'Organization',
    search: 'Search orders, customers or products',
    home: 'Workspace',
    help: 'Help center',
    notifications: 'Notifications',
    toggleTheme: 'Toggle theme',
    profile: 'Profile',
    logout: 'Log out',
    pageTitle: 'Orders',
    pageSub: 'All channels · live sync',
    export: 'Export',
    exporting: 'Building report…',
    exported: 'Report ready',
    exportedDesc: 'Sent to maya@fieldnote.shop',
    create: 'New order',
    kpi: ['Revenue', 'Orders', 'Avg. order', 'Refund rate'],
    vsLast: 'vs last period',
    trend: 'Revenue',
    ranges: ['7 days', '30 days', '12 months'],
    channels: 'Channels',
    channelNames: ['Website', 'Mobile app', 'Retail stores', 'Partners'],
    target: 'Monthly target',
    targetDone: '$1.28M of $1.6M',
    tabs: {
      all: 'All',
      pending: 'Unpaid',
      paid: 'To ship',
      shipped: 'Shipped',
      refund: 'Returns',
    },
    status: {
      pending: 'Unpaid',
      paid: 'To ship',
      shipped: 'Shipped',
      refund: 'Refunding',
    },
    filterChannel: 'Channel',
    clear: 'Clear filters',
    selected: (n: number) => `${n} selected`,
    ship: 'Mark shipped',
    cols: {
      id: 'Order',
      customer: 'Customer',
      items: 'Items',
      amount: 'Amount',
      status: 'Status',
      channel: 'Channel',
      date: 'Placed',
    },
    pieces: (n: number) => `${n} pcs`,
    total: (n: number) => `${n} orders`,
    view: 'View details',
    edit: 'Edit',
    refund: 'Issue refund',
    copied: 'Order ID copied',
    shipped: (n: number) => `${n} order${n > 1 ? 's' : ''} marked shipped`,
    refunded: 'Refund issued',
    detail: 'Order details',
    print: 'Print',
    contact: 'Contact',
    payment: 'Payment',
    address: 'Ship to',
    paymentValue: 'Visa •••• 4242',
    addressValue: '88 Harbor St, Portland, OR',
    history: 'Progress',
    events: ['Order placed', 'Payment captured', 'Picking', 'Left warehouse'],
    newTitle: 'New order',
    fCustomer: 'Customer',
    fProduct: 'Products',
    fQty: 'Quantity',
    fChannel: 'Channel',
    fNote: 'Note',
    fNotify: 'Text the customer after ordering',
    required: 'Required',
    created: 'Order created',
  },
};
export type Copy = (typeof copy)['zh'];

export const accents = [
  {
    id: 'daybreak-blue',
    zh: '拂晓蓝',
    en: 'Daybreak Blue',
    light: 'oklch(0.599 0.219 259)',
    dark: 'oklch(0.72 0.16 259)',
  },
  {
    id: 'verdant',
    zh: '翠绿',
    en: 'Verdant',
    light: 'oklch(0.58 0.15 145)',
    dark: 'oklch(0.78 0.16 145)',
  },
  {
    id: 'magenta',
    zh: '洋红',
    en: 'Magenta',
    light: 'oklch(0.6 0.238 350)',
    dark: 'oklch(0.74 0.17 350)',
  },
  {
    id: 'vermilion',
    zh: '朱红',
    en: 'Vermilion',
    light: 'oklch(0.6 0.231 25)',
    dark: 'oklch(0.72 0.17 25)',
  },
  {
    id: 'tangerine',
    zh: '活力橙',
    en: 'Tangerine',
    light: 'oklch(0.66 0.179 45)',
    dark: 'oklch(0.78 0.15 50)',
  },
  // No colorPrimary override: the library's default near-black primary.
  { id: 'ink', zh: '墨', en: 'Ink', light: undefined, dark: undefined },
] as const;

/* ---------- data ---------- */

export type Status = 'pending' | 'paid' | 'shipped' | 'refund';
export type Order = {
  id: string;
  customer: string;
  company: string;
  product: string;
  qty: number;
  amount: number;
  status: Status;
  channel: number;
  date: Dayjs;
};

export const people = {
  zh: [
    ['林知夏', '知夏花艺'],
    ['周屿', '屿间咖啡'],
    ['陈一禾', '一禾文具'],
    ['许南星', '南星工作室'],
    ['沈默', '默默书店'],
    ['顾清', '清风茶舍'],
    ['江晚', '晚来烘焙'],
    ['陆远', '远山户外'],
    ['苏青', '青柠瑜伽'],
    ['叶舟', '舟行旅社'],
    ['宋知', '知味餐厅'],
    ['程朗', '朗月设计'],
  ],
  en: [
    ['Maya Chen', 'Bloom & Co.'],
    ['Leo Park', 'Northbound Coffee'],
    ['Ava Brooks', 'Paper Lane'],
    ['Noah Kim', 'Studio Kite'],
    ['Iris Wong', 'Quiet Books'],
    ['Owen Hart', 'Tealeaf House'],
    ['Zoe Adams', 'Rise Bakery'],
    ['Eli Ross', 'Ridgeline Outdoor'],
    ['Ruby Lane', 'Lime Yoga'],
    ['Finn Cole', 'Drift Travel'],
    ['Mia Grant', 'Savory Kitchen'],
    ['Jude Moss', 'Moonlit Design'],
  ],
};
export const products = {
  zh: [
    '手冲咖啡礼盒',
    '亚麻围裙',
    '陶瓷马克杯',
    '帆布托特包',
    '香薰蜡烛',
    '速写本套装',
    '保温随行杯',
    '羊毛围巾',
  ],
  en: [
    'Pour-over gift set',
    'Linen apron',
    'Ceramic mug',
    'Canvas tote',
    'Scented candle',
    'Sketchbook set',
    'Travel tumbler',
    'Wool scarf',
  ],
};
const statusCycle: Status[] = [
  'paid',
  'shipped',
  'pending',
  'shipped',
  'paid',
  'refund',
  'shipped',
  'shipped',
  'pending',
  'paid',
];
export const today = dayjs('2026-11-08T16:40:00');

export function makeOrders(lang: 'zh' | 'en'): Order[] {
  return Array.from({ length: 28 }, (_, i) => {
    const [customer, company] = people[lang][(i * 5) % 12];
    const qty = ((i * 7) % 5) + 1;
    return {
      id: `TC-${20481 - i}`,
      customer,
      company,
      product: products[lang][(i * 3) % 8],
      qty,
      amount:
        Math.round((qty * (89 + ((i * 137) % 420)) + (i % 3) * 0.5) * 100) /
        100,
      status: statusCycle[i % statusCycle.length],
      channel: [0, 1, 0, 2, 1, 3, 0, 1][i % 8],
      date: today.subtract(i * 97 + (i % 4) * 13, 'minute'),
    };
  });
}

export const series = [
  [42, 51, 47, 63, 58, 72, 68],
  [
    31, 36, 33, 41, 38, 45, 43, 39, 48, 52, 47, 44, 50, 55, 53, 49, 58, 61, 57,
    54, 60, 66, 62, 59, 64, 70, 67, 63, 69, 74,
  ],
  [620, 680, 710, 690, 760, 820, 870, 840, 910, 980, 1040, 1284],
];

export const statusTone: Record<
  Status,
  {
    color: 'warning' | 'primary' | 'success' | 'error';
    icon: ComponentType<{ size?: number }>;
  }
> = {
  pending: { color: 'warning', icon: ClockIcon },
  paid: { color: 'primary', icon: PackageIcon },
  shipped: { color: 'success', icon: CheckCircleIcon },
  refund: { color: 'error', icon: RotateCcwIcon },
};

export function SwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  const id = useId();
  return (
    <label className="tao-showcase-switch" htmlFor={id}>
      <Switch id={id} size="small" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

export type Lang = 'zh' | 'en';

/** Form.Item adapters: Upload emits { fileList }, ColorPicker emits a Color object. */
export const fileListFrom = (...args: unknown[]) =>
  (args[0] as { fileList: unknown[] }).fileList;
export const hexFrom = (...args: unknown[]) =>
  (args[0] as { toHexString: () => string }).toHexString();
export type IconType = ComponentType<{ size?: number }>;

/** Inline bilingual copy for the newer pages: L('中文', 'English'). */
export function useL() {
  const zh = useLang() === 'zh';
  return (zhText: string, enText: string) => (zhText && zh ? zhText : enText);
}

export function PageTitle({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <div className="tao-console-title">
      <div>
        <h2>{title}</h2>
        {sub ? <p>{sub}</p> : null}
      </div>
      {children ? (
        <div className="tao-console-title-actions">{children}</div>
      ) : null}
    </div>
  );
}
