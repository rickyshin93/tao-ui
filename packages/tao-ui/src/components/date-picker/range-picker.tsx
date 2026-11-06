import * as Popover from '@radix-ui/react-popover';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  type AriaAttributes,
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
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
  useTaoDirection,
} from '../../provider/tao-provider';
import { useIsMobile } from '../../utils/breakpoint';
import { useMobileTitle } from '../../utils/field-label';
import { mergeRefs } from '../../utils/refs';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Drawer } from '../drawer/drawer';
import { CalendarGrid } from './calendar/calendar-grid';
import './date-picker.css';
import { Presets } from './presets';
import { formatPickerDate, parsePickerDate } from './date-localization';
import {
  getDefaultFormat,
  type PickerRef,
  type RangePresetItem,
} from './types';

type RangeValue = [Dayjs | null, Dayjs | null] | null;
type RangeInteraction =
  | { phase: 'idle'; activeInput: 'start' | 'end' }
  | {
      phase: 'pickingEnd';
      activeInput: 'end';
      start: Dayjs;
      hover: Dayjs | null;
    };

export type RangePickerSemanticPart =
  | 'root'
  | 'input'
  | 'separator'
  | 'popup'
  | 'calendar'
  | 'cell';

export interface RangePickerProps
  extends Pick<
    AriaAttributes,
    | 'aria-label'
    | 'aria-labelledby'
    | 'aria-describedby'
    | 'aria-errormessage'
    | 'aria-invalid'
    | 'aria-required'
  > {
  direction?: 'ltr' | 'rtl';
  id?: string;
  value?: RangeValue;
  defaultValue?: [Dayjs | null, Dayjs | null];
  onChange?: (dates: RangeValue, dateStrings: [string, string]) => void;
  picker?: 'date' | 'month' | 'year';
  showTime?: boolean;
  format?: string;
  disabledDate?: (date: Dayjs) => boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  presets?: RangePresetItem[];
  placeholder?: [string, string];
  separator?: ReactNode;
  size?: TaoSize;
  variant?: TaoVariant;
  disabled?: boolean | [boolean, boolean];
  allowClear?: boolean;
  status?: TaoStatus;
  ref?: Ref<PickerRef>;
  mobile?: boolean;
  /** Mobile drawer title. Defaults to the Form.Item/FormField label, then locale text. */
  mobileTitle?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<RangePickerSemanticPart>;
  styles?: SemanticStyles<RangePickerSemanticPart>;
}

export const RangePicker = forwardRef(function RangePicker(
  props: RangePickerProps,
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
    placeholder: placeholderProp,
    separator = '~',
    size,
    variant,
    disabled,
    allowClear = true,
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
  const [keyboardFocusRequested, setKeyboardFocusRequested] = useState(false);
  const returnFocusRef = useRef<HTMLInputElement | null>(null);
  const ctx = useTaoConfig();
  const drawerTitle = useMobileTitle(props.mobileTitle, ctx.locale.dateRange);
  const placeholder = placeholderProp ?? [
    ctx.locale.startDate,
    ctx.locale.endDate,
  ];
  const resolvedSize = size ?? ctx.size;
  const resolvedVariant = variant ?? ctx.variant;
  const startDisabled =
    (Array.isArray(disabled) ? disabled[0] : disabled) ?? ctx.disabled;
  const endDisabled =
    (Array.isArray(disabled) ? disabled[1] : disabled) ?? ctx.disabled;
  const resolvedDisabled = startDisabled && endDisabled;
  const autoMobile = useIsMobile();
  const isMobile = mobile ?? autoMobile;
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const [direction, directionRef] = useTaoDirection(props.direction);
  const mergedMobileRef = useMemo(
    () => mergeRefs(mobileTriggerRef, directionRef),
    [directionRef],
  );
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      focus: (position = 'start') =>
        (isMobile
          ? mobileTriggerRef.current
          : position === 'end'
            ? endInputRef.current
            : startInputRef.current
        )?.focus(),
      blur: () => {
        mobileTriggerRef.current?.blur();
        startInputRef.current?.blur();
        endInputRef.current?.blur();
      },
      get nativeElement() {
        return isMobile ? mobileTriggerRef.current : startInputRef.current;
      },
    }),
    [isMobile],
  );

  const fmt = formatProp ?? getDefaultFormat(picker, showTime);
  const dayjsLocale = ctx.locale.dayjsLocale;
  const numberLocale = ctx.locale.numberLocale;
  const formatValue = useCallback(
    (date: Dayjs | null | undefined) =>
      formatPickerDate(date, fmt, dayjsLocale),
    [fmt, dayjsLocale],
  );
  const isDateBlocked = useCallback(
    (date: Dayjs) =>
      !date.isValid() ||
      Boolean(disabledDate?.(date)) ||
      (minDate != null && date.isBefore(minDate, 'day')) ||
      (maxDate != null && date.isAfter(maxDate, 'day')),
    [disabledDate, minDate, maxDate],
  );
  const isValueControlled = 'value' in props;
  const [internalValue, setInternalValue] = useState<RangeValue>(
    defaultValue ?? null,
  );
  const resolvedValue = isValueControlled ? (value ?? null) : internalValue;
  const emitChange = useCallback(
    (dates: RangeValue) => {
      if (resolvedDisabled) return false;
      const start = (startDisabled ? resolvedValue?.[0] : dates?.[0]) ?? null;
      const end = (endDisabled ? resolvedValue?.[1] : dates?.[1]) ?? null;
      if ((startDisabled || endDisabled) && start && end && start.isAfter(end))
        return false;
      const nextValue: RangeValue = start || end ? [start, end] : null;
      if (!isValueControlled) setInternalValue(nextValue);
      onChange?.(nextValue, [formatValue(start), formatValue(end)]);
      return true;
    },
    [
      isValueControlled,
      onChange,
      startDisabled,
      endDisabled,
      resolvedDisabled,
      resolvedValue,
      formatValue,
    ],
  );

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const [interaction, setInteraction] = useState<RangeInteraction>({
    phase: 'idle',
    activeInput: 'start',
  });
  const controlledValueKey = isValueControlled
    ? `${resolvedValue?.[0]?.valueOf() ?? 'null'}:${resolvedValue?.[1]?.valueOf() ?? 'null'}`
    : undefined;
  const setOpen = useCallback(
    (v: boolean) => {
      if (v && resolvedDisabled) return;
      setInternalOpen(v);
      onOpenChange?.(v);
    },
    [onOpenChange, resolvedDisabled],
  );
  useEffect(() => {
    if (!isOpen) {
      setInteraction({ phase: 'idle', activeInput: 'start' });
    }
  }, [isOpen]);
  useEffect(() => {
    if (controlledValueKey !== undefined) {
      setInteraction((current) => ({
        phase: 'idle',
        activeInput:
          current.phase === 'pickingEnd' ? 'start' : current.activeInput,
      }));
    }
  }, [controlledValueKey]);

  const [viewDateStart, setViewDateStart] = useState<Dayjs>(
    () => resolvedValue?.[0] ?? resolvedValue?.[1] ?? dayjs(),
  );
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setViewDateStart(
        resolvedValue?.[interaction.activeInput === 'end' ? 1 : 0] ??
          resolvedValue?.[0] ??
          resolvedValue?.[1] ??
          dayjs(),
      );
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, resolvedValue, interaction.activeInput]);
  const viewDateEnd = viewDateStart.add(1, 'month');

  const rangeStart =
    interaction.phase === 'pickingEnd'
      ? interaction.start
      : (resolvedValue?.[0] ?? null);
  const rangeEnd =
    interaction.phase === 'pickingEnd' ? null : (resolvedValue?.[1] ?? null);
  const hoverDate =
    interaction.phase === 'pickingEnd' ? interaction.hover : null;
  const setHoverDate = useCallback((hover: Dayjs | null) => {
    setInteraction((current) =>
      current.phase === 'pickingEnd' ? { ...current, hover } : current,
    );
  }, []);

  const handleDateSelect = useCallback(
    (date: Dayjs) => {
      if (startDisabled || endDisabled) {
        if (!emitChange(startDisabled ? [rangeStart, date] : [date, rangeEnd]))
          return;
        setInteraction({
          phase: 'idle',
          activeInput: startDisabled ? 'end' : 'start',
        });
        if (!showTime) setOpen(false);
        return;
      }
      if (interaction.phase === 'idle' && interaction.activeInput === 'start') {
        setInteraction({
          phase: 'pickingEnd',
          activeInput: 'end',
          start: date,
          hover: null,
        });
      } else {
        let start =
          interaction.phase === 'pickingEnd' ? interaction.start : rangeStart;
        let end = date;
        if (start && date.isBefore(start)) {
          [start, end] = [date, start];
        }
        emitChange([start, end]);
        setInteraction({ phase: 'idle', activeInput: 'start' });
        if (!showTime) setOpen(false);
      }
    },
    [
      interaction,
      rangeStart,
      rangeEnd,
      emitChange,
      startDisabled,
      endDisabled,
      showTime,
      setOpen,
    ],
  );

  const handleClear = useCallback(
    (e: React.SyntheticEvent) => {
      e.stopPropagation();
      emitChange(null);
      setInteraction({ phase: 'idle', activeInput: 'start' });
    },
    [emitChange],
  );

  const handlePresetSelect = useCallback(
    (val: unknown) => {
      const [s, e] = val as [Dayjs, Dayjs];
      if (
        (!startDisabled && isDateBlocked(s)) ||
        (!endDisabled && isDateBlocked(e)) ||
        (!startDisabled && !endDisabled && s.isAfter(e))
      )
        return;
      if (!emitChange([s, e])) return;
      setInteraction({ phase: 'idle', activeInput: 'start' });
      setOpen(false);
    },
    [emitChange, setOpen, isDateBlocked, startDisabled, endDisabled],
  );

  const displayStart = formatValue(rangeStart);
  const displayEnd = formatValue(rangeEnd);
  const [inputStart, setInputStart] = useState(displayStart);
  const [inputEnd, setInputEnd] = useState(displayEnd);

  useEffect(() => setInputStart(displayStart), [displayStart]);
  useEffect(() => setInputEnd(displayEnd), [displayEnd]);

  const commitInputValue = useCallback(
    (position: 'start' | 'end', keepPopupOpen = false) => {
      if (position === 'start' ? startDisabled : endDisabled) return;
      const text = (position === 'start' ? inputStart : inputEnd).trim();
      const currentValue = position === 'start' ? displayStart : displayEnd;
      const parsed = text
        ? parsePickerDate(text, fmt, dayjsLocale, numberLocale)
        : null;
      const isBlocked =
        parsed != null &&
        (isDateBlocked(parsed) ||
          (position === 'start' &&
            rangeEnd != null &&
            parsed.isAfter(rangeEnd)) ||
          (position === 'end' &&
            rangeStart != null &&
            parsed.isBefore(rangeStart)));

      if (isBlocked) {
        if (position === 'start') setInputStart(currentValue);
        else setInputEnd(currentValue);
        return;
      }

      const nextStart = position === 'start' ? parsed : rangeStart;
      const nextEnd = position === 'end' ? parsed : rangeEnd;
      const nextStrings: [string, string] = [
        formatValue(nextStart),
        formatValue(nextEnd),
      ];
      if (nextStrings[0] !== displayStart || nextStrings[1] !== displayEnd) {
        emitChange(nextStart || nextEnd ? [nextStart, nextEnd] : null);
      }
      setInteraction({ phase: 'idle', activeInput: position });
      if (parsed && !keepPopupOpen) setViewDateStart(parsed);
      if (position === 'start')
        setInputStart(isValueControlled ? displayStart : nextStrings[0]);
      else setInputEnd(isValueControlled ? displayEnd : nextStrings[1]);
      if (nextStart && nextEnd && !keepPopupOpen) setOpen(false);
    },
    [
      isDateBlocked,
      startDisabled,
      endDisabled,
      displayEnd,
      displayStart,
      emitChange,
      fmt,
      dayjsLocale,
      numberLocale,
      formatValue,
      inputEnd,
      inputStart,
      isValueControlled,
      rangeEnd,
      rangeStart,
      setOpen,
    ],
  );

  const showClearBtn =
    allowClear &&
    ((!startDisabled && rangeStart) || (!endDisabled && rangeEnd));

  const isDateDisabled = (date: Dayjs) =>
    Boolean(
      resolvedDisabled ||
        disabledDate?.(date) ||
        (startDisabled && rangeStart && date.isBefore(rangeStart, 'day')) ||
        (endDisabled && rangeEnd && date.isAfter(rangeEnd, 'day')),
    );

  const panelContent = (
    <div
      data-tao-range-panel=""
      className={isMobile ? classNames?.popup : undefined}
      style={isMobile ? styles?.popup : undefined}
    >
      {/* Shared header: << < [Left Month Year]  [Right Month Year] > >> */}
      <div data-tao-range-header="">
        <div data-tao-calendar-nav="">
          <button
            type="button"
            data-tao-calendar-nav-btn=""
            onClick={() => setViewDateStart(viewDateStart.subtract(1, 'year'))}
            aria-label={ctx.locale.previousYear}
          >
            <DoubleLeftIcon />
          </button>
          <button
            type="button"
            data-tao-calendar-nav-btn=""
            onClick={() => setViewDateStart(viewDateStart.subtract(1, 'month'))}
            aria-label={ctx.locale.previousMonth}
          >
            <LeftIcon />
          </button>
        </div>
        <div data-tao-range-titles="">
          <span data-tao-range-title="">
            {ctx.locale.monthTitle(viewDateStart.month(), viewDateStart.year())}
          </span>
          <span data-tao-range-title="">
            {ctx.locale.monthTitle(viewDateEnd.month(), viewDateEnd.year())}
          </span>
        </div>
        <div data-tao-calendar-nav="">
          <button
            type="button"
            data-tao-calendar-nav-btn=""
            onClick={() => setViewDateStart(viewDateStart.add(1, 'month'))}
            aria-label={ctx.locale.nextMonth}
          >
            <RightIcon />
          </button>
          <button
            type="button"
            data-tao-calendar-nav-btn=""
            onClick={() => setViewDateStart(viewDateStart.add(1, 'year'))}
            aria-label={ctx.locale.nextYear}
          >
            <DoubleRightIcon />
          </button>
        </div>
      </div>
      <div data-tao-range-panels="">
        {/* Left panel */}
        <div data-tao-picker-panel="">
          <div data-tao-picker-body="">
            <CalendarGrid
              viewDate={viewDateStart}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              hoverDate={hoverDate}
              onSelect={handleDateSelect}
              onViewDateChange={setViewDateStart}
              onHover={setHoverDate}
              disabledDate={isDateDisabled}
              minDate={minDate}
              maxDate={maxDate}
              className={classNames?.calendar}
              style={styles?.calendar}
              cellClassName={classNames?.cell}
              cellStyle={styles?.cell}
            />
          </div>
        </div>
        {/* Right panel */}
        <div data-tao-picker-panel="">
          <div data-tao-picker-body="">
            <CalendarGrid
              viewDate={viewDateEnd}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              hoverDate={hoverDate}
              onSelect={handleDateSelect}
              onViewDateChange={(date) =>
                setViewDateStart(date.subtract(1, 'month'))
              }
              onHover={setHoverDate}
              disabledDate={isDateDisabled}
              minDate={minDate}
              maxDate={maxDate}
              className={classNames?.calendar}
              style={styles?.calendar}
              cellClassName={classNames?.cell}
              cellStyle={styles?.cell}
            />
          </div>
        </div>
      </div>
      {presets && presets.length > 0 && (
        <Presets items={presets} onSelect={handlePresetSelect} />
      )}
    </div>
  );

  const triggerIcons = (
    <span
      data-tao-picker-icons=""
      data-tao-clearable={showClearBtn || undefined}
    >
      {showClearBtn && (
        // biome-ignore lint/a11y/useSemanticElements: shared by the mobile button trigger, where nesting a button would be invalid HTML.
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
      <span data-tao-picker-suffix="">
        <CalendarIcon />
      </span>
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

  const activeDate = interaction.activeInput === 'end' ? rangeEnd : rangeStart;
  const focusCalendar = useCallback(() => {
    const popup = popupRef.current;
    if (!popup) return;
    const selectedDate =
      activeDate && !isDateBlocked(activeDate) ? activeDate : null;
    if (
      selectedDate &&
      !selectedDate.isSame(viewDateStart, 'month') &&
      !selectedDate.isSame(viewDateStart.add(1, 'month'), 'month')
    ) {
      setViewDateStart(selectedDate);
      return;
    }
    let target = selectedDate
      ? popup.querySelector<HTMLButtonElement>(
          `[data-tao-calendar-cell-button][aria-label="${selectedDate.format('YYYY-MM-DD')}"]:not([data-tao-other-month]):not(:disabled)`,
        )
      : null;
    target ??=
      popup.querySelector<HTMLButtonElement>(
        '[data-tao-calendar-cell-button][tabindex="0"]:not(:disabled)',
      ) ??
      popup.querySelector<HTMLButtonElement>(
        'button[aria-pressed="true"]:not(:disabled)',
      ) ??
      popup.querySelector<HTMLButtonElement>('button:not(:disabled)');
    target?.focus();
    setKeyboardFocusRequested(false);
  }, [activeDate, isDateBlocked, viewDateStart]);

  useEffect(() => {
    if (isOpen && keyboardFocusRequested) focusCalendar();
  }, [isOpen, keyboardFocusRequested, focusCalendar]);

  const openFromKeyboard = () => {
    commitInputValue(interaction.activeInput, true);
    setKeyboardFocusRequested(true);
    if (!isOpen) setOpen(true);
  };

  const mobileTrigger = (
    <button
      ref={mergedMobileRef}
      dir={direction}
      id={props.id}
      {...controlAria}
      type="button"
      data-tao-control=""
      data-tao-range-trigger=""
      data-tao-size={resolvedSize}
      data-tao-variant={resolvedVariant}
      data-tao-error={status === 'error' || undefined}
      disabled={resolvedDisabled}
      onClick={() => setOpen(true)}
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
    >
      <span
        data-tao-range-input=""
        data-tao-active={
          (interaction.activeInput === 'start' && isOpen) || undefined
        }
        className={classNames?.input}
        style={styles?.input}
      >
        {displayStart || (
          <span data-tao-picker-placeholder="">{placeholder[0]}</span>
        )}
      </span>
      <span
        data-tao-range-separator=""
        className={classNames?.separator}
        style={styles?.separator}
      >
        {separator}
      </span>
      <span
        data-tao-range-input=""
        data-tao-active={
          (interaction.activeInput === 'end' && isOpen) || undefined
        }
        className={classNames?.input}
        style={styles?.input}
      >
        {displayEnd || (
          <span data-tao-picker-placeholder="">{placeholder[1]}</span>
        )}
      </span>
      {triggerIcons}
    </button>
  );

  const desktopTrigger = (
    // biome-ignore lint/a11y/noStaticElementInteractions: the input surface forwards pointer activation; the inputs handle keyboard interaction.
    // biome-ignore lint/a11y/useKeyWithClickEvents: the inputs handle keyboard interaction.
    <div
      ref={directionRef}
      dir={direction}
      data-tao-control=""
      data-tao-range-trigger=""
      onClick={() => !resolvedDisabled && setOpen(!isOpen)}
      data-tao-size={resolvedSize}
      data-tao-variant={resolvedVariant}
      data-tao-error={status === 'error' || undefined}
      data-disabled={resolvedDisabled || undefined}
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
    >
      <span hidden id={`${popupId}-start-label`}>
        {placeholder[0]}
      </span>
      <span hidden id={`${popupId}-end-label`}>
        {placeholder[1]}
      </span>
      <input
        ref={startInputRef}
        id={props.id}
        {...controlAria}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="none"
        aria-required={props['aria-required']}
        aria-controls={isOpen ? popupId : undefined}
        aria-label={
          props['aria-label']
            ? `${props['aria-label']} ${placeholder[0]}`
            : !props.id && !props['aria-labelledby']
              ? placeholder[0]
              : undefined
        }
        aria-labelledby={
          props['aria-labelledby']
            ? `${props['aria-labelledby']} ${popupId}-start-label`
            : undefined
        }
        data-tao-range-input=""
        data-tao-active={
          (interaction.activeInput === 'start' && isOpen) || undefined
        }
        className={classNames?.input}
        style={styles?.input}
        value={inputStart}
        placeholder={placeholder[0]}
        disabled={startDisabled}
        onFocus={() => {
          returnFocusRef.current = startInputRef.current;
          setInteraction({ phase: 'idle', activeInput: 'start' });
        }}
        onChange={(event) => setInputStart(event.target.value)}
        onBlur={(event) => {
          const enteringCalendar =
            event.relatedTarget instanceof HTMLElement &&
            !!popupRef.current?.contains(event.relatedTarget);
          // ArrowDown already committed before requesting calendar focus.
          if (enteringCalendar && keyboardFocusRequested) return;
          commitInputValue('start', enteringCalendar);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            openFromKeyboard();
          } else if (event.key === 'Enter') {
            event.preventDefault();
            commitInputValue('start');
          } else if (event.key === 'Escape') {
            setInputStart(displayStart);
            setOpen(false);
          }
        }}
      />
      <span
        data-tao-range-separator=""
        className={classNames?.separator}
        style={styles?.separator}
      >
        {separator}
      </span>
      <input
        ref={endInputRef}
        id={props.id ? `${props.id}-end` : undefined}
        {...controlAria}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="none"
        aria-required={props['aria-required']}
        aria-controls={isOpen ? popupId : undefined}
        aria-label={
          props['aria-label']
            ? `${props['aria-label']} ${placeholder[1]}`
            : !props.id && !props['aria-labelledby']
              ? placeholder[1]
              : undefined
        }
        aria-labelledby={
          props['aria-labelledby']
            ? `${props['aria-labelledby']} ${popupId}-end-label`
            : undefined
        }
        data-tao-range-input=""
        data-tao-active={
          (interaction.activeInput === 'end' && isOpen) || undefined
        }
        className={classNames?.input}
        style={styles?.input}
        value={inputEnd}
        placeholder={placeholder[1]}
        disabled={endDisabled}
        onFocus={() => {
          returnFocusRef.current = endInputRef.current;
          setInteraction({ phase: 'idle', activeInput: 'end' });
        }}
        onChange={(event) => setInputEnd(event.target.value)}
        onBlur={(event) => {
          const enteringCalendar =
            event.relatedTarget instanceof HTMLElement &&
            !!popupRef.current?.contains(event.relatedTarget);
          if (enteringCalendar && keyboardFocusRequested) return;
          commitInputValue('end', enteringCalendar);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            openFromKeyboard();
          } else if (event.key === 'Enter') {
            event.preventDefault();
            commitInputValue('end');
          } else if (event.key === 'Escape') {
            setInputEnd(displayEnd);
            setOpen(false);
          }
        }}
      />
      {triggerIcons}
    </div>
  );

  if (isMobile) {
    return (
      <>
        {mobileTrigger}
        <Drawer
          direction={direction}
          open={isOpen}
          onClose={() => setOpen(false)}
          placement="bottom"
          title={drawerTitle}
          height="85vh"
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
        <TaoPortalScope asChild direction={direction}>
          <Popover.Content
            id={popupId}
            ref={popupRef}
            aria-label={props['aria-label'] ?? ctx.locale.dateRange}
            data-tao-picker-dropdown=""
            sideOffset={4}
            align="start"
            className={classNames?.popup}
            style={styles?.popup}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              if (keyboardFocusRequested) focusCalendar();
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (
                document.activeElement === document.body ||
                popupRef.current?.contains(document.activeElement)
              ) {
                (returnFocusRef.current ?? startInputRef.current)?.focus();
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
      width="14"
      height="14"
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

function LeftIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function RightIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function DoubleLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m11 17-5-5 5-5" />
      <path d="m18 17-5-5 5-5" />
    </svg>
  );
}

function DoubleRightIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 17 5-5-5-5" />
      <path d="m13 17 5-5-5-5" />
    </svg>
  );
}
