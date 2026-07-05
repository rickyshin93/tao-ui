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
  optionRender?: (option: SelectOption, info: { index: number }) => ReactNode;
  onClose: () => void;
}

const defaultFilter = (input: string, option: SelectOption): boolean => {
  const label =
    typeof option.label === 'string' ? option.label : String(option.label);
  return label.toLowerCase().includes(input.toLowerCase());
};

/** Filter while preserving group structure; empty groups are dropped. */
function filterTree(
  options: SelectOption[],
  fn: (input: string, option: SelectOption) => boolean,
  input: string,
): SelectOption[] {
  const result: SelectOption[] = [];
  for (const o of options) {
    if (o.options) {
      const kids = filterTree(o.options, fn, input);
      if (kids.length) result.push({ ...o, options: kids });
    } else if (fn(input, o)) {
      result.push(o);
    }
  }
  return result;
}

function countLeaves(options: SelectOption[]): number {
  return options.reduce(
    (n, o) => n + (o.options ? countLeaves(o.options) : 1),
    0,
  );
}

export function MobileSelectContent({
  options,
  value,
  onChange,
  showSearch,
  filterOption,
  notFoundContent = 'No results',
  optionRender,
  onClose,
}: MobileSelectContentProps) {
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    if (!showSearch || !search) return options;
    const fn = filterOption ?? defaultFilter;
    return filterTree(options, fn, search);
  }, [options, search, showSearch, filterOption]);

  const handleSelect = useCallback(
    (optValue: string) => {
      onChange?.(optValue);
      onClose();
    },
    [onChange, onClose],
  );

  let optIndex = 0;
  const renderItem = (opt: SelectOption): ReactNode => {
    const index = optIndex++;
    const isSelected = opt.value === value;
    return (
      <button
        type="button"
        key={opt.value}
        data-tao-sheet-item=""
        data-tao-selected={isSelected || undefined}
        data-tao-disabled={opt.disabled || undefined}
        disabled={opt.disabled}
        onClick={() => {
          handleSelect(opt.value);
        }}
        data-tao-has-desc={opt.description != null || undefined}
      >
        {optionRender ? (
          optionRender(opt, { index })
        ) : (
          <>
            {opt.icon != null && (
              <span data-tao-sheet-item-icon="">{opt.icon}</span>
            )}
            <span data-tao-sheet-item-main="">
              <span data-tao-sheet-item-label="">{opt.label}</span>
              {opt.description != null && (
                <span data-tao-sheet-item-desc="">{opt.description}</span>
              )}
            </span>
          </>
        )}
        {isSelected && (
          <span data-tao-sheet-item-check="">
            <CheckIcon />
          </span>
        )}
      </button>
    );
  };

  const renderTree = (opts: SelectOption[]): ReactNode =>
    opts.map((o) =>
      o.options ? (
        <div key={o.value} data-tao-sheet-group="">
          <div data-tao-sheet-group-label="">{o.label}</div>
          {o.options.map(renderItem)}
        </div>
      ) : (
        renderItem(o)
      ),
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
          />
        </div>
      )}
      <div data-tao-sheet-list="">
        {countLeaves(filteredOptions) > 0 ? (
          renderTree(filteredOptions)
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
      <MobileSelectContent
        onClose={onClose}
        placeholder={placeholder}
        {...rest}
      />
    </Drawer>
  );
}

function SearchIcon() {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="18"
      height="18"
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
