import type { ReactNode } from 'react';
import { cx } from '../../utils/semantic';
import { CheckIcon } from './select-icons';
import type { SelectOption, SelectProps } from './select-types';

interface SearchableSelectListProps {
  id: string;
  options: SelectOption[];
  resultCount: number;
  searchableOptions: SelectOption[];
  activeValue?: string;
  selectedValues: string[];
  multiple: boolean;
  maxCountReached: boolean;
  listHeight: number;
  notFoundContent: ReactNode;
  optionRender?: SelectProps['optionRender'];
  classNames?: SelectProps['classNames'];
  styles?: SelectProps['styles'];
  onActiveIndexChange: (index: number) => void;
  onValueChange: (value: string) => void;
  onClose: () => void;
}

export function SearchableSelectList({
  id,
  options,
  resultCount,
  searchableOptions,
  activeValue,
  selectedValues,
  multiple,
  maxCountReached,
  listHeight,
  notFoundContent,
  optionRender,
  classNames,
  styles,
  onActiveIndexChange,
  onValueChange,
  onClose,
}: SearchableSelectListProps) {
  let itemIndex = 0;

  const renderItem = (option: SelectOption): ReactNode => {
    const renderIndex = itemIndex++;
    const optionIndex = searchableOptions.findIndex(
      (candidate) => candidate.value === option.value,
    );
    const isSelected = selectedValues.includes(option.value);
    const isDisabled = !!option.disabled || (maxCountReached && !isSelected);

    return (
      <button
        key={option.value}
        id={`${id}-option-${encodeURIComponent(option.value)}`}
        type="button"
        role="option"
        aria-selected={isSelected}
        disabled={isDisabled}
        data-disabled={isDisabled || undefined}
        data-tao-select-item=""
        data-tao-selected={multiple && isSelected ? '' : undefined}
        data-tao-has-desc={option.description != null || undefined}
        data-state={isSelected ? 'checked' : 'unchecked'}
        data-highlighted={activeValue === option.value ? '' : undefined}
        className={cx(classNames?.item)}
        style={styles?.item}
        onPointerDown={(event) => event.preventDefault()}
        onMouseMove={() => {
          if (optionIndex >= 0) onActiveIndexChange(optionIndex);
        }}
        onClick={() => {
          if (isDisabled) return;
          onValueChange(option.value);
          if (!multiple) onClose();
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

  const renderTree = (items: SelectOption[]): ReactNode =>
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
          {renderTree(option.options)}
        </fieldset>
      ) : (
        renderItem(option)
      ),
    );

  return (
    <div
      id={id}
      role="listbox"
      aria-multiselectable={multiple || undefined}
      data-tao-select-viewport=""
      style={{ maxHeight: listHeight }}
    >
      {resultCount > 0 ? (
        renderTree(options)
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
}
