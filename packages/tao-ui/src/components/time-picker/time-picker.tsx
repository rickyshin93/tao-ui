import RcPicker, {
  type PickerRef,
  type PickerProps as RcPickerProps,
  RangePicker as RcRangePicker,
  type RangePickerProps as RcRangePickerProps,
} from '@rc-component/picker';
import dayjsConfig from '@rc-component/picker/generate/dayjs';
import type { Locale, RangePickerRef } from '@rc-component/picker/interface';
import enLocale from '@rc-component/picker/locale/en_US';
import zhLocale from '@rc-component/picker/locale/zh_CN';
import type { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  TaoPortalScope,
  useTaoConfig,
  useTaoInternalConfig,
} from '../../provider/tao-provider';
import { cx } from '../../utils/semantic';
import { Button } from '../button/button';
import './time-picker.css';

export type TimePickerSemanticPart =
  | 'root'
  | 'prefix'
  | 'input'
  | 'suffix'
  | 'popup';
export type TimePickerRef = PickerRef;
export type TimeRangePickerRef = RangePickerRef;
export interface TimePickerLocale {
  placeholder?: string;
  rangePlaceholder?: [string, string];
}
export interface TimePickerLocaleConfig {
  lang: Partial<Locale> & {
    placeholder?: string;
    rangePlaceholder?: [string, string];
  };
  timePickerLocale?: TimePickerLocale;
}

type PickerClassNames = NonNullable<RcPickerProps<Dayjs>['classNames']>;
export type TimePickerClassNames = Omit<PickerClassNames, 'popup'> & {
  popup?: string | PickerClassNames['popup'];
};
export type TimePickerStyles = NonNullable<RcPickerProps<Dayjs>['styles']>;
type SemanticValue<Value, Props> = Value | ((info: { props: Props }) => Value);
interface TimeAppearance {
  locale?: TimePickerLocaleConfig;
  size?: 'small' | 'medium' | 'middle' | 'large';
  status?: 'error' | 'warning' | 'success' | 'validating';
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined';
  /** @deprecated Use variant. */
  bordered?: boolean;
  /** @deprecated Use classNames.popup.root. */
  popupClassName?: string;
  /** @deprecated Use classNames.popup.root. */
  dropdownClassName?: string;
  /** @deprecated Use styles.popup.root. */
  popupStyle?: CSSProperties;
}

export interface TimePickerProps
  extends Omit<
      RcPickerProps<Dayjs>,
      | 'picker'
      | 'showTime'
      | 'generateConfig'
      | 'locale'
      | 'classNames'
      | 'styles'
      | 'value'
      | 'defaultValue'
      | 'onChange'
      | 'onOk'
      | 'multiple'
    >,
    TimeAppearance {
  value?: Dayjs | null;
  defaultValue?: Dayjs | null;
  onChange?: (time: Dayjs | null, timeString: string | null) => void;
  onOk?: (time: Dayjs) => void;
  /** @deprecated Use onCalendarChange. */
  onSelect?: (time: Dayjs) => void;
  /** @deprecated Use renderExtraFooter. */
  addon?: () => ReactNode;
  classNames?: SemanticValue<TimePickerClassNames, TimePickerProps>;
  styles?: SemanticValue<TimePickerStyles, TimePickerProps>;
}

export interface TimeRangePickerProps
  extends Omit<
      RcRangePickerProps<Dayjs>,
      | 'picker'
      | 'showTime'
      | 'generateConfig'
      | 'locale'
      | 'classNames'
      | 'styles'
    >,
    TimeAppearance {
  classNames?: SemanticValue<TimePickerClassNames, TimeRangePickerProps>;
  styles?: SemanticValue<TimePickerStyles, TimeRangePickerProps>;
}

function TimeIcon({ clear = false }: { clear?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {clear ? (
        <path d="m6 6 12 12M18 6 6 18" />
      ) : (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      )}
    </svg>
  );
}

function ConfirmButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <Button {...props} size="small" />;
}

function NowButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <Button {...props} size="small" variant="bare" />;
}

function useAppearance(
  props: TimeAppearance,
  classNames: TimePickerClassNames | undefined,
  styles: TimePickerStyles | undefined,
) {
  const config = useTaoConfig();
  const { tokenStyle } = useTaoInternalConfig();
  const baseLocale = config.locale.locale === 'zh_CN' ? zhLocale : enLocale;
  const popup =
    typeof classNames?.popup === 'string'
      ? { root: classNames.popup }
      : classNames?.popup;
  return {
    config,
    locale: {
      ...baseLocale,
      now: config.locale.now,
      ok: config.locale.ok,
      clear: config.locale.clear,
      ...props.locale?.lang,
    },
    size: props.size === 'middle' ? 'medium' : (props.size ?? config.size),
    variant:
      props.variant ??
      (props.bordered === false ? 'borderless' : config.variant),
    classNames: {
      ...classNames,
      popup: {
        ...popup,
        root: cx(props.dropdownClassName, props.popupClassName, popup?.root),
      },
    },
    styles: {
      ...styles,
      popup: {
        ...styles?.popup,
        root: {
          ...tokenStyle,
          position: 'absolute' as const,
          width: 'max-content',
          maxWidth: 'calc(100vw - 24px)',
          zIndex: 'calc(var(--tao-z-index-popup-base) + 50)',
          ...props.popupStyle,
          ...styles?.popup?.root,
        },
      },
    },
  };
}

function scopedPanel(
  panel: ReactNode,
  render?: (panel: ReactNode) => ReactNode,
) {
  return (
    <TaoPortalScope asChild>
      <div data-tao-time-popup="">{render ? render(panel) : panel}</div>
    </TaoPortalScope>
  );
}

const SingleTimePicker = forwardRef<TimePickerRef, TimePickerProps>(
  (props, ref) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const pickerRef = useRef<PickerRef>(null);
    useImperativeHandle(ref, () => ({
      get nativeElement() {
        return rootRef.current as HTMLDivElement;
      },
      focus: (options) => pickerRef.current?.focus(options),
      blur: () => pickerRef.current?.blur(),
    }));
    const names =
      typeof props.classNames === 'function'
        ? props.classNames({ props })
        : props.classNames;
    const semanticStyles =
      typeof props.styles === 'function'
        ? props.styles({ props })
        : props.styles;
    const appearance = useAppearance(props, names, semanticStyles);
    const {
      locale,
      size,
      status,
      variant,
      bordered,
      popupClassName,
      dropdownClassName,
      popupStyle,
      classNames,
      styles,
      addon,
      renderExtraFooter,
      panelRender,
      components,
      onSelect,
      onCalendarChange,
      onChange,
      onOk,
      defaultValue,
      disabled = appearance.config.disabled,
      allowClear = true,
      suffix,
      suffixIcon,
      prefixCls = 'tao-time-picker',
      placeholder,
      className,
      style,
      ...rest
    } = props;
    void [
      size,
      variant,
      bordered,
      popupClassName,
      dropdownClassName,
      popupStyle,
      classNames,
      styles,
    ];
    const clear =
      allowClear === false
        ? false
        : {
            clearIcon: <TimeIcon clear />,
            label: appearance.config.locale.clear,
            ...(typeof allowClear === 'object' ? allowClear : {}),
          };
    return (
      <div
        ref={rootRef}
        data-tao-time-picker=""
        data-tao-control=""
        data-tao-size={appearance.size}
        data-tao-variant={appearance.variant}
        data-tao-error={status === 'error' || undefined}
        data-tao-warning={status === 'warning' || undefined}
        data-disabled={disabled || undefined}
        className={cx(names?.root, className, props.rootClassName)}
        style={{ ...semanticStyles?.root, ...style }}
      >
        <RcPicker<Dayjs>
          {...rest}
          ref={pickerRef}
          picker="time"
          generateConfig={dayjsConfig}
          locale={appearance.locale}
          defaultValue={defaultValue ?? undefined}
          disabled={disabled}
          placeholder={
            placeholder ??
            locale?.timePickerLocale?.placeholder ??
            locale?.lang.placeholder ??
            appearance.config.locale.selectTime ??
            'Select time'
          }
          prefixCls={prefixCls}
          aria-busy={status === 'validating' || undefined}
          suffix={
            suffix !== undefined ? (
              suffix
            ) : suffixIcon !== undefined ? (
              suffixIcon
            ) : (
              <TimeIcon />
            )
          }
          allowClear={clear}
          classNames={{ ...appearance.classNames, root: undefined }}
          styles={{ ...appearance.styles, root: undefined }}
          components={{
            nowButton: NowButton,
            okButton: components?.button ?? ConfirmButton,
            ...components,
          }}
          panelRender={(panel) => scopedPanel(panel, panelRender)}
          renderExtraFooter={renderExtraFooter ?? addon}
          onChange={(date, text) =>
            onChange?.(date as Dayjs | null, text as string)
          }
          onOk={(date) => onOk?.(date as Dayjs)}
          onCalendarChange={(date, text, info) => {
            onCalendarChange?.(date, text, info);
            if (date) onSelect?.(date as Dayjs);
          }}
        />
      </div>
    );
  },
);
SingleTimePicker.displayName = 'TimePicker';

export const TimeRangePicker = forwardRef<
  TimeRangePickerRef,
  TimeRangePickerProps
>((props, ref) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<RangePickerRef>(null);
  useImperativeHandle(ref, () => ({
    get nativeElement() {
      return rootRef.current as HTMLDivElement;
    },
    focus: (options) => pickerRef.current?.focus(options),
    blur: () => pickerRef.current?.blur(),
  }));
  const names =
    typeof props.classNames === 'function'
      ? props.classNames({ props })
      : props.classNames;
  const semanticStyles =
    typeof props.styles === 'function' ? props.styles({ props }) : props.styles;
  const appearance = useAppearance(props, names, semanticStyles);
  const {
    locale,
    size,
    status,
    variant,
    bordered,
    popupClassName,
    dropdownClassName,
    popupStyle,
    classNames,
    styles,
    panelRender,
    components,
    disabled = appearance.config.disabled,
    allowClear = true,
    suffix,
    suffixIcon,
    prefixCls = 'tao-time-picker',
    placeholder,
    className,
    style,
    ...rest
  } = props;
  void [
    size,
    variant,
    bordered,
    popupClassName,
    dropdownClassName,
    popupStyle,
    classNames,
    styles,
  ];
  const clear =
    allowClear === false
      ? false
      : {
          clearIcon: <TimeIcon clear />,
          label: appearance.config.locale.clear,
          ...(typeof allowClear === 'object' ? allowClear : {}),
        };
  return (
    <div
      ref={rootRef}
      data-tao-time-picker="range"
      data-tao-control=""
      data-tao-size={appearance.size}
      data-tao-variant={appearance.variant}
      data-tao-error={status === 'error' || undefined}
      data-tao-warning={status === 'warning' || undefined}
      data-disabled={disabled === true || undefined}
      className={cx(names?.root, className, props.rootClassName)}
      style={{ ...semanticStyles?.root, ...style }}
    >
      <RcRangePicker<Dayjs>
        {...rest}
        ref={pickerRef}
        picker="time"
        generateConfig={dayjsConfig}
        locale={appearance.locale}
        disabled={disabled}
        placeholder={
          placeholder ??
          locale?.timePickerLocale?.rangePlaceholder ??
          locale?.lang.rangePlaceholder ?? [
            appearance.config.locale.startTime ?? 'Start time',
            appearance.config.locale.endTime ?? 'End time',
          ]
        }
        prefixCls={prefixCls}
        aria-busy={status === 'validating' || undefined}
        suffix={
          suffix !== undefined ? (
            suffix
          ) : suffixIcon !== undefined ? (
            suffixIcon
          ) : (
            <TimeIcon />
          )
        }
        allowClear={clear}
        classNames={{ ...appearance.classNames, root: undefined }}
        styles={{ ...appearance.styles, root: undefined }}
        components={{
          nowButton: NowButton,
          okButton: components?.button ?? ConfirmButton,
          ...components,
        }}
        panelRender={(panel) => scopedPanel(panel, panelRender)}
      />
    </div>
  );
});
TimeRangePicker.displayName = 'TimePicker.RangePicker';

export const TimePicker = Object.assign(SingleTimePicker, {
  RangePicker: TimeRangePicker,
});
