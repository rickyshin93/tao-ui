import type { Dayjs } from 'dayjs';
import type { CSSProperties } from 'react';
import { getMonths } from './use-calendar';

import { useTaoConfig } from '../../../provider/tao-provider';

interface MonthGridProps {
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

export function MonthGrid({
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
}: MonthGridProps) {
  const { locale } = useTaoConfig();
  const months = getMonths(viewDate.year());

  return (
    <div data-tao-month-grid="" className={className} style={style}>
      {months.map((m, i) => {
        const isSelected = [value, rangeStart, rangeEnd].some((date) =>
          date?.isSame(m, 'month'),
        );
        const inRange =
          rangeStart &&
          rangeEnd &&
          m.isAfter(rangeStart, 'month') &&
          m.isBefore(rangeEnd, 'month');
        const disabled =
          disabledDate?.(m) ||
          (minDate != null && m.isBefore(minDate, 'month')) ||
          (maxDate != null && m.isAfter(maxDate, 'month'));
        return (
          <button
            key={m.format('YYYY-MM')}
            type="button"
            data-tao-month-cell=""
            data-tao-calendar-date={m.format('YYYY-MM')}
            className={cellClassName}
            style={cellStyle}
            data-tao-in-range={inRange || undefined}
            data-tao-selected={isSelected || undefined}
            aria-pressed={!!isSelected}
            data-tao-disabled={disabled || undefined}
            disabled={disabled}
            onClick={() => onSelect(m)}
          >
            {locale.months[i]}
          </button>
        );
      })}
    </div>
  );
}
