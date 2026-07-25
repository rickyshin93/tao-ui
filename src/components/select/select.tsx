import * as Popover from '@radix-ui/react-popover';
import * as RadixSelect from '@radix-ui/react-select';
import {
  type CSSProperties,
  Fragment,
  type ReactNode,
  useCallback,
  useId,
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
  | 'searchInput'
  | 'group'
  | 'groupLabel'
  | 'item'
  | 'itemIcon'
  | 'itemLabel'
  | 'itemDesc'
  | 'empty'
  | 'tag'
  | 'tagLabel'
  | 'tagClose'
  | 'tagRest'
  | 'values';

export type SelectPlacement =
  | 'bottomLeft'
  | 'bottomRight'
  | 'topLeft'
  | 'topRight';

export interface TagRenderProps {
  label: ReactNode;
  value: string;
  closable: boolean;
  disabled: boolean;
  onClose: (e: React.MouseEvent) => void;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  /** Fired on selection or clear. Multi-mode receives `string[]`. */
  onChange?: (
    value: string | string[],
    option?: SelectOption | SelectOption[],
  ) => void;
  /** Fired only when an option is picked (not on clear). Multi-mode receives a single value. */
  onSelect?: (value: string, option: SelectOption) => void;
  /** Fired when an option is deselected (multi-mode only). */
  onDeselect?: (value: string, option: SelectOption) => void;
  /** Fired when the value is cleared via the clear button. */
  onClear?: () => void;
  /** Selection mode. `multiple` for multi-select, `tags` for free-form tag input. */
  mode?: 'multiple' | 'tags';
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
  /** Custom remove icon for multi-select tags. */
  removeIcon?: ReactNode;
  autoFocus?: boolean;
  id?: string;
  /** Name for hidden form field (single mode only). */
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
  /** Customize the selected label shown in the trigger (single mode only). */
  labelRender?: (option: SelectOption) => ReactNode;
  /** Wrap/customize the dropdown content. */
  popupRender?: (menu: ReactNode) => ReactNode;
  /** Custom tag rendering (multi-mode only). */
  tagRender?: (props: TagRenderProps) => ReactNode;
  /** Max visible tags before collapsing into "+N". */
  maxTagCount?: number | 'responsive';
  /** Placeholder for collapsed tags: node or `(omittedValues) => node`. */
  maxTagPlaceholder?:
    | ReactNode
    | ((omittedValues: SelectOption[]) => ReactNode);
  /** Truncate tag label text to this length. */
  maxTagTextLength?: number;
  /** Max selectable items (multi-mode only). */
  maxCount?: number;
  /** Auto-clear search text after selection (multi-mode only, default: true). */
  autoClearSearchValue?: boolean;
  /** Characters that split pasted/typed text into multiple selections. */
  tokenSeparators?: string[];
  /** Hide already-selected options from the dropdown (multi-mode only). */
  hideSelected?: boolean;
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
    onDeselect,
    onClear,
    mode,
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
    removeIcon,
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
    tagRender,
    maxTagCount,
    maxTagPlaceholder,
    maxTagTextLength,
    maxCount,
    autoClearSearchValue = true,
    tokenSeparators,
    hideSelected,
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

  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchListboxId = useId();

  const isMultiple = mode === 'multiple' || mode === 'tags';
  const hasInlineSearch = !!showSearch && !isMobile;

  // value (controlled / uncontrolled)
  const isValueControlled = valueProp !== undefined;
  const [valueInternal, setValueInternal] = useState<
    string | string[] | undefined
  >(
    isMultiple
      ? ((defaultValue as string[] | undefined) ?? [])
      : (defaultValue as string | undefined),
  );
  const value = isValueControlled ? valueProp : valueInternal;

  // Normalized array form for consistent internal handling.
  const valueArray = useMemo<string[]>(() => {
    if (isMultiple) return (value as string[]) ?? [];
    return value ? [value as string] : [];
  }, [isMultiple, value]);

  // open (controlled / uncontrolled)
  const isOpenControlled = openProp !== undefined;
  const [openInternal, setOpenInternal] = useState(defaultOpen ?? false);
  const open = isOpenControlled ? openProp : openInternal;

  // search (controlled / uncontrolled)
  const isSearchControlled = searchValueProp !== undefined;
  const [searchInternal, setSearchInternal] = useState('');
  const search = isSearchControlled ? searchValueProp : searchInternal;
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);

  const [hovering, setHovering] = useState(false);

  // Prevents Radix from auto-closing the dropdown after a multi-select toggle.
  const suppressCloseRef = useRef(false);

  const allOptions = useMemo(() => flattenOptions(options), [options]);

  const handleValueChange = useCallback(
    (next: string) => {
      if (isMultiple) {
        // Token separators: split on separator chars
        if (tokenSeparators && tokenSeparators.length > 0) {
          const sep = tokenSeparators.find((s) => next.includes(s));
          if (sep) {
            const tokens = next
              .split(sep)
              .map((t) => t.trim())
              .filter(Boolean);
            const toAdd = tokens.filter((t) => {
              const opt = allOptions.find(
                (o) => o.value === t || o.label === t,
              );
              return opt && !valueArray.includes(opt.value);
            });
            if (toAdd.length > 0) {
              const nextArray = [...valueArray, ...toAdd];
              if (maxCount != null && nextArray.length > maxCount) return;
              if (!isValueControlled) setValueInternal(nextArray);
              const selectedOpts = nextArray
                .map((v) => allOptions.find((o) => o.value === v))
                .filter(Boolean) as SelectOption[];
              onChange?.(nextArray, selectedOpts);
              for (const v of toAdd) {
                const opt = allOptions.find((o) => o.value === v);
                if (opt) onSelect?.(v, opt);
              }
            }
            return;
          }
        }

        if (!hasInlineSearch) suppressCloseRef.current = true;
        const current = valueArray;
        const existed = current.includes(next);
        const nextArray = existed
          ? current.filter((v) => v !== next)
          : [...current, next];

        if (!existed && maxCount != null && nextArray.length > maxCount) return;

        if (!isValueControlled) setValueInternal(nextArray);
        const selectedOpts = nextArray
          .map((v) => allOptions.find((o) => o.value === v))
          .filter(Boolean) as SelectOption[];
        onChange?.(nextArray, selectedOpts);

        const opt = allOptions.find((o) => o.value === next);
        if (opt) {
          if (existed) {
            onDeselect?.(next, opt);
          } else {
            onSelect?.(next, opt);
          }
        }

        if (autoClearSearchValue && !isSearchControlled) {
          setSearchInternal('');
        }
        return;
      }

      // Single mode
      const opt = allOptions.find((o) => o.value === next);
      if (!isValueControlled) setValueInternal(next);
      onChange?.(next, opt);
      if (opt) onSelect?.(next, opt);
    },
    [
      isMultiple,
      hasInlineSearch,
      valueArray,
      maxCount,
      tokenSeparators,
      isValueControlled,
      allOptions,
      onChange,
      onSelect,
      onDeselect,
      autoClearSearchValue,
      isSearchControlled,
    ],
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      // In multi mode, suppress the auto-close that Radix fires after selection.
      if (isMultiple && !hasInlineSearch && !next && suppressCloseRef.current) {
        suppressCloseRef.current = false;
        return;
      }
      suppressCloseRef.current = false;
      if (!isOpenControlled) setOpenInternal(next);
      if (!next && !isSearchControlled) setSearchInternal('');
      // Focus the search input once the dropdown mounts.
      if (next && showSearch && !isMobile) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      onOpenChange?.(next);
    },
    [
      isMultiple,
      hasInlineSearch,
      isOpenControlled,
      isSearchControlled,
      onOpenChange,
      showSearch,
      isMobile,
    ],
  );

  const handleSearchChange = useCallback(
    (v: string) => {
      if (!isSearchControlled) setSearchInternal(v);
      onSearch?.(v);
    },
    [isSearchControlled, onSearch],
  );

  // Token separator handling for search input
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isMultiple || !tokenSeparators || tokenSeparators.length === 0)
        return;
      const value = (e.target as HTMLInputElement).value;
      const sep = tokenSeparators.find((s) => value.includes(s));
      if (!sep) return;
      e.preventDefault();
      handleValueChange(value);
      if (!isSearchControlled) setSearchInternal('');
    },
    [isMultiple, tokenSeparators, handleValueChange, isSearchControlled],
  );

  const clearValue = useCallback(() => {
    if (isMultiple) {
      if (!isValueControlled) setValueInternal([]);
      onChange?.([], undefined);
    } else {
      if (!isValueControlled) setValueInternal(undefined);
      onChange?.('', undefined);
    }
    onClear?.();
  }, [isMultiple, isValueControlled, onChange, onClear]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      clearValue();
    },
    [clearValue],
  );

  // Remove a single tag
  const handleRemoveTag = useCallback(
    (removedValue: string, e: React.SyntheticEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!isMultiple) return;
      const nextArray = valueArray.filter((v) => v !== removedValue);
      if (!isValueControlled) setValueInternal(nextArray);
      const selectedOpts = nextArray
        .map((v) => allOptions.find((o) => o.value === v))
        .filter(Boolean) as SelectOption[];
      onChange?.(nextArray, selectedOpts);
      const opt = allOptions.find((o) => o.value === removedValue);
      if (opt) onDeselect?.(removedValue, opt);
    },
    [
      isMultiple,
      valueArray,
      isValueControlled,
      allOptions,
      onChange,
      onDeselect,
    ],
  );

  // Mobile multi-select commit: fires when the user presses "Done" in the drawer.
  const handleMultiChange = useCallback(
    (nextArray: string[]) => {
      if (!isValueControlled) setValueInternal(nextArray);
      const selectedOpts = nextArray
        .map((v) => allOptions.find((o) => o.value === v))
        .filter(Boolean) as SelectOption[];
      onChange?.(nextArray, selectedOpts);

      // Fire onSelect for newly added, onDeselect for removed.
      const prev = valueArray;
      for (const v of nextArray) {
        if (!prev.includes(v)) {
          const opt = allOptions.find((o) => o.value === v);
          if (opt) onSelect?.(v, opt);
        }
      }
      for (const v of prev) {
        if (!nextArray.includes(v)) {
          const opt = allOptions.find((o) => o.value === v);
          if (opt) onDeselect?.(v, opt);
        }
      }
    },
    [valueArray, isValueControlled, allOptions, onChange, onSelect, onDeselect],
  );

  const filteredOptions = useMemo(() => {
    let opts = options;
    if (hideSelected && isMultiple && valueArray.length > 0) {
      const filterSelected = (list: SelectOption[]): SelectOption[] => {
        const result: SelectOption[] = [];
        for (const o of list) {
          if (o.options) {
            const kids = filterSelected(o.options);
            if (kids.length) result.push({ ...o, options: kids });
          } else if (!valueArray.includes(o.value)) {
            result.push(o);
          }
        }
        return result;
      };
      opts = filterSelected(opts);
    }
    if (!showSearch || !search) return opts;
    const fn = filterOption ?? defaultFilter;
    return filterTree(opts, fn, search);
  }, [
    options,
    search,
    showSearch,
    filterOption,
    hideSelected,
    isMultiple,
    valueArray,
  ]);

  const allowClearEnabled = !!allowClear;
  const clearIcon = (typeof allowClear === 'object' &&
    allowClear.clearIcon) || <CloseIcon />;
  const showClearBtn =
    allowClearEnabled &&
    (isMultiple ? valueArray.length > 0 : !!value) &&
    !resolvedDisabled;

  const selectedOption = useMemo(
    () =>
      !isMultiple && value
        ? allOptions.find((o) => o.value === value)
        : undefined,
    [isMultiple, value, allOptions],
  );

  const selectedOptions = useMemo(
    () =>
      isMultiple
        ? (valueArray
            .map(
              (v) =>
                allOptions.find((o) => o.value === v) ??
                (mode === 'tags' ? { label: v, value: v } : undefined),
            )
            .filter(Boolean) as SelectOption[])
        : [],
    [isMultiple, valueArray, allOptions, mode],
  );

  const statusProps = {
    'data-tao-error': status === 'error' || undefined,
    'data-tao-warning': status === 'warning' || undefined,
  };

  // ---- Tag rendering for multi mode ----

  const renderTags = (): ReactNode => {
    if (!isMultiple || selectedOptions.length === 0) return null;

    let visible = selectedOptions;
    let omitted: SelectOption[] = [];

    if (
      typeof maxTagCount === 'number' &&
      maxTagCount < selectedOptions.length
    ) {
      visible = selectedOptions.slice(0, maxTagCount);
      omitted = selectedOptions.slice(maxTagCount);
    }

    const truncateLabel = (opt: SelectOption): ReactNode => {
      const raw = typeof opt.label === 'string' ? opt.label : String(opt.label);
      if (
        maxTagTextLength != null &&
        typeof raw === 'string' &&
        raw.length > maxTagTextLength
      ) {
        return `${raw.slice(0, maxTagTextLength)}…`;
      }
      return opt.label;
    };

    return (
      <>
        {visible.map((opt) => {
          const closable = !resolvedDisabled && !opt.disabled;
          const tagNode = tagRender ? (
            tagRender({
              label: truncateLabel(opt),
              value: opt.value,
              closable,
              disabled: !!opt.disabled,
              onClose: (e) => handleRemoveTag(opt.value, e),
            })
          ) : (
            <span
              key={opt.value}
              data-tao-select-tag=""
              data-tao-disabled={opt.disabled || undefined}
              className={cx(classNames?.tag)}
              style={styles?.tag}
            >
              <span
                data-tao-select-tag-label=""
                className={cx(classNames?.tagLabel)}
                style={styles?.tagLabel}
              >
                {truncateLabel(opt)}
              </span>
              {closable && (
                // biome-ignore lint/a11y/useSemanticElements: the tag lives inside a trigger, so a nested button would be invalid HTML.
                <span
                  data-tao-select-tag-close=""
                  className={cx(classNames?.tagClose)}
                  style={styles?.tagClose}
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${typeof opt.label === 'string' ? opt.label : opt.value}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => handleRemoveTag(opt.value, e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleRemoveTag(opt.value, e);
                    }
                  }}
                >
                  {removeIcon ?? <CloseSmallIcon />}
                </span>
              )}
            </span>
          );
          return <Fragment key={opt.value}>{tagNode}</Fragment>;
        })}
        {omitted.length > 0 && (
          <span
            data-tao-select-tag=""
            data-tao-select-tag-rest=""
            className={cx(classNames?.tagRest)}
            style={styles?.tagRest}
          >
            {typeof maxTagPlaceholder === 'function'
              ? maxTagPlaceholder(omitted)
              : (maxTagPlaceholder ?? `+${omitted.length}…`)}
          </span>
        )}
      </>
    );
  };

  const trailingIcons = (
    <span data-tao-select-icons="">
      {loading ? (
        <span data-tao-select-icon="" data-tao-select-loading-slot="">
          {loadingIcon ?? <LoadingIcon />}
        </span>
      ) : showClearBtn && hovering ? (
        // biome-ignore lint/a11y/useSemanticElements: inside Radix button trigger; nesting a button here would be invalid HTML.
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

  const searchableTrailingIcons = (
    <span
      data-tao-select-icons=""
      data-tao-clearable={showClearBtn || undefined}
    >
      {loading ? (
        <span data-tao-select-icon="" data-tao-select-loading-slot="">
          {loadingIcon ?? <LoadingIcon />}
        </span>
      ) : (
        <>
          {showClearBtn && (
            <button
              type="button"
              data-tao-select-clear=""
              className={cx(classNames?.clear)}
              style={styles?.clear}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={handleClear}
              aria-label="Clear"
            >
              {clearIcon}
            </button>
          )}
          <span
            data-tao-select-icon=""
            data-tao-custom-suffix={suffixIcon != null || undefined}
            className={cx(classNames?.suffix)}
            style={styles?.suffix}
          >
            {suffixIcon ?? <ChevronDownIcon />}
          </span>
        </>
      )}
    </span>
  );

  // ---- Mobile: custom trigger + Drawer ----
  if (isMobile) {
    return (
      <>
        {/* biome-ignore lint/a11y/useSemanticElements: this custom trigger contains removable tags, so it cannot be a native button. */}
        <div
          id={id}
          data-tao-control=""
          data-tao-select=""
          data-tao-size={resolvedSize}
          data-tao-variant={resolvedVariant}
          data-tao-disabled={resolvedDisabled || undefined}
          {...statusProps}
          // biome-ignore lint/a11y/noAutofocus: Select exposes autoFocus to match native input-like controls.
          autoFocus={autoFocus}
          role="button"
          tabIndex={resolvedDisabled ? undefined : 0}
          aria-disabled={resolvedDisabled || undefined}
          className={cx(classNames?.root, className)}
          style={{ ...styles?.root, ...style }}
          onClick={() => handleOpenChange(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenChange(true);
            }
          }}
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
          {isMultiple ? (
            <span
              data-tao-select-values=""
              className={cx(classNames?.values)}
              style={styles?.values}
            >
              {selectedOptions.length > 0 ? (
                renderTags()
              ) : (
                <span
                  data-tao-select-placeholder=""
                  className={cx(classNames?.placeholder)}
                  style={styles?.placeholder}
                >
                  {placeholder}
                </span>
              )}
            </span>
          ) : (
            <>
              {selectedOption?.icon != null && (
                <span data-tao-select-value-icon="">{selectedOption.icon}</span>
              )}
              {selectedOption && labelRender ? (
                <span data-tao-select-value="">
                  {labelRender(selectedOption)}
                </span>
              ) : selectedOption ? (
                <span data-tao-select-value="">
                  {typeof selectedOption.label === 'string'
                    ? selectedOption.label
                    : String(selectedOption.label)}
                </span>
              ) : (
                <span
                  data-tao-select-placeholder=""
                  className={cx(classNames?.placeholder)}
                  style={styles?.placeholder}
                >
                  {placeholder}
                </span>
              )}
            </>
          )}
          {trailingIcons}
        </div>
        <MobileSelectDrawer
          open={open}
          onClose={() => handleOpenChange(false)}
          options={options}
          value={value}
          onChange={handleValueChange}
          onMultiChange={handleMultiChange}
          placeholder={placeholder}
          showSearch={showSearch}
          filterOption={filterOption}
          notFoundContent={notFoundContent}
          optionRender={optionRender}
          multiple={isMultiple}
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

  // In multi mode, Radix doesn't manage our value — we render our own checkmarks.
  const radixValue = isMultiple ? '' : (value as string) || undefined;

  const resultCount = flattenOptions(filteredOptions).length;

  const overMaxCount =
    isMultiple && maxCount != null && valueArray.length >= maxCount;

  let optIndex = 0;
  const renderItem = (opt: SelectOption): ReactNode => {
    const index = optIndex++;
    const textLabel =
      typeof opt.label === 'string' ? opt.label : String(opt.label);
    const isSelected = valueArray.includes(opt.value);
    const itemDisabled = opt.disabled || (!isSelected && overMaxCount);

    return (
      <RadixSelect.Item
        key={opt.value}
        value={opt.value}
        disabled={itemDisabled}
        data-tao-select-item=""
        data-tao-has-desc={opt.description != null || undefined}
        data-tao-selected={isMultiple && isSelected ? '' : undefined}
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
        {isMultiple ? (
          isSelected && (
            <span data-tao-select-check="">
              <CheckIcon />
            </span>
          )
        ) : (
          <RadixSelect.ItemIndicator data-tao-select-check="">
            <CheckIcon />
          </RadixSelect.ItemIndicator>
        )}
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
  );

  const isSearchableOptionDisabled = (option: SelectOption) =>
    !!option.disabled || (overMaxCount && !valueArray.includes(option.value));
  const searchableOptions = flattenOptions(filteredOptions).filter(
    (option) => !isSearchableOptionDisabled(option),
  );
  const activeSearchOption =
    searchableOptions[
      Math.min(activeSearchIndex, Math.max(searchableOptions.length - 1, 0))
    ];
  let searchableItemIndex = 0;

  const renderSearchableItem = (option: SelectOption): ReactNode => {
    const renderIndex = searchableItemIndex++;
    const optionIndex = searchableOptions.findIndex(
      (candidate) => candidate.value === option.value,
    );
    const isSelected = valueArray.includes(option.value);
    const itemDisabled = isSearchableOptionDisabled(option);

    return (
      <button
        key={option.value}
        id={`${searchListboxId}-option-${encodeURIComponent(option.value)}`}
        type="button"
        role="option"
        aria-selected={isSelected}
        disabled={itemDisabled}
        data-disabled={itemDisabled || undefined}
        data-tao-select-item=""
        data-tao-selected={isMultiple && isSelected ? '' : undefined}
        data-tao-has-desc={option.description != null || undefined}
        data-state={isSelected ? 'checked' : 'unchecked'}
        data-highlighted={
          activeSearchOption?.value === option.value ? '' : undefined
        }
        className={cx(classNames?.item)}
        style={styles?.item}
        onPointerDown={(event) => event.preventDefault()}
        onMouseMove={() => {
          if (optionIndex >= 0) setActiveSearchIndex(optionIndex);
        }}
        onClick={() => {
          if (itemDisabled) return;
          handleValueChange(option.value);
          if (!isMultiple) handleOpenChange(false);
        }}
      >
        {optionRender ? (
          optionRender(option, { index: renderIndex })
        ) : (
          <>
            {option.icon != null && (
              <span
                data-tao-select-item-icon=""
                className={cx(classNames?.itemIcon)}
                style={styles?.itemIcon}
              >
                {option.icon}
              </span>
            )}
            <span
              data-tao-select-item-main=""
              className={cx(classNames?.itemLabel)}
              style={styles?.itemLabel}
            >
              <span>{option.label}</span>
              {option.description != null && (
                <span
                  data-tao-select-item-desc=""
                  className={cx(classNames?.itemDesc)}
                  style={styles?.itemDesc}
                >
                  {option.description}
                </span>
              )}
            </span>
          </>
        )}
        {isSelected && (
          <span data-tao-select-check="">
            <CheckIcon />
          </span>
        )}
      </button>
    );
  };

  const renderSearchableTree = (items: SelectOption[]): ReactNode =>
    items.map((option) =>
      option.options ? (
        <fieldset
          key={option.value}
          aria-label={String(option.label)}
          data-tao-select-group=""
          className={cx(classNames?.group)}
          style={styles?.group}
        >
          <legend
            data-tao-select-group-label=""
            className={cx(classNames?.groupLabel)}
            style={styles?.groupLabel}
          >
            {option.label}
          </legend>
          {renderSearchableTree(option.options)}
        </fieldset>
      ) : (
        renderSearchableItem(option)
      ),
    );

  const searchableMenuNode = (
    <div
      id={searchListboxId}
      role="listbox"
      aria-multiselectable={isMultiple || undefined}
      data-tao-select-viewport=""
      style={{ maxHeight: listHeight }}
    >
      {resultCount > 0 ? (
        renderSearchableTree(filteredOptions)
      ) : (
        <div
          data-tao-select-empty=""
          className={cx(classNames?.empty)}
          style={styles?.empty}
        >
          {notFoundContent}
        </div>
      )}
    </div>
  );

  const container =
    getPopupContainer && triggerRef.current
      ? getPopupContainer(triggerRef.current)
      : undefined;

  const inlineSearchInput = (
    <input
      ref={inputRef}
      id={id}
      role="combobox"
      data-tao-select-trigger-input=""
      className={cx(classNames?.searchInput)}
      style={styles?.searchInput}
      value={search}
      placeholder={
        isMultiple && selectedOptions.length === 0 ? placeholder : undefined
      }
      disabled={resolvedDisabled}
      aria-expanded={open}
      aria-autocomplete="list"
      aria-controls={open ? searchListboxId : undefined}
      aria-invalid={status === 'error' || undefined}
      aria-activedescendant={
        open && activeSearchOption
          ? `${searchListboxId}-option-${encodeURIComponent(activeSearchOption.value)}`
          : undefined
      }
      aria-label={selectedOption ? String(selectedOption.label) : placeholder}
      // biome-ignore lint/a11y/noAutofocus: Select exposes autoFocus to match native input-like controls.
      autoFocus={autoFocus}
      autoComplete="off"
      onClick={(event) => {
        if (open) event.stopPropagation();
      }}
      onChange={(event) => {
        handleSearchChange(event.target.value);
        setActiveSearchIndex(0);
        if (!open) handleOpenChange(true);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        handleSearchKeyDown(event);
        if (event.defaultPrevented) return;
        if (event.key === 'Escape') {
          handleSearchChange('');
          handleOpenChange(false);
          return;
        }
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setActiveSearchIndex((index) =>
            Math.min(index + 1, searchableOptions.length - 1),
          );
          if (!open) handleOpenChange(true);
          return;
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setActiveSearchIndex((index) => Math.max(index - 1, 0));
          return;
        }
        const nextValue =
          activeSearchOption?.value ??
          (mode === 'tags' ? search.trim() : undefined);
        if (event.key === 'Enter' && nextValue) {
          event.preventDefault();
          handleValueChange(nextValue);
          if (!isMultiple) handleOpenChange(false);
        }
      }}
    />
  );

  if (hasInlineSearch) {
    const searchableContentStyle: CSSProperties = { ...contentStyle };
    if (popupMatchSelectWidth === true) {
      searchableContentStyle.minWidth = 'var(--radix-popover-trigger-width)';
    } else if (popupMatchSelectWidth === false) {
      searchableContentStyle.minWidth = 'max-content';
    }

    return (
      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <Popover.Trigger asChild>
          <div
            ref={triggerRef}
            role="presentation"
            data-tao-control=""
            data-tao-select=""
            data-tao-inline-search=""
            data-tao-multiple={isMultiple || undefined}
            data-tao-size={resolvedSize}
            data-tao-variant={resolvedVariant}
            data-disabled={resolvedDisabled || undefined}
            data-tao-disabled={resolvedDisabled || undefined}
            {...statusProps}
            className={cx(classNames?.root, className)}
            style={{ ...styles?.root, ...style }}
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
            {isMultiple ? (
              <span
                data-tao-select-values=""
                className={cx(classNames?.values)}
                style={styles?.values}
              >
                {renderTags()}
                {inlineSearchInput}
              </span>
            ) : (
              <>
                {selectedOption?.icon != null && (
                  <span data-tao-select-value-icon="">
                    {selectedOption.icon}
                  </span>
                )}
                <span
                  data-tao-select-search-trigger=""
                  className={cx(classNames?.search)}
                  style={styles?.search}
                >
                  {inlineSearchInput}
                  {!search && (
                    <span
                      data-tao-select-trigger-value=""
                      data-tao-select-placeholder={
                        selectedOption ? undefined : ''
                      }
                      className={cx(
                        selectedOption ? undefined : classNames?.placeholder,
                      )}
                      style={selectedOption ? undefined : styles?.placeholder}
                    >
                      {selectedOption && labelRender
                        ? labelRender(selectedOption)
                        : selectedOption
                          ? String(selectedOption.label)
                          : placeholder}
                    </span>
                  )}
                </span>
              </>
            )}
            {searchableTrailingIcons}
          </div>
        </Popover.Trigger>

        {name && !isMultiple && (
          <input
            type="hidden"
            name={name}
            value={(value as string) ?? ''}
            disabled={resolvedDisabled}
          />
        )}

        <Popover.Portal container={container}>
          <TaoPortalScope asChild>
            <Popover.Content
              data-tao-select-content=""
              data-tao-popup-width={
                popupMatchSelectWidth === false ? 'content' : undefined
              }
              className={cx(classNames?.popup)}
              style={searchableContentStyle}
              side={side}
              align={align}
              sideOffset={4}
              onOpenAutoFocus={(event) => event.preventDefault()}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                inputRef.current?.focus();
              }}
            >
              {popupRender
                ? popupRender(searchableMenuNode)
                : searchableMenuNode}
            </Popover.Content>
          </TaoPortalScope>
        </Popover.Portal>
      </Popover.Root>
    );
  }

  return (
    <RadixSelect.Root
      value={radixValue}
      onValueChange={handleValueChange}
      disabled={resolvedDisabled}
      open={open}
      onOpenChange={handleOpenChange}
      name={isMultiple ? undefined : name}
    >
      <RadixSelect.Trigger asChild>
        {/* biome-ignore lint/a11y/noStaticElementInteractions: Radix adds combobox semantics and keyboard behavior to this trigger. */}
        <div
          ref={triggerRef}
          id={id}
          data-tao-control=""
          data-tao-select=""
          data-tao-size={resolvedSize}
          data-tao-variant={resolvedVariant}
          data-tao-disabled={resolvedDisabled || undefined}
          data-tao-multiple={isMultiple || undefined}
          {...statusProps}
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
          {isMultiple ? (
            <span
              data-tao-select-values=""
              className={cx(classNames?.values)}
              style={styles?.values}
            >
              {selectedOptions.length > 0 ? (
                renderTags()
              ) : (
                <span
                  data-tao-select-placeholder=""
                  className={cx(classNames?.placeholder)}
                  style={styles?.placeholder}
                >
                  {placeholder}
                </span>
              )}
            </span>
          ) : (
            <>
              {selectedOption?.icon != null && (
                <span data-tao-select-value-icon="">{selectedOption.icon}</span>
              )}
              {selectedOption && labelRender ? (
                <span data-tao-select-value="">
                  {labelRender(selectedOption)}
                </span>
              ) : selectedOption ? (
                <span data-tao-select-value="">
                  {typeof selectedOption.label === 'string'
                    ? selectedOption.label
                    : String(selectedOption.label)}
                </span>
              ) : (
                <span
                  data-tao-select-placeholder=""
                  className={cx(classNames?.placeholder)}
                  style={styles?.placeholder}
                >
                  {placeholder}
                </span>
              )}
            </>
          )}
          {trailingIcons}
        </div>
      </RadixSelect.Trigger>

      <RadixSelect.Portal container={container}>
        <TaoPortalScope asChild>
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
            {showSearch && !hasInlineSearch && (
              <div
                data-tao-select-search=""
                className={cx(classNames?.search)}
                style={styles?.search}
              >
                <span data-tao-select-search-icon="">
                  <SearchIcon />
                </span>
                <input
                  ref={inputRef}
                  data-tao-select-search-input=""
                  className={cx(classNames?.searchInput)}
                  style={styles?.searchInput}
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    // Stop propagation so Radix Content's typeahead / arrow-key
                    // navigation doesn't swallow keystrokes meant for this input.
                    e.stopPropagation();
                    handleSearchKeyDown(e);
                  }}
                  placeholder="Search..."
                  autoComplete="off"
                />
              </div>
            )}
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

function CloseSmallIcon() {
  return (
    <svg
      width="10"
      height="10"
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
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function SearchIcon() {
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
