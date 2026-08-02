'use client';

// Global theme — imported once here so consumers don't need a separate CSS import.
// This entry's CSS side effects are preserved end-to-end via the `sideEffects`
// whitelist in package.json (./dist/index.js + ./src/index.tsx). Without that
// whitelist, tree-shakers mark this module side-effect-free based on the CSS-only
// sideEffects glob and silently drop these two imports.
import './theme/theme.css';
import './theme/control.css';

// Provider

export {
  Breadcrumb,
  type BreadcrumbItemType,
  type BreadcrumbProps,
  type BreadcrumbSemanticPart,
} from './components/breadcrumb/breadcrumb';
// Components
export {
  Button,
  type ButtonProps,
  type ButtonSemanticPart,
} from './components/button/button';
export {
  Checkbox,
  CheckboxGroup,
  type CheckboxGroupProps,
  type CheckboxOptionType,
  type CheckboxProps,
  type CheckboxSemanticPart,
} from './components/checkbox/checkbox';
export {
  Collapsible,
  type CollapsibleContentProps,
  type CollapsibleProps,
  type CollapsibleSemanticPart,
  type CollapsibleTriggerProps,
} from './components/collapsible/collapsible';
export {
  ContextMenu,
  type ContextMenuProps,
  type ContextMenuSemanticPart,
} from './components/context-menu/context-menu';
export {
  DatePicker,
  type DatePickerProps,
  type DatePickerSemanticPart,
  type PickerRef,
} from './components/date-picker/date-picker';
export {
  RangePicker,
  type RangePickerProps,
  type RangePickerSemanticPart,
} from './components/date-picker/range-picker';
export {
  Drawer,
  type DrawerPlacement,
  type DrawerProps,
  type DrawerResizableConfig,
  type DrawerSemanticPart,
  type DrawerSize,
} from './components/drawer/drawer';
export {
  Dropdown,
  type DropdownButtonProps,
  type DropdownPlacement,
  type DropdownProps,
  type DropdownSemanticPart,
  type DropdownTrigger,
  type MenuDividerType,
  type MenuGroupType,
  type MenuItem,
  type MenuItemType,
  type MenuProps,
} from './components/dropdown/dropdown';
export {
  FormActions,
  type FormActionsProps,
  type FormActionsSemanticPart,
} from './components/form-actions/form-actions';
export {
  FormField,
  type FormFieldProps,
  type FormFieldSemanticPart,
} from './components/form-field/form-field';
export {
  FormSection,
  type FormSectionProps,
  type FormSectionSemanticPart,
} from './components/form-section/form-section';
export {
  Input,
  type InputProps,
  type InputSemanticPart,
} from './components/input/input';
export {
  InputNumber,
  type InputNumberProps,
  type InputNumberSemanticPart,
} from './components/input-number/input-number';
export {
  type ConfirmType,
  Modal,
  type ModalFooterRender,
  type ModalFuncProps,
  type ModalFuncReturn,
  type ModalHookApi,
  type ModalProps,
  type ModalSemanticPart,
} from './components/modal';
export {
  Pagination,
  type PaginationProps,
  type PaginationSemanticPart,
} from './components/pagination/pagination';
export {
  Radio,
  RadioGroup,
  type RadioGroupProps,
  type RadioOptionType,
  type RadioProps,
  type RadioSemanticPart,
} from './components/radio/radio';
export {
  ScrollArea,
  type ScrollAreaProps,
  type ScrollAreaSemanticPart,
  type ScrollAreaType,
} from './components/scroll-area/scroll-area';
export {
  Select,
  type SelectOption,
  type SelectPlacement,
  type SelectProps,
  type SelectRef,
  type SelectSemanticPart,
  type TagRenderProps,
} from './components/select/select';
export {
  Sonner,
  type SonnerAction,
  type SonnerPosition,
  type SonnerProps,
  type SonnerSemanticPart,
  type SonnerToastItem,
  type SonnerToastOptions,
  type SonnerType,
  toast,
} from './components/sonner';
export {
  Spinner,
  type SpinnerProps,
  type SpinnerSemanticPart,
} from './components/spinner/spinner';
export {
  Splitter,
  type SplitterPanelProps,
  type SplitterProps,
  type SplitterSemanticPart,
} from './components/splitter/splitter';
export {
  Switch,
  type SwitchProps,
  type SwitchSemanticPart,
} from './components/switch/switch';
export {
  type SorterResult,
  type SortOrder,
  Table,
  type TableColumn,
  type TableFilterItem,
  type TablePagination,
  type TableProps,
  type TableRowSelection,
  type TableSemanticPart,
  type TableVariant,
} from './components/table/table';
export {
  type TabItem,
  Tabs,
  type TabsProps,
  type TabsSemanticPart,
} from './components/tabs/tabs';
export {
  CheckableTag,
  type CheckableTagProps,
  Tag,
  type TagColor,
  type TagProps,
  type TagSemanticPart,
  type TagVariant,
} from './components/tag/tag';
export {
  type AutoSizeOptions,
  Textarea,
  type TextareaProps,
  type TextareaSemanticPart,
} from './components/textarea/textarea';
export {
  FormLayout,
  type FormLayoutProps,
  type FormLayoutSemanticPart,
} from './layouts/form-layout/form-layout';
// Layouts
export {
  Stack,
  type StackProps,
  type StackSemanticPart,
} from './layouts/stack/stack';
// Number input — headless component + hook (the styled InputNumber is above)
export {
  type FormatOptions,
  HeadlessInputNumber,
  type HeadlessInputNumberProps,
  // Deprecated aliases (renamed to HeadlessInputNumber*).
  NumberInput,
  type NumberInputProps,
  type PadDecimalsOnBlur,
  type UseNumberInputOptions,
  type UseNumberInputReturn,
  useNumberInput,
} from './number-input';
export {
  type TaoConfig,
  TaoProvider,
  type TaoProviderProps,
  type TaoSeedToken,
  type TaoSize,
  type TaoStatus,
  type TaoThemeConfig,
  type TaoThemeMode,
  type TaoVariant,
  useTaoConfig,
} from './provider/tao-provider';
// Semantic DOM utilities
export {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from './utils/semantic';
