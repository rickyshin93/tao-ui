import type { AriaAttributes, CSSProperties, ReactNode, Ref } from 'react';
import type {
  TaoSize,
  TaoStatus,
  TaoVariant,
} from '../../provider/tao-provider';
import type { SemanticClassNames, SemanticStyles } from '../../utils/semantic';

export interface SelectOption {
  label: ReactNode;
  value: string;
  disabled?: boolean;
  icon?: ReactNode;
  description?: ReactNode;
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
  onClose: (event: React.MouseEvent) => void;
}

export interface SelectRef {
  focus: () => void;
  blur: () => void;
  nativeElement: HTMLElement | null;
}

export interface SelectProps
  extends Pick<
    AriaAttributes,
    | 'aria-label'
    | 'aria-labelledby'
    | 'aria-describedby'
    | 'aria-errormessage'
    | 'aria-invalid'
    | 'aria-required'
  > {
  options: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (
    value: string | string[],
    option?: SelectOption | SelectOption[],
  ) => void;
  onSelect?: (value: string, option: SelectOption) => void;
  onDeselect?: (value: string, option: SelectOption) => void;
  onClear?: () => void;
  mode?: 'multiple' | 'tags';
  placeholder?: string;
  size?: TaoSize;
  variant?: TaoVariant;
  disabled?: boolean;
  status?: TaoStatus;
  showSearch?: boolean;
  filterOption?: (input: string, option: SelectOption) => boolean;
  searchValue?: string;
  onSearch?: (value: string) => void;
  allowClear?: boolean | { clearIcon?: ReactNode };
  loading?: boolean;
  loadingIcon?: ReactNode;
  notFoundContent?: ReactNode;
  prefix?: ReactNode;
  suffixIcon?: ReactNode;
  removeIcon?: ReactNode;
  autoFocus?: boolean;
  id?: string;
  name?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: SelectPlacement;
  popupMatchSelectWidth?: boolean | number;
  listHeight?: number;
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
  optionRender?: (option: SelectOption, info: { index: number }) => ReactNode;
  labelRender?: (option: SelectOption) => ReactNode;
  popupRender?: (menu: ReactNode) => ReactNode;
  tagRender?: (props: TagRenderProps) => ReactNode;
  maxTagCount?: number | 'responsive';
  maxTagPlaceholder?:
    | ReactNode
    | ((omittedValues: SelectOption[]) => ReactNode);
  maxTagTextLength?: number;
  maxCount?: number;
  autoClearSearchValue?: boolean;
  tokenSeparators?: string[];
  hideSelected?: boolean;
  mobile?: boolean;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<SelectSemanticPart>;
  styles?: SemanticStyles<SelectSemanticPart>;
  ref?: Ref<SelectRef>;
}
