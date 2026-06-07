import type { Dayjs } from 'dayjs';
import { getYears } from './use-calendar';

interface YearGridProps {
  viewDate: Dayjs;
  value?: Dayjs | null;
  onSelect: (date: Dayjs) => void;
  disabledDate?: (date: Dayjs) => boolean;
}

export function YearGrid({
  viewDate,
  value,
  onSelect,
  disabledDate,
}: YearGridProps) {
  const years = getYears(viewDate.year());
  const decadeStart = Math.floor(viewDate.year() / 10) * 10;

  return (
    <div data-tao-year-grid="">
      {years.map((y) => {
        const yr = y.year();
        const isSelected = value && value.year() === yr;
        const isOutside = yr < decadeStart || yr > decadeStart + 9;
        const disabled = disabledDate?.(y) ?? false;
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
