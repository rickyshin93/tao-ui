import {
  forwardRef,
  type ReactElement,
  type Ref,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import { cx } from '../../utils/semantic';
import { TransferList } from './transfer-list';
import { TransferOperation, TransferSearch } from './transfer-parts';
import type {
  KeyWise,
  TransferDirection,
  TransferItem,
  TransferKey,
  TransferLocale,
  TransferProps,
  TransferRef,
} from './transfer-types';
import './transfer.css';

export type * from './transfer-types';

function TransferRoot<T extends TransferItem>(
  props: TransferProps<T>,
  ref: Ref<TransferRef>,
) {
  const {
    prefixCls = 'tao-transfer',
    rootClassName,
    className,
    classNames,
    style,
    styles,
    listStyle,
    operationStyle,
    disabled,
    dataSource = [],
    targetKeys = [],
    selectedKeys,
    render,
    onChange,
    onSelectChange,
    titles,
    operations,
    actions,
    showSearch,
    filterOption,
    locale,
    footer,
    rowKey,
    onSearch,
    onScroll,
    children,
    showSelectAll = true,
    selectAllLabels = [],
    oneWay,
    pagination,
    status,
    selectionsIcon,
    ...rest
  } = props;
  const config = useTaoConfig();
  const resolvedDisabled = disabled ?? config.disabled;
  const chinese = config.locale.locale?.startsWith('zh');
  const text: TransferLocale = {
    titles: chinese ? ['源列表', '目标列表'] : ['Source', 'Target'],
    searchPlaceholder: config.locale.searchPlaceholder,
    itemUnit: chinese ? '项' : 'item',
    itemsUnit: chinese ? '项' : 'items',
    remove: chinese ? '移除' : 'Remove',
    selectAll: chinese ? '全选' : 'Select all',
    deselectAll: chinese ? '取消全选' : 'Deselect all',
    selectCurrent: chinese ? '选择当前页' : 'Select current page',
    selectInvert: chinese ? '反选当前页' : 'Invert current selection',
    removeAll: chinese ? '移除全部' : 'Remove all',
    removeCurrent: chinese ? '移除当前页' : 'Remove current page',
    ...locale,
  };
  const mergedProps = { ...props, disabled: resolvedDisabled };
  const classes =
    typeof classNames === 'function'
      ? classNames({ props: mergedProps })
      : classNames;
  const semanticStyles =
    typeof styles === 'function' ? styles({ props: mergedProps }) : styles;
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({ nativeElement: root.current! }));
  const [internalSelected, setSelected] = useState<TransferKey[]>([]);
  const selected = selectedKeys ?? internalSelected;
  const records = dataSource.map((record) => {
    const key = rowKey ? rowKey(record) : record.key;
    if (key == null)
      throw new Error('Transfer records require a key or a rowKey getter.');
    return rowKey ? { ...record, key } : (record as KeyWise<T>);
  });
  const targetSet = new Set(targetKeys);
  const recordMap = new Map(records.map((record) => [record.key, record]));
  const source = records.filter((record) => !targetSet.has(record.key));
  const target = targetKeys
    .map((key) => recordMap.get(key))
    .filter((record): record is KeyWise<T> => !!record);
  const sourceSelected = selected.filter((key) => !targetSet.has(key));
  const targetSelected = selected.filter((key) => targetSet.has(key));
  const lastSelection = useRef<
    Partial<
      Record<TransferDirection, { key: TransferKey; keys: TransferKey[] }>
    >
  >({});
  const updateSelection = (side: TransferDirection, next: TransferKey[]) => {
    const nextSource = side === 'left' ? next : sourceSelected;
    const nextTarget = side === 'right' ? next : targetSelected;
    if (selectedKeys === undefined) setSelected([...nextSource, ...nextTarget]);
    onSelectChange?.(nextSource, nextTarget);
  };
  const move = (
    side: TransferDirection,
    keys = side === 'right' ? sourceSelected : targetSelected,
  ) => {
    if (resolvedDisabled) return;
    const moveKeys = keys.filter(
      (key) => recordMap.has(key) && !recordMap.get(key)?.disabled,
    );
    const moveSet = new Set(moveKeys);
    const next =
      side === 'right'
        ? [...moveKeys, ...targetKeys]
        : targetKeys.filter((key) => !moveSet.has(key));
    const clearSide = side === 'right' ? 'left' : 'right';
    updateSelection(clearSide, []);
    lastSelection.current[clearSide] = undefined;
    onChange?.(next, side, moveKeys);
  };
  const renderSection = (side: TransferDirection) => {
    const left = side === 'left';
    const index = left ? 0 : 1;
    const sectionData = left ? source : target;
    const checked = left ? sourceSelected : targetSelected;
    const semanticSide = left ? 'source' : 'target';
    return (
      <TransferList<T>
        {...text}
        prefixCls={`${prefixCls}-section`}
        style={
          typeof listStyle === 'function'
            ? listStyle({ direction: side })
            : listStyle
        }
        classNames={{ ...classes, ...classes?.[semanticSide] }}
        styles={{ ...semanticStyles, ...semanticStyles?.[semanticSide] }}
        titleText={titles?.[index] ?? text.titles?.[index]}
        dataSource={sectionData}
        checkedKeys={checked}
        disabled={resolvedDisabled}
        direction={side}
        render={render}
        filterOption={filterOption}
        showSearch={showSearch}
        showSelectAll={showSelectAll}
        selectAllLabel={selectAllLabels[index]}
        showRemove={!left && oneWay}
        pagination={children ? false : pagination}
        selectionsIcon={selectionsIcon}
        footer={footer}
        renderList={children}
        onScroll={(event) => onScroll?.(side, event)}
        handleFilter={(event) => {
          lastSelection.current[side] = undefined;
          onSearch?.(side, event.target.value);
        }}
        handleClear={() => {
          lastSelection.current[side] = undefined;
          onSearch?.(side, '');
        }}
        onItemSelect={(key, check, event, filteredItems = sectionData) => {
          if (resolvedDisabled || recordMap.get(key)?.disabled) return;
          const enabled = filteredItems
            .filter((record) => !record.disabled)
            .map((record) => record.key!);
          const previous = lastSelection.current[side];
          const selection = new Set(checked);
          const sameData =
            previous?.keys.length === enabled.length &&
            previous.keys.every((value, i) => value === enabled[i]);
          const start = previous ? enabled.indexOf(previous.key) : -1;
          const end = enabled.indexOf(key);
          const keys =
            event?.shiftKey && sameData && start >= 0
              ? enabled.slice(Math.min(start, end), Math.max(start, end) + 1)
              : [key];
          for (const value of keys) {
            if (check) selection.add(value);
            else selection.delete(value);
          }
          lastSelection.current[side] = { key, keys: enabled };
          updateSelection(side, [...selection]);
        }}
        onItemSelectAll={(keys, check) => {
          if (resolvedDisabled) return;
          const selection =
            check === 'replace' ? new Set<TransferKey>() : new Set(checked);
          for (const key of keys) {
            if (check) selection.add(key);
            else selection.delete(key);
          }
          updateSelection(side, [...selection]);
          lastSelection.current[side] = undefined;
        }}
        onItemRemove={(keys) => move('left', keys)}
      />
    );
  };
  return (
    <div
      {...rest}
      ref={root}
      data-tao-transfer=""
      data-tao-disabled={resolvedDisabled ? '' : undefined}
      data-tao-status={status}
      className={cx(prefixCls, classes?.root, rootClassName, className)}
      style={{ ...semanticStyles?.root, ...style }}
    >
      {renderSection('left')}
      <TransferOperation
        actions={actions ?? operations ?? []}
        moveToLeft={() => move('left')}
        moveToRight={() => move('right')}
        leftActive={targetSelected.some((key) => !recordMap.get(key)?.disabled)}
        rightActive={sourceSelected.some(
          (key) => !recordMap.get(key)?.disabled,
        )}
        disabled={resolvedDisabled}
        oneWay={oneWay}
        direction={rest.dir === 'rtl' ? 'rtl' : 'ltr'}
        className={classes?.actions}
        style={{ ...operationStyle, ...semanticStyles?.actions }}
      />
      {renderSection('right')}
    </div>
  );
}
export const Transfer = Object.assign(
  forwardRef(TransferRoot) as <T extends TransferItem = TransferItem>(
    props: TransferProps<T> & { ref?: Ref<TransferRef> },
  ) => ReactElement,
  { List: TransferList, Search: TransferSearch, Operation: TransferOperation },
);
