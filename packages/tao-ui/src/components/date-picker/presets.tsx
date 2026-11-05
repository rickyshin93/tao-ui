import { Button } from '../button/button';

interface PresetsProps {
  items: Array<{ label: string; value: unknown }>;
  onSelect: (value: unknown) => void;
}

export function Presets({ items, onSelect }: PresetsProps) {
  if (!items.length) return null;
  return (
    <div data-tao-picker-presets="">
      {items.map((item) => (
        <Button
          key={item.label}
          variant="secondary"
          size="small"
          disabled={false}
          data-tao-preset-btn=""
          onClick={() => onSelect(item.value)}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
