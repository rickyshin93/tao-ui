import * as Popover from '@radix-ui/react-popover';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  type CSSProperties,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
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
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Drawer } from '../drawer/drawer';
import { CalendarGrid } from './calendar/calendar-grid';
import './date-picker.css';
import { Presets } from './presets';
import {
  getDefaultFormat,
  type PickerRef,
  type RangePresetItem,
} from './types';

dayjs.extend(customParseFormat);

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

export interface RangePickerProps {
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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<RangePickerSemanticPart>;
  styles?: SemanticStyles<RangePickerSemanticPart>;
}

export function RangePicker({
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
  placeholder = ['Start date', 'End date'],
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
  ref,
}: RangePickerProps) {
  const ctx = useTaoConfig();
  const resolvedSize = size ?? ctx.size;
  const resolvedVariant = variant ?? ctx.variant;
  const isDisabled =
    typeof disabled === 'boolean' ? disabled : disabled?.[0] && disabled?.[1];
  const resolvedDisabled = isDisabled ?? ctx.disabled;
  const autoMobile = useIsMobile();
  const isMobile = mobile ?? autoMobile;
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
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
  const isValueControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<RangeValue>(
    defaultValue ?? null,
  );
  const resolvedValue = isValueControlled ? value : internalValue;
  const emitChange = useCallback(
    (dates: RangeValue, dateStrings: [string, string]) => {
      if (!isValueControlled) setInternalValue(dates);
      onChange?.(dates, dateStrings);
    },
    [isValueControlled, onChange],
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
      setInternalOpen(v);
      onOpenChange?.(v);
    },
    [onOpenChange],
  );
  useEffect(() => {
    if (!isOpen) {
      setInteraction({ phase: 'idle', activeInput: 'start' });
    }
  }, [isOpen]);
  useEffect(() => {
    if (controlledValueKey !== undefined) {
      setInteraction({ phase: 'idle', activeInput: 'start' });
    }
  }, [controlledValueKey]);

  const [viewDateStart, setViewDateStart] = useState<Dayjs>(
    () => resolvedValue?.[0] ?? dayjs(),
  );
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
        emitChange([start, end], [start?.format(fmt) ?? '', end.format(fmt)]);
        setInteraction({ phase: 'idle', activeInput: 'start' });
        if (!showTime) setOpen(false);
      }
    },
    [interaction, rangeStart, emitChange, fmt, showTime, setOpen],
  );

  const handleClear = useCallback(
    (e: React.SyntheticEvent) => {
      e.stopPropagation();
      emitChange(null, ['', '']);
      setInteraction({ phase: 'idle', activeInput: 'start' });
    },
    [emitChange],
  );

  const handlePresetSelect = useCallback(
    (val: unknown) => {
      const [s, e] = val as [Dayjs, Dayjs];
      emitChange([s, e], [s.format(fmt), e.format(fmt)]);
      setInteraction({ phase: 'idle', activeInput: 'start' });
      setOpen(false);
    },
    [emitChange, fmt, setOpen],
  );

  const displayStart = rangeStart ? rangeStart.format(fmt) : '';
  const displayEnd = rangeEnd ? rangeEnd.format(fmt) : '';
  const [inputStart, setInputStart] = useState(displayStart);
  const [inputEnd, setInputEnd] = useState(displayEnd);

  useEffect(() => setInputStart(displayStart), [displayStart]);
  useEffect(() => setInputEnd(displayEnd), [displayEnd]);

  const commitInputValue = useCallback(
    (position: 'start' | 'end') => {
      const text = (position === 'start' ? inputStart : inputEnd).trim();
      const currentValue = position === 'start' ? displayStart : displayEnd;
      const parsed = text ? dayjs(text, fmt, true) : null;
      const isBlocked =
        parsed != null &&
        (!parsed.isValid() ||
          disabledDate?.(parsed) ||
          (minDate != null && parsed.isBefore(minDate, 'day')) ||
          (maxDate != null && parsed.isAfter(maxDate, 'day')) ||
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
        nextStart?.format(fmt) ?? '',
        nextEnd?.format(fmt) ?? '',
      ];
      emitChange(
        nextStart || nextEnd ? [nextStart, nextEnd] : null,
        nextStrings,
      );
      setInteraction({ phase: 'idle', activeInput: position });
      if (parsed) setViewDateStart(parsed);
      if (position === 'start') setInputStart(nextStrings[0]);
      else setInputEnd(nextStrings[1]);
      if (nextStart && nextEnd) setOpen(false);
    },
    [
      disabledDate,
      displayEnd,
      displayStart,
      emitChange,
      fmt,
      inputEnd,
      inputStart,
      maxDate,
      minDate,
      rangeEnd,
      rangeStart,
      setOpen,
    ],
  );

  const showClearBtn =
    allowClear && (rangeStart || rangeEnd) && !resolvedDisabled;

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
            aria-label="Previous year"
          >
            <DoubleLeftIcon />
          </button>
          <button
            type="button"
            data-tao-calendar-nav-btn=""
            onClick={() => setViewDateStart(viewDateStart.subtract(1, 'month'))}
            aria-label="Previous month"
          >
            <LeftIcon />
          </button>
        </div>
        <div data-tao-range-titles="">
          <span data-tao-range-title="">
            {viewDateStart.format('MMM YYYY')}
          </span>
          <span data-tao-range-title="">{viewDateEnd.format('MMM YYYY')}</span>
        </div>
        <div data-tao-calendar-nav="">
          <button
            type="button"
            data-tao-calendar-nav-btn=""
            onClick={() => setViewDateStart(viewDateStart.add(1, 'month'))}
            aria-label="Next month"
          >
            <RightIcon />
          </button>
          <button
            type="button"
            data-tao-calendar-nav-btn=""
            onClick={() => setViewDateStart(viewDateStart.add(1, 'year'))}
            aria-label="Next year"
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
              disabledDate={disabledDate}
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
              disabledDate={disabledDate}
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
          aria-label="Clear"
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

  const mobileTrigger = (
    <button
      ref={mobileTriggerRef}
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
    <div
      data-tao-control=""
      data-tao-range-trigger=""
      data-tao-size={resolvedSize}
      data-tao-variant={resolvedVariant}
      data-tao-error={status === 'error' || undefined}
      data-disabled={resolvedDisabled || undefined}
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
    >
      <input
        ref={startInputRef}
        data-tao-range-input=""
        data-tao-active={
          (interaction.activeInput === 'start' && isOpen) || undefined
        }
        className={classNames?.input}
        style={styles?.input}
        value={inputStart}
        placeholder={placeholder[0]}
        disabled={resolvedDisabled}
        aria-invalid={status === 'error' || undefined}
        onFocus={() => {
          setInteraction({ phase: 'idle', activeInput: 'start' });
        }}
        onChange={(event) => setInputStart(event.target.value)}
        onBlur={() => commitInputValue('start')}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
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
        data-tao-range-input=""
        data-tao-active={
          (interaction.activeInput === 'end' && isOpen) || undefined
        }
        className={classNames?.input}
        style={styles?.input}
        value={inputEnd}
        placeholder={placeholder[1]}
        disabled={resolvedDisabled}
        aria-invalid={status === 'error' || undefined}
        onFocus={() => {
          setInteraction({ phase: 'idle', activeInput: 'end' });
        }}
        onChange={(event) => setInputEnd(event.target.value)}
        onBlur={() => commitInputValue('end')}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
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
          open={isOpen}
          onClose={() => setOpen(false)}
          placement="bottom"
          title="Select date range"
          height="85vh"
        >
          {panelContent}
        </Drawer>
      </>
    );
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{desktopTrigger}</Popover.Trigger>
      <Popover.Portal>
        <TaoPortalScope asChild>
          <Popover.Content
            data-tao-picker-dropdown=""
            sideOffset={4}
            align="start"
            className={classNames?.popup}
            style={styles?.popup}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {panelContent}
          </Popover.Content>
        </TaoPortalScope>
      </Popover.Portal>
    </Popover.Root>
  );
}

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
