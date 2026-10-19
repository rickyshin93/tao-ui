import type { Dayjs } from 'dayjs';
import { getYears } from './use-calendar';

interface YearGridProps {
  viewDate: Dayjs;
  value?: Dayjs | null;
  onSelect: (date: Dayjs) => void;
  disabledDate?: (date: Dayjs) => boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
}

export function YearGrid({
  viewDate,
  value,
  onSelect,
  disabledDate,
  minDate,
  maxDate,
}: YearGridProps) {
  const years = getYears(viewDate.year());
  const decadeStart = Math.floor(viewDate.year() / 10) * 10;

  return (
    <div data-tao-year-grid="">
      {years.map((y) => {
        const yr = y.year();
        const isSelected = value && value.year() === yr;
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
            data-tao-selected={isSelected || undefined}
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
