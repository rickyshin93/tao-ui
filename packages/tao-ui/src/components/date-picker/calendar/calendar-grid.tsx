// biome-ignore-all lint/a11y/noNoninteractiveElementToInteractiveRole: the calendar uses a table-shaped grid with interactive date buttons in cells.
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTaoConfig } from '../../../provider/tao-provider';
import { getCalendarWeeks } from './use-calendar';

interface CalendarGridProps {
  viewDate: Dayjs;
  value?: Dayjs | null;
  /** Range mode: start of confirmed range */
  rangeStart?: Dayjs | null;
  /** Range mode: end of confirmed range */
  rangeEnd?: Dayjs | null;
  /** Range mode: date currently being hovered */
  hoverDate?: Dayjs | null;
  onSelect: (date: Dayjs) => void;
  onViewDateChange?: (date: Dayjs) => void;
  onHover?: (date: Dayjs | null) => void;
  disabledDate?: (date: Dayjs) => boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  className?: string;
  style?: CSSProperties;
  cellClassName?: string;
  cellStyle?: CSSProperties;
}

export function CalendarGrid({
  viewDate,
  value,
  rangeStart,
  rangeEnd,
  hoverDate,
  onSelect,
  onViewDateChange,
  onHover,
  disabledDate,
  minDate,
  maxDate,
  className,
  style,
  cellClassName,
  cellStyle,
}: CalendarGridProps) {
  const { locale } = useTaoConfig();
  const weekStartsOn = locale.weekStartsOn ?? 1;
  const weekdayOffset = (weekStartsOn + 6) % 7;
  const weekdays = [
    ...locale.weekdays.slice(weekdayOffset),
    ...locale.weekdays.slice(0, weekdayOffset),
  ];
  const weeks = getCalendarWeeks(viewDate, weekStartsOn);
  const today = dayjs();
  const currentMonth = viewDate.month();
  const isRangeMode = rangeStart !== undefined; // distinguish from single picker

  const isDisabled = (date: Dayjs): boolean => {
    if (disabledDate?.(date)) return true;
    if (minDate && date.isBefore(minDate, 'day')) return true;
    if (maxDate && date.isAfter(maxDate, 'day')) return true;
    return false;
  };
  const dates = weeks.flat();
  const preferredFocus =
    [value, rangeStart, today].find(
      (candidate) =>
        candidate != null &&
        dates.some((date) => date.isSame(candidate, 'day')) &&
        !isDisabled(candidate),
    ) ??
    dates.find((date) => date.month() === currentMonth && !isDisabled(date)) ??
    dates.find((date) => !isDisabled(date)) ??
    viewDate;
  const [focusedDate, setFocusedDate] = useState(preferredFocus);
  const focusedDateRef = useRef(focusedDate);
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
  const shouldRestoreFocus = useRef(false);

  useEffect(() => {
    if (!dates.some((date) => date.isSame(focusedDateRef.current, 'day'))) {
      focusedDateRef.current = preferredFocus;
      setFocusedDate(preferredFocus);
    }
  }, [dates, preferredFocus]);

  useEffect(() => {
    if (!shouldRestoreFocus.current) return;
    shouldRestoreFocus.current = false;
    buttonRefs.current.get(focusedDate.format('YYYY-MM-DD'))?.focus();
  }, [focusedDate]);

  const moveFocus = (nextDate: Dayjs) => {
    let next = nextDate;
    const direction = next.isBefore(focusedDateRef.current, 'day') ? -1 : 1;
    while (isDisabled(next)) {
      next = next.add(direction, 'day');
      if (minDate && next.isBefore(minDate, 'day')) return;
      if (maxDate && next.isAfter(maxDate, 'day')) return;
    }
    const nextButton = buttonRefs.current.get(next.format('YYYY-MM-DD'));
    if (nextButton) {
      const currentButton = buttonRefs.current.get(
        focusedDateRef.current.format('YYYY-MM-DD'),
      );
      if (currentButton) currentButton.tabIndex = -1;
      nextButton.tabIndex = 0;
      focusedDateRef.current = next;
      nextButton.focus();
      return;
    }
    focusedDateRef.current = next;
    shouldRestoreFocus.current = true;
    setFocusedDate(next);
    if (!next.isSame(viewDate, 'month')) {
      onViewDateChange?.(next.startOf('month'));
    }
  };

  const handleKeyDown = (event: KeyboardEvent, date: Dayjs) => {
    let next: Dayjs | undefined;
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    if (event.key === 'ArrowLeft') next = date.add(rtl ? 1 : -1, 'day');
    else if (event.key === 'ArrowRight') next = date.add(rtl ? -1 : 1, 'day');
    else if (event.key === 'ArrowUp') next = date.subtract(7, 'day');
    else if (event.key === 'ArrowDown') next = date.add(7, 'day');
    else if (event.key === 'Home')
      next = date.subtract((date.day() - weekStartsOn + 7) % 7, 'day');
    else if (event.key === 'End')
      next = date.add(6 - ((date.day() - weekStartsOn + 7) % 7), 'day');
    else if (event.key === 'PageUp') next = date.subtract(1, 'month');
    else if (event.key === 'PageDown') next = date.add(1, 'month');
    if (!next) return;
    event.preventDefault();
    event.stopPropagation();
    moveFocus(next);
  };

  // Compute effective range (confirmed or hover preview)
  const getEffectiveRange = (): [Dayjs, Dayjs] | null => {
    if (!isRangeMode) return null;
    const s = rangeStart;
    const e = rangeEnd ?? hoverDate;
    if (!s || !e) return null;
    return s.isBefore(e, 'day') ? [s, e] : [e, s];
  };

  const effectiveRange = getEffectiveRange();

  const isInRange = (date: Dayjs): boolean => {
    if (!effectiveRange) return false;
    return (
      date.isAfter(effectiveRange[0], 'day') &&
      date.isBefore(effectiveRange[1], 'day')
    );
  };

  const isRangeStart = (date: Dayjs): boolean => {
    if (!effectiveRange) return false;
    return date.isSame(effectiveRange[0], 'day');
  };

  const isRangeEnd = (date: Dayjs): boolean => {
    if (!effectiveRange) return false;
    return date.isSame(effectiveRange[1], 'day');
  };

  return (
    <table
      data-tao-calendar-grid=""
      role="grid"
      aria-label={locale.calendarTitle(viewDate.month(), viewDate.year())}
      aria-multiselectable={isRangeMode || undefined}
      className={className}
      style={style}
    >
      <thead>
        <tr>
          {weekdays.map((d) => (
            <th key={d} data-tao-calendar-weekday="">
              {d}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week) => (
          <tr key={week[0]?.format('YYYY-MM-DD')}>
            {week.map((date) => {
              const isOtherMonth = date.month() !== currentMonth;
              const disabled = isDisabled(date);
              const isSelected =
                !isRangeMode && value && date.isSame(value, 'day');
              const isToday = date.isSame(today, 'day');
              // Range states only apply to current month cells
              const inRange = !isOtherMonth && isInRange(date);
              const rStart = !isOtherMonth && isRangeStart(date);
              const rEnd = !isOtherMonth && isRangeEnd(date);

              return (
                // biome-ignore lint/a11y/useFocusableInteractive: each gridcell contains the focusable date button, which owns roving keyboard navigation.
                <td
                  role="gridcell"
                  key={date.format('YYYY-MM-DD')}
                  data-tao-calendar-cell=""
                  aria-selected={
                    isRangeMode
                      ? !!(
                          rangeStart &&
                          rangeEnd &&
                          !isOtherMonth &&
                          !date.isBefore(rangeStart, 'day') &&
                          !date.isAfter(rangeEnd, 'day')
                        )
                      : !!isSelected
                  }
                >
                  <button
                    ref={(element) => {
                      const key = date.format('YYYY-MM-DD');
                      if (element) buttonRefs.current.set(key, element);
                      else buttonRefs.current.delete(key);
                    }}
                    type="button"
                    className={cellClassName}
                    style={cellStyle}
                    data-tao-calendar-cell-button=""
                    data-tao-selected={isSelected || undefined}
                    data-tao-today={isToday || undefined}
                    data-tao-other-month={isOtherMonth || undefined}
                    data-tao-disabled={disabled || undefined}
                    data-tao-in-range={inRange || undefined}
                    data-tao-range-start={rStart || undefined}
                    data-tao-range-end={rEnd || undefined}
                    disabled={disabled}
                    tabIndex={
                      date.isSame(focusedDateRef.current, 'day') ? 0 : -1
                    }
                    onFocus={(event) => {
                      const previous = buttonRefs.current.get(
                        focusedDateRef.current.format('YYYY-MM-DD'),
                      );
                      if (previous) previous.tabIndex = -1;
                      event.currentTarget.tabIndex = 0;
                      focusedDateRef.current = date;
                    }}
                    onKeyDown={(event) => handleKeyDown(event, date)}
                    onClick={() => onSelect(date)}
                    onMouseEnter={() => onHover?.(date)}
                    onMouseLeave={() => onHover?.(null)}
                    aria-label={date.format('YYYY-MM-DD')}
                    aria-current={isToday ? 'date' : undefined}
                  >
                    <span data-tao-calendar-cell-inner="">{date.date()}</span>
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
