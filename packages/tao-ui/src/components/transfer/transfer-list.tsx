import { type MouseEvent, useState } from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import { Checkbox } from '../checkbox/checkbox';
import { Dropdown } from '../dropdown/dropdown';
import { Empty } from '../empty/empty';
import { ListPaginationControl } from '../list/list-pagination';
import { TransferSearch } from './transfer-parts';
import type {
  RenderedItem,
  TransferItem,
  TransferListProps,
  TransferSemanticPart,
} from './transfer-types';

export function TransferList<T extends TransferItem>(
  props: TransferListProps<T>,
) {
  const { locale } = useTaoConfig();
  const {
    prefixCls,
    style,
    classNames,
    styles,
    titleText,
    dataSource,
    filterOption,
    checkedKeys,
    handleFilter,
    handleClear,
    onItemSelect,
    onItemSelectAll,
    onItemRemove,
    render,
    showSearch,
    renderList,
    footer,
    onScroll,
    disabled,
    direction,
    showSelectAll = true,
    selectAllLabel,
    showRemove,
    pagination,
    selectionsIcon,
    notFoundContent,
    searchPlaceholder,
    itemUnit,
    itemsUnit,
    itemCount,
    remove = locale.remove('').trim(),
    selectAll = locale.messages.selectAll,
    deselectAll = locale.messages.deselectAll,
    selectCurrent = locale.messages.selectCurrent,
    selectInvert = locale.messages.invertCurrent,
    removeAll = locale.messages.removeAll,
    removeCurrent = locale.messages.removeCurrent,
  } = props;
  const searchOptions = typeof showSearch === 'object' ? showSearch : {};
  const [search, setSearch] = useState(searchOptions.defaultValue ?? '');
  const [page, setPage] = useState(1);
  const paging = typeof pagination === 'object' ? pagination : {};
  const configuredSize = paging.pageSize ?? 10;
  const [pageSizing, setPageSizing] = useState({
    configuredSize,
    pageSize: configuredSize,
  });
  const sizeChanged = pageSizing.configuredSize !== configuredSize;
  const pageSize = sizeChanged ? configuredSize : pageSizing.pageSize;
  if (sizeChanged) setPageSizing({ configuredSize, pageSize });
  const renderedItems = dataSource
    .map((item): RenderedItem<T> & { labelText?: string } => {
      const rendered = render ? render(item) : (item.title ?? String(item.key));
      if (
        rendered != null &&
        typeof rendered === 'object' &&
        'value' in rendered
      )
        return {
          item,
          renderedEl: rendered.label,
          renderedText: rendered.value,
        };
      const renderedText =
        typeof rendered === 'string'
          ? rendered
          : (item.title ?? String(item.key));
      return {
        item,
        renderedEl: rendered,
        renderedText,
        labelText: renderedText,
      };
    })
    .filter(
      ({ item, renderedText }) =>
        !showSearch ||
        !search ||
        (filterOption
          ? filterOption(search, item, direction)
          : renderedText.includes(search)),
    );
  const filteredItems = renderedItems.map(({ item }) => item);
  const current = Math.max(
    1,
    Math.min(page, Math.ceil(renderedItems.length / pageSize)),
  );
  if (pagination && page !== current) setPage(current);
  const pageItems = pagination
    ? renderedItems.slice((current - 1) * pageSize, current * pageSize)
    : renderedItems;
  const enabled = filteredItems
    .filter((item) => !item.disabled)
    .map((item) => item.key!);
  const enabledPage = pageItems
    .filter(({ item }) => !item.disabled)
    .map(({ item }) => item.key!);
  const selectedCount = enabled.filter((key) =>
    checkedKeys.includes(key),
  ).length;
  const allSelected = enabled.length > 0 && selectedCount === enabled.length;
  const selectLabel =
    typeof selectAllLabel === 'function'
      ? selectAllLabel({ selectedCount, totalCount: filteredItems.length })
      : (selectAllLabel ??
        `${selectedCount ? `${new Intl.NumberFormat(locale.numberLocale).format(selectedCount)}/` : ''}${itemCount ? itemCount(filteredItems.length) : `${filteredItems.length} ${filteredItems.length === 1 ? itemUnit : itemsUnit}`}`);
  const clear = () => {
    setSearch('');
    setPage(1);
    handleClear();
  };
  const customBody = renderList?.({
    ...props,
    filteredItems,
    filteredRenderItems: renderedItems,
    selectedKeys: checkedKeys,
  });
  const sectionName =
    typeof titleText === 'string' && titleText
      ? titleText
      : direction === 'left'
        ? locale.messages.source
        : locale.messages.target;
  const semantic = (
    part: Exclude<TransferSemanticPart, 'root' | 'actions'>,
  ) => ({ className: classNames?.[part], style: styles?.[part] });
  const menuItems = showRemove
    ? [
        ...(pagination
          ? [
              {
                key: 'removeCurrent',
                label: removeCurrent,
                disabled: !enabledPage.length,
                onClick: () => onItemRemove?.(enabledPage),
              },
            ]
          : []),
        {
          key: 'removeAll',
          label: removeAll,
          onClick: () => onItemRemove?.(enabled),
        },
      ]
    : [
        {
          key: 'selectAll',
          label: allSelected ? deselectAll : selectAll,
          onClick: () => onItemSelectAll(enabled, !allSelected),
        },
        ...(pagination
          ? [
              {
                key: 'selectCurrent',
                label: selectCurrent,
                disabled: !enabledPage.length,
                onClick: () => onItemSelectAll(enabledPage, true),
              },
            ]
          : []),
        {
          key: 'selectInvert',
          label: selectInvert,
          disabled: !enabledPage.length,
          onClick: () => {
            const selected = new Set(checkedKeys);
            for (const key of enabledPage) {
              if (selected.has(key)) selected.delete(key);
              else selected.add(key);
            }
            onItemSelectAll([...selected], 'replace');
          },
        },
      ];
  return (
    <section
      data-tao-transfer-section=""
      data-tao-direction={direction}
      aria-label={sectionName}
      className={[prefixCls, classNames?.section].filter(Boolean).join(' ')}
      style={{ ...style, ...styles?.section }}
    >
      <div data-tao-transfer-header="" {...semantic('header')}>
        {showSelectAll && (
          <>
            {!showRemove && !pagination && (
              <Checkbox
                aria-label={`${selectAll} ${sectionName}`}
                checked={allSelected}
                indeterminate={selectedCount > 0 && !allSelected}
                disabled={disabled || !enabled.length}
                onChange={() => onItemSelectAll(enabled, !allSelected)}
              />
            )}
            <Dropdown
              menu={{ items: menuItems }}
              disabled={disabled || !enabled.length}
            >
              <button
                data-tao-transfer-selection=""
                type="button"
                aria-label={`${locale.messages.selectionActions} ${sectionName}`}
                disabled={disabled || !enabled.length}
              >
                {selectionsIcon ?? '⌄'}
              </button>
            </Dropdown>
          </>
        )}
        <span data-tao-transfer-count="">{selectLabel}</span>
        <span data-tao-transfer-title="" {...semantic('title')}>
          {titleText}
        </span>
      </div>
      <div data-tao-transfer-body="" {...semantic('body')}>
        {showSearch && (
          <div data-tao-transfer-search="">
            <TransferSearch
              placeholder={searchOptions.placeholder ?? searchPlaceholder}
              aria-label={`${sectionName} ${searchOptions.placeholder ?? searchPlaceholder}`}
              value={search}
              disabled={disabled}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
                handleFilter(event);
              }}
              handleClear={clear}
            />
          </div>
        )}
        {renderList ? (
          customBody
        ) : (
          <ul
            data-tao-transfer-list=""
            {...semantic('list')}
            onScroll={onScroll}
          >
            {pageItems.length ? (
              pageItems.map(({ item, renderedEl, renderedText, labelText }) => (
                <li
                  key={item.key}
                  data-tao-transfer-item=""
                  data-tao-disabled={disabled || item.disabled ? '' : undefined}
                  data-tao-checked={
                    checkedKeys.includes(item.key!) ? '' : undefined
                  }
                  {...semantic('item')}
                >
                  {showRemove ? (
                    <>
                      <span
                        data-tao-transfer-content=""
                        {...semantic('itemContent')}
                      >
                        {renderedEl}
                      </span>
                      <button
                        data-tao-transfer-remove=""
                        type="button"
                        disabled={disabled || item.disabled}
                        aria-label={`${remove} ${renderedText}`}
                        onClick={() => onItemRemove?.([item.key!])}
                        {...semantic('itemIcon')}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <Checkbox
                      aria-label={labelText}
                      checked={checkedKeys.includes(item.key!)}
                      disabled={disabled || item.disabled}
                      onChange={(event) =>
                        onItemSelect(
                          item.key!,
                          event.target.checked,
                          {
                            shiftKey: (
                              event.nativeEvent as globalThis.MouseEvent
                            ).shiftKey,
                          } as MouseEvent<Element>,
                          filteredItems,
                        )
                      }
                      classNames={{
                        indicator: classNames?.itemIcon,
                        label: classNames?.itemContent,
                      }}
                      styles={{
                        indicator: styles?.itemIcon,
                        label: styles?.itemContent,
                      }}
                    >
                      {renderedEl}
                    </Checkbox>
                  )}
                </li>
              ))
            ) : (
              <li data-tao-transfer-empty="">
                {(Array.isArray(notFoundContent)
                  ? notFoundContent[direction === 'left' ? 0 : 1]
                  : notFoundContent) ?? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </li>
            )}
          </ul>
        )}
        {pagination && !renderList && (
          <div data-tao-transfer-pagination="">
            <ListPaginationControl
              size="small"
              {...paging}
              simple={paging.simple ?? true}
              current={current}
              pageSize={pageSize}
              total={filteredItems.length}
              showSizeChanger={paging.showSizeChanger ?? false}
              disabled={disabled}
              onChange={(next, nextSize) => {
                setPage(next);
                setPageSizing({ configuredSize, pageSize: nextSize });
              }}
            />
          </div>
        )}
      </div>
      {footer && (
        <div data-tao-transfer-footer="" {...semantic('footer')}>
          {footer(props, { direction })}
        </div>
      )}
    </section>
  );
}
