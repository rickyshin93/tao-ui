import type { ValidateMessages } from '@rc-component/form/es/interface';
import type { Locale as PickerLocale } from '@rc-component/picker/interface';

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
  /** BCP 47 locale used by numeric displays and input controls. */
  numberLocale?: string;
  /** Registered Day.js locale used on individual date instances. */
  dayjsLocale?: string;
  /** First weekday: Sunday = 0. The weekdays array remains Monday-first. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  pickerLocale?: PickerLocale;
  /** Component text overrides. Missing entries inherit from the parent. */
  messages?: Partial<TaoMessages>;
  form?: ValidateMessages;
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

export interface TaoMessages {
  loading: string;
  backToTop: string;
  successNotification: string;
  errorNotification: string;
  warningNotification: string;
  infoNotification: string;
  notification: string;
  removeFileError: string;
  readFileError: string;
  pagination: string;
  previousPage: string;
  nextPage: string;
  itemsPerPage: string;
  pageSize: string;
  pageUnit: string;
  jumpTo: string;
  jumpToConfirm: string;
  previousPages: string;
  nextPages: string;
  tableEmpty: string;
  selectAllRows: string;
  expandRow: string;
  collapseRow: string;
  uploadFile: string;
  uploadDrop: string;
  removeFile: string;
  previewFile: string;
  downloadFile: string;
  uploadError: string;
  previewUnavailable: string;
  source: string;
  target: string;
  itemUnit: string;
  itemsUnit: string;
  selectAll: string;
  deselectAll: string;
  selectCurrent: string;
  invertCurrent: string;
  removeAll: string;
  removeCurrent: string;
  moveToTarget: string;
  moveToSource: string;
  clearSearch: string;
  calendarYear: string;
  calendarMonth: string;
  calendarView: string;
  millisecond: string;
  meridiem: string;
  zoomIn: string;
  zoomOut: string;
  rotateLeft: string;
  rotateRight: string;
  flipX: string;
  flipY: string;
  colorMode: string;
  colorSingle: string;
  colorGradient: string;
  colorStop: string;
  addColorStop: string;
  removeColorStop: string;
  colorPosition: string;
  colorStopPosition: string;
  colorFormat: string;
  colorHex: string;
  colorRed: string;
  colorGreen: string;
  colorBlue: string;
  colorHue: string;
  colorSaturation: string;
  colorBrightness: string;
  colorAlpha: string;
  clearColor: string;
  colorPreset: string;
  colorTransparent: string;
  chooseColor: string;
  colorPicker: string;
  loadingQrCode: string;
  loadingNotification: string;
  closeNotification: string;
  floatingActions: string;
  breadcrumb: string;
  showMore: string;
  collapsePanel: string;
  selectionActions: string;
  more: string;
  scrollVertically: string;
  scrollHorizontally: string;
  filter: string;
  filterReset: string;
  page: (page: number) => string;
  itemCount: (count: number) => string;
  selectRow: (label: string) => string;
  moreUsers: (count: number) => string;
  resizePanels: (first: number, second: number) => string;
}

/** Complete dictionaries shipped by tao-ui; custom TaoLocale values stay compatible. */
export type BuiltinTaoLocale = Required<
  Omit<TaoLocale, 'messages' | 'form'>
> & {
  messages: TaoMessages;
  form: ValidateMessages;
};
