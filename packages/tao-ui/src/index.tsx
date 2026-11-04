'use client';

// Global theme — imported once here so consumers don't need a separate CSS import.
// This entry's CSS side effects are preserved end-to-end via the `sideEffects`
// whitelist in package.json (./dist/index.js + ./src/index.tsx). Without that
// whitelist, tree-shakers mark this module side-effect-free based on the CSS-only
// sideEffects glob and silently drop these two imports.
import './theme/theme.css';
import './theme/control.css';

// Provider

export type {
  FormInstance,
  NamePath,
  Rule,
  RuleObject,
} from '@rc-component/form';
export {
  Affix,
  type AffixProps,
  type AffixRef,
  type AffixSemanticPart,
} from './components/affix/affix';
export {
  Alert,
  type AlertProps,
  type AlertSemanticPart,
  type AlertType,
} from './components/alert/alert';
export type {
  AutoCompleteOption,
  AutoCompleteProps,
  AutoCompleteRef,
  AutoCompleteSemanticPart,
  AutoCompleteSemanticType,
  DataSourceItemObject,
  DataSourceItemType,
} from './components/auto-complete/auto-complete';
export { AutoComplete } from './components/auto-complete/auto-complete';
export {
  Avatar,
  type AvatarGroupProps,
  type AvatarGroupRef,
  type AvatarGroupSemanticPart,
  type AvatarProps,
  type AvatarSemanticPart,
  type AvatarSize,
} from './components/avatar/avatar';
export {
  Badge,
  type BadgeProps,
  type BadgeSemanticPart,
  type RibbonProps,
  type RibbonRef,
  type RibbonSemanticPart,
} from './components/badge/badge';
export {
  BorderBeam,
  type BorderBeamColor,
  type BorderBeamGradient,
  type BorderBeamItem,
  type BorderBeamProps,
  type BorderBeamSemanticPart,
} from './components/border-beam/border-beam';
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
  Calendar,
  type CalendarMode,
  type CalendarProps,
  type CalendarRef,
  type CalendarSelectInfo,
  type CalendarSemanticPart,
  type HeaderRender,
} from './components/calendar/calendar';
export {
  Card,
  type CardGridProps,
  type CardGridRef,
  type CardGridSemanticPart,
  type CardMetaProps,
  type CardMetaRef,
  type CardMetaSemanticPart,
  type CardProps,
  type CardSemanticPart,
  type CardSize,
  type CardTabListType,
  type CardTabsProps,
  type CardType,
} from './components/card/card';
export {
  Carousel,
  type CarouselEffect,
  type CarouselProps,
  type CarouselRef,
  type CarouselSemanticPart,
  type DotPlacement,
} from './components/carousel/carousel';
export type {
  BaseOptionType,
  CascaderAutoProps,
  CascaderPanelAutoProps,
  CascaderPanelProps,
  CascaderProps,
  CascaderRef,
  CascaderSemanticPart,
  CascaderSemanticType,
  DefaultOptionType,
  FieldNamesType,
  FilledFieldNamesType,
} from './components/cascader/cascader';
export { Cascader, CascaderPanel } from './components/cascader/cascader';
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
export type {
  Color,
  ColorFormatType,
  ColorGenInput,
  ColorValueType,
  GradientColor,
  LineGradientType,
  ModeType,
} from './components/color-picker/color';
export { ColorPicker } from './components/color-picker/color-picker';
export type {
  ColorPickerClassNames,
  ColorPickerProps,
  ColorPickerSemanticPart,
  ColorPickerStyles,
  PresetsItem,
} from './components/color-picker/color-picker-types';
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
  Descriptions,
  type DescriptionsItemProps,
  type DescriptionsItemSemanticPart,
  type DescriptionsItemType,
  type DescriptionsProps,
  type DescriptionsRef,
  type DescriptionsSemanticPart,
} from './components/descriptions/descriptions';
export {
  Divider,
  type DividerProps,
  type DividerRef,
  type DividerSemanticPart,
  type DividerTitlePlacement,
} from './components/divider/divider';
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
  Empty,
  type EmptyProps,
  type EmptyRef,
  type EmptySemanticPart,
} from './components/empty/empty';
export {
  type BackTopProps,
  FloatButton,
  type FloatButtonBackTopProps,
  type FloatButtonBadgeProps,
  type FloatButtonElement,
  type FloatButtonGroupProps,
  type FloatButtonGroupRef,
  type FloatButtonGroupSemanticPart,
  type FloatButtonGroupTrigger,
  type FloatButtonProps,
  type FloatButtonRef,
  type FloatButtonSemanticPart,
  type FloatButtonShape,
  type FloatButtonType,
} from './components/float-button/float-button';
export {
  Form,
  type FormItemChildren,
  type FormItemProps,
  type FormItemSemanticPart,
  type FormItemValidateStatus,
  type FormProps,
  type FormSemanticPart,
} from './components/form';
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
  type DeprecatedPreviewConfig,
  type GroupPreviewConfig,
  Image,
  ImagePreviewGroup,
  type ImageProgressConfig,
  type ImageProps,
  type ImageSemanticPart,
  type ImageSemanticType,
  type PlaceholderType,
  type PreviewConfig,
  type PreviewGroupProps,
  type ProgressClassNames,
  type ProgressStyles,
} from './components/image/image';
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
  List,
  type ColumnCount,
  type ColumnType,
  type ListConsumerProps,
  type ListGridType,
  type ListItemLayout,
  type ListItemMetaProps,
  type ListItemMetaRef,
  type ListItemMetaSemanticPart,
  type ListItemProps,
  type ListItemSemanticClassNames,
  type ListItemSemanticName,
  type ListItemSemanticPart,
  type ListItemSemanticStyles,
  type ListLocale,
  type ListPagination,
  type ListProps,
  type ListSemanticPart,
  type ListSize,
} from './components/list/list';
export {
  Listy,
  type ListyClassNames,
  type ListyProps,
  type ListyRef,
  type ListyScrollToConfig,
  type ListySemanticPart,
  type ListyStyles,
  type ScrollAlign,
} from './components/listy/listy';
export {
  Masonry,
  type MasonryGutter,
  type MasonryItemType,
  type MasonryProps,
  type MasonryRef,
  type MasonrySemanticPart,
} from './components/masonry/masonry';
export type {
  MentionPlacement,
  MentionProps,
  MentionSemanticType,
  MentionsConfig,
  MentionsEntity,
  MentionsLegacyOptionProps,
  MentionsOptionProps,
  MentionsProps,
  MentionsRef,
  MentionsSemanticPart,
} from './components/mentions/mentions';
export { Mentions } from './components/mentions/mentions';
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
  Popconfirm,
  type PopconfirmProps,
  type PopconfirmSemanticPart,
} from './components/popconfirm/popconfirm';
export {
  Popover,
  type PopoverPlacement,
  type PopoverProps,
  type PopoverSemanticPart,
  type PopoverTrigger,
} from './components/popover/popover';
export {
  type GapPlacement,
  type GapPosition,
  type PercentPositionType,
  Progress,
  type ProgressGradient,
  type ProgressProps,
  type ProgressSemanticPart,
  type ProgressSize,
  type ProgressStatus,
  type ProgressType,
  type StringGradients,
  type SuccessProps,
} from './components/progress/progress';
export type {
  ImageSettings,
  QRCodeProps,
  QRCodeRef,
  QRCodeSemanticPart,
  QRProps,
  QRPropsCanvas,
  QRPropsSvg,
  QRStatus,
  StatusRenderInfo,
} from './components/qr-code/qr-code';
export { QRCode } from './components/qr-code/qr-code';
export {
  Radio,
  RadioGroup,
  type RadioGroupProps,
  type RadioOptionType,
  type RadioProps,
  type RadioSemanticPart,
} from './components/radio/radio';
export {
  Rate,
  type RateProps,
  type RateRef,
  type RateSemanticPart,
} from './components/rate/rate';
export {
  type ExceptionStatusType,
  Result,
  type ResultProps,
  type ResultRef,
  type ResultSemanticPart,
  type ResultStatusType,
} from './components/result/result';
export {
  ScrollArea,
  type ScrollAreaProps,
  type ScrollAreaSemanticPart,
  type ScrollAreaType,
} from './components/scroll-area/scroll-area';
export {
  Segmented,
  type SegmentedLabeledOption,
  type SegmentedOptions,
  type SegmentedProps,
  type SegmentedSemanticPart,
  type SegmentedValue,
} from './components/segmented/segmented';
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
  Skeleton,
  type SkeletonAvatarProps,
  type SkeletonButtonProps,
  type SkeletonElementProps,
  type SkeletonElementSemanticPart,
  type SkeletonImageProps,
  type SkeletonInputProps,
  type SkeletonNodeProps,
  type SkeletonParagraphProps,
  type SkeletonProps,
  type SkeletonRef,
  type SkeletonSemanticPart,
  type SkeletonSize,
  type SkeletonTitleProps,
} from './components/skeleton/skeleton';
export {
  type Formatter,
  Slider,
  type SliderBaseProps,
  type SliderMarks,
  type SliderProps,
  type SliderRangeProps,
  type SliderRef,
  type SliderSemanticPart,
  type SliderSingleProps,
  type SliderTooltipProps,
} from './components/slider/slider';
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
  type CountdownProps,
  Statistic,
  type StatisticFormatConfig,
  type StatisticProps,
  type StatisticRef,
  type StatisticSemanticPart,
  type StatisticTimerProps,
  type StatisticValue,
  type TimerType,
} from './components/statistic/statistic';
export {
  type StepItem,
  Steps,
  type StepsIconComponent,
  type StepsIconRender,
  type StepsIconRenderInfo,
  type StepsItemSemanticPart,
  type StepsOrientation,
  type StepsProps,
  type StepsSemanticPart,
  type StepsSize,
  type StepsStatus,
  type StepsTitlePlacement,
  type StepsType,
  type StepsVariant,
} from './components/steps/steps';
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
  type TableExpandable,
  type TableFilterItem,
  type TablePagination,
  type TableProps,
  type TableRowSelection,
  type TableSemanticPart,
  type TableSummaryCellProps,
  type TableSummaryProps,
  type TableSummaryRowProps,
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
  TimePicker,
  type TimePickerClassNames,
  type TimePickerLocale,
  type TimePickerLocaleConfig,
  type TimePickerProps,
  type TimePickerRef,
  type TimePickerSemanticPart,
  type TimePickerStyles,
  TimeRangePicker,
  type TimeRangePickerProps,
  type TimeRangePickerRef,
} from './components/time-picker/time-picker';
export {
  type ItemPlacement,
  type ItemPosition,
  Timeline,
  type TimelineItemSemanticPart,
  type TimelineItemType,
  type TimelineMode,
  type TimelineProps,
  type TimelineSemanticPart,
} from './components/timeline/timeline';
export {
  Tooltip,
  type TooltipPlacement,
  type TooltipProps,
  type TooltipSemanticPart,
} from './components/tooltip/tooltip';
export {
  Tour,
  type TourLocale,
  type TourProps,
  type TourSemanticPart,
  type TourSemanticType,
  type TourStepProps,
} from './components/tour/tour';
export {
  type KeyWise,
  type KeyWiseTransferItem,
  type ListStyle,
  type PaginationType,
  type RenderedItem,
  type RenderResult,
  type RenderResultObject,
  type SelectAllLabel,
  Transfer,
  type TransferClassNames,
  type TransferCustomListBodyProps,
  type TransferDirection,
  type TransferItem,
  type TransferKey,
  type TransferListProps,
  type TransferLocale,
  type TransferOperationProps,
  type TransferProps,
  type TransferRef,
  type TransferSearchOption,
  type TransferSearchProps,
  type TransferSectionSemanticClassNames,
  type TransferSectionSemanticPart,
  type TransferSectionSemanticStyles,
  type TransferSemanticPart,
  type TransferStyles,
} from './components/transfer/transfer';
export {
  type AntdTreeNodeAttribute,
  type AntTreeNode,
  type AntTreeNodeCheckedEvent,
  type AntTreeNodeExpandedEvent,
  type AntTreeNodeMouseEvent,
  type AntTreeNodeProps,
  type AntTreeNodeSelectedEvent,
  type BasicDataNode,
  type DataNode,
  DirectoryTree,
  type DirectoryTreeExpandAction,
  type DirectoryTreeProps,
  type EventDataNode,
  Tree,
  type TreeInstance,
  type TreeProps,
  type TreeRef,
  type TreeSemanticPart,
  type UseTreeConfig,
} from './components/tree/tree';
export type {
  TreeSelectDataNode,
  TreeSelectLabeledValue,
  TreeSelectProps,
  TreeSelectRef,
  TreeSelectSemanticPart,
  TreeSelectSemanticType,
  TreeSelectValue,
} from './components/tree-select/tree-select';
export { TreeSelect } from './components/tree-select/tree-select';
export { Upload } from './components/upload/upload';
export type {
  DraggerProps,
  ItemRender,
  PreviewFileHandler,
  RcFile,
  ShowUploadListInterface,
  UploadChangeParam,
  UploadCustomRequest,
  UploadFile,
  UploadFileStatus,
  UploadListProgressProps,
  UploadListType,
  UploadLocale,
  UploadProps,
  UploadRef,
  UploadRequestResult,
  UploadSemanticPart,
  UploadType,
} from './components/upload/upload-types';
export {
  Watermark,
  type WatermarkContent,
  type WatermarkFont,
  type WatermarkProps,
  type WatermarkRef,
  type WatermarkSemanticPart,
  type WatermarkText,
} from './components/watermark/watermark';
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
  type ButtonComponentToken,
  enUS,
  type FormFieldComponentToken,
  type InputComponentToken,
  type TaoComponentTokenMap,
  type TaoConfig,
  type TaoLocale,
  TaoProvider,
  type TaoProviderProps,
  type TaoSeedToken,
  type TaoSize,
  type TaoStatus,
  type TaoThemeConfig,
  type TaoThemeMode,
  type TaoVariant,
  useTaoConfig,
  useTaoToken,
  zhCN,
} from './provider/tao-provider';
// Theme token utilities
export { type TaoTokenName, taoTokenNames, tokenVar } from './theme/tokens';
// Responsive utilities
export {
  resolveResponsiveValue,
  type TaoBreakpoint,
  type TaoBreakpointMap,
  type TaoResponsiveValue,
  useBreakpoint,
  useIsMobile,
} from './utils/breakpoint';
// Semantic DOM utilities
export {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from './utils/semantic';
export type { GetProp, GetProps, GetRef } from './utils/types';

export {
  App,
  type AppConfig,
  type AppInstance,
  type AppMessageArgs,
  type AppMessageConfig,
  type AppMessageInstance,
  type AppMessageOpen,
  type AppMessageSemanticPart,
  type AppMessageType,
  type AppModalConfig,
  type AppModalInstance,
  type AppModalResult,
  type AppNoticeType,
  type AppNotificationArgs,
  type AppNotificationConfig,
  type AppNotificationInstance,
  type AppNotificationPlacement,
  type AppNotificationSemanticPart,
  type AppProps,
  type AppSemanticPart,
  type useAppProps,
} from './components/app/app';
