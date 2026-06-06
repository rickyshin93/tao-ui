import type { ReactNode } from 'react';

interface PresetsProps {
  items: Array<{ label: string; value: unknown }>;
  onSelect: (value: unknown) => void;
}

export function Presets({ items, onSelect }: PresetsProps) {
  if (!items.length) return null;
  return (
    <div data-tao-picker-presets="">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          data-tao-preset-btn=""
          onClick={() => onSelect(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
