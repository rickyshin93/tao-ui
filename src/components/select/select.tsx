import * as RadixSelect from '@radix-ui/react-select';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import {
  type TaoSize,
  type TaoVariant,
  useTaoConfig,
} from '../../provider/tao-provider';
import { MobileSelectDrawer } from './mobile-select';
import './select.css';
import { useIsMobile } from './use-is-mobile';

export interface SelectOption {
  label: ReactNode;
  value: string;
  disabled?: boolean;
  /** Leading icon/avatar shown in the option row and in the trigger when selected. */
  icon?: ReactNode;
  /** Secondary description line shown under the label in the option row. */
  description?: ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  size?: TaoSize;
  variant?: TaoVariant;
  disabled?: boolean;
  /** Show search input in dropdown */
  showSearch?: boolean;
  /** Custom filter function, default matches label string */
  filterOption?: (input: string, option: SelectOption) => boolean;
  /** Allow clearing the value */
  allowClear?: boolean;
  /** Show loading spinner */
  loading?: boolean;
  /** Content when no options match */
  notFoundContent?: ReactNode;
  /** Prefix icon/element */
  prefix?: ReactNode;
  /** Force mobile mode (bottom sheet) regardless of screen size */
  mobile?: boolean;
}

const defaultFilter = (input: string, option: SelectOption): boolean => {
  const label =
    typeof option.label === 'string' ? option.label : String(option.label);
  return label.toLowerCase().includes(input.toLowerCase());
};

export function Select(props: SelectProps) {
  const {
    options,
    value,
    onChange,
    placeholder,
    size,
    variant,
    disabled,
    showSearch,
    filterOption,
    allowClear,
    loading,
    notFoundContent = 'No results',
    prefix,
    mobile,
  } = props;

  const ctx = useTaoConfig();
  const resolvedSize = size ?? ctx.size;
  const resolvedVariant = variant ?? ctx.variant;
  const resolvedDisabled = disabled ?? ctx.disabled;
  const autoMobile = useIsMobile();
  const isMobile = mobile ?? autoMobile;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [hovering, setHovering] = useState(false);

  const filteredOptions = useMemo(() => {
    if (!showSearch || !search) return options;
    const fn = filterOption ?? defaultFilter;
    return options.filter((o) => fn(search, o));
  }, [options, search, showSearch, filterOption]);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setSearch('');
  }, []);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.('');
    },
    [onChange],
  );

  const showClearBtn = allowClear && value && !resolvedDisabled;
  const selectedOption = options.find((o) => o.value === value);

  // ---- Mobile: custom trigger + Drawer ----
  if (isMobile) {
    return (
      <>
        <button
          type="button"
          data-tao-control=""
          data-tao-select=""
          data-tao-size={resolvedSize}
          data-tao-variant={resolvedVariant}
          data-tao-disabled={resolvedDisabled || undefined}
          disabled={resolvedDisabled}
          onClick={() => setOpen(true)}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {prefix != null && <span data-tao-select-prefix="">{prefix}</span>}
          {selectedOption?.icon != null && (
            <span data-tao-select-value-icon="">{selectedOption.icon}</span>
          )}
          <span data-tao-select-value="">
            {selectedOption ? (
              selectedOption.label
            ) : (
              <span data-tao-select-placeholder="">{placeholder}</span>
            )}
          </span>
          <span data-tao-select-icons="">
            {loading && <LoadingIcon />}
            {showClearBtn && hovering ? (
              <span
                data-tao-select-clear=""
                onClick={handleClear}
                role="button"
                aria-label="Clear"
              >
                <CloseIcon />
              </span>
            ) : (
              <span data-tao-select-icon="">
                <ChevronDownIcon />
              </span>
            )}
          </span>
        </button>
        <MobileSelectDrawer
          open={open}
          onClose={() => handleOpenChange(false)}
          options={options}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          showSearch={showSearch}
          filterOption={filterOption}
          notFoundContent={notFoundContent}
        />
      </>
    );
  }

  // ---- Desktop: Radix Select ----
  return (
    <RadixSelect.Root
      value={value}
      onValueChange={onChange}
      disabled={resolvedDisabled}
      open={open}
      onOpenChange={handleOpenChange}
    >
      <RadixSelect.Trigger
        data-tao-control=""
        data-tao-select=""
        data-tao-size={resolvedSize}
        data-tao-variant={resolvedVariant}
        data-tao-disabled={resolvedDisabled || undefined}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {prefix != null && <span data-tao-select-prefix="">{prefix}</span>}
        {selectedOption?.icon != null && (
          <span data-tao-select-value-icon="">{selectedOption.icon}</span>
        )}
        <RadixSelect.Value placeholder={placeholder} />
        <span data-tao-select-icons="">
          {loading && <LoadingIcon />}
          {showClearBtn && hovering ? (
            <span
              data-tao-select-clear=""
              onClick={handleClear}
              role="button"
              aria-label="Clear"
            >
              <CloseIcon />
            </span>
          ) : (
            <RadixSelect.Icon data-tao-select-icon="">
              <ChevronDownIcon />
            </RadixSelect.Icon>
          )}
        </span>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          data-tao-select-content=""
          position="popper"
          sideOffset={4}
        >
          {showSearch && (
            <div data-tao-select-search="">
              <SearchIcon />
              <input
                data-tao-select-search-input=""
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                autoFocus
              />
            </div>
          )}
          <RadixSelect.Viewport data-tao-select-viewport="">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  data-tao-select-item=""
                  data-tao-has-desc={opt.description != null || undefined}
                >
                  {opt.icon != null && (
                    <span data-tao-select-item-icon="">{opt.icon}</span>
                  )}
                  <span data-tao-select-item-main="">
                    <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                    {opt.description != null && (
                      <span data-tao-select-item-desc="">
                        {opt.description}
                      </span>
                    )}
                  </span>
                  <RadixSelect.ItemIndicator data-tao-select-check="">
                    <CheckIcon />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))
            ) : (
              <div data-tao-select-empty="">{notFoundContent}</div>
            )}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function LoadingIcon() {
  return (
    <svg
      data-tao-select-loading=""
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
