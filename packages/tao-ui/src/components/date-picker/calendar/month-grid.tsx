import type { Dayjs } from 'dayjs';
import { getMonths } from './use-calendar';

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

interface MonthGridProps {
  viewDate: Dayjs;
  value?: Dayjs | null;
  onSelect: (date: Dayjs) => void;
  disabledDate?: (date: Dayjs) => boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
}

export function MonthGrid({
  viewDate,
  value,
  onSelect,
  disabledDate,
  minDate,
  maxDate,
}: MonthGridProps) {
  const months = getMonths(viewDate.year());

  return (
    <div data-tao-month-grid="">
      {months.map((m, i) => {
        const isSelected =
          value && value.month() === i && value.year() === viewDate.year();
        const disabled =
          disabledDate?.(m) ||
          (minDate != null && m.isBefore(minDate, 'month')) ||
          (maxDate != null && m.isAfter(maxDate, 'month'));
        return (
          <button
            key={m.format('YYYY-MM')}
            type="button"
            data-tao-month-cell=""
            data-tao-selected={isSelected || undefined}
            aria-pressed={!!isSelected}
            data-tao-disabled={disabled || undefined}
            disabled={disabled}
            onClick={() => onSelect(m)}
          >
            {MONTH_LABELS[i]}
          </button>
        );
      })}
    </div>
  );
}
