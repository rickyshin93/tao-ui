import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useState } from 'react';
import {
  type TaoDirection,
  TaoPortalScope,
  useTaoConfig,
} from '../../provider/tao-provider';
import { CheckIcon, FilterIcon } from './table-icons';
import type { TableFilterItem } from './table-types';

export function TableFilterDropdown({
  filters,
  activeValues,
  direction,
  onSelect,
}: {
  filters: TableFilterItem[];
  activeValues: string[];
  direction?: TaoDirection;
  onSelect: (values: string[]) => void;
}) {
  const { locale, disabled } = useTaoConfig();
  const [internalOpen, setInternalOpen] = useState(false);
  if (disabled && internalOpen) setInternalOpen(false);
  const open = !disabled && internalOpen;
  const toggle = (value: string) => {
    onSelect(
      activeValues.includes(value)
        ? activeValues.filter((item) => item !== value)
        : [...activeValues, value],
    );
  };

  return (
    <DropdownMenu.Root
      dir={direction}
      open={open}
      onOpenChange={(next) => {
        if (!disabled || !next) setInternalOpen(next);
      }}
    >
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <button
          type="button"
          data-tao-table-filter-trigger=""
          aria-label={locale.messages.filter}
          disabled={disabled}
        >
          <FilterIcon active={activeValues.length > 0} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <TaoPortalScope asChild direction={direction}>
          <DropdownMenu.Content
            data-tao-table-filter-panel=""
            align="end"
            sideOffset={4}
            loop
          >
            {filters.map((filter) => {
              const checked = activeValues.includes(filter.value);
              return (
                <DropdownMenu.CheckboxItem
                  key={filter.value}
                  checked={checked}
                  data-tao-table-filter-option=""
                  onCheckedChange={() => toggle(filter.value)}
                  onSelect={(event) => event.preventDefault()}
                >
                  <span
                    data-tao-table-filter-check=""
                    data-tao-checked={checked || undefined}
                  >
                    <DropdownMenu.ItemIndicator>
                      <CheckIcon />
                    </DropdownMenu.ItemIndicator>
                  </span>
                  <span>{filter.text}</span>
                </DropdownMenu.CheckboxItem>
              );
            })}
            {activeValues.length > 0 && (
              <DropdownMenu.Item
                data-tao-table-filter-reset=""
                onSelect={() => onSelect([])}
              >
                {locale.messages.filterReset}
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </TaoPortalScope>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
