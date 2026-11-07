import { PickerPanel } from '@rc-component/picker';
import dayjsConfig from '@rc-component/picker/generate/dayjs';
import type { CellRenderInfo, Locale } from '@rc-component/picker/interface';
import enLocale from '@rc-component/picker/locale/en_US';
import dayjs, { type Dayjs } from 'dayjs';
import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTaoConfig, useTaoDirection } from '../../provider/tao-provider';
import { Segmented } from '../segmented/segmented';
import { Select } from '../select/select';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { mergeRefs } from '../../utils/refs';
import './calendar.css';

export type CalendarMode = 'year' | 'month';
export type CalendarSemanticPart =
  | 'root'
  | 'header'
  | 'body'
  | 'content'
  | 'item'
  | 'itemContent';
export interface CalendarSelectInfo {
  source: 'year' | 'month' | 'date' | 'customize';
}
export type HeaderRender<DateType> = (config: {
  value: DateType;
  type: CalendarMode;
  onChange: (date: DateType) => void;
  onTypeChange: (type: CalendarMode) => void;
}) => ReactNode;
type SemanticValue<Value, Props> = Value | ((info: { props: Props }) => Value);
export interface CalendarProps<DateType = Dayjs> {
  direction?: 'ltr' | 'rtl';
  prefixCls?: string;
  className?: string;
  rootClassName?: string;
  style?: CSSProperties;
  classNames?: SemanticValue<
    SemanticClassNames<CalendarSemanticPart>,
    CalendarProps<DateType>
  >;
  styles?: SemanticValue<
    SemanticStyles<CalendarSemanticPart>,
    CalendarProps<DateType>
  >;
  locale?: {
    lang: Partial<Locale>;
    timePickerLocale?: { placeholder?: string };
  };
  validRange?: [DateType, DateType];
  disabledDate?: (date: DateType) => boolean;
  dateFullCellRender?: (date: DateType) => ReactNode;
  dateCellRender?: (date: DateType) => ReactNode;
  monthFullCellRender?: (date: DateType) => ReactNode;
  monthCellRender?: (date: DateType) => ReactNode;
  cellRender?: (date: DateType, info: CellRenderInfo<DateType>) => ReactNode;
  fullCellRender?: (
    date: DateType,
    info: CellRenderInfo<DateType>,
  ) => ReactNode;
  headerRender?: HeaderRender<DateType>;
  value?: DateType;
  defaultValue?: DateType;
  mode?: CalendarMode;
  fullscreen?: boolean;
  showWeek?: boolean;
  onChange?: (date: DateType) => void;
  onPanelChange?: (date: DateType, mode: CalendarMode) => void;
  onSelect?: (date: DateType, info: CalendarSelectInfo) => void;
}
export interface CalendarRef {
  nativeElement: HTMLDivElement;
}

export const Calendar = forwardRef<CalendarRef, CalendarProps>((props, ref) => {
  const config = useTaoConfig();
  const root = useRef<HTMLDivElement>(null);
  const [direction, directionRef] = useTaoDirection(props.direction);
  const mergedRootRef = useMemo(
    () => mergeRefs(root, directionRef),
    [directionRef],
  );
  useImperativeHandle(ref, () => ({
    get nativeElement() {
      return root.current as HTMLDivElement;
    },
  }));
  const [innerValue, setValue] = useState(() => props.defaultValue ?? dayjs());
  const [innerMode, setMode] = useState<CalendarMode>('month');
  const value = props.value ?? innerValue;
  const mode = props.mode ?? innerMode;
  const { fullscreen = true, validRange } = props;
  const names =
    typeof props.classNames === 'function'
      ? props.classNames({ props })
      : props.classNames;
  const styles =
    typeof props.styles === 'function' ? props.styles({ props }) : props.styles;
  const locale = {
    ...(config.locale.pickerLocale ?? enLocale),
    ...props.locale?.lang,
  };
  const weekStartsOn = props.locale?.lang.locale
    ? dayjsConfig.locale.getWeekFirstDay(locale.locale)
    : (config.locale.weekStartsOn ??
      dayjsConfig.locale.getWeekFirstDay(locale.locale));
  const generateConfig = useMemo(
    () => ({
      ...dayjsConfig,
      locale: {
        ...dayjsConfig.locale,
        getWeekFirstDay: () => weekStartsOn,
        getWeekFirstDate: (_locale: string, date: Dayjs) =>
          date.subtract((date.day() - weekStartsOn + 7) % 7, 'day'),
      },
    }),
    [weekStartsOn],
  );
  const calendarYear =
    props.locale?.lang.year ?? config.locale.messages.calendarYear;
  const calendarMonth =
    props.locale?.lang.month ?? config.locale.messages.calendarMonth;
  const { calendarView } = config.locale.messages;
  const months =
    locale.shortMonths ??
    dayjsConfig.locale.getShortMonths?.(locale.locale) ??
    [];
  const disabled = (date: Dayjs) =>
    config.disabled ||
    !!(
      validRange &&
      (date.isBefore(validRange[0], 'day') ||
        date.isAfter(validRange[1], 'day'))
    ) || !!props.disabledDate?.(date);
  const select = (date: Dayjs, source: CalendarSelectInfo['source']) => {
    if (config.disabled) return;
    if (props.value === undefined) setValue(date);
    if (!date.isSame(value, 'day')) {
      if (!date.isSame(value, mode === 'month' ? 'month' : 'year'))
        props.onPanelChange?.(date, mode);
      props.onChange?.(date);
    }
    props.onSelect?.(date, { source });
  };
  const changeMode = (next: CalendarMode) => {
    if (config.disabled) return;
    if (props.mode === undefined) setMode(next);
    props.onPanelChange?.(value, next);
  };
  const clamp = (date: Dayjs) =>
    validRange
      ? date.isBefore(validRange[0], 'day')
        ? validRange[0]
        : date.isAfter(validRange[1], 'day')
          ? validRange[1]
          : date
      : date;
  const firstYear = validRange?.[0].year() ?? value.year() - 10;
  const lastYear = validRange?.[1].year() ?? value.year() + 10;
  const minMonth =
    validRange && value.year() === validRange[0].year()
      ? validRange[0].month()
      : 0;
  const maxMonth =
    validRange && value.year() === validRange[1].year()
      ? validRange[1].month()
      : 11;
  const renderCell = (date: Dayjs, info: CellRenderInfo<Dayjs>) => {
    if (props.fullCellRender) return props.fullCellRender(date, info);
    const legacyFull =
      info.type === 'month'
        ? props.monthFullCellRender
        : props.dateFullCellRender;
    if (legacyFull) return legacyFull(date);
    const extra = props.cellRender
      ? props.cellRender(date, info)
      : info.type === 'month'
        ? props.monthCellRender?.(date)
        : props.dateCellRender?.(date);
    return (
      <div
        data-tao-calendar-item=""
        data-today={
          date.isSame(dayjs(), info.type === 'month' ? 'month' : 'day') ||
          undefined
        }
      >
        <span data-tao-calendar-value="">
          {info.type === 'month'
            ? months[date.month()]
            : String(date.date()).padStart(2, '0')}
        </span>
        <div
          data-tao-calendar-events=""
          className={names?.itemContent}
          style={styles?.itemContent}
        >
          {extra}
        </div>
      </div>
    );
  };
  return (
    <div
      ref={mergedRootRef}
      dir={direction}
      data-tao-calendar=""
      data-fullscreen={fullscreen}
      className={cx(names?.root, props.className, props.rootClassName)}
      style={{ ...styles?.root, ...props.style }}
    >
      {props.headerRender ? (
        props.headerRender({
          value,
          type: mode,
          onChange: (date) => select(clamp(date), 'customize'),
          onTypeChange: changeMode,
        })
      ) : (
        <div
          data-tao-calendar-toolbar=""
          className={names?.header}
          style={styles?.header}
        >
          <Select
            aria-label={calendarYear}
            mobileTitle={calendarYear}
            size="medium"
            style={{ width: 'auto', minWidth: '6em' }}
            value={String(value.year())}
            onChange={(year) => select(clamp(value.year(Number(year))), 'year')}
            options={Array.from(
              { length: lastYear - firstYear + 1 },
              (_, index) => ({
                value: String(firstYear + index),
                label: dayjsConfig.locale.format(
                  locale.locale,
                  value.year(firstYear + index),
                  locale.yearFormat ?? 'YYYY',
                ),
              }),
            )}
          />
          {mode === 'month' && (
            <Select
              aria-label={calendarMonth}
              mobileTitle={calendarMonth}
              size="medium"
              style={{ width: 'auto', minWidth: '6em' }}
              value={String(value.month())}
              onChange={(month) =>
                select(clamp(value.month(Number(month))), 'month')
              }
              options={months
                .map((month, index) => ({ label: month, value: String(index) }))
                .slice(minMonth, maxMonth + 1)}
            />
          )}
          <Segmented<CalendarMode>
            aria-label={calendarView}
            size="medium"
            value={mode}
            onChange={changeMode}
            options={[
              { value: 'month', label: calendarMonth },
              { value: 'year', label: calendarYear },
            ]}
          />
        </div>
      )}
      <PickerPanel<Dayjs>
        direction={direction}
        prefixCls={props.prefixCls ?? 'tao-calendar-panel'}
        generateConfig={generateConfig}
        locale={locale}
        value={value}
        mode={mode === 'year' ? 'month' : 'date'}
        picker={mode === 'year' ? 'month' : 'date'}
        hideHeader
        showWeek={props.showWeek}
        disabledDate={disabled}
        onSelect={(date) =>
          mode === 'year' ? select(clamp(date), 'month') : select(date, 'date')
        }
        cellRender={(date, info) => renderCell(date as Dayjs, info)}
        classNames={{
          body: names?.body,
          content: names?.content,
          item: names?.item,
        }}
        styles={{
          body: styles?.body,
          content: styles?.content,
          item: styles?.item,
        }}
      />
    </div>
  );
});
Calendar.displayName = 'Calendar';
