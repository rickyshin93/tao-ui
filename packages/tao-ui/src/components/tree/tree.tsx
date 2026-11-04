import RcTree, {
  type BasicDataNode,
  conductExpandParent,
  convertDataToEntities,
  convertTreeToData,
  type DataNode,
  type TreeProps as RcTreeProps,
  TreeNode,
  type TreeNodeProps,
  useTree,
} from '@rc-component/tree';
import {
  type AriaAttributes,
  type Component,
  type CSSProperties,
  forwardRef,
  type Key,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
  useRef,
  useState,
} from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Spinner } from '../spinner/spinner';
import './tree.css';
import { interopDefault } from '../../utils/interop-default';

const RcTreeComponent = /*#__PURE__*/ interopDefault(RcTree);

export type {
  BasicDataNode,
  DataNode,
  EventDataNode,
  TreeInstance,
  UseTreeConfig,
} from '@rc-component/tree';
export type TreeSemanticPart =
  | 'root'
  | 'item'
  | 'itemIcon'
  | 'itemTitle'
  | 'itemSwitcher';
export type TreeRef = RcTree;
export type AntTreeNodeProps = TreeNodeProps;
export type AntdTreeNodeAttribute = TreeNodeProps;
export type AntTreeNode = Component<AntTreeNodeProps>;
export type AntTreeNodeCheckedEvent = Parameters<
  NonNullable<RcTreeProps['onCheck']>
>[1];
export type AntTreeNodeSelectedEvent = Parameters<
  NonNullable<RcTreeProps['onSelect']>
>[1];
export type AntTreeNodeExpandedEvent = Parameters<
  NonNullable<RcTreeProps['onExpand']>
>[1];
export type AntTreeNodeMouseEvent = Parameters<
  NonNullable<RcTreeProps['onDragStart']>
>[0];
export type TreeNodeNormal = DataNode;
export type TreeLeafIcon = ReactNode | ((props: AntTreeNodeProps) => ReactNode);
export type SwitcherIcon = TreeLeafIcon;

export interface TreeProps<T extends BasicDataNode = DataNode>
  extends Omit<
      RcTreeProps<T>,
      'prefixCls' | 'showLine' | 'checkable' | 'classNames' | 'styles'
    >,
    AriaAttributes {
  prefixCls?: string;
  checkable?: boolean;
  showLine?: boolean | { showLeafIcon: boolean | TreeLeafIcon };
  switcherLoadingIcon?: ReactNode;
  blockNode?: boolean;
  classNames?:
    | SemanticClassNames<TreeSemanticPart>
    | ((info: { props: TreeProps<T> }) => SemanticClassNames<TreeSemanticPart>);
  styles?:
    | SemanticStyles<TreeSemanticPart>
    | ((info: { props: TreeProps<T> }) => SemanticStyles<TreeSemanticPart>);
  /** @deprecated Use styles.root. */
  rootStyle?: CSSProperties;
  /** @deprecated Use filterTreeNode. */
  filterAntTreeNode?: RcTreeProps<T>['filterTreeNode'];
}

function TreeGlyph({
  kind,
}: {
  kind: 'chevron' | 'file' | 'folder' | 'folder-open' | 'grip';
}) {
  return (
    <svg
      data-tao-tree-glyph=""
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === 'chevron' && <path d="m9 6 6 6-6 6" />}
      {kind === 'file' && (
        <>
          <path d="M14 3H6v18h12V7l-4-4Z" />
          <path d="M14 3v5h4" />
        </>
      )}
      {kind === 'folder' && <path d="M3 6h7l2 3h9v11H3V6Z" />}
      {kind === 'folder-open' && (
        <>
          <path d="M3 18V6h7l2 3h8v3" />
          <path d="M6 12h16l-3 8H3l3-8Z" />
        </>
      )}
      {kind === 'grip' && (
        <path
          d="M8 5h.01M16 5h.01M8 12h.01M16 12h.01M8 19h.01M16 19h.01"
          strokeWidth="3"
        />
      )}
    </svg>
  );
}

const TreeBase = forwardRef<RcTree, TreeProps>((props, ref) => {
  const config = useTaoConfig();
  const {
    prefixCls = 'tao-tree',
    className,
    rootClassName,
    rootStyle,
    classNames,
    styles,
    showLine = false,
    showIcon = false,
    checkable = false,
    selectable = true,
    blockNode = false,
    disabled = config.disabled,
    switcherIcon,
    switcherLoadingIcon,
    draggable,
    filterAntTreeNode,
    filterTreeNode = filterAntTreeNode,
    itemHeight = 32,
    dropIndicatorRender,
    direction,
    ...rest
  } = props;
  const mergedProps = {
    ...props,
    disabled,
    showIcon,
    checkable,
    selectable,
    blockNode,
  };
  const classes =
    typeof classNames === 'function'
      ? classNames({ props: mergedProps })
      : classNames;
  const semanticStyles =
    typeof styles === 'function' ? styles({ props: mergedProps }) : styles;
  const dragConfig = !draggable
    ? false
    : {
        icon: (
          <span data-tao-tree-drag-icon="">
            <TreeGlyph kind="grip" />
          </span>
        ),
        ...(typeof draggable === 'function'
          ? { nodeDraggable: draggable }
          : typeof draggable === 'object'
            ? draggable
            : {}),
      };

  function renderSwitcher(node: AntTreeNodeProps) {
    const leafIcon =
      typeof showLine === 'object' ? showLine.showLeafIcon : false;
    let content: ReactNode;
    if (node.loading) {
      content = switcherLoadingIcon ?? <Spinner size="small" />;
    } else if (node.isLeaf) {
      content =
        leafIcon === true ? (
          <TreeGlyph kind="file" />
        ) : typeof leafIcon === 'function' ? (
          leafIcon(node)
        ) : (
          leafIcon
        );
    } else if (switcherIcon !== undefined) {
      content =
        typeof switcherIcon === 'function' ? switcherIcon(node) : switcherIcon;
      if (content === false) return false;
    } else if (showLine) {
      content = (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 12h8" />
          {!node.expanded && <path d="M12 8v8" />}
        </svg>
      );
    } else {
      content = <TreeGlyph kind="chevron" />;
    }
    return (
      <span
        data-tao-tree-switcher=""
        data-tao-expanded={node.expanded || undefined}
        data-tao-leaf={node.isLeaf || undefined}
        data-tao-loading={node.loading || undefined}
        data-tao-custom={switcherIcon !== undefined || undefined}
      >
        {content}
      </span>
    );
  }

  return (
    <div
      data-tao-tree=""
      data-tao-block={blockNode || undefined}
      data-tao-show-line={Boolean(showLine) || undefined}
      data-tao-disabled={disabled || undefined}
      data-tao-selectable={selectable || undefined}
      data-tao-size={config.size}
      dir={direction}
      className={cx(className, rootClassName, classes?.root)}
      style={{ ...rootStyle, ...semanticStyles?.root }}
    >
      <RcTreeComponent
        {...rest}
        ref={ref}
        prefixCls={prefixCls}
        direction={direction}
        showLine={Boolean(showLine)}
        showIcon={showIcon}
        disabled={disabled}
        selectable={selectable}
        itemHeight={itemHeight}
        filterTreeNode={filterTreeNode}
        checkable={checkable && <span data-tao-tree-check="" />}
        switcherIcon={renderSwitcher}
        draggable={dragConfig}
        classNames={classes}
        styles={semanticStyles}
        dropIndicatorRender={
          dropIndicatorRender ??
          (({ dropPosition, dropLevelOffset, indent }) => (
            <span
              data-tao-tree-drop=""
              style={{
                [direction === 'rtl' ? 'right' : 'left']:
                  -dropLevelOffset * indent + (dropPosition === 0 ? indent : 0),
                [direction === 'rtl' ? 'left' : 'right']: 0,
                [dropPosition === -1 ? 'top' : 'bottom']: -2,
              }}
            />
          ))
        }
      />
    </div>
  );
});
TreeBase.displayName = 'Tree';

export type DirectoryTreeExpandAction = false | 'click' | 'doubleClick';
export interface DirectoryTreeProps<T extends BasicDataNode = DataNode>
  extends TreeProps<T> {
  expandAction?: DirectoryTreeExpandAction;
}

const DirectoryTreeBase = forwardRef<RcTree, DirectoryTreeProps>(
  (props, ref) => {
    const {
      defaultExpandAll,
      defaultExpandedKeys = [],
      defaultExpandParent = true,
    } = props;
    const data = props.treeData ?? convertTreeToData(props.children);
    const ordered: { key: Key; node: DataNode; ancestors: Key[] }[] = [];
    const { keyEntities } = convertDataToEntities(data, {
      fieldNames: props.fieldNames,
      processEntity(entity) {
        const ancestors: Key[] = [];
        let parent = entity.parent;
        while (parent) {
          ancestors.push(parent.key);
          parent = parent.parent;
        }
        ordered.push({ key: entity.key, node: entity.node, ancestors });
      },
    });
    const [internalExpanded, setExpanded] = useState<Key[]>(() =>
      defaultExpandAll
        ? ordered.map(({ key }) => key)
        : defaultExpandParent
          ? conductExpandParent(defaultExpandedKeys, keyEntities)
          : defaultExpandedKeys,
    );
    const [internalSelected, setSelected] = useState<Key[]>(
      props.defaultSelectedKeys ?? [],
    );
    const expandedKeys = props.expandedKeys ?? internalExpanded;
    const selectedKeys = props.selectedKeys ?? internalSelected;
    const anchor = useRef<Key | undefined>(undefined);
    const selectionBeforeRange = useRef<Key[]>([]);

    const onSelect: NonNullable<TreeProps['onSelect']> = (keys, info) => {
      const key = info.node.key;
      let selection = [key];
      if (
        props.multiple &&
        (info.nativeEvent.ctrlKey || info.nativeEvent.metaKey)
      ) {
        selection = keys;
        anchor.current = key;
        selectionBeforeRange.current = selection;
      } else if (props.multiple && info.nativeEvent.shiftKey) {
        const visible = ordered.filter(({ ancestors }) =>
          ancestors.every((parentKey) => expandedKeys.includes(parentKey)),
        );
        const start = visible.findIndex((node) => node.key === anchor.current);
        const end = visible.findIndex((node) => node.key === key);
        const range =
          start < 0
            ? []
            : visible
                .slice(Math.min(start, end), Math.max(start, end) + 1)
                .filter(
                  ({ node }) => !node.disabled && node.selectable !== false,
                )
                .map((node) => node.key);
        selection = [...new Set([...selectionBeforeRange.current, ...range])];
      } else {
        anchor.current = key;
        selectionBeforeRange.current = selection;
      }
      if (props.selectedKeys === undefined) setSelected(selection);
      props.onSelect?.(selection, {
        ...info,
        selected: true,
        selectedNodes: ordered
          .filter((item) => selection.includes(item.key))
          .map((item) => item.node),
      });
    };

    return (
      <TreeBase
        icon={(node) => (
          <TreeGlyph
            kind={
              node.isLeaf ? 'file' : node.expanded ? 'folder-open' : 'folder'
            }
          />
        )}
        blockNode
        showIcon
        expandAction="click"
        {...props}
        ref={ref}
        defaultExpandParent={defaultExpandParent}
        expandedKeys={expandedKeys}
        selectedKeys={selectedKeys}
        onSelect={onSelect}
        onExpand={(keys, info) => {
          if (props.expandedKeys === undefined) setExpanded(keys);
          props.onExpand?.(keys, info);
        }}
      />
    );
  },
);
DirectoryTreeBase.displayName = 'DirectoryTree';

export const DirectoryTree = DirectoryTreeBase as <
  T extends BasicDataNode | DataNode = DataNode,
>(
  props: DirectoryTreeProps<T> & RefAttributes<RcTree>,
) => ReactElement;
export const Tree = Object.assign(
  TreeBase as <T extends BasicDataNode | DataNode = DataNode>(
    props: TreeProps<T> & RefAttributes<RcTree>,
  ) => ReactElement,
  { DirectoryTree, TreeNode, useTree },
);
