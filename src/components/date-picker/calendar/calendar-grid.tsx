import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { getCalendarWeeks } from './use-calendar';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

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
  onHover?: (date: Dayjs | null) => void;
  disabledDate?: (date: Dayjs) => boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
}

export function CalendarGrid({
  viewDate,
  value,
  rangeStart,
  rangeEnd,
  hoverDate,
  onSelect,
  onHover,
  disabledDate,
  minDate,
  maxDate,
}: CalendarGridProps) {
  const weeks = getCalendarWeeks(viewDate);
  const today = dayjs();
  const currentMonth = viewDate.month();
  const isRangeMode = rangeStart !== undefined; // distinguish from single picker

  const isDisabled = (date: Dayjs): boolean => {
    if (disabledDate?.(date)) return true;
    if (minDate && date.isBefore(minDate, 'day')) return true;
    if (maxDate && date.isAfter(maxDate, 'day')) return true;
    return false;
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
    // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: the calendar uses a table-shaped grid with interactive date buttons in cells.
    <table data-tao-calendar-grid="" role="grid">
      <thead>
        <tr>
          {WEEKDAYS.map((d) => (
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
                <td key={date.format('YYYY-MM-DD')} data-tao-calendar-cell="">
                  <button
                    type="button"
                    data-tao-calendar-cell-button=""
                    data-tao-selected={isSelected || undefined}
                    data-tao-today={isToday || undefined}
                    data-tao-other-month={isOtherMonth || undefined}
                    data-tao-disabled={disabled || undefined}
                    data-tao-in-range={inRange || undefined}
                    data-tao-range-start={rStart || undefined}
                    data-tao-range-end={rEnd || undefined}
                    disabled={disabled}
                    onClick={() => onSelect(date)}
                    onMouseEnter={() => onHover?.(date)}
                    onMouseLeave={() => onHover?.(null)}
                    aria-label={date.format('YYYY-MM-DD')}
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
