// Generated from the showcase imports: every tao-ui component and tao-icons glyph used on this page.
import {
  ActivityIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BellIcon,
  ChartColumnIcon,
  CheckCheckIcon,
  CheckCircleIcon,
  ChevronsUpDownIcon,
  ClockIcon,
  CoinsIcon,
  CompassIcon,
  CopyIcon,
  CreditCardIcon,
  DownloadIcon,
  EditIcon,
  EyeIcon,
  FileTextIcon,
  FilterClearIcon,
  GiftIcon,
  GlobeIcon,
  HelpCircleIcon,
  ImagePlusIcon,
  LaptopIcon,
  LayersIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MailIcon,
  MapPinIcon,
  MegaphoneIcon,
  MessageCircleIcon,
  MessageSquareIcon,
  MoonIcon,
  MoreHorizontalIcon,
  PackageCheckIcon,
  PackageIcon,
  PhoneIcon,
  PlusIcon,
  PrinterIcon,
  ReceiptIcon,
  RefreshCwIcon,
  RocketIcon,
  RotateCcwIcon,
  SaveIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  SparklesIcon,
  StarIcon,
  StoreIcon,
  SunIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  TrophyIcon,
  TruckIcon,
  UploadIcon,
  UserGroupIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  WalletIcon,
} from '@rockshin/tao-icons';
import { Link } from '@rspress/core/theme';
import type { IconType } from './shared';

const components = [
  'affix',
  'alert',
  'auto-complete',
  'avatar',
  'badge',
  'border-beam',
  'breadcrumb',
  'button',
  'calendar',
  'card',
  'carousel',
  'cascader',
  'checkbox',
  'collapse',
  'color-picker',
  'context-menu',
  'date-picker',
  'descriptions',
  'divider',
  'drawer',
  'dropdown',
  'empty',
  'float-button',
  'form',
  'form-actions',
  'form-field',
  'form-section',
  'image',
  'input',
  'input-number',
  'list',
  'listy',
  'masonry',
  'mentions',
  'modal',
  'popconfirm',
  'popover',
  'progress',
  'qr-code',
  'radio',
  'range-picker',
  'rate',
  'result',
  'scroll-area',
  'segmented',
  'select',
  'skeleton',
  'slider',
  'sonner',
  'spinner',
  'splitter',
  'statistic',
  'steps',
  'switch',
  'table',
  'tabs',
  'tag',
  'tao-provider',
  'textarea',
  'time-picker',
  'timeline',
  'tooltip',
  'tour',
  'transfer',
  'tree',
  'tree-select',
  'upload',
  'watermark',
];

const icons: [string, IconType][] = [
  ['Activity', ActivityIcon],
  ['ArrowLeft', ArrowLeftIcon],
  ['ArrowRight', ArrowRightIcon],
  ['Bell', BellIcon],
  ['ChartColumn', ChartColumnIcon],
  ['CheckCheck', CheckCheckIcon],
  ['CheckCircle', CheckCircleIcon],
  ['ChevronsUpDown', ChevronsUpDownIcon],
  ['Clock', ClockIcon],
  ['Coins', CoinsIcon],
  ['Compass', CompassIcon],
  ['Copy', CopyIcon],
  ['CreditCard', CreditCardIcon],
  ['Download', DownloadIcon],
  ['Edit', EditIcon],
  ['Eye', EyeIcon],
  ['FileText', FileTextIcon],
  ['FilterClear', FilterClearIcon],
  ['Gift', GiftIcon],
  ['Globe', GlobeIcon],
  ['HelpCircle', HelpCircleIcon],
  ['ImagePlus', ImagePlusIcon],
  ['Laptop', LaptopIcon],
  ['Layers', LayersIcon],
  ['LayoutDashboard', LayoutDashboardIcon],
  ['LogOut', LogOutIcon],
  ['Mail', MailIcon],
  ['MapPin', MapPinIcon],
  ['Megaphone', MegaphoneIcon],
  ['MessageCircle', MessageCircleIcon],
  ['MessageSquare', MessageSquareIcon],
  ['Moon', MoonIcon],
  ['MoreHorizontal', MoreHorizontalIcon],
  ['PackageCheck', PackageCheckIcon],
  ['Package', PackageIcon],
  ['Phone', PhoneIcon],
  ['Plus', PlusIcon],
  ['Printer', PrinterIcon],
  ['Receipt', ReceiptIcon],
  ['RefreshCw', RefreshCwIcon],
  ['Rocket', RocketIcon],
  ['RotateCcw', RotateCcwIcon],
  ['Save', SaveIcon],
  ['Search', SearchIcon],
  ['Send', SendIcon],
  ['Settings', SettingsIcon],
  ['ShieldCheck', ShieldCheckIcon],
  ['Smartphone', SmartphoneIcon],
  ['Sparkles', SparklesIcon],
  ['Star', StarIcon],
  ['Store', StoreIcon],
  ['Sun', SunIcon],
  ['TrendingDown', TrendingDownIcon],
  ['TrendingUp', TrendingUpIcon],
  ['Trophy', TrophyIcon],
  ['Truck', TruckIcon],
  ['Upload', UploadIcon],
  ['UserGroup', UserGroupIcon],
  ['User', UserIcon],
  ['UserPlus', UserPlusIcon],
  ['Users', UsersIcon],
  ['Wallet', WalletIcon],
];

const title = (slug: string) =>
  slug
    .split('-')
    .map((s) => (s === 'qr' ? 'QR' : s[0].toUpperCase() + s.slice(1)))
    .join('');

export function Inventory({ zh, prefix }: { zh: boolean; prefix: string }) {
  return (
    <section className="tao-showcase-inventory">
      <div>
        <h2>
          {zh ? '商城示例使用的组件' : 'Components in the commerce showcase'}
          <span>{components.length}</span>
        </h2>
        <ul className="tao-showcase-chips">
          {components.map((slug) => (
            <li key={slug}>
              <Link href={`${prefix}/components/${slug}`}>{title(slug)}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>
          {zh ? '商城示例使用的图标' : 'Icons in the commerce showcase'}
          <span>{icons.length}</span>
        </h2>
        <ul className="tao-showcase-icons">
          {icons.map(([name, Icon]) => (
            <li key={name} title={`${name}Icon`}>
              <Icon size={20} />
              <span>{name}</span>
            </li>
          ))}
        </ul>
        <Link className="tao-showcase-more" href={`${prefix}/components/icons`}>
          {zh ? '浏览全部 2,126 枚图标 →' : 'Browse all 2,126 icons →'}
        </Link>
      </div>
    </section>
  );
}
