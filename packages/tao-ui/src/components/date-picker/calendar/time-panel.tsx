import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { TimeConfig } from '../types';

interface TimePanelProps {
  hour: number;
  minute: number;
  second: number;
  onChange: (h: number, m: number, s: number) => void;
  config?: TimeConfig;
  /** Increment to force scroll-to-selected even when the value hasn't changed */
  scrollKey?: number;
}

export function TimePanel({
  hour,
  minute,
  second,
  onChange,
  config,
  scrollKey,
}: TimePanelProps) {
  const hourStep = config?.hourStep ?? 1;
  const minuteStep = config?.minuteStep ?? 1;
  const secondStep = config?.secondStep ?? 1;

  const hours = useMemo(
    () =>
      Array.from({ length: Math.ceil(24 / hourStep) }, (_, i) => i * hourStep),
    [hourStep],
  );

  const minutes = useMemo(
    () =>
      Array.from(
        { length: Math.ceil(60 / minuteStep) },
        (_, i) => i * minuteStep,
      ),
    [minuteStep],
  );

  const seconds = useMemo(
    () =>
      Array.from(
        { length: Math.ceil(60 / secondStep) },
        (_, i) => i * secondStep,
      ),
    [secondStep],
  );

  return (
    <div data-tao-time-panel="">
      <TimeColumn
        values={hours}
        selected={hour}
        onSelect={(v) => onChange(v, minute, second)}
        label="Hour"
        scrollKey={scrollKey}
      />
      <TimeColumn
        values={minutes}
        selected={minute}
        onSelect={(v) => onChange(hour, v, second)}
        label="Minute"
        scrollKey={scrollKey}
      />
      <TimeColumn
        values={seconds}
        selected={second}
        onSelect={(v) => onChange(hour, minute, v)}
        label="Second"
        scrollKey={scrollKey}
      />
    </div>
  );
}

interface TimeColumnProps {
  values: number[];
  selected: number;
  onSelect: (value: number) => void;
  label: string;
  scrollKey?: number;
}

function TimeColumn({
  values,
  selected,
  onSelect,
  label,
  scrollKey,
}: TimeColumnProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll on mount (no animation)
  const initRef = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const selectedEl = el.querySelector('[data-tao-selected]');
    selectedEl?.scrollIntoView({ block: 'center' });
  }, []);

  useEffect(() => {
    // Props are dependencies because a new selection must re-center the list.
    void selected;
    void scrollKey;
    const el = listRef.current;
    if (!el) return;
    const selectedEl = el.querySelector('[data-tao-selected]');
    selectedEl?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [selected, scrollKey]);

  return (
    <fieldset data-tao-time-column="" aria-label={label}>
      <div data-tao-time-column-title="">{label}</div>
      <div
        data-tao-time-column-list=""
        ref={(el) => {
          (listRef as React.MutableRefObject<HTMLDivElement | null>).current =
            el;
          initRef(el);
        }}
      >
        {values.map((v) => (
          <button
            key={v}
            type="button"
            data-tao-time-cell=""
            data-tao-selected={v === selected || undefined}
            aria-pressed={v === selected}
            onClick={() => onSelect(v)}
          >
            {String(v).padStart(2, '0')}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
