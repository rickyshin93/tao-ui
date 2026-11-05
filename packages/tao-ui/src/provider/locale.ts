/** Built-in Select and date-picker text. Arrays use calendar order (Monday first). */
export interface TaoLocale {
  select: string;
  searchPlaceholder: string;
  search?: string;
  showPassword?: string;
  hidePassword?: string;
  otpLabel?: (index: number, length: number) => string;
  searchOptions: string;
  noResults: string;
  /** Empty-state text. Omitted custom locales use the built-in English text. */
  emptyDescription?: string;
  /** BCP 47 / picker locale identifier; omitted custom locales use en_US. */
  locale?: string;
  done: string;
  clear: string;
  close: string;
  remove: (label: string) => string;
  dateTime: string;
  /** Date-only picker title. Omitted custom locales use the built-in English text. */
  selectDate?: string;
  selectTime?: string;
  startTime?: string;
  endTime?: string;
  qrCode?: { expired: string; refresh: string; scanned: string };
  dateRange: string;
  startDate: string;
  endDate: string;
  now: string;
  ok: string;
  /** Cancel text. Omitted custom locales use the built-in English text. */
  cancel?: string;
  previous: string;
  next: string;
  previousMonth: string;
  nextMonth: string;
  previousYear: string;
  nextYear: string;
  hour: string;
  minute: string;
  second: string;
  weekdays: readonly [string, string, string, string, string, string, string];
  months: readonly [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  monthTitle: (month: number, year: number) => string;
  calendarTitle: (month: number, year: number) => string;
}

export const enUS: TaoLocale = {
  locale: 'en_US',
  select: 'Select',
  searchPlaceholder: 'Search...',
  search: 'Search',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  otpLabel: (index, length) => `Character ${index} of ${length}`,
  searchOptions: 'Search options',
  noResults: 'No results',
  emptyDescription: 'No data',
  done: 'Done',
  clear: 'Clear',
  close: 'Close',
  remove: (label) => `Remove ${label}`,
  dateTime: 'Date & Time',
  selectDate: 'Select date',
  selectTime: 'Select time',
  startTime: 'Start time',
  endTime: 'End time',
  qrCode: {
    expired: 'QR code expired',
    refresh: 'Refresh',
    scanned: 'Scanned',
  },
  dateRange: 'Select date range',
  startDate: 'Start date',
  endDate: 'End date',
  now: 'Now',
  ok: 'OK',
  cancel: 'Cancel',
  previous: 'Previous',
  next: 'Next',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  hour: 'Hour',
  minute: 'Minute',
  second: 'Second',
  weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  months: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  monthTitle: (month, year) => `${enUS.months[month]} ${year}`,
  calendarTitle: (month, year) =>
    `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month]} ${year}`,
};

export const zhCN: TaoLocale = {
  locale: 'zh_CN',
  select: '选择',
  searchPlaceholder: '搜索…',
  search: '搜索',
  showPassword: '显示密码',
  hidePassword: '隐藏密码',
  otpLabel: (index, length) => `第 ${index} 位，共 ${length} 位`,
  searchOptions: '搜索选项',
  noResults: '暂无结果',
  emptyDescription: '暂无数据',
  done: '完成',
  clear: '清除',
  close: '关闭',
  remove: (label) => `移除${label}`,
  dateTime: '选择日期和时间',
  selectDate: '选择日期',
  selectTime: '选择时间',
  startTime: '开始时间',
  endTime: '结束时间',
  qrCode: { expired: '二维码已过期', refresh: '刷新', scanned: '已扫描' },
  dateRange: '选择日期范围',
  startDate: '开始日期',
  endDate: '结束日期',
  now: '此刻',
  ok: '确定',
  cancel: '取消',
  previous: '上一页',
  next: '下一页',
  previousMonth: '上个月',
  nextMonth: '下个月',
  previousYear: '上一年',
  nextYear: '下一年',
  hour: '时',
  minute: '分',
  second: '秒',
  weekdays: ['一', '二', '三', '四', '五', '六', '日'],
  months: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  monthTitle: (month, year) => `${year}年${month + 1}月`,
  calendarTitle: (month, year) => `${year}年${month + 1}月`,
};
