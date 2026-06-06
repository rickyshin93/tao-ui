import * as Popover from '@radix-ui/react-popover';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { type TaoSize, type TaoVariant, useTaoConfig } from '../../provider/tao-provider';
import { Drawer } from '../drawer/drawer';
import { useIsMobile } from '../select/use-is-mobile';
import { CalendarGrid } from './calendar/calendar-grid';
import { CalendarHeader } from './calendar/calendar-header';
import { MonthGrid } from './calendar/month-grid';
import { TimePanel } from './calendar/time-panel';
import { YearGrid } from './calendar/year-grid';
import './date-picker.css';
import { Presets } from './presets';
import { type PanelMode, type PresetItem, type TimeConfig, getDefaultFormat } from './types';

export interface DatePickerProps {
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
  status?: 'error' | 'warning';
  mobile?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DatePicker({
  value,
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
}: DatePickerProps) {
  const ctx = useTaoConfig();
  const resolvedSize = size ?? ctx.size;
  const resolvedVariant = variant ?? ctx.variant;
  const resolvedDisabled = disabled ?? ctx.disabled;
  const autoMobile = useIsMobile();
  const isMobile = mobile ?? autoMobile;

  const fmt = formatProp ?? getDefaultFormat(picker, showTime);
  const defaultPlaceholder = placeholder ?? fmt;
  const drawerTitle = showTime ? 'Date & Time' : defaultPlaceholder;

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

  const [viewDate, setViewDate] = useState<Dayjs>(() => value ?? dayjs());
  const [panelMode, setPanelMode] = useState<PanelMode>(picker === 'year' ? 'year' : picker === 'month' ? 'month' : 'date');
  const [timeScrollKey, setTimeScrollKey] = useState(0);

  // Reset panel state when opening
  useEffect(() => {
    if (isOpen) {
      setViewDate(value ?? dayjs());
      setPanelMode(picker === 'year' ? 'year' : picker === 'month' ? 'month' : 'date');
      setTimeScrollKey((k) => k + 1);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Time state
  const timeValue = useMemo(() => ({
    hour: value?.hour() ?? 0,
    minute: value?.minute() ?? 0,
    second: value?.second() ?? 0,
  }), [value]);

  const handleDateSelect = useCallback(
    (date: Dayjs) => {
      let result = date;
      if (showTime && value) {
        result = date.hour(value.hour()).minute(value.minute()).second(value.second());
      }
      if (!showTime) {
        onChange?.(result, result.format(fmt));
        setOpen(false);
      } else {
        onChange?.(result, result.format(fmt));
        // Keep open for time selection
      }
    },
    [onChange, fmt, showTime, value, setOpen],
  );

  const handleMonthSelect = useCallback(
    (date: Dayjs) => {
      if (picker === 'month') {
        onChange?.(date, date.format(fmt));
        setOpen(false);
      } else {
        setViewDate(date);
        setPanelMode('date');
      }
    },
    [picker, onChange, fmt, setOpen],
  );

  const handleYearSelect = useCallback(
    (date: Dayjs) => {
      if (picker === 'year') {
        onChange?.(date, date.format(fmt));
        setOpen(false);
      } else {
        setViewDate(date);
        setPanelMode(picker === 'month' ? 'month' : 'date');
      }
    },
    [picker, onChange, fmt, setOpen],
  );

  const handleTimeChange = useCallback(
    (h: number, m: number, s: number) => {
      const base = value ?? dayjs();
      const result = base.hour(h).minute(m).second(s);
      onChange?.(result, result.format(fmt));
    },
    [value, onChange, fmt],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(null, '');
    },
    [onChange],
  );

  const handlePresetSelect = useCallback(
    (val: unknown) => {
      const d = val as Dayjs;
      onChange?.(d, d.format(fmt));
      setOpen(false);
    },
    [onChange, fmt, setOpen],
  );

  const handleOk = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleNow = useCallback(() => {
    const now = dayjs();
    onChange?.(now, now.format(fmt));
    setViewDate(now);
    setPanelMode('date');
    setTimeScrollKey((k) => k + 1);
  }, [onChange, fmt]);

  const displayValue = value ? value.format(fmt) : '';
  const showClearBtn = allowClear && value && !resolvedDisabled;

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
            value={value}
            onSelect={handleDateSelect}
            disabledDate={disabledDate}
            minDate={minDate}
            maxDate={maxDate}
          />
        )}
        {panelMode === 'month' && (
          <MonthGrid
            viewDate={viewDate}
            value={value}
            onSelect={handleMonthSelect}
            disabledDate={disabledDate}
          />
        )}
        {(panelMode === 'year' || panelMode === 'decade') && (
          <YearGrid
            viewDate={viewDate}
            value={value}
            onSelect={handleYearSelect}
            disabledDate={disabledDate}
          />
        )}
      </div>
    </>
  );

  // Panel content (shared between desktop popover and mobile drawer)
  const panelContent = (
    <div data-tao-picker-panel="" data-tao-has-time={showTimePanel || undefined}>
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
        <div data-tao-picker-footer="">
          <button type="button" data-tao-picker-footer-btn="" onClick={handleNow}>Now</button>
          <button type="button" data-tao-picker-footer-btn="" data-tao-primary="" onClick={handleOk}>OK</button>
        </div>
      )}
    </div>
  );

  // Trigger button/input
  const trigger = (
    <button
      type="button"
      data-tao-control=""
      data-tao-picker-trigger=""
      data-tao-size={resolvedSize}
      data-tao-variant={resolvedVariant}
      data-tao-error={status === 'error' || undefined}
      disabled={resolvedDisabled}
      onClick={isMobile ? () => setOpen(true) : undefined}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {prefix != null && <span data-tao-picker-prefix="">{prefix}</span>}
      <span data-tao-picker-input="">
        {displayValue || <span data-tao-picker-placeholder="">{defaultPlaceholder}</span>}
      </span>
      <span data-tao-picker-icons="">
        {showClearBtn && hovering ? (
          <span data-tao-picker-clear="" onClick={handleClear} role="button" aria-label="Clear">
            <CloseIcon />
          </span>
        ) : (
          <span data-tao-picker-suffix="">
            {suffixIcon ?? <CalendarIcon />}
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
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          data-tao-picker-dropdown=""
          sideOffset={4}
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {panelContent}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
