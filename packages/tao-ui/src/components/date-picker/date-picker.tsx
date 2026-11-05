import * as Popover from '@radix-ui/react-popover';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  type AriaAttributes,
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  TaoPortalScope,
  type TaoSize,
  type TaoStatus,
  type TaoVariant,
  useTaoConfig,
} from '../../provider/tao-provider';
import { useIsMobile } from '../../utils/breakpoint';
import { useMobileTitle } from '../../utils/field-label';
import { Button } from '../button/button';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Drawer } from '../drawer/drawer';
import { CalendarGrid } from './calendar/calendar-grid';
import { CalendarHeader } from './calendar/calendar-header';
import { MonthGrid } from './calendar/month-grid';
import { TimePanel } from './calendar/time-panel';
import { YearGrid } from './calendar/year-grid';
import './date-picker.css';
import { Presets } from './presets';
import {
  getDefaultFormat,
  type PanelMode,
  type PickerRef,
  type PresetItem,
  type TimeConfig,
} from './types';

dayjs.extend(customParseFormat);

export type { PickerRef } from './types';

export type DatePickerSemanticPart =
  | 'root'
  | 'input'
  | 'popup'
  | 'calendar'
  | 'cell'
  | 'footer';

export interface DatePickerProps
  extends Pick<
    AriaAttributes,
    | 'aria-label'
    | 'aria-labelledby'
    | 'aria-describedby'
    | 'aria-errormessage'
    | 'aria-invalid'
    | 'aria-required'
  > {
  id?: string;
  value?: Dayjs | null;
  defaultValue?: Dayjs | null;
  onChange?: (date: Dayjs | null, dateString: string) => void;
  picker?: 'date' | 'month' | 'year';
  showTime?: boolean | TimeConfig;
  format?: string;
  disabledDate?: (date: Dayjs) => boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  presets?: PresetItem[];
  placeholder?: string;
  size?: TaoSize;
  variant?: TaoVariant;
  disabled?: boolean;
  allowClear?: boolean;
  prefix?: ReactNode;
  suffixIcon?: ReactNode;
  status?: TaoStatus;
  ref?: Ref<PickerRef>;
  mobile?: boolean;
  /** Mobile drawer title. Defaults to the Form.Item/FormField label, then locale text. */
  mobileTitle?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<DatePickerSemanticPart>;
  styles?: SemanticStyles<DatePickerSemanticPart>;
}

export const DatePicker = forwardRef(function DatePicker(
  props: DatePickerProps,
  ref: ForwardedRef<PickerRef>,
) {
  const {
    value,
    defaultValue,
    onChange,
    picker = 'date',
    showTime,
    format: formatProp,
    disabledDate,
    minDate,
    maxDate,
    presets,
    placeholder,
    size,
    variant,
    disabled,
    allowClear = true,
    prefix,
    suffixIcon,
    status,
    mobile,
    open: controlledOpen,
    onOpenChange,
    className,
    style,
    classNames,
    styles,
  } = props;
  const popupId = useId();
  const popupRef = useRef<HTMLDivElement>(null);
  const keyboardOpenRef = useRef(false);
  const ctx = useTaoConfig();
  const resolvedSize = size ?? ctx.size;
  const resolvedVariant = variant ?? ctx.variant;
  const resolvedDisabled = disabled ?? ctx.disabled;
  const autoMobile = useIsMobile();
  const isMobile = mobile ?? autoMobile;
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      focus: () =>
        (isMobile ? mobileTriggerRef.current : inputRef.current)?.focus(),
      blur: () => {
        mobileTriggerRef.current?.blur();
        inputRef.current?.blur();
      },
      get nativeElement() {
        return isMobile ? mobileTriggerRef.current : inputRef.current;
      },
    }),
    [isMobile],
  );

  const fmt = formatProp ?? getDefaultFormat(picker, showTime);
  const defaultPlaceholder = placeholder ?? fmt;
  const drawerTitle = useMobileTitle(
    props.mobileTitle,
    showTime ? ctx.locale.dateTime : ctx.locale.selectDate,
  );

  const isDateBlocked = useCallback(
    (date: Dayjs) => {
      const granularity = picker === 'date' ? 'day' : picker;
      return (
        !date.isValid() ||
        Boolean(disabledDate?.(date)) ||
        (minDate != null && date.isBefore(minDate, granularity)) ||
        (maxDate != null && date.isAfter(maxDate, granularity))
      );
    },
    [picker, disabledDate, minDate, maxDate],
  );

  const isValueControlled = 'value' in props;
  const [internalValue, setInternalValue] = useState<Dayjs | null>(
    defaultValue ?? null,
  );
  const resolvedValue = isValueControlled ? (value ?? null) : internalValue;
  const emitChange = useCallback(
    (next: Dayjs | null, dateString: string) => {
      if (!isValueControlled) setInternalValue(next);
      onChange?.(next, dateString);
    },
    [isValueControlled, onChange],
  );

  const [internalOpen, setInternalOpen] = useState(false);
  const displayValue = resolvedValue ? resolvedValue.format(fmt) : '';
  const [inputValue, setInputValue] = useState(displayValue);
  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = useCallback(
    (v: boolean) => {
      setInternalOpen(v);
      onOpenChange?.(v);
    },
    [onOpenChange],
  );

  useEffect(() => {
    setInputValue(displayValue);
  }, [displayValue]);

  const [viewDate, setViewDate] = useState<Dayjs>(
    () => resolvedValue ?? dayjs(),
  );
  const [panelMode, setPanelMode] = useState<PanelMode>(
    picker === 'year' ? 'year' : picker === 'month' ? 'month' : 'date',
  );
  const [timeScrollKey, setTimeScrollKey] = useState(0);

  // Reset panel state when opening
  useEffect(() => {
    if (isOpen) {
      setViewDate(resolvedValue ?? dayjs());
      setPanelMode(
        picker === 'year' ? 'year' : picker === 'month' ? 'month' : 'date',
      );
      setTimeScrollKey((k) => k + 1);
    }
  }, [isOpen, picker, resolvedValue]);

  // Time state
  const timeValue = useMemo(
    () => ({
      hour: resolvedValue?.hour() ?? 0,
      minute: resolvedValue?.minute() ?? 0,
      second: resolvedValue?.second() ?? 0,
    }),
    [resolvedValue],
  );

  const handleDateSelect = useCallback(
    (date: Dayjs) => {
      let result = date;
      if (showTime && resolvedValue) {
        result = date
          .hour(resolvedValue.hour())
          .minute(resolvedValue.minute())
          .second(resolvedValue.second());
      }
      if (!showTime) {
        emitChange(result, result.format(fmt));
        setOpen(false);
      } else {
        emitChange(result, result.format(fmt));
        // Keep open for time selection
      }
    },
    [emitChange, fmt, showTime, resolvedValue, setOpen],
  );

  const handleMonthSelect = useCallback(
    (date: Dayjs) => {
      if (picker === 'month') {
        emitChange(date, date.format(fmt));
        setOpen(false);
      } else {
        setViewDate(date);
        setPanelMode('date');
      }
    },
    [picker, emitChange, fmt, setOpen],
  );

  const handleYearSelect = useCallback(
    (date: Dayjs) => {
      if (picker === 'year') {
        emitChange(date, date.format(fmt));
        setOpen(false);
      } else {
        setViewDate(date);
        setPanelMode(picker === 'month' ? 'month' : 'date');
      }
    },
    [picker, emitChange, fmt, setOpen],
  );

  const handleTimeChange = useCallback(
    (h: number, m: number, s: number) => {
      const base = resolvedValue ?? dayjs();
      const result = base.hour(h).minute(m).second(s);
      emitChange(result, result.format(fmt));
    },
    [resolvedValue, emitChange, fmt],
  );

  const handleClear = useCallback(
    (e: React.SyntheticEvent) => {
      e.stopPropagation();
      emitChange(null, '');
    },
    [emitChange],
  );

  const handlePresetSelect = useCallback(
    (val: unknown) => {
      const d = val as Dayjs;
      if (isDateBlocked(d)) return;
      emitChange(d, d.format(fmt));
      setOpen(false);
    },
    [emitChange, fmt, setOpen, isDateBlocked],
  );

  const handleOk = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleNow = useCallback(() => {
    const now = dayjs();
    emitChange(now, now.format(fmt));
    setViewDate(now);
    setPanelMode('date');
    setTimeScrollKey((k) => k + 1);
  }, [emitChange, fmt]);

  const showClearBtn = allowClear && resolvedValue && !resolvedDisabled;

  const commitInputValue = useCallback(() => {
    const text = inputValue.trim();
    if (!text) {
      if (displayValue) emitChange(null, '');
      setInputValue(isValueControlled ? displayValue : '');
      setOpen(false);
      return;
    }

    const parsed = dayjs(text, fmt, true);
    if (isDateBlocked(parsed)) {
      setInputValue(displayValue);
      return;
    }

    const formatted = parsed.format(fmt);
    setInputValue(isValueControlled ? displayValue : formatted);
    setViewDate(parsed);
    if (formatted !== displayValue) emitChange(parsed, formatted);
    setOpen(false);
  }, [
    displayValue,
    fmt,
    inputValue,
    isValueControlled,
    isDateBlocked,
    emitChange,
    setOpen,
  ]);

  const showTimePanel = !!(showTime && panelMode === 'date');

  const datePanel = (
    <>
      <CalendarHeader
        viewDate={viewDate}
        panelMode={panelMode}
        onViewDateChange={setViewDate}
        onPanelModeChange={setPanelMode}
      />
      <div data-tao-picker-body="">
        {panelMode === 'date' && (
          <CalendarGrid
            viewDate={viewDate}
            value={resolvedValue}
            onSelect={handleDateSelect}
            onViewDateChange={setViewDate}
            disabledDate={disabledDate}
            minDate={minDate}
            maxDate={maxDate}
            className={classNames?.calendar}
            style={styles?.calendar}
            cellClassName={classNames?.cell}
            cellStyle={styles?.cell}
          />
        )}
        {panelMode === 'month' && (
          <MonthGrid
            viewDate={viewDate}
            value={resolvedValue}
            onSelect={handleMonthSelect}
            disabledDate={disabledDate}
            minDate={minDate}
            maxDate={maxDate}
          />
        )}
        {(panelMode === 'year' || panelMode === 'decade') && (
          <YearGrid
            viewDate={viewDate}
            value={resolvedValue}
            onSelect={handleYearSelect}
            disabledDate={disabledDate}
            minDate={minDate}
            maxDate={maxDate}
          />
        )}
      </div>
    </>
  );

  // Panel content (shared between desktop popover and mobile drawer)
  const panelContent = (
    <div
      data-tao-picker-panel=""
      data-tao-has-time={showTimePanel || undefined}
      className={isMobile ? classNames?.popup : undefined}
      style={isMobile ? styles?.popup : undefined}
    >
      {showTimePanel ? (
        <div data-tao-picker-datetime="">
          <div data-tao-picker-date-side="">{datePanel}</div>
          <div data-tao-picker-time="">
            <div data-tao-time-header="">
              {String(timeValue.hour).padStart(2, '0')}:
              {String(timeValue.minute).padStart(2, '0')}:
              {String(timeValue.second).padStart(2, '0')}
            </div>
            <TimePanel
              hour={timeValue.hour}
              minute={timeValue.minute}
              second={timeValue.second}
              onChange={handleTimeChange}
              config={typeof showTime === 'object' ? showTime : undefined}
              scrollKey={timeScrollKey}
            />
          </div>
        </div>
      ) : (
        datePanel
      )}
      {presets && presets.length > 0 && (
        <Presets items={presets} onSelect={handlePresetSelect} />
      )}
      {showTimePanel && (
        <div
          data-tao-picker-footer=""
          className={classNames?.footer}
          style={styles?.footer}
        >
          <Button
            variant="secondary"
            size="small"
            disabled={false}
            data-tao-picker-footer-btn=""
            onClick={handleNow}
          >
            {ctx.locale.now}
          </Button>
          <Button
            size="small"
            disabled={false}
            data-tao-picker-footer-btn=""
            data-tao-primary=""
            onClick={handleOk}
          >
            {ctx.locale.ok}
          </Button>
        </div>
      )}
    </div>
  );

  const pickerIcons = (
    <span
      data-tao-picker-icons=""
      data-tao-clearable={showClearBtn || undefined}
    >
      {showClearBtn && (
        // biome-ignore lint/a11y/useSemanticElements: nested buttons are invalid in the mobile trigger; the desktop trigger shares this content.
        <span
          data-tao-picker-clear=""
          onClick={(event) => {
            event.stopPropagation();
            handleClear(event);
          }}
          aria-label={ctx.locale.clear}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              handleClear(event);
            }
          }}
        >
          <CloseIcon />
        </span>
      )}
      <span data-tao-picker-suffix="">{suffixIcon ?? <CalendarIcon />}</span>
    </span>
  );

  const controlAria = {
    'aria-label': props['aria-label'],
    'aria-labelledby': props['aria-labelledby'],
    'aria-describedby': props['aria-describedby'],
    'aria-errormessage': props['aria-errormessage'],
    'aria-invalid': status === 'error' ? true : props['aria-invalid'],
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': isOpen,
  };

  const focusCalendar = () => {
    const popup = popupRef.current;
    const target =
      popup?.querySelector<HTMLButtonElement>(
        '[data-tao-calendar-cell-button][tabindex="0"]:not(:disabled)',
      ) ??
      popup?.querySelector<HTMLButtonElement>(
        'button[aria-pressed="true"]:not(:disabled)',
      ) ??
      popup?.querySelector<HTMLButtonElement>('button:not(:disabled)');
    target?.focus();
  };

  const openFromKeyboard = () => {
    if (isOpen) {
      focusCalendar();
    } else {
      keyboardOpenRef.current = true;
      setOpen(true);
    }
  };

  const mobileTrigger = (
    <button
      ref={mobileTriggerRef}
      id={props.id}
      {...controlAria}
      type="button"
      data-tao-control=""
      data-tao-picker-trigger=""
      data-tao-size={resolvedSize}
      data-tao-variant={resolvedVariant}
      data-tao-error={status === 'error' || undefined}
      disabled={resolvedDisabled}
      onClick={() => setOpen(true)}
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
    >
      {prefix != null && <span data-tao-picker-prefix="">{prefix}</span>}
      <span
        data-tao-picker-input=""
        className={classNames?.input}
        style={styles?.input}
      >
        {displayValue || (
          <span data-tao-picker-placeholder="">{defaultPlaceholder}</span>
        )}
      </span>
      {pickerIcons}
    </button>
  );

  const desktopTrigger = (
    // biome-ignore lint/a11y/noStaticElementInteractions: the input surface forwards pointer activation; the inputs handle keyboard interaction.
    // biome-ignore lint/a11y/useKeyWithClickEvents: the inputs handle keyboard interaction.
    <div
      data-tao-control=""
      data-tao-picker-trigger=""
      onClick={() => !resolvedDisabled && setOpen(!isOpen)}
      data-tao-size={resolvedSize}
      data-tao-variant={resolvedVariant}
      data-tao-error={status === 'error' || undefined}
      data-disabled={resolvedDisabled || undefined}
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
    >
      {prefix != null && <span data-tao-picker-prefix="">{prefix}</span>}
      <input
        ref={inputRef}
        id={props.id}
        {...controlAria}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="none"
        aria-required={props['aria-required']}
        aria-controls={isOpen ? popupId : undefined}
        data-tao-picker-input=""
        className={classNames?.input}
        style={styles?.input}
        value={inputValue}
        placeholder={defaultPlaceholder}
        disabled={resolvedDisabled}
        onChange={(event) => setInputValue(event.target.value)}
        onBlur={(event) => {
          if (
            event.relatedTarget instanceof HTMLElement &&
            event.relatedTarget.closest('[data-tao-picker-dropdown]')
          ) {
            return;
          }
          commitInputValue();
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            openFromKeyboard();
          } else if (event.key === 'Enter') {
            event.preventDefault();
            commitInputValue();
          } else if (event.key === 'Escape') {
            setInputValue(displayValue);
            setOpen(false);
          }
        }}
      />
      {pickerIcons}
    </div>
  );

  if (isMobile) {
    return (
      <>
        {mobileTrigger}
        <Drawer
          open={isOpen}
          onClose={() => setOpen(false)}
          placement="bottom"
          title={drawerTitle}
          height="auto"
        >
          {panelContent}
        </Drawer>
      </>
    );
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={setOpen}>
      <Popover.Anchor asChild>{desktopTrigger}</Popover.Anchor>
      <Popover.Portal>
        <TaoPortalScope asChild>
          <Popover.Content
            id={popupId}
            ref={popupRef}
            aria-label={
              props['aria-label'] ??
              (showTime ? ctx.locale.dateTime : defaultPlaceholder)
            }
            data-tao-picker-dropdown=""
            sideOffset={4}
            align="start"
            className={classNames?.popup}
            style={styles?.popup}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              if (keyboardOpenRef.current) focusCalendar();
              keyboardOpenRef.current = false;
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (
                document.activeElement === document.body ||
                popupRef.current?.contains(document.activeElement)
              ) {
                inputRef.current?.focus();
              }
            }}
          >
            {panelContent}
          </Popover.Content>
        </TaoPortalScope>
      </Popover.Portal>
    </Popover.Root>
  );
});

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
