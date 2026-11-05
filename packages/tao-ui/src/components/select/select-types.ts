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
  /** Available options; nested options form groups. */
  options: SelectOption[];
  /** Controlled selection. Use an array for multiple or tags mode. */
  value?: string | string[];
  /** Initial selection for an uncontrolled Select. */
  defaultValue?: string | string[];
  /** Called with the new selection and its matching option or options. */
  onChange?: (
    value: string | string[],
    option?: SelectOption | SelectOption[],
  ) => void;
  /** Called when an option is selected. */
  onSelect?: (value: string, option: SelectOption) => void;
  /** Called when a selected option is removed. */
  onDeselect?: (value: string, option: SelectOption) => void;
  /** Called when the selection is cleared. */
  onClear?: () => void;
  /** Multiple selection or free-form tags. Omit for single selection. */
  mode?: 'multiple' | 'tags';
  /** Hint displayed when no value is selected. */
  placeholder?: string;
  /** Control and desktop popup size; inherits from TaoProvider when omitted. */
  size?: TaoSize;
  /** Control appearance; inherits from TaoProvider when omitted. */
  variant?: TaoVariant;
  /** Disable interaction; inherits from TaoProvider when omitted. */
  disabled?: boolean;
  /** Validation appearance: error or warning. */
  status?: TaoStatus;
  /** Enable searching the option list. */
  showSearch?: boolean;
  /** Custom search predicate receiving the query and option. */
  filterOption?: (input: string, option: SelectOption) => boolean;
  /** Controlled search input text. */
  searchValue?: string;
  /** Called when the search text changes. */
  onSearch?: (value: string) => void;
  /** Show a clear action, optionally with a custom icon. */
  allowClear?: boolean | { clearIcon?: ReactNode };
  /** Show the loading indicator. */
  loading?: boolean;
  /** Replace the default loading indicator. */
  loadingIcon?: ReactNode;
  /** Content shown when there are no matching options. Defaults to No results. */
  notFoundContent?: ReactNode;
  /** Content before the selected value. */
  prefix?: ReactNode;
  /** Replace the dropdown indicator. */
  suffixIcon?: ReactNode;
  /** Replace the remove icon on selected tags. */
  removeIcon?: ReactNode;
  /** Focus the control when it mounts. */
  autoFocus?: boolean;
  /** Identifier for the control and its associated label. */
  id?: string;
  /** Name used for form submission. */
  name?: string;
  /** Controlled popup visibility. */
  open?: boolean;
  /** Initial popup visibility. */
  defaultOpen?: boolean;
  /** Called when popup visibility changes. */
  onOpenChange?: (open: boolean) => void;
  /** Desktop popup position. Defaults to bottomLeft. */
  placement?: SelectPlacement;
  /** Desktop popup width: match the trigger, use intrinsic width, or specify pixels. Defaults to true. */
  popupMatchSelectWidth?: boolean | number;
  /** Desktop option-list height in pixels. Defaults to 256. */
  listHeight?: number;
  /** Choose the desktop popup portal container; mobile drawers portal to document.body. */
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
  /** Customize each option's content. */
  optionRender?: (option: SelectOption, info: { index: number }) => ReactNode;
  /** Customize the selected option's label. */
  labelRender?: (option: SelectOption) => ReactNode;
  /** Wrap or extend the desktop menu or mobile drawer content. */
  popupRender?: (menu: ReactNode) => ReactNode;
  /** Customize a selected tag, including its remove action. */
  tagRender?: (props: TagRenderProps) => ReactNode;
  /** Maximum visible tags, or fit tags to the available width with 'responsive'. */
  maxTagCount?: number | 'responsive';
  /** Content representing selected tags hidden by maxTagCount. */
  maxTagPlaceholder?:
    | ReactNode
    | ((omittedValues: SelectOption[]) => ReactNode);
  /** Maximum displayed character count for each tag label. */
  maxTagTextLength?: number;
  /** Maximum number of selected values in multiple or tags mode. */
  maxCount?: number;
  /** Clear the search after selecting an option. Defaults to true. */
  autoClearSearchValue?: boolean;
  /** Characters that split entered text into selections in multiple or tags mode. */
  tokenSeparators?: string[];
  /** Hide already selected options from the list. */
  hideSelected?: boolean;
  /** Force mobile or desktop. Otherwise use viewport <576px; an open popup keeps its presentation until closed. */
  mobile?: boolean;
  /** Mobile drawer title. Defaults to the Form.Item/FormField label, then locale text. */
  mobileTitle?: ReactNode;
  /** CSS class on the root element. */
  className?: string;
  /** Inline styles on the root element. */
  style?: CSSProperties;
  /** CSS classes keyed by typed semantic parts. */
  classNames?: SemanticClassNames<SelectSemanticPart>;
  /** Inline styles keyed by typed semantic parts. */
  styles?: SemanticStyles<SelectSemanticPart>;
  /** Access focus, blur, and the native control element. */
  ref?: Ref<SelectRef>;
}
