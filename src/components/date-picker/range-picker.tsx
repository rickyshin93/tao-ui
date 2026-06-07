import * as Popover from '@radix-ui/react-popover';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { type ReactNode, useCallback, useState } from 'react';
import {
  TaoPortalScope,
  type TaoSize,
  type TaoVariant,
  useTaoConfig,
} from '../../provider/tao-provider';
import { Drawer } from '../drawer/drawer';
import { useIsMobile } from '../select/use-is-mobile';
import { CalendarGrid } from './calendar/calendar-grid';
import { CalendarHeader } from './calendar/calendar-header';
import './date-picker.css';
import { Presets } from './presets';
import { getDefaultFormat, type RangePresetItem } from './types';

type RangeValue = [Dayjs | null, Dayjs | null] | null;

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
  status?: 'error' | 'warning';
  mobile?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function RangePicker({
  value,
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
}: RangePickerProps) {
  const ctx = useTaoConfig();
  const resolvedSize = size ?? ctx.size;
  const resolvedVariant = variant ?? ctx.variant;
  const isDisabled =
    typeof disabled === 'boolean' ? disabled : disabled?.[0] && disabled?.[1];
  const resolvedDisabled = isDisabled ?? ctx.disabled;
  const autoMobile = useIsMobile();
  const isMobile = mobile ?? autoMobile;

  const fmt = formatProp ?? getDefaultFormat(picker, showTime);

  const [internalOpen, setInternalOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = useCallback(
    (v: boolean) => {
      setInternalOpen(v);
      onOpenChange?.(v);
    },
    [onOpenChange],
  );

  const [viewDateStart, setViewDateStart] = useState<Dayjs>(
    () => value?.[0] ?? dayjs(),
  );
  const viewDateEnd = viewDateStart.add(1, 'month');

  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const [hoverDate, setHoverDate] = useState<Dayjs | null>(null);
  // When selecting end, store the pending start separately so rangeEnd stays null for hover preview
  const [pendingStart, setPendingStart] = useState<Dayjs | null>(null);

  const rangeStart = pendingStart ?? value?.[0] ?? null;
  const rangeEnd = pendingStart ? null : (value?.[1] ?? null);

  const handleDateSelect = useCallback(
    (date: Dayjs) => {
      if (selecting === 'start') {
        setPendingStart(date);
        setSelecting('end');
      } else {
        let start = pendingStart ?? rangeStart;
        let end = date;
        if (start && date.isBefore(start)) {
          [start, end] = [date, start];
        }
        onChange?.([start, end], [start?.format(fmt) ?? '', end.format(fmt)]);
        setPendingStart(null);
        setSelecting('start');
        setHoverDate(null);
        if (!showTime) setOpen(false);
      }
    },
    [selecting, pendingStart, rangeStart, onChange, fmt, showTime, setOpen],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(null, ['', '']);
    },
    [onChange],
  );

  const handlePresetSelect = useCallback(
    (val: unknown) => {
      const [s, e] = val as [Dayjs, Dayjs];
      onChange?.([s, e], [s.format(fmt), e.format(fmt)]);
      setOpen(false);
    },
    [onChange, fmt, setOpen],
  );

  const displayStart = rangeStart ? rangeStart.format(fmt) : '';
  const displayEnd = rangeEnd ? rangeEnd.format(fmt) : '';
  const showClearBtn =
    allowClear && (rangeStart || rangeEnd) && !resolvedDisabled;

  const panelContent = (
    <div data-tao-range-panel="">
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
              onHover={setHoverDate}
              disabledDate={disabledDate}
              minDate={minDate}
              maxDate={maxDate}
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
              onHover={setHoverDate}
              disabledDate={disabledDate}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>
        </div>
      </div>
      {presets && presets.length > 0 && (
        <Presets items={presets} onSelect={handlePresetSelect} />
      )}
    </div>
  );

  const trigger = (
    <button
      type="button"
      data-tao-control=""
      data-tao-range-trigger=""
      data-tao-size={resolvedSize}
      data-tao-variant={resolvedVariant}
      data-tao-error={status === 'error' || undefined}
      disabled={resolvedDisabled}
      onClick={isMobile ? () => setOpen(true) : undefined}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <span
        data-tao-range-input=""
        data-tao-active={(selecting === 'start' && isOpen) || undefined}
      >
        {displayStart || (
          <span data-tao-picker-placeholder="">{placeholder[0]}</span>
        )}
      </span>
      <span data-tao-range-separator="">{separator}</span>
      <span
        data-tao-range-input=""
        data-tao-active={(selecting === 'end' && isOpen) || undefined}
      >
        {displayEnd || (
          <span data-tao-picker-placeholder="">{placeholder[1]}</span>
        )}
      </span>
      <span data-tao-picker-icons="">
        {showClearBtn && hovering ? (
          <span
            data-tao-picker-clear=""
            onClick={handleClear}
            role="button"
            aria-label="Clear"
          >
            <CloseIcon />
          </span>
        ) : (
          <span data-tao-picker-suffix="">
            <CalendarIcon />
          </span>
        )}
      </span>
    </button>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
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
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <TaoPortalScope>
          <Popover.Content
            data-tao-picker-dropdown=""
            sideOffset={4}
            align="start"
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
