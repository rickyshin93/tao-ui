import type { Dayjs } from 'dayjs';
import { useTaoConfig } from '../../../provider/tao-provider';
import type { PanelMode } from '../types';

interface CalendarHeaderProps {
  viewDate: Dayjs;
  panelMode: PanelMode;
  onViewDateChange: (date: Dayjs) => void;
  onPanelModeChange: (mode: PanelMode) => void;
}

export function CalendarHeader({
  viewDate,
  panelMode,
  onViewDateChange,
  onPanelModeChange,
}: CalendarHeaderProps) {
  const { locale } = useTaoConfig();
  const handlePrev = () => {
    if (panelMode === 'date') onViewDateChange(viewDate.subtract(1, 'month'));
    else if (panelMode === 'month')
      onViewDateChange(viewDate.subtract(1, 'year'));
    else if (panelMode === 'year' || panelMode === 'decade')
      onViewDateChange(viewDate.subtract(10, 'year'));
  };

  const handleNext = () => {
    if (panelMode === 'date') onViewDateChange(viewDate.add(1, 'month'));
    else if (panelMode === 'month') onViewDateChange(viewDate.add(1, 'year'));
    else if (panelMode === 'year' || panelMode === 'decade')
      onViewDateChange(viewDate.add(10, 'year'));
  };

  const handleSuperPrev = () => {
    onViewDateChange(viewDate.subtract(1, 'year'));
  };

  const handleSuperNext = () => {
    onViewDateChange(viewDate.add(1, 'year'));
  };

  const handleMonthClick = () => {
    onPanelModeChange(panelMode === 'month' ? 'date' : 'month');
  };

  const handleYearClick = () => {
    onPanelModeChange(panelMode === 'year' ? 'date' : 'year');
  };

  const decadeStart = Math.floor(viewDate.year() / 10) * 10;

  return (
    <div data-tao-calendar-header="">
      <div data-tao-calendar-nav="">
        {panelMode === 'date' && (
          <button
            type="button"
            data-tao-calendar-nav-btn=""
            onClick={handleSuperPrev}
            aria-label={locale.previousYear}
          >
            <DoubleLeftIcon />
          </button>
        )}
        <button
          type="button"
          data-tao-calendar-nav-btn=""
          onClick={handlePrev}
          aria-label={locale.previous}
        >
          <LeftIcon />
        </button>
      </div>

      <div data-tao-calendar-title="">
        {panelMode === 'date' && (
          <>
            <button
              type="button"
              data-tao-calendar-title-btn=""
              onClick={handleMonthClick}
            >
              {locale.months[viewDate.month()]}
            </button>
            <button
              type="button"
              data-tao-calendar-title-btn=""
              onClick={handleYearClick}
            >
              {viewDate.format('YYYY')}
            </button>
          </>
        )}
        {panelMode === 'month' && (
          <button
            type="button"
            data-tao-calendar-title-btn=""
            onClick={handleYearClick}
          >
            {viewDate.format('YYYY')}
          </button>
        )}
        {(panelMode === 'year' || panelMode === 'decade') && (
          <span data-tao-calendar-title-text="">
            {decadeStart} – {decadeStart + 9}
          </span>
        )}
      </div>

      <div data-tao-calendar-nav="">
        <button
          type="button"
          data-tao-calendar-nav-btn=""
          onClick={handleNext}
          aria-label={locale.next}
        >
          <RightIcon />
        </button>
        {panelMode === 'date' && (
          <button
            type="button"
            data-tao-calendar-nav-btn=""
            onClick={handleSuperNext}
            aria-label={locale.nextYear}
          >
            <DoubleRightIcon />
          </button>
        )}
      </div>
    </div>
  );
}

function LeftIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
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
      aria-hidden="true"
      focusable="false"
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
      aria-hidden="true"
      focusable="false"
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
      aria-hidden="true"
      focusable="false"
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
