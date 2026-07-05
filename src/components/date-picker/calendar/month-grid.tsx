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
}

export function MonthGrid({
  viewDate,
  value,
  onSelect,
  disabledDate,
}: MonthGridProps) {
  const months = getMonths(viewDate.year());

  return (
    <div data-tao-month-grid="">
      {months.map((m, i) => {
        const isSelected =
          value && value.month() === i && value.year() === viewDate.year();
        const disabled = disabledDate?.(m) ?? false;
        return (
          <button
            key={m.format('YYYY-MM')}
            type="button"
            data-tao-month-cell=""
            data-tao-selected={isSelected || undefined}
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
