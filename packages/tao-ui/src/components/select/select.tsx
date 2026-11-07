import * as Popover from '@radix-ui/react-popover';
import * as RadixSelect from '@radix-ui/react-select';
import {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  type ReactNode,
  useCallback,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  TaoPortalScope,
  useTaoConfig,
  useTaoDirection,
} from '../../provider/tao-provider';
import { mergeRefs } from '../../utils/refs';
import { cx } from '../../utils/semantic';
import { MobileSelectDrawer } from './mobile-select';
import {
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  LoadingIcon,
  SearchIcon,
} from './select-icons';
import { defaultFilter, filterTree, flattenLeafOptions } from './select-model';
import { SearchableSelectList } from './select-searchable-list';
import { SelectTags } from './select-tags';
import { useSelectSelection } from './use-select-selection';
import './select.css';
import { useBreakpoint } from '../../utils/breakpoint';
import type {
  SelectOption,
  SelectPlacement,
  SelectProps,
  SelectRef,
} from './select-types';

export type {
  SelectOption,
  SelectPlacement,
  SelectProps,
  SelectRef,
  SelectSemanticPart,
  TagRenderProps,
} from './select-types';

const PLACEMENT_MAP: Record<
  SelectPlacement,
  { side: 'top' | 'bottom'; align: 'start' | 'end' }
> = {
  bottomLeft: { side: 'bottom', align: 'start' },
  bottomRight: { side: 'bottom', align: 'end' },
  topLeft: { side: 'top', align: 'start' },
  topRight: { side: 'top', align: 'end' },
};

export const Select = forwardRef(function Select(
  props: SelectProps,
  ref: ForwardedRef<SelectRef>,
) {
  const {
    options,
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
    notFoundContent: notFoundContentProp,
    prefix,
    suffixIcon,
    removeIcon,
    autoFocus,
    id,
    name,
    open: openProp,
    defaultOpen,
    onOpenChange,
    placement,
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
  const notFoundContent =
    notFoundContentProp === undefined
      ? ctx.locale.noResults
      : notFoundContentProp;
  const resolvedSize = size ?? ctx.size;
  const resolvedVariant = variant ?? ctx.variant;
  const resolvedDisabled = disabled ?? ctx.disabled;
  const screens = useBreakpoint();
  const requestedMobile = mobile ?? screens.xs;
  const isOpenControlled = openProp !== undefined;
  const [openInternal, setOpenInternal] = useState(defaultOpen ?? false);
  const requestedOpen = isOpenControlled ? openProp : openInternal;
  const latestRequestedOpen = useRef(requestedOpen);
  latestRequestedOpen.current = requestedOpen;
  // Preserve the active editing surface until it closes, including its draft and focus.
  const [mobilePresentation, setMobilePresentation] = useState(requestedMobile);
  if (
    (!requestedOpen || mobilePresentation === undefined) &&
    mobilePresentation !== requestedMobile
  ) {
    setMobilePresentation(requestedMobile);
  }
  const isMobile =
    (requestedOpen ? mobilePresentation : requestedMobile) ?? false;

  const triggerRef = useRef<HTMLDivElement>(null);
  const [direction, directionRef] = useTaoDirection(props.direction);
  const mergedTriggerRef = useMemo(
    () => mergeRefs(triggerRef, directionRef),
    [directionRef],
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const searchListboxId = useId();

  const isMultiple = mode === 'multiple' || mode === 'tags';
  const hasInlineSearch = !!showSearch && !isMobile;

  useImperativeHandle(
    ref,
    () => ({
      focus: () =>
        (hasInlineSearch ? inputRef.current : triggerRef.current)?.focus(),
      blur: () =>
        (hasInlineSearch ? inputRef.current : triggerRef.current)?.blur(),
      get nativeElement() {
        return hasInlineSearch ? inputRef.current : triggerRef.current;
      },
    }),
    [hasInlineSearch],
  );

  const {
    value,
    valueArray,
    selectedValueSet,
    selectedOption,
    selectedOptions,
    select: selectValue,
    addTokens,
    remove: removeValue,
    commit: handleMultiChange,
    clear: clearValue,
  } = useSelectSelection(props, resolvedDisabled);

  // search (controlled / uncontrolled)
  const isSearchControlled = searchValueProp !== undefined;
  const [searchInternal, setSearchInternal] = useState('');
  const search = isSearchControlled ? searchValueProp : searchInternal;
  const [previousOpen, setPreviousOpen] = useState(requestedOpen);
  if (previousOpen !== requestedOpen) {
    setPreviousOpen(requestedOpen);
    if (!requestedOpen && !isSearchControlled) setSearchInternal('');
  }
  const [activeSearch, setActiveSearch] = useState<{
    index: number;
    value?: string;
  }>({ index: 0 });
  const composingRef = useRef(false);
  const isComposingKey = useCallback(
    (event: KeyboardEvent) =>
      composingRef.current || event.isComposing || event.keyCode === 229,
    [],
  );
  const handleEscapeKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isComposingKey(event)) event.preventDefault();
    },
    [isComposingKey],
  );

  // Prevents Radix from auto-closing the dropdown after a multi-select toggle.
  const suppressCloseRef = useRef(false);

  const handleValueChange = useCallback(
    (next: string) => {
      if (resolvedDisabled) return;
      if (isMultiple && !hasInlineSearch) suppressCloseRef.current = true;
      if (!selectValue(next)) return;
      if (isMultiple && autoClearSearchValue && !isSearchControlled)
        setSearchInternal('');
    },
    [
      isMultiple,
      hasInlineSearch,
      resolvedDisabled,
      selectValue,
      autoClearSearchValue,
      isSearchControlled,
    ],
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next && resolvedDisabled) return;
      // In multi mode, suppress the auto-close that Radix fires after selection.
      if (isMultiple && !hasInlineSearch && !next && suppressCloseRef.current) {
        suppressCloseRef.current = false;
        return;
      }
      suppressCloseRef.current = false;
      if (!isOpenControlled) setOpenInternal(next);
      if (!next && isMobile) {
        setTimeout(() => {
          if (!latestRequestedOpen.current)
            (inputRef.current ?? triggerRef.current)?.focus();
        }, 0);
      }
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
      onOpenChange,
      resolvedDisabled,
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
      if (isComposingKey(e.nativeEvent)) return;
      if (!isMultiple || !tokenSeparators || tokenSeparators.length === 0)
        return;
      const value = (e.target as HTMLInputElement).value;
      const sep = tokenSeparators.find((s) => s && value.includes(s));
      if (!sep) return;
      e.preventDefault();
      if (addTokens(value) && !isSearchControlled) setSearchInternal('');
    },
    [
      isMultiple,
      tokenSeparators,
      addTokens,
      isSearchControlled,
      isComposingKey,
    ],
  );

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
      removeValue(removedValue);
    },
    [removeValue],
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
          } else if (!selectedValueSet.has(o.value)) {
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
    selectedValueSet,
    valueArray.length,
  ]);
  const filteredFlatOptions = useMemo(
    () => flattenLeafOptions(filteredOptions),
    [filteredOptions],
  );

  const suppressEmptyTagsPopup =
    hasInlineSearch &&
    mode === 'tags' &&
    filteredFlatOptions.length === 0 &&
    !notFoundContent &&
    !loading &&
    !popupRender;
  const open = requestedOpen && !suppressEmptyTagsPopup;

  const allowClearEnabled = !!allowClear;
  const clearIcon = (typeof allowClear === 'object' &&
    allowClear.clearIcon) || <CloseIcon />;
  const showClearBtn =
    allowClearEnabled &&
    (isMultiple ? valueArray.length > 0 : !!value) &&
    !resolvedDisabled;

  const statusProps = {
    'data-tao-error': status === 'error' || undefined,
    'data-tao-warning': status === 'warning' || undefined,
  };
  const ariaProps = {
    'aria-label': props['aria-label'],
    'aria-labelledby': props['aria-labelledby'],
    'aria-describedby': props['aria-describedby'],
    'aria-errormessage': props['aria-errormessage'],
    'aria-invalid': status === 'error' ? true : props['aria-invalid'],
    'aria-required': props['aria-required'],
  };

  const tags = isMultiple ? (
    <SelectTags
      options={selectedOptions}
      disabled={!!resolvedDisabled}
      maxTagCount={maxTagCount}
      maxTagPlaceholder={maxTagPlaceholder}
      maxTagTextLength={maxTagTextLength}
      removeIcon={removeIcon}
      tagRender={tagRender}
      classNames={classNames}
      styles={styles}
      onRemove={handleRemoveTag}
    />
  ) : null;

  const trailingIcons = (
    <span
      data-tao-select-icons=""
      data-tao-clearable={showClearBtn || undefined}
    >
      {loading ? (
        <span data-tao-select-icon="" data-tao-select-loading-slot="">
          {loadingIcon ?? <LoadingIcon />}
        </span>
      ) : showClearBtn ? (
        <>
          {/* biome-ignore lint/a11y/useSemanticElements: inside Radix button trigger; nesting a button here would be invalid HTML. */}
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
            aria-label={ctx.locale.clear}
          >
            {clearIcon}
          </span>
          <span
            data-tao-select-icon=""
            data-tao-custom-suffix={suffixIcon != null || undefined}
            className={cx(classNames?.suffix)}
            style={styles?.suffix}
          >
            {suffixIcon ?? <ChevronDownIcon />}
          </span>
        </>
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
              aria-label={ctx.locale.clear}
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
          ref={mergedTriggerRef}
          id={id}
          data-tao-control=""
          dir={direction}
          data-tao-select=""
          data-tao-multiple={isMultiple || undefined}
          data-tao-size={resolvedSize}
          data-tao-variant={resolvedVariant}
          data-tao-disabled={resolvedDisabled || undefined}
          {...statusProps}
          // biome-ignore lint/a11y/noAutofocus: Select exposes autoFocus to match native input-like controls.
          autoFocus={autoFocus}
          role="button"
          tabIndex={resolvedDisabled ? undefined : 0}
          {...ariaProps}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-disabled={resolvedDisabled || undefined}
          data-disabled={resolvedDisabled || undefined}
          className={cx(classNames?.root, className)}
          style={{ ...styles?.root, ...style }}
          onClick={() => handleOpenChange(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenChange(true);
            }
          }}
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
                tags
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
                <span data-tao-select-value="">{selectedOption.label}</span>
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
          direction={direction}
          mobileTitle={props.mobileTitle}
          classNames={classNames}
          styles={styles}
          popupRender={popupRender}
          open={open}
          onClose={() => handleOpenChange(false)}
          options={options}
          value={value}
          onChange={handleValueChange}
          onMultiChange={handleMultiChange}
          placeholder={placeholder}
          showSearch={showSearch}
          searchValue={search}
          onSearch={handleSearchChange}
          filterOption={filterOption}
          notFoundContent={notFoundContent}
          optionRender={optionRender}
          multiple={isMultiple}
          hideSelected={hideSelected}
          maxCount={maxCount}
          mode={mode}
          tokenSeparators={tokenSeparators}
          onSearchClear={() => {
            if (autoClearSearchValue && !isSearchControlled)
              setSearchInternal('');
          }}
          disabled={resolvedDisabled}
        />
      </>
    );
  }

  // ---- Desktop: Radix Select ----
  const { side, align: physicalAlign } =
    PLACEMENT_MAP[
      placement ?? (direction === 'rtl' ? 'bottomRight' : 'bottomLeft')
    ];
  const align =
    direction === 'rtl'
      ? physicalAlign === 'start'
        ? 'end'
        : 'start'
      : physicalAlign;

  const contentStyle: CSSProperties = { ...styles?.popup };
  if (typeof popupMatchSelectWidth === 'number') {
    contentStyle.width = popupMatchSelectWidth;
  }

  // In multi mode, Radix doesn't manage our value — we render our own checkmarks.
  const radixValue = isMultiple ? '' : ((value as string | undefined) ?? '');

  const resultCount = filteredFlatOptions.length;

  const overMaxCount =
    isMultiple && maxCount != null && valueArray.length >= maxCount;

  let optIndex = 0;
  const renderItem = (opt: SelectOption): ReactNode => {
    const index = optIndex++;
    const textLabel =
      typeof opt.label === 'string' ? opt.label : String(opt.label);
    const isSelected = selectedValueSet.has(opt.value);
    const itemDisabled =
      resolvedDisabled || opt.disabled || (!isSelected && overMaxCount);

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
          {renderTree(o.options)}
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
    resolvedDisabled ||
    option.disabled ||
    (overMaxCount && !selectedValueSet.has(option.value));
  const searchableOptions = filteredFlatOptions.filter(
    (option) => !isSearchableOptionDisabled(option),
  );
  const lastSearchIndex = Math.max(searchableOptions.length - 1, 0);
  const previousSearchIndex =
    searchableOptions[activeSearch.index]?.value === activeSearch.value
      ? activeSearch.index
      : searchableOptions.findIndex(
          (option) => option.value === activeSearch.value,
        );
  const boundedSearchIndex =
    previousSearchIndex < 0
      ? Math.min(activeSearch.index, lastSearchIndex)
      : previousSearchIndex;
  const activeSearchOption = searchableOptions[boundedSearchIndex];
  const setActiveSearchIndex = (index: number) =>
    setActiveSearch({ index, value: searchableOptions[index]?.value });
  if (
    activeSearch.index !== boundedSearchIndex ||
    activeSearch.value !== activeSearchOption?.value
  ) {
    setActiveSearchIndex(boundedSearchIndex);
  }
  const searchableMenuNode = (
    <SearchableSelectList
      id={searchListboxId}
      options={filteredOptions}
      resultCount={resultCount}
      searchableOptions={searchableOptions}
      activeValue={activeSearchOption?.value}
      selectedValues={valueArray}
      multiple={isMultiple}
      disabled={resolvedDisabled}
      maxCountReached={overMaxCount}
      listHeight={listHeight}
      notFoundContent={notFoundContent}
      optionRender={optionRender}
      classNames={classNames}
      styles={styles}
      onActiveIndexChange={setActiveSearchIndex}
      onValueChange={handleValueChange}
      onClose={() => handleOpenChange(false)}
    />
  );

  const container =
    getPopupContainer && triggerRef.current
      ? getPopupContainer(triggerRef.current)
      : undefined;

  const selectedLabel = selectedOption?.label;
  const selectedLabelId =
    selectedLabel != null && typeof selectedLabel === 'object'
      ? `${searchListboxId}-selected-label`
      : undefined;
  const inlineSearchInput = (
    <input
      ref={inputRef}
      id={id}
      role="combobox"
      {...ariaProps}
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
      aria-activedescendant={
        open && activeSearchOption
          ? `${searchListboxId}-option-${encodeURIComponent(activeSearchOption.value)}`
          : undefined
      }
      aria-label={
        props['aria-label'] ??
        (typeof selectedLabel === 'string' || typeof selectedLabel === 'number'
          ? String(selectedLabel)
          : selectedLabelId
            ? undefined
            : placeholder)
      }
      aria-labelledby={
        props['aria-labelledby'] ??
        (props['aria-label'] == null ? selectedLabelId : undefined)
      }
      // biome-ignore lint/a11y/noAutofocus: Select exposes autoFocus to match native input-like controls.
      autoFocus={autoFocus}
      autoComplete="off"
      onCompositionStart={() => {
        composingRef.current = true;
      }}
      onCompositionEnd={() => {
        composingRef.current = false;
      }}
      onBlur={() => {
        composingRef.current = false;
      }}
      onClick={(event) => {
        if (open) event.stopPropagation();
      }}
      onChange={(event) => {
        handleSearchChange(event.target.value);
        setActiveSearch({ index: 0 });
        if (!open) handleOpenChange(true);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (isComposingKey(event.nativeEvent)) return;
        handleSearchKeyDown(event);
        if (event.defaultPrevented) return;
        if (event.key === 'Escape') {
          handleSearchChange('');
          handleOpenChange(false);
          return;
        }
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setActiveSearchIndex(
            Math.min(boundedSearchIndex + 1, lastSearchIndex),
          );
          if (!open) handleOpenChange(true);
          return;
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setActiveSearchIndex(Math.max(boundedSearchIndex - 1, 0));
          return;
        }
        if (event.key === 'Enter' && !requestedOpen) {
          event.preventDefault();
          handleOpenChange(true);
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
            ref={mergedTriggerRef}
            role="presentation"
            data-tao-control=""
            dir={direction}
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
                {tags}
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
                  {(!search || selectedLabelId) && (
                    <span
                      id={selectedLabelId}
                      hidden={!!search}
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
                          ? selectedOption.label
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
          <TaoPortalScope asChild direction={direction}>
            <Popover.Content
              data-tao-select-content=""
              data-tao-size={resolvedSize}
              data-tao-popup-width={
                popupMatchSelectWidth === false ? 'content' : undefined
              }
              className={cx(classNames?.popup)}
              style={searchableContentStyle}
              side={side}
              align={align}
              sideOffset={4}
              onEscapeKeyDown={handleEscapeKeyDown}
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
      dir={direction}
      value={radixValue}
      onValueChange={handleValueChange}
      disabled={resolvedDisabled}
      open={open}
      onOpenChange={handleOpenChange}
      name={isMultiple ? undefined : name}
    >
      <RadixSelect.Trigger asChild>
        <div
          ref={mergedTriggerRef}
          tabIndex={resolvedDisabled ? -1 : 0}
          id={id}
          {...ariaProps}
          data-tao-control=""
          dir={direction}
          data-tao-select=""
          data-tao-size={resolvedSize}
          data-tao-variant={resolvedVariant}
          data-tao-disabled={resolvedDisabled || undefined}
          data-tao-multiple={isMultiple || undefined}
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
              {selectedOptions.length > 0 ? (
                tags
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
                <span data-tao-select-value="">{selectedOption.label}</span>
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
        <TaoPortalScope asChild direction={direction}>
          <RadixSelect.Content
            data-tao-select-content=""
            data-tao-size={resolvedSize}
            data-tao-popup-width={
              popupMatchSelectWidth === false ? 'content' : undefined
            }
            className={cx(classNames?.popup)}
            style={contentStyle}
            position="popper"
            onEscapeKeyDown={handleEscapeKeyDown}
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
                  placeholder={ctx.locale.searchPlaceholder}
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
});
