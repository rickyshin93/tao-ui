import RcSelect, {
  type BaseSelectRef,
  type SelectProps as RcSelectProps,
} from '@rc-component/select';
import type {
  BaseOptionType,
  DefaultOptionType,
  SearchConfig,
} from '@rc-component/select/es/Select';
import {
  Children,
  type CSSProperties,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefAttributes,
} from 'react';
import {
  type TaoSize,
  type TaoStatus,
  useTaoInternalConfig,
} from '../../provider/tao-provider';
import { cx } from '../../utils/semantic';
import {
  SelectEnginePopup,
  type SelectEngineSemantic,
  type SelectEngineVariant,
  selectAllowClear,
} from '../tree-select/select-engine';
import '../tree-select/select-engine.css';
import './auto-complete.css';
import { interopDefault } from '../../utils/interop-default';

const RcSelectComponent = /*#__PURE__*/ interopDefault(RcSelect);

export type AutoCompleteRef = BaseSelectRef;
export type AutoCompleteOption = DefaultOptionType;
export type AutoCompleteSemanticPart =
  | 'root'
  | 'prefix'
  | 'input'
  | 'placeholder'
  | 'content'
  | 'clear'
  | 'popup.root'
  | 'popup.list'
  | 'popup.listItem';
export type AutoCompleteSemanticType = {
  classNames?: SelectEngineSemantic<string, 'list' | 'listItem'>;
  styles?: SelectEngineSemantic<CSSProperties, 'list' | 'listItem'>;
};
export interface DataSourceItemObject {
  value: string;
  text: string;
}
export type DataSourceItemType = DataSourceItemObject | ReactNode;
export interface AutoCompleteProps<
  ValueType = string,
  OptionType extends BaseOptionType = DefaultOptionType,
> extends Omit<
    RcSelectProps<ValueType, OptionType>,
    | 'loading'
    | 'mode'
    | 'optionLabelProp'
    | 'labelInValue'
    | 'styles'
    | 'classNames'
    | 'showSearch'
    | 'optionFilterProp'
    | 'filterSort'
    | 'popupRender'
  > {
  size?: TaoSize | 'middle';
  variant?: SelectEngineVariant;
  status?: TaoStatus;
  bordered?: boolean;
  showArrow?: boolean;
  rootClassName?: string;
  dataSource?: DataSourceItemType[];
  classNames?:
    | AutoCompleteSemanticType['classNames']
    | ((info: {
        props: AutoCompleteProps<ValueType, OptionType>;
      }) => AutoCompleteSemanticType['classNames']);
  styles?:
    | AutoCompleteSemanticType['styles']
    | ((info: {
        props: AutoCompleteProps<ValueType, OptionType>;
      }) => AutoCompleteSemanticType['styles']);
  showSearch?:
    | boolean
    | Pick<
        SearchConfig<OptionType> & { searchIcon?: ReactNode },
        'filterOption' | 'onSearch' | 'searchIcon'
      >;
  dropdownClassName?: string;
  dropdownStyle?: CSSProperties;
  dropdownRender?: (menu: ReactElement) => ReactNode;
  popupRender?: (menu: ReactElement) => ReactNode;
  dropdownMatchSelectWidth?: boolean | number;
  onDropdownVisibleChange?: (visible: boolean) => void;
  onOpenChange?: (open: boolean) => void;
}

function InternalAutoComplete<
  ValueType = string,
  OptionType extends BaseOptionType = DefaultOptionType,
>(props: AutoCompleteProps<ValueType, OptionType>, ref: Ref<AutoCompleteRef>) {
  const config = useTaoInternalConfig();
  const {
    size: sizeProp = config.size,
    disabled = config.disabled,
    variant = props.bordered === false ? 'borderless' : config.variant,
    status,
    prefixCls = 'tao-select-engine',
    className,
    rootClassName,
    style,
    classNames,
    styles,
    children,
    dataSource,
    components,
    suffix,
    suffixIcon,
    allowClear,
    clearIcon,
    popupClassName,
    dropdownClassName,
    popupStyle,
    dropdownStyle,
    popupRender,
    dropdownRender,
    onOpenChange,
    onDropdownVisibleChange,
    onPopupVisibleChange,
    popupMatchSelectWidth,
    dropdownMatchSelectWidth,
    listHeight = 256,
    listItemHeight = 32,
    showSearch = true,
    notFoundContent = null,
    bordered: _bordered,
    showArrow: _showArrow,
    ...rest
  } = props;
  const nodes = Children.toArray(children);
  const customInput =
    nodes.length === 1 &&
    isValidElement(nodes[0]) &&
    nodes[0].type !== RcSelectComponent.Option &&
    nodes[0].type !== RcSelectComponent.OptGroup
      ? nodes[0]
      : undefined;
  const optionsChildren = customInput ? undefined : children;
  const legacyOptions = dataSource?.map((item) => {
    if (isValidElement(item)) return item;
    if (typeof item === 'string')
      return (
        <RcSelectComponent.Option key={item} value={item}>
          {item}
        </RcSelectComponent.Option>
      );
    if (item && typeof item === 'object' && 'value' in item && 'text' in item)
      return (
        <RcSelectComponent.Option key={item.value} value={item.value}>
          {item.text}
        </RcSelectComponent.Option>
      );
    return null;
  });
  const size = sizeProp === 'middle' ? 'medium' : sizeProp;
  const resolvedProps = { ...props, size, disabled, variant };
  const classes =
    typeof classNames === 'function'
      ? classNames({ props: resolvedProps })
      : classNames;
  const semanticStyles =
    typeof styles === 'function' ? styles({ props: resolvedProps }) : styles;
  const renderPopup = popupRender ?? dropdownRender;

  return (
    <RcSelectComponent<ValueType, OptionType>
      {...rest}
      ref={ref}
      prefixCls={prefixCls}
      mode="combobox"
      data-tao-auto-complete=""
      data-tao-select-engine={customInput ? undefined : ''}
      data-tao-control={customInput ? undefined : ''}
      data-tao-custom-input={!!customInput || undefined}
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
      components={
        customInput ? { ...components, input: customInput } : components
      }
      showSearch={showSearch}
      notFoundContent={notFoundContent}
      listHeight={listHeight}
      listItemHeight={listItemHeight}
      suffix={suffix !== undefined ? suffix : (suffixIcon ?? null)}
      allowClear={selectAllowClear(allowClear, clearIcon, config.locale.clear)}
      popupMatchSelectWidth={popupMatchSelectWidth ?? dropdownMatchSelectWidth}
      popupClassName={cx(
        popupClassName ?? dropdownClassName,
        rootClassName,
        classes?.popup?.root,
      )}
      popupAlign={{
        overflow: { adjustX: true, adjustY: true, shiftX: 8 },
        ...props.popupAlign,
      }}
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
        <SelectEnginePopup size={size}>
          {renderPopup ? renderPopup(menu) : menu}
        </SelectEnginePopup>
      )}
      onPopupVisibleChange={
        onOpenChange ?? onDropdownVisibleChange ?? onPopupVisibleChange
      }
    >
      {optionsChildren ?? legacyOptions}
    </RcSelectComponent>
  );
}

const AutoCompleteComponent = forwardRef(InternalAutoComplete) as <
  ValueType = string,
  OptionType extends BaseOptionType = DefaultOptionType,
>(
  props: AutoCompleteProps<ValueType, OptionType> &
    RefAttributes<AutoCompleteRef>,
) => ReactElement;
export const AutoComplete = Object.assign(AutoCompleteComponent, {
  Option: RcSelectComponent.Option,
});
