import type { Dayjs } from 'dayjs';
import type { CSSProperties } from 'react';
import { getYears } from './use-calendar';

interface YearGridProps {
  viewDate: Dayjs;
  value?: Dayjs | null;
  rangeStart?: Dayjs | null;
  rangeEnd?: Dayjs | null;
  onSelect: (date: Dayjs) => void;
  disabledDate?: (date: Dayjs) => boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  className?: string;
  style?: CSSProperties;
  cellClassName?: string;
  cellStyle?: CSSProperties;
}

export function YearGrid({
  viewDate,
  value,
  rangeStart,
  rangeEnd,
  onSelect,
  disabledDate,
  minDate,
  maxDate,
  className,
  style,
  cellClassName,
  cellStyle,
}: YearGridProps) {
  const years = getYears(viewDate.year());
  const decadeStart = Math.floor(viewDate.year() / 10) * 10;

  return (
    <div data-tao-year-grid="" className={className} style={style}>
      {years.map((y) => {
        const yr = y.year();
        const isSelected = [value, rangeStart, rangeEnd].some((date) =>
          date?.isSame(y, 'year'),
        );
        const inRange =
          rangeStart &&
          rangeEnd &&
          y.isAfter(rangeStart, 'year') &&
          y.isBefore(rangeEnd, 'year');
        const isOutside = yr < decadeStart || yr > decadeStart + 9;
        const disabled =
          disabledDate?.(y) ||
          (minDate != null && y.isBefore(minDate, 'year')) ||
          (maxDate != null && y.isAfter(maxDate, 'year'));
        return (
          <button
            key={yr}
            type="button"
            data-tao-year-cell=""
            data-tao-calendar-date={y.format('YYYY')}
            className={cellClassName}
            style={cellStyle}
            data-tao-in-range={inRange || undefined}
            data-tao-selected={isSelected || undefined}
            aria-pressed={!!isSelected}
            data-tao-other-month={isOutside || undefined}
            data-tao-disabled={disabled || undefined}
            disabled={disabled}
            onClick={() => onSelect(y)}
          >
            {yr}
          </button>
        );
      })}
    </div>
  );
}
