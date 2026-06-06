// Provider
export {
  TaoProvider,
  useTaoConfig,
  type TaoProviderProps,
  type TaoThemeConfig,
  type TaoSeedToken,
  type TaoSize,
  type TaoVariant,
} from './provider/tao-provider';

// Semantic DOM utilities
export { cx, type SemanticClassNames, type SemanticStyles } from './utils/semantic';

// Components
export { Button, type ButtonProps, type ButtonSemanticPart } from './components/button/button';
export { Input, type InputProps, type InputSemanticPart } from './components/input/input';
export {
  Select,
  type SelectProps,
  type SelectOption,
} from './components/select/select';
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
  FormActions,
  type FormActionsProps,
  type FormActionsSemanticPart,
} from './components/form-actions/form-actions';
export {
  Drawer,
  type DrawerProps,
  type DrawerPlacement,
  type DrawerSemanticPart,
} from './components/drawer/drawer';
export { Switch, type SwitchProps, type SwitchSemanticPart } from './components/switch/switch';
export {
  DatePicker,
  type DatePickerProps,
} from './components/date-picker/date-picker';
export {
  RangePicker,
  type RangePickerProps,
} from './components/date-picker/range-picker';
export {
  Checkbox,
  CheckboxGroup,
  type CheckboxProps,
  type CheckboxGroupProps,
  type CheckboxOptionType,
  type CheckboxSemanticPart,
} from './components/checkbox/checkbox';
export {
  Radio,
  RadioGroup,
  type RadioProps,
  type RadioGroupProps,
  type RadioOptionType,
  type RadioSemanticPart,
} from './components/radio/radio';

export {
  Tabs,
  type TabsProps,
  type TabItem,
  type TabsSemanticPart,
} from './components/tabs/tabs';
export {
  Pagination,
  type PaginationProps,
  type PaginationSemanticPart,
} from './components/pagination/pagination';
export {
  Table,
  type TableProps,
  type TableColumn,
  type TableRowSelection,
  type TableFilterItem,
  type TablePagination,
  type SortOrder,
  type SorterResult,
  type TableSemanticPart,
} from './components/table/table';
export {
  Splitter,
  type SplitterProps,
  type SplitterPanelProps,
  type SplitterSemanticPart,
} from './components/splitter/splitter';
export {
  Tag,
  CheckableTag,
  type TagProps,
  type CheckableTagProps,
  type TagColor,
  type TagVariant,
  type TagSemanticPart,
} from './components/tag/tag';
export {
  ScrollArea,
  type ScrollAreaProps,
  type ScrollAreaType,
  type ScrollAreaSemanticPart,
} from './components/scroll-area/scroll-area';

// Layouts
export { Stack, type StackProps } from './layouts/stack/stack';
export { FormLayout, type FormLayoutProps } from './layouts/form-layout/form-layout';

// Legacy (headless)
export {
  type FormatOptions,
  NumberInput,
  type NumberInputProps,
  type PadDecimalsOnBlur,
  type UseNumberInputOptions,
  type UseNumberInputReturn,
  useNumberInput,
} from './number-input';
