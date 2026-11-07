import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  groupInteger,
  localizeDigits,
  type NumberFormatOptions,
  resolveNumberFormat,
} from '../../number-input/locale';
import { useTaoConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Skeleton } from '../skeleton/skeleton';
import './statistic.css';
export type StatisticValue = number | string;
export type StatisticSemanticPart =
  | 'root'
  | 'content'
  | 'value'
  | 'title'
  | 'header'
  | 'prefix'
  | 'suffix';
export interface StatisticFormatConfig {
  /** BCP 47 locale. Defaults to the provider's number locale. */
  locale?: string;
  formatter?:
    | false
    | 'number'
    | 'countdown'
    | ((value: StatisticValue, config?: StatisticFormatConfig) => ReactNode);
  decimalSeparator?: string;
  groupSeparator?: string;
  precision?: number;
}
export interface StatisticProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'prefix'>,
    StatisticFormatConfig {
  prefixCls?: string;
  rootClassName?: string;
  value?: StatisticValue;
  valueStyle?: CSSProperties;
  valueRender?: (node: ReactNode) => ReactNode;
  title?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  loading?: boolean;
  classNames?:
    | SemanticClassNames<StatisticSemanticPart>
    | ((info: {
        props: StatisticProps;
      }) => SemanticClassNames<StatisticSemanticPart>);
  styles?:
    | SemanticStyles<StatisticSemanticPart>
    | ((info: {
        props: StatisticProps;
      }) => SemanticStyles<StatisticSemanticPart>);
}
export interface StatisticRef {
  nativeElement: HTMLDivElement;
}
const plainNumber = new Intl.NumberFormat('en-US', {
  useGrouping: false,
  maximumSignificantDigits: 21,
});
function formattedNumber(
  value: StatisticValue,
  precision: number | undefined,
  options: NumberFormatOptions,
): ReactNode {
  const text =
    typeof value === 'number' && String(value).includes('e')
      ? plainNumber.format(value)
      : String(value);
  const match = /^(-?)(\d*)(?:\.(\d+))?$/.exec(text);
  if (!match || text === '-') return text;
  const integer = localizeDigits(
    groupInteger(match[2] || '0', options),
    options,
  );
  const fraction =
    precision === undefined
      ? (match[3] ?? '')
      : (match[3] ?? '')
          .padEnd(precision, '0')
          .slice(0, Math.max(0, precision));
  return (
    <>
      <span data-tao-statistic-integer="">
        {match[1] ? (options.minusSign ?? '-') : ''}
        {integer}
      </span>
      {fraction && (
        <span data-tao-statistic-decimal="">
          {options.decimalSeparator}
          {localizeDigits(fraction, options)}
        </span>
      )}
    </>
  );
}
const hasContent = (node: ReactNode) =>
  node !== undefined && node !== null && typeof node !== 'boolean';
const StatisticRoot = forwardRef<StatisticRef, StatisticProps>((props, ref) => {
  const {
    prefixCls,
    rootClassName,
    value = 0,
    valueStyle,
    valueRender,
    title,
    prefix,
    suffix,
    loading = false,
    formatter,
    locale: localeProp,
    decimalSeparator,
    groupSeparator,
    precision,
    classNames,
    styles,
    className,
    style,
    ...rest
  } = props;
  const config = useTaoConfig();
  const locale = localeProp ?? config.locale.numberLocale;
  const numberFormat = useMemo(
    () =>
      resolveNumberFormat(locale, {
        decimalSeparator,
        thousandsSeparator: groupSeparator,
      }),
    [locale, decimalSeparator, groupSeparator],
  );
  const merged = {
    ...props,
    value,
    loading,
    decimalSeparator: numberFormat.decimalSeparator,
    groupSeparator: numberFormat.thousandsSeparator,
  };
  const classes =
    typeof classNames === 'function'
      ? classNames({ props: merged })
      : classNames;
  const slots =
    typeof styles === 'function' ? styles({ props: merged }) : styles;
  const node = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({ nativeElement: node.current! }));
  const formatted = (
    <span
      data-tao-statistic-value=""
      className={classes?.value}
      style={slots?.value}
    >
      {typeof formatter === 'function'
        ? formatter(value)
        : formatter === false
          ? value
          : formattedNumber(value, precision, numberFormat)}
    </span>
  );
  return (
    <div
      {...rest}
      ref={node}
      data-tao-statistic=""
      className={cx(prefixCls, classes?.root, className, rootClassName)}
      style={{ ...slots?.root, ...style }}
    >
      {hasContent(title) && (
        <div
          data-tao-statistic-header=""
          className={classes?.header}
          style={slots?.header}
        >
          <div
            data-tao-statistic-title=""
            className={classes?.title}
            style={slots?.title}
          >
            {title}
          </div>
        </div>
      )}
      <Skeleton loading={loading} paragraph={false} active>
        <div
          data-tao-statistic-content=""
          className={classes?.content}
          style={{ ...valueStyle, ...slots?.content }}
        >
          {hasContent(prefix) && (
            <span
              data-tao-statistic-prefix=""
              className={classes?.prefix}
              style={slots?.prefix}
            >
              {prefix}
            </span>
          )}
          {valueRender ? valueRender(formatted) : formatted}
          {hasContent(suffix) && (
            <span
              data-tao-statistic-suffix=""
              className={classes?.suffix}
              style={slots?.suffix}
            >
              {suffix}
            </span>
          )}
        </div>
      </Skeleton>
    </div>
  );
});
StatisticRoot.displayName = 'Statistic';
export type TimerType = 'countdown' | 'countup';
export interface StatisticTimerProps extends Omit<StatisticProps, 'onChange'> {
  type: TimerType;
  format?: string;
  onFinish?: () => void;
  onChange?: (value?: StatisticValue) => void;
}
export type CountdownProps = Omit<StatisticTimerProps, 'type'>;
const units: [string, number][] = [
  ['Y', 365 * 86400000],
  ['M', 30 * 86400000],
  ['D', 86400000],
  ['H', 3600000],
  ['m', 60000],
  ['s', 1000],
  ['S', 1],
];
function formatDuration(duration: number, format: string) {
  const literals: string[] = [];
  let output = format.replace(/\[([^\]]*)\]/g, (_, literal: string) => {
    literals.push(literal);
    return '\0';
  });
  let remaining = Math.max(0, duration);
  for (const [unit, milliseconds] of units) {
    if (!output.includes(unit)) continue;
    const value = Math.floor(remaining / milliseconds);
    remaining %= milliseconds;
    output = output.replace(new RegExp(`${unit}+`, 'g'), (token) =>
      String(value).padStart(token.length, '0'),
    );
  }
  let index = 0;
  return output.replace(/\0/g, () => literals[index++]);
}
function StatisticTimer({
  value,
  format = 'HH:mm:ss',
  onChange,
  onFinish,
  type,
  ...rest
}: StatisticTimerProps) {
  const [now, setNow] = useState<number>();
  const callbacks = useRef({ onChange, onFinish });
  useLayoutEffect(() => {
    callbacks.current = { onChange, onFinish };
  }, [onChange, onFinish]);
  const timestamp = value === undefined ? NaN : new Date(value).getTime();
  const target = Number.isNaN(timestamp) ? undefined : timestamp;
  useEffect(() => {
    if (target === undefined) {
      setNow(undefined);
      return;
    }
    setNow(Date.now());
    const timer = setInterval(() => {
      const current = Date.now();
      const difference = Math.max(
        0,
        type === 'countdown' ? target - current : current - target,
      );
      setNow(current);
      callbacks.current.onChange?.(difference);
      if (type === 'countdown' && current >= target) {
        clearInterval(timer);
        callbacks.current.onFinish?.();
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [target, type]);
  return (
    <StatisticRoot
      {...rest}
      value={value}
      formatter={() =>
        now === undefined || target === undefined
          ? '-'
          : formatDuration(
              type === 'countdown' ? target - now : now - target,
              format,
            )
      }
    />
  );
}
function Countdown(props: CountdownProps) {
  return <StatisticTimer {...props} type="countdown" />;
}
export const Statistic = Object.assign(StatisticRoot, {
  Timer: StatisticTimer,
  Countdown,
});
