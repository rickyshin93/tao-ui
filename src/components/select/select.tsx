import * as RadixSelect from '@radix-ui/react-select';
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  TaoPortalScope,
  type TaoSize,
  type TaoVariant,
  useTaoConfig,
} from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
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
  /** Nested options turn this entry into a group; `label` becomes the group title. */
  options?: SelectOption[];
}

export type SelectSemanticPart =
  | 'root'
  | 'prefix'
  | 'suffix'
  | 'placeholder'
  | 'clear'
  | 'popup'
  | 'search'
  | 'group'
  | 'groupLabel'
  | 'item'
  | 'itemIcon'
  | 'itemLabel'
  | 'itemDesc'
  | 'empty';

export type SelectPlacement =
  | 'bottomLeft'
  | 'bottomRight'
  | 'topLeft'
  | 'topRight';

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  /** Fired on selection or clear. `option` is undefined when cleared. */
  onChange?: (value: string, option?: SelectOption) => void;
  /** Fired only when an option is picked (not on clear). */
  onSelect?: (value: string, option: SelectOption) => void;
  /** Fired when the value is cleared via the clear button. */
  onClear?: () => void;
  placeholder?: string;
  size?: TaoSize;
  variant?: TaoVariant;
  disabled?: boolean;
  /** Validation status. */
  status?: 'error' | 'warning';
  /** Show search input in dropdown */
  showSearch?: boolean;
  /** Custom filter function, default matches label string */
  filterOption?: (input: string, option: SelectOption) => boolean;
  /** Controlled search text. */
  searchValue?: string;
  /** Fired when the search text changes. */
  onSearch?: (value: string) => void;
  /** Allow clearing the value; pass an object to customize the clear icon. */
  allowClear?: boolean | { clearIcon?: ReactNode };
  /** Show loading spinner */
  loading?: boolean;
  /** Custom loading icon. */
  loadingIcon?: ReactNode;
  /** Content when no options match */
  notFoundContent?: ReactNode;
  /** Prefix icon/element */
  prefix?: ReactNode;
  /** Custom suffix (arrow) icon. */
  suffixIcon?: ReactNode;
  autoFocus?: boolean;
  id?: string;
  /** Name for hidden form field. */
  name?: string;
  /** Controlled open state of the dropdown. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Dropdown position. Defaults to `bottomLeft`. */
  placement?: SelectPlacement;
  /** Match popup width to trigger (true), a fixed px width (number), or fit content (false). */
  popupMatchSelectWidth?: boolean | number;
  /** Max height of the option list. Defaults to 256. */
  listHeight?: number;
  /** Parent node the popup renders into. Defaults to body. */
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
  /** Customize the rendering of each dropdown option. */
  optionRender?: (option: SelectOption, info: { index: number }) => ReactNode;
  /** Customize the selected label shown in the trigger. */
  labelRender?: (option: SelectOption) => ReactNode;
  /** Wrap/customize the dropdown content. */
  popupRender?: (menu: ReactNode) => ReactNode;
  /** Force mobile mode (bottom sheet) regardless of screen size */
  mobile?: boolean;
  /** Merged onto the trigger root; use to override width etc. */
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<SelectSemanticPart>;
  styles?: SemanticStyles<SelectSemanticPart>;
}

const defaultFilter = (input: string, option: SelectOption): boolean => {
  const label =
    typeof option.label === 'string' ? option.label : String(option.label);
  return label.toLowerCase().includes(input.toLowerCase());
};

/** Collect all leaf (non-group) options, descending into groups. */
function flattenOptions(options: SelectOption[]): SelectOption[] {
  const out: SelectOption[] = [];
  for (const o of options) {
    if (o.options) out.push(...flattenOptions(o.options));
    else out.push(o);
  }
  return out;
}

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

const PLACEMENT_MAP: Record<
  SelectPlacement,
  { side: 'top' | 'bottom'; align: 'start' | 'end' }
> = {
  bottomLeft: { side: 'bottom', align: 'start' },
  bottomRight: { side: 'bottom', align: 'end' },
  topLeft: { side: 'top', align: 'start' },
  topRight: { side: 'top', align: 'end' },
};

export function Select(props: SelectProps) {
  const {
    options,
    value: valueProp,
    defaultValue,
    onChange,
    onSelect,
    onClear,
    placeholder,
    size,
    variant,
    disabled,
    status,
    showSearch,
    filterOption,
    searchValue: searchValueProp,
    onSearch,
    allowClear,
    loading,
    loadingIcon,
    notFoundContent = 'No results',
    prefix,
    suffixIcon,
    autoFocus,
    id,
    name,
    open: openProp,
    defaultOpen,
    onOpenChange,
    placement = 'bottomLeft',
    popupMatchSelectWidth = true,
    listHeight = 256,
    getPopupContainer,
    optionRender,
    labelRender,
    popupRender,
    mobile,
    className,
    style,
    classNames,
    styles,
  } = props;

  const ctx = useTaoConfig();
  const resolvedSize = size ?? ctx.size;
  const resolvedVariant = variant ?? ctx.variant;
  const resolvedDisabled = disabled ?? ctx.disabled;
  const autoMobile = useIsMobile();
  const isMobile = mobile ?? autoMobile;

  const triggerRef = useRef<HTMLButtonElement>(null);

  // value (controlled / uncontrolled)
  const isValueControlled = valueProp !== undefined;
  const [valueInternal, setValueInternal] = useState(defaultValue);
  const value = isValueControlled ? valueProp : valueInternal;

  // open (controlled / uncontrolled)
  const isOpenControlled = openProp !== undefined;
  const [openInternal, setOpenInternal] = useState(defaultOpen ?? false);
  const open = isOpenControlled ? openProp : openInternal;

  // search (controlled / uncontrolled)
  const isSearchControlled = searchValueProp !== undefined;
  const [searchInternal, setSearchInternal] = useState('');
  const search = isSearchControlled ? searchValueProp : searchInternal;

  const [hovering, setHovering] = useState(false);

  const allOptions = useMemo(() => flattenOptions(options), [options]);

  const handleValueChange = useCallback(
    (next: string) => {
      const opt = allOptions.find((o) => o.value === next);
      if (!isValueControlled) setValueInternal(next);
      onChange?.(next, opt);
      if (opt) onSelect?.(next, opt);
    },
    [allOptions, isValueControlled, onChange, onSelect],
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setOpenInternal(next);
      if (!next && !isSearchControlled) setSearchInternal('');
      onOpenChange?.(next);
    },
    [isOpenControlled, isSearchControlled, onOpenChange],
  );

  const handleSearchChange = useCallback(
    (v: string) => {
      if (!isSearchControlled) setSearchInternal(v);
      onSearch?.(v);
    },
    [isSearchControlled, onSearch],
  );

  const clearValue = useCallback(() => {
    if (!isValueControlled) setValueInternal(undefined);
    onChange?.('', undefined);
    onClear?.();
  }, [isValueControlled, onChange, onClear]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      clearValue();
    },
    [clearValue],
  );

  const filteredOptions = useMemo(() => {
    if (!showSearch || !search) return options;
    const fn = filterOption ?? defaultFilter;
    return filterTree(options, fn, search);
  }, [options, search, showSearch, filterOption]);

  const allowClearEnabled = !!allowClear;
  const clearIcon = (typeof allowClear === 'object' &&
    allowClear.clearIcon) || <CloseIcon />;
  const showClearBtn = allowClearEnabled && !!value && !resolvedDisabled;
  const selectedOption = allOptions.find((o) => o.value === value);

  const statusProps = {
    'data-tao-error': status === 'error' || undefined,
    'data-tao-warning': status === 'warning' || undefined,
  };

  // Selected label shown in the trigger.
  const triggerLabel = selectedOption ? (
    labelRender ? (
      labelRender(selectedOption)
    ) : (
      selectedOption.label
    )
  ) : (
    <span
      data-tao-select-placeholder=""
      className={cx(classNames?.placeholder)}
      style={styles?.placeholder}
    >
      {placeholder}
    </span>
  );

  const trailingIcons = (
    <span data-tao-select-icons="">
      {loading ? (
        <span data-tao-select-icon="" data-tao-select-loading-slot="">
          {loadingIcon ?? <LoadingIcon />}
        </span>
      ) : showClearBtn && hovering ? (
        // biome-ignore lint/a11y/useSemanticElements: This sits inside the Radix button trigger; nesting a button here would be invalid HTML.
        <span
          data-tao-select-clear=""
          className={cx(classNames?.clear)}
          style={styles?.clear}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleClear}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              clearValue();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Clear"
        >
          {clearIcon}
        </span>
      ) : (
        <span
          data-tao-select-icon=""
          data-tao-custom-suffix={suffixIcon != null || undefined}
          className={cx(classNames?.suffix)}
          style={styles?.suffix}
        >
          {suffixIcon ?? <ChevronDownIcon />}
        </span>
      )}
    </span>
  );

  // ---- Mobile: custom trigger + Drawer ----
  if (isMobile) {
    return (
      <>
        <button
          type="button"
          id={id}
          data-tao-control=""
          data-tao-select=""
          data-tao-size={resolvedSize}
          data-tao-variant={resolvedVariant}
          data-tao-disabled={resolvedDisabled || undefined}
          {...statusProps}
          disabled={resolvedDisabled}
          // biome-ignore lint/a11y/noAutofocus: Select exposes autoFocus to match native input-like controls.
          autoFocus={autoFocus}
          className={cx(classNames?.root, className)}
          style={{ ...styles?.root, ...style }}
          onClick={() => handleOpenChange(true)}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {prefix != null && (
            <span
              data-tao-select-prefix=""
              className={cx(classNames?.prefix)}
              style={styles?.prefix}
            >
              {prefix}
            </span>
          )}
          {selectedOption?.icon != null && (
            <span data-tao-select-value-icon="">{selectedOption.icon}</span>
          )}
          <span data-tao-select-value="">{triggerLabel}</span>
          {trailingIcons}
        </button>
        <MobileSelectDrawer
          open={open}
          onClose={() => handleOpenChange(false)}
          options={options}
          value={value}
          onChange={handleValueChange}
          placeholder={placeholder}
          showSearch={showSearch}
          filterOption={filterOption}
          notFoundContent={notFoundContent}
          optionRender={optionRender}
        />
      </>
    );
  }

  // ---- Desktop: Radix Select ----
  const { side, align } = PLACEMENT_MAP[placement];

  const contentStyle: CSSProperties = { ...styles?.popup };
  if (typeof popupMatchSelectWidth === 'number') {
    contentStyle.width = popupMatchSelectWidth;
  }

  const resultCount = flattenOptions(filteredOptions).length;

  // Stable index across groups for optionRender.
  let optIndex = 0;
  const renderItem = (opt: SelectOption): ReactNode => {
    const index = optIndex++;
    const textLabel =
      typeof opt.label === 'string' ? opt.label : String(opt.label);
    return (
      <RadixSelect.Item
        key={opt.value}
        value={opt.value}
        disabled={opt.disabled}
        data-tao-select-item=""
        data-tao-has-desc={opt.description != null || undefined}
        className={cx(classNames?.item)}
        style={styles?.item}
      >
        {optionRender ? (
          <>
            {optionRender(opt, { index })}
            <RadixSelect.ItemText style={{ display: 'none' }}>
              {textLabel}
            </RadixSelect.ItemText>
          </>
        ) : (
          <>
            {opt.icon != null && (
              <span
                data-tao-select-item-icon=""
                className={cx(classNames?.itemIcon)}
                style={styles?.itemIcon}
              >
                {opt.icon}
              </span>
            )}
            <span
              data-tao-select-item-main=""
              className={cx(classNames?.itemLabel)}
              style={styles?.itemLabel}
            >
              <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
              {opt.description != null && (
                <span
                  data-tao-select-item-desc=""
                  className={cx(classNames?.itemDesc)}
                  style={styles?.itemDesc}
                >
                  {opt.description}
                </span>
              )}
            </span>
          </>
        )}
        <RadixSelect.ItemIndicator data-tao-select-check="">
          <CheckIcon />
        </RadixSelect.ItemIndicator>
      </RadixSelect.Item>
    );
  };

  const renderTree = (opts: SelectOption[]): ReactNode =>
    opts.map((o) =>
      o.options ? (
        <RadixSelect.Group
          key={o.value}
          data-tao-select-group=""
          className={cx(classNames?.group)}
          style={styles?.group}
        >
          <RadixSelect.Label
            data-tao-select-group-label=""
            className={cx(classNames?.groupLabel)}
            style={styles?.groupLabel}
          >
            {o.label}
          </RadixSelect.Label>
          {o.options.map(renderItem)}
        </RadixSelect.Group>
      ) : (
        renderItem(o)
      ),
    );

  const menuNode: ReactNode = (
    <>
      {showSearch && (
        <div
          data-tao-select-search=""
          className={cx(classNames?.search)}
          style={styles?.search}
        >
          <SearchIcon />
          <input
            data-tao-select-search-input=""
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search..."
            // biome-ignore lint/a11y/noAutofocus: Opening a searchable select should put focus in its search field.
            autoFocus
          />
        </div>
      )}
      <RadixSelect.Viewport
        data-tao-select-viewport=""
        style={{ maxHeight: listHeight }}
      >
        {resultCount > 0 ? (
          renderTree(filteredOptions)
        ) : (
          <div
            data-tao-select-empty=""
            className={cx(classNames?.empty)}
            style={styles?.empty}
          >
            {notFoundContent}
          </div>
        )}
      </RadixSelect.Viewport>
    </>
  );

  const container =
    getPopupContainer && triggerRef.current
      ? getPopupContainer(triggerRef.current)
      : undefined;

  return (
    <RadixSelect.Root
      value={value || undefined}
      onValueChange={handleValueChange}
      disabled={resolvedDisabled}
      open={open}
      onOpenChange={handleOpenChange}
      name={name}
    >
      <RadixSelect.Trigger
        ref={triggerRef}
        id={id}
        data-tao-control=""
        data-tao-select=""
        data-tao-size={resolvedSize}
        data-tao-variant={resolvedVariant}
        data-tao-disabled={resolvedDisabled || undefined}
        {...statusProps}
        autoFocus={autoFocus}
        className={cx(classNames?.root, className)}
        style={{ ...styles?.root, ...style }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {prefix != null && (
          <span
            data-tao-select-prefix=""
            className={cx(classNames?.prefix)}
            style={styles?.prefix}
          >
            {prefix}
          </span>
        )}
        {selectedOption?.icon != null && (
          <span data-tao-select-value-icon="">{selectedOption.icon}</span>
        )}
        <span data-tao-select-value="">{triggerLabel}</span>
        {trailingIcons}
      </RadixSelect.Trigger>

      <RadixSelect.Portal container={container}>
        <TaoPortalScope>
          <RadixSelect.Content
            data-tao-select-content=""
            data-tao-popup-width={
              popupMatchSelectWidth === false ? 'content' : undefined
            }
            className={cx(classNames?.popup)}
            style={contentStyle}
            position="popper"
            side={side}
            align={align}
            sideOffset={4}
          >
            {popupRender ? popupRender(menuNode) : menuNode}
          </RadixSelect.Content>
        </TaoPortalScope>
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
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** Double chevron (↕) for a switcher-style trigger. Pass to `suffixIcon`. */
export function ChevronsUpDownIcon() {
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
      aria-hidden="true"
      focusable="false"
    >
      <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
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
      aria-hidden="true"
      focusable="false"
      role="presentation"
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
      aria-hidden="true"
      focusable="false"
      role="presentation"
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
      aria-hidden="true"
      focusable="false"
      role="presentation"
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
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
