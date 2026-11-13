import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import { useMobileTitle } from '../../utils/field-label';
import { Button } from '../button/button';
import { Drawer } from '../drawer/drawer';
import { SearchIcon } from './select-icons';
import {
  countLeafOptions,
  defaultFilter,
  filterTree,
  flattenLeafOptions,
} from './select-model';
import type { SelectOption, SelectProps } from './select-types';
import { useSelectSelection } from './use-select-selection';
import './mobile-select.css';

interface MobileSelectContentProps
  extends Pick<SelectProps, 'classNames' | 'styles' | 'popupRender'> {
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string) => void;
  /** Multi-mode commit callback: fires when "Done" is pressed with the full array. */
  onMultiChange?: (values: string[]) => void;
  placeholder?: string;
  showSearch?: boolean;
  searchValue: string;
  onSearch: (value: string) => void;
  disabled?: boolean;
  filterOption?: (input: string, option: SelectOption) => boolean;
  notFoundContent?: ReactNode;
  optionRender?: (option: SelectOption, info: { index: number }) => ReactNode;
  optionLabelWrap?: boolean;
  onClose: () => void;
  /** Enable multi-select checkboxes + Done button flow. */
  multiple?: boolean;
  hideSelected?: boolean;
  maxCount?: number;
  mode?: 'multiple' | 'tags';
  tokenSeparators?: string[];
  onSearchClear: () => void;
}

function MobileSelectContentInner({
  options,
  value,
  onChange,
  onMultiChange,
  showSearch,
  searchValue: search,
  onSearch,
  filterOption,
  notFoundContent: notFoundContentProp,
  optionRender,
  optionLabelWrap,
  onClose,
  multiple,
  hideSelected,
  maxCount,
  mode,
  tokenSeparators,
  onSearchClear,
  disabled,
  classNames,
  styles,
}: MobileSelectContentProps) {
  const { locale } = useTaoConfig();
  const notFoundContent =
    notFoundContentProp === undefined ? locale.noResults : notFoundContentProp;
  const valueArray = useMemo<string[]>(() => {
    if (multiple) return (value as string[]) ?? [];
    return value ? [value as string] : [];
  }, [multiple, value]);

  const [draft, setDraft] = useState(valueArray);
  const [previousValue, setPreviousValue] = useState(valueArray);
  // External value changes supersede pending edits; equal arrays keep the draft.
  if (
    previousValue.length !== valueArray.length ||
    previousValue.some((item, index) => item !== valueArray[index])
  ) {
    setPreviousValue(valueArray);
    setDraft(valueArray);
  }

  const {
    selectedValueSet: draftSet,
    selectedOptions,
    select,
    addTokens,
  } = useSelectSelection(
    {
      options,
      value: draft,
      onChange: (next) => setDraft(next as string[]),
      mode,
      maxCount,
      tokenSeparators,
    },
    !!disabled,
  );
  const composingRef = useRef(false);
  const createTag = () => {
    if (addTokens(search)) onSearchClear();
  };

  const knownOptions = useMemo(() => flattenLeafOptions(options), [options]);
  const filteredOptions = useMemo(() => {
    const knownValues = new Set(knownOptions.map((option) => option.value));
    const available =
      mode === 'tags'
        ? [
            ...options,
            ...selectedOptions.filter(
              (option) => !knownValues.has(option.value),
            ),
          ]
        : options;
    const committed =
      hideSelected && multiple && valueArray.length
        ? new Set(valueArray)
        : undefined;
    const searching = showSearch && !!search;
    if (!committed && !searching) return available;
    const filter = filterOption ?? defaultFilter;
    return filterTree(
      available,
      (query, option) =>
        !committed?.has(option.value) && (!searching || filter(query, option)),
      search,
    );
  }, [
    options,
    knownOptions,
    selectedOptions,
    mode,
    multiple,
    hideSelected,
    valueArray,
    search,
    showSearch,
    filterOption,
  ]);
  const resultCount = useMemo(
    () => countLeafOptions(filteredOptions),
    [filteredOptions],
  );

  const handleSelect = useCallback(
    (optValue: string) => {
      if (disabled) return;
      if (multiple) {
        if (select(optValue)) onSearchClear();
      } else {
        onChange?.(optValue);
        onClose();
      }
    },
    [multiple, onChange, onClose, disabled, select, onSearchClear],
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
    const itemDisabled =
      disabled ||
      opt.disabled ||
      (multiple && maxCount != null && draft.length >= maxCount && !isSelected);
    return (
      <button
        type="button"
        key={opt.value}
        data-tao-sheet-item=""
        data-tao-label-wrap={optionLabelWrap || undefined}
        className={classNames?.item}
        style={styles?.item}
        data-tao-selected={isSelected || undefined}
        aria-pressed={isSelected}
        data-tao-disabled={itemDisabled || undefined}
        disabled={itemDisabled}
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
              <span
                data-tao-sheet-item-icon=""
                className={classNames?.itemIcon}
                style={styles?.itemIcon}
              >
                {opt.icon}
              </span>
            )}
            <span data-tao-sheet-item-main="">
              <span
                data-tao-sheet-item-label=""
                className={classNames?.itemLabel}
                style={styles?.itemLabel}
              >
                {opt.label}
              </span>
              {opt.description != null && (
                <span
                  data-tao-sheet-item-desc=""
                  className={classNames?.itemDesc}
                  style={styles?.itemDesc}
                >
                  {opt.description}
                </span>
              )}
            </span>
          </>
        )}
        {(isSelected || optionLabelWrap) && (
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
        <div
          key={o.value}
          data-tao-sheet-group=""
          className={classNames?.group}
          style={styles?.group}
        >
          <div
            data-tao-sheet-group-label=""
            className={classNames?.groupLabel}
            style={styles?.groupLabel}
          >
            {o.label}
          </div>
          {renderTree(o.options)}
        </div>
      ) : (
        renderItem(o)
      ),
    );

  return (
    <>
      {showSearch && (
        <div
          data-tao-sheet-search=""
          className={classNames?.search}
          style={styles?.search}
        >
          <SearchIcon />
          <input
            data-tao-sheet-search-input=""
            className={classNames?.searchInput}
            style={styles?.searchInput}
            value={search}
            disabled={disabled}
            onChange={(e) => onSearch(e.target.value)}
            onCompositionStart={() => {
              composingRef.current = true;
            }}
            onCompositionEnd={() => {
              composingRef.current = false;
            }}
            onKeyDown={(e) => {
              if (
                composingRef.current ||
                e.nativeEvent.isComposing ||
                e.keyCode === 229
              )
                return;
              if (
                multiple &&
                (e.key === 'Enter' ||
                  tokenSeparators?.some(
                    (separator) => separator && search.includes(separator),
                  ))
              ) {
                e.preventDefault();
                createTag();
              }
            }}
            placeholder={locale.searchPlaceholder}
            aria-label={locale.searchOptions}
          />
        </div>
      )}
      <div data-tao-sheet-list="">
        {mode === 'tags' &&
          search.trim() &&
          !draftSet.has(search.trim()) &&
          !knownOptions.some(
            (option) =>
              option.value === search.trim() || option.label === search.trim(),
          ) && (
            <button
              type="button"
              data-tao-sheet-item=""
              className={classNames?.item}
              style={styles?.item}
              disabled={
                disabled || (maxCount != null && draft.length >= maxCount)
              }
              onClick={createTag}
            >
              {search.trim()}
            </button>
          )}
        {resultCount > 0 ? (
          renderTree(filteredOptions)
        ) : (
          <div
            data-tao-sheet-empty=""
            className={classNames?.empty}
            style={styles?.empty}
          >
            {notFoundContent}
          </div>
        )}
      </div>
      {multiple && (
        <div data-tao-sheet-footer="">
          <Button
            size="large"
            data-tao-sheet-done=""
            disabled={disabled || (maxCount != null && draft.length > maxCount)}
            onClick={handleDone}
          >
            {locale.done}
          </Button>
        </div>
      )}
    </>
  );
}

export { MobileSelectContentInner as MobileSelectContent };

export interface MobileSelectDrawerProps extends MobileSelectContentProps {
  direction?: 'ltr' | 'rtl';
  open: boolean;
  mobileTitle?: ReactNode;
}

export function MobileSelectDrawer({
  direction,
  open,
  mobileTitle,
  onClose,
  placeholder,
  classNames,
  styles,
  popupRender,
  ...rest
}: MobileSelectDrawerProps) {
  const { locale } = useTaoConfig();
  const title = useMobileTitle(mobileTitle, locale.select);
  const content = (
    <MobileSelectContentInner
      onClose={onClose}
      placeholder={placeholder}
      classNames={classNames}
      styles={styles}
      {...rest}
    />
  );
  return (
    <Drawer
      direction={direction}
      open={open}
      onClose={onClose}
      placement="bottom"
      title={title}
      height="70vh"
      classNames={{ root: classNames?.popup }}
      styles={{ root: styles?.popup }}
    >
      {popupRender ? popupRender(content) : content}
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
