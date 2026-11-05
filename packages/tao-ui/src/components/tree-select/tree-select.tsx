import type { BaseSelectRef } from '@rc-component/select';
import RcTreeSelect, {
  type TreeSelectProps as RcTreeSelectProps,
  SHOW_ALL,
  SHOW_CHILD,
  SHOW_PARENT,
  TreeNode,
} from '@rc-component/tree-select';
import {
  type CSSProperties,
  forwardRef,
  type Key,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefAttributes,
  useRef,
} from 'react';
import {
  type TaoSize,
  type TaoStatus,
  useTaoInternalConfig,
} from '../../provider/tao-provider';
import { cx } from '../../utils/semantic';
import { ChevronDownIcon, CloseIcon } from '../select/select-icons';
import { Spinner } from '../spinner/spinner';
import type { TreeProps } from '../tree/tree';
import { TreeCheck } from '../tree/tree-check';
import {
  type SelectEnginePart,
  SelectEnginePopup,
  type SelectEngineSemantic,
  type SelectEngineVariant,
  selectAllowClear,
} from './select-engine';
import '../tree/tree.css';
import './select-engine.css';
import { interopDefault } from '../../utils/interop-default';

const RcTreeSelectComponent = /*#__PURE__*/ interopDefault(RcTreeSelect);

import './tree-select.css';

export type TreeSelectDataNode = NonNullable<
  RcTreeSelectProps['treeData']
>[number];
export type TreeSelectRef = BaseSelectRef;
export type TreeSelectSemanticPart =
  | SelectEnginePart
  | 'popup.root'
  | 'popup.item'
  | 'popup.itemTitle'
  | 'popup.itemSwitcher';
export type TreeSelectSemanticType = {
  classNames?: SelectEngineSemantic<
    string,
    'item' | 'itemTitle' | 'itemSwitcher'
  >;
  styles?: SelectEngineSemantic<
    CSSProperties,
    'item' | 'itemTitle' | 'itemSwitcher'
  >;
};
export interface TreeSelectLabeledValue {
  key?: string;
  value: string | number;
  label: ReactNode;
}
export type TreeSelectValue =
  | string
  | number
  | (string | number)[]
  | TreeSelectLabeledValue
  | TreeSelectLabeledValue[];

export interface TreeSelectProps<
  ValueType = TreeSelectValue,
  OptionType extends TreeSelectDataNode = TreeSelectDataNode,
> extends Omit<
    RcTreeSelectProps<ValueType, OptionType>,
    | 'showTreeIcon'
    | 'treeMotion'
    | 'mode'
    | 'getInputElement'
    | 'backfill'
    | 'treeLine'
    | 'classNames'
    | 'styles'
    | 'popupRender'
  > {
  size?: TaoSize | 'middle';
  status?: TaoStatus;
  variant?: SelectEngineVariant;
  rootClassName?: string;
  bordered?: boolean;
  showArrow?: boolean;
  treeLine?: TreeProps['showLine'];
  classNames?:
    | TreeSelectSemanticType['classNames']
    | ((info: {
        props: TreeSelectProps<ValueType, OptionType>;
      }) => TreeSelectSemanticType['classNames']);
  styles?:
    | TreeSelectSemanticType['styles']
    | ((info: {
        props: TreeSelectProps<ValueType, OptionType>;
      }) => TreeSelectSemanticType['styles']);
  dropdownClassName?: string;
  dropdownStyle?: CSSProperties;
  dropdownRender?: (menu: ReactElement) => ReactNode;
  popupRender?: (menu: ReactElement) => ReactNode;
  dropdownMatchSelectWidth?: boolean | number;
  onDropdownVisibleChange?: (visible: boolean) => void;
  onOpenChange?: (open: boolean) => void;
}

function InternalTreeSelect<
  ValueType = TreeSelectValue,
  OptionType extends TreeSelectDataNode = TreeSelectDataNode,
>(props: TreeSelectProps<ValueType, OptionType>, ref: Ref<TreeSelectRef>) {
  const config = useTaoInternalConfig();
  const {
    size: sizeProp = config.size,
    disabled = config.disabled,
    variant = props.bordered === false ? 'borderless' : config.variant,
    status,
    className,
    rootClassName,
    style,
    classNames,
    styles,
    prefixCls = 'tao-select-engine',
    treeCheckable,
    multiple,
    treeLine,
    treeIcon = false,
    switcherIcon,
    suffix,
    suffixIcon,
    showArrow = true,
    allowClear,
    clearIcon,
    removeIcon = <CloseIcon small />,
    popupClassName,
    dropdownClassName,
    popupStyle,
    dropdownStyle,
    popupRender,
    dropdownRender,
    popupMatchSelectWidth,
    dropdownMatchSelectWidth,
    onOpenChange,
    onDropdownVisibleChange,
    onPopupVisibleChange,
    listHeight = 256,
    listItemHeight = 28,
    notFoundContent = config.locale.noResults,
    maxCount,
    loadData,
    bordered: _bordered,
    ...rest
  } = props;
  const size = sizeProp === 'middle' ? 'medium' : sizeProp;
  const pendingLoads = useRef(new Map<Key | undefined, Promise<unknown>>());
  const loadNode: typeof loadData = loadData
    ? (node) => {
        const pending = pendingLoads.current.get(node.key);
        if (pending) return pending;
        // rc-tree invokes loaders inside a state updater, which React can replay.
        const request = Promise.resolve()
          .then(() => loadData(node))
          .finally(() => pendingLoads.current.delete(node.key));
        pendingLoads.current.set(node.key, request);
        return request;
      }
    : undefined;
  const resolvedProps = { ...props, size, disabled, variant };
  const classes =
    typeof classNames === 'function'
      ? classNames({ props: resolvedProps })
      : classNames;
  const semanticStyles =
    typeof styles === 'function' ? styles({ props: resolvedProps }) : styles;
  const renderPopup = popupRender ?? dropdownRender;
  const selectionLimit =
    props.showCheckedStrategy === SHOW_PARENT ||
    (props.showCheckedStrategy === SHOW_ALL && !props.treeCheckStrictly)
      ? undefined
      : maxCount;

  return (
    <RcTreeSelectComponent<ValueType, OptionType>
      {...rest}
      ref={ref}
      prefixCls={prefixCls}
      data-tao-tree-select=""
      data-tao-select-engine=""
      data-tao-control=""
      data-tao-size={size}
      data-tao-variant={variant}
      data-disabled={disabled || undefined}
      data-tao-error={status === 'error' || undefined}
      data-tao-warning={status === 'warning' || undefined}
      disabled={disabled}
      className={cx(className, rootClassName, classes?.root)}
      style={{ ...semanticStyles?.root, ...style }}
      classNames={classes}
      styles={semanticStyles}
      multiple={!!(treeCheckable || multiple)}
      treeCheckable={treeCheckable ? <TreeCheck /> : false}
      treeLine={!!treeLine}
      treeIcon={treeIcon}
      showTreeIcon={!!treeIcon}
      switcherIcon={(node) => {
        const custom =
          typeof switcherIcon === 'function'
            ? switcherIcon(node)
            : switcherIcon;
        const leaf = typeof treeLine === 'object' && treeLine.showLeafIcon;
        return (
          <span
            data-tao-tree-select-switcher=""
            data-tao-tree-switcher=""
            data-tao-custom=""
            data-tao-expanded={node.expanded || undefined}
            data-tao-leaf={node.isLeaf || undefined}
            className={classes?.popup?.itemSwitcher}
            style={semanticStyles?.popup?.itemSwitcher}
          >
            {node.loading ? (
              <Spinner size="small" />
            ) : custom !== undefined ? (
              custom
            ) : node.isLeaf ? (
              typeof leaf === 'function' ? (
                leaf(node)
              ) : leaf === true ? (
                <span>·</span>
              ) : (
                leaf || null
              )
            ) : (
              <ChevronDownIcon />
            )}
          </span>
        );
      }}
      treeMotion={null}
      suffix={
        suffix !== undefined ? (
          suffix
        ) : suffixIcon !== undefined ? (
          suffixIcon
        ) : showArrow ? (
          <ChevronDownIcon />
        ) : null
      }
      allowClear={selectAllowClear(allowClear, clearIcon, config.locale.clear)}
      removeIcon={removeIcon}
      listHeight={listHeight}
      listItemHeight={listItemHeight}
      notFoundContent={notFoundContent}
      maxCount={selectionLimit}
      loadData={loadNode}
      popupMatchSelectWidth={popupMatchSelectWidth ?? dropdownMatchSelectWidth}
      popupAlign={{
        overflow: { adjustX: true, adjustY: true, shiftX: 8 },
        ...props.popupAlign,
      }}
      popupClassName={cx(
        popupClassName ?? dropdownClassName,
        rootClassName,
        classes?.popup?.root,
      )}
      popupStyle={{
        ...config.tokenStyle,
        position: 'absolute',
        maxWidth: 'calc(100vw - 16px)',
        zIndex: 'var(--tao-z-index-popup)' as CSSProperties['zIndex'],
        ...dropdownStyle,
        ...popupStyle,
        ...semanticStyles?.popup?.root,
      }}
      popupRender={(menu) => (
        <SelectEnginePopup tree treeLine={!!treeLine} size={size}>
          {renderPopup ? renderPopup(menu) : menu}
        </SelectEnginePopup>
      )}
      onPopupVisibleChange={
        onOpenChange ?? onDropdownVisibleChange ?? onPopupVisibleChange
      }
    />
  );
}

const TreeSelectComponent = forwardRef(InternalTreeSelect) as <
  ValueType = TreeSelectValue,
  OptionType extends TreeSelectDataNode = TreeSelectDataNode,
>(
  props: TreeSelectProps<ValueType, OptionType> & RefAttributes<TreeSelectRef>,
) => ReactElement;
export const TreeSelect = Object.assign(TreeSelectComponent, {
  TreeNode,
  SHOW_ALL,
  SHOW_CHILD,
  SHOW_PARENT,
} as const);
