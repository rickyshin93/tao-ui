import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { Drawer } from '../drawer/drawer';
import { SearchIcon } from './select-icons';
import { countLeafOptions, defaultFilter, filterTree } from './select-model';
import type { SelectOption } from './select-types';
import './mobile-select.css';

interface MobileSelectContentProps {
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string) => void;
  /** Multi-mode commit callback: fires when "Done" is pressed with the full array. */
  onMultiChange?: (values: string[]) => void;
  placeholder?: string;
  showSearch?: boolean;
  disabled?: boolean;
  filterOption?: (input: string, option: SelectOption) => boolean;
  notFoundContent?: ReactNode;
  optionRender?: (option: SelectOption, info: { index: number }) => ReactNode;
  onClose: () => void;
  /** Enable multi-select checkboxes + Done button flow. */
  multiple?: boolean;
}

function MobileSelectContentInner({
  options,
  value,
  onChange,
  onMultiChange,
  showSearch,
  filterOption,
  notFoundContent = 'No results',
  optionRender,
  onClose,
  multiple,
  disabled,
}: MobileSelectContentProps) {
  const [search, setSearch] = useState('');

  const valueArray = useMemo<string[]>(() => {
    if (multiple) return (value as string[]) ?? [];
    return value ? [value as string] : [];
  }, [multiple, value]);

  const [draft, setDraft] = useState<string[]>(valueArray);
  const draftSet = useMemo(() => new Set(draft), [draft]);

  const filteredOptions = useMemo(() => {
    if (!showSearch || !search) return options;
    const fn = filterOption ?? defaultFilter;
    return filterTree(options, fn, search);
  }, [options, search, showSearch, filterOption]);
  const resultCount = useMemo(
    () => countLeafOptions(filteredOptions),
    [filteredOptions],
  );

  const handleSelect = useCallback(
    (optValue: string) => {
      if (disabled) return;
      if (multiple) {
        setDraft((prev) =>
          prev.includes(optValue)
            ? prev.filter((v) => v !== optValue)
            : [...prev, optValue],
        );
      } else {
        onChange?.(optValue);
        onClose();
      }
    },
    [multiple, onChange, onClose, disabled],
  );

  const handleDone = useCallback(() => {
    if (disabled) return;
    onMultiChange?.(draft);
    onClose();
  }, [draft, onMultiChange, onClose, disabled]);

  let optIndex = 0;
  const renderItem = (opt: SelectOption): ReactNode => {
    const index = optIndex++;
    const isSelected = multiple ? draftSet.has(opt.value) : opt.value === value;
    return (
      <button
        type="button"
        key={opt.value}
        data-tao-sheet-item=""
        data-tao-selected={isSelected || undefined}
        aria-pressed={isSelected}
        data-tao-disabled={disabled || opt.disabled || undefined}
        disabled={disabled || opt.disabled}
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
            disabled={disabled}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            aria-label="Search options"
          />
        </div>
      )}
      <div data-tao-sheet-list="">
        {resultCount > 0 ? (
          renderTree(filteredOptions)
        ) : (
          <div data-tao-sheet-empty="">{notFoundContent}</div>
        )}
      </div>
      {multiple && (
        <div data-tao-sheet-footer="">
          <button
            type="button"
            data-tao-sheet-done=""
            disabled={disabled}
            onClick={handleDone}
          >
            Done
          </button>
        </div>
      )}
    </>
  );
}

export { MobileSelectContentInner as MobileSelectContent };

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
      <MobileSelectContentInner
        onClose={onClose}
        placeholder={placeholder}
        {...rest}
      />
    </Drawer>
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
