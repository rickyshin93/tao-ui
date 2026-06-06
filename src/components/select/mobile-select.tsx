import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { Drawer } from '../drawer/drawer';
import type { SelectOption } from './select';
import './mobile-select.css';

interface MobileSelectContentProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  showSearch?: boolean;
  filterOption?: (input: string, option: SelectOption) => boolean;
  notFoundContent?: ReactNode;
  onClose: () => void;
}

const defaultFilter = (input: string, option: SelectOption): boolean => {
  const label = typeof option.label === 'string' ? option.label : String(option.label);
  return label.toLowerCase().includes(input.toLowerCase());
};

export function MobileSelectContent({
  options,
  value,
  onChange,
  showSearch,
  filterOption,
  notFoundContent = 'No results',
  onClose,
}: MobileSelectContentProps) {
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    if (!showSearch || !search) return options;
    const fn = filterOption ?? defaultFilter;
    return options.filter((o) => fn(search, o));
  }, [options, search, showSearch, filterOption]);

  const handleSelect = useCallback(
    (optValue: string) => {
      onChange?.(optValue);
      onClose();
    },
    [onChange, onClose],
  );

  return (
    <>
      {showSearch && (
        <div data-tao-sheet-search="">
          <SearchIcon />
          <input
            data-tao-sheet-search-input=""
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            autoFocus
          />
        </div>
      )}
      <div data-tao-sheet-list="">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                data-tao-sheet-item=""
                data-tao-selected={isSelected || undefined}
                data-tao-disabled={opt.disabled || undefined}
                onClick={() => {
                  if (!opt.disabled) handleSelect(opt.value);
                }}
              >
                <span data-tao-sheet-item-label="">{opt.label}</span>
                {isSelected && (
                  <span data-tao-sheet-item-check="">
                    <CheckIcon />
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <div data-tao-sheet-empty="">{notFoundContent}</div>
        )}
      </div>
    </>
  );
}

export interface MobileSelectDrawerProps extends MobileSelectContentProps {
  open: boolean;
}

export function MobileSelectDrawer({
  open,
  onClose,
  placeholder,
  ...rest
}: MobileSelectDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="bottom"
      title={placeholder ?? 'Select'}
      height="70vh"
    >
      <MobileSelectContent onClose={onClose} placeholder={placeholder} {...rest} />
    </Drawer>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
