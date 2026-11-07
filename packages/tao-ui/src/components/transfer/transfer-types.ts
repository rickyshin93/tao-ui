import type {
  ChangeEvent,
  CSSProperties,
  HTMLAttributes,
  Key,
  MouseEvent,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  SyntheticEvent,
} from 'react';
import type { SemanticClassNames, SemanticStyles } from '../../utils/semantic';

export type TransferKey = Key;
export type TransferDirection = 'left' | 'right';
export type TransferSemanticPart =
  | 'root'
  | 'section'
  | 'header'
  | 'title'
  | 'body'
  | 'list'
  | 'item'
  | 'itemIcon'
  | 'itemContent'
  | 'footer'
  | 'actions';
export type TransferSectionSemanticPart = Exclude<
  TransferSemanticPart,
  'root' | 'actions'
>;
export type TransferSectionSemanticClassNames =
  SemanticClassNames<TransferSectionSemanticPart>;
export type TransferSectionSemanticStyles =
  SemanticStyles<TransferSectionSemanticPart>;
export type TransferClassNames = SemanticClassNames<TransferSemanticPart> & {
  source?: TransferSectionSemanticClassNames;
  target?: TransferSectionSemanticClassNames;
};
export type TransferStyles = SemanticStyles<TransferSemanticPart> & {
  source?: TransferSectionSemanticStyles;
  target?: TransferSectionSemanticStyles;
};
export interface TransferItem {
  key?: TransferKey;
  title?: string;
  description?: string;
  disabled?: boolean;
}
export type KeyWise<T> = T & { key: TransferKey };
export type KeyWiseTransferItem = KeyWise<TransferItem>;
export interface RenderResultObject {
  label: ReactElement;
  value: string;
}
export type RenderResult = ReactElement | RenderResultObject | string | null;
export interface ListStyle {
  direction: TransferDirection;
}
export type SelectAllLabel =
  | ReactNode
  | ((info: { selectedCount: number; totalCount: number }) => ReactNode);
export interface TransferLocale {
  titles?: ReactNode[];
  notFoundContent?: ReactNode | ReactNode[];
  searchPlaceholder: string;
  itemUnit: string;
  itemsUnit: string;
  itemCount?: (count: number) => string;
  remove?: string;
  selectAll?: string;
  deselectAll?: string;
  selectCurrent?: string;
  selectInvert?: string;
  removeAll?: string;
  removeCurrent?: string;
}
export interface TransferSearchOption {
  placeholder?: string;
  defaultValue?: string;
}
export type PaginationType =
  | boolean
  | {
      pageSize?: number;
      simple?: boolean;
      showSizeChanger?: boolean;
      showLessItems?: boolean;
    };
export interface TransferSearchProps {
  prefixCls?: string;
  placeholder?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  handleClear?: () => void;
  value?: string;
  disabled?: boolean;
  'aria-label'?: string;
}
export interface TransferOperationProps {
  className?: string;
  actions: ReactNode[];
  moveToLeft?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  moveToRight?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  leftActive?: boolean;
  rightActive?: boolean;
  style?: CSSProperties;
  disabled?: boolean;
  direction?: 'ltr' | 'rtl';
  oneWay?: boolean;
}
export interface RenderedItem<T> {
  renderedText: string;
  renderedEl: ReactNode;
  item: T;
}
export interface TransferListProps<T extends TransferItem>
  extends TransferLocale {
  prefixCls: string;
  style?: CSSProperties;
  classNames: TransferSectionSemanticClassNames;
  styles: TransferSectionSemanticStyles;
  titleText: ReactNode;
  dataSource: T[];
  filterOption?: (
    filterText: string,
    item: T,
    direction: TransferDirection,
  ) => boolean;
  checkedKeys: TransferKey[];
  handleFilter: (event: ChangeEvent<HTMLInputElement>) => void;
  handleClear: () => void;
  onItemSelect: (
    key: TransferKey,
    check: boolean,
    event?: MouseEvent<Element>,
    filteredItems?: T[],
  ) => void;
  onItemSelectAll: (keys: TransferKey[], check: boolean | 'replace') => void;
  onItemRemove?: (keys: TransferKey[]) => void;
  render?: (item: T) => RenderResult;
  showSearch?: boolean | TransferSearchOption;
  renderList?: (props: TransferCustomListBodyProps<T>) => ReactNode;
  footer?: (
    props: TransferListProps<T>,
    info?: { direction: TransferDirection },
  ) => ReactNode;
  onScroll: (event: SyntheticEvent<HTMLUListElement>) => void;
  disabled?: boolean;
  direction: TransferDirection;
  showSelectAll?: boolean;
  selectAllLabel?: SelectAllLabel;
  showRemove?: boolean;
  pagination?: PaginationType;
  selectionsIcon?: ReactNode;
}
export interface TransferCustomListBodyProps<T extends TransferItem>
  extends Omit<
    TransferListProps<T>,
    'handleFilter' | 'handleClear' | 'checkedKeys'
  > {
  filteredItems: T[];
  filteredRenderItems: RenderedItem<T>[];
  selectedKeys: TransferKey[];
}
export interface TransferProps<T extends TransferItem = TransferItem>
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'onChange' | 'onScroll' | 'children'
  > {
  prefixCls?: string;
  rootClassName?: string;
  listStyle?: CSSProperties | ((info: ListStyle) => CSSProperties);
  operationStyle?: CSSProperties;
  classNames?:
    | TransferClassNames
    | ((info: { props: TransferProps<T> }) => TransferClassNames);
  styles?:
    | TransferStyles
    | ((info: { props: TransferProps<T> }) => TransferStyles);
  disabled?: boolean;
  dataSource?: T[];
  targetKeys?: TransferKey[];
  selectedKeys?: TransferKey[];
  /** Item content; defaults to the title, or the key when the title is omitted. */
  render?: (item: T) => RenderResult;
  onChange?: (
    targetKeys: TransferKey[],
    direction: TransferDirection,
    moveKeys: TransferKey[],
  ) => void;
  onSelectChange?: (
    sourceSelectedKeys: TransferKey[],
    targetSelectedKeys: TransferKey[],
  ) => void;
  titles?: ReactNode[];
  operations?: string[];
  actions?: ReactNode[];
  showSearch?: boolean | TransferSearchOption;
  filterOption?: (
    inputValue: string,
    item: T,
    direction: TransferDirection,
  ) => boolean;
  locale?: Partial<TransferLocale>;
  footer?: (
    props: TransferListProps<T>,
    info?: { direction: TransferDirection },
  ) => ReactNode;
  rowKey?: (record: T) => TransferKey;
  onSearch?: (direction: TransferDirection, value: string) => void;
  onScroll?: (
    direction: TransferDirection,
    event: SyntheticEvent<HTMLUListElement>,
  ) => void;
  children?: (props: TransferCustomListBodyProps<T>) => ReactNode;
  showSelectAll?: boolean;
  selectAllLabels?: SelectAllLabel[];
  oneWay?: boolean;
  pagination?: PaginationType;
  status?: 'error' | 'warning';
  selectionsIcon?: ReactNode;
}
export interface TransferRef {
  nativeElement: HTMLDivElement;
}
