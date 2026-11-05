import RcCascader, {
  type DefaultOptionType,
  type FieldNames,
  type CascaderProps as RcCascaderProps,
  type CascaderRef as RcCascaderRef,
  Panel as RcPanel,
  type SearchConfig,
} from '@rc-component/cascader';
import {
  type CSSProperties,
  forwardRef,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefAttributes,
  useMemo,
} from 'react';
import {
  type TaoSize,
  type TaoStatus,
  useTaoDirection,
  useTaoInternalConfig,
} from '../../provider/tao-provider';
import { mergeRefs } from '../../utils/refs';
import { cx } from '../../utils/semantic';
import { ChevronDownIcon, CloseIcon } from '../select/select-icons';
import { Spinner } from '../spinner/spinner';
import {
  type SelectEnginePart,
  SelectEnginePopup,
  type SelectEngineSemantic,
  type SelectEngineVariant,
  selectAllowClear,
} from '../tree-select/select-engine';
import '../tree-select/select-engine.css';
import './cascader.css';
import { interopDefault } from '../../utils/interop-default';

const RcCascaderComponent = /*#__PURE__*/ interopDefault(RcCascader);

export type { BaseOptionType, DefaultOptionType } from '@rc-component/cascader';
export type CascaderRef = RcCascaderRef;
export type FieldNamesType = FieldNames;
export type FilledFieldNamesType = Required<FieldNamesType>;
export type CascaderSemanticPart =
  | SelectEnginePart
  | 'popup.root'
  | 'popup.list'
  | 'popup.listItem';
export type CascaderSemanticType = {
  classNames?: SelectEngineSemantic<string, 'list' | 'listItem'>;
  styles?: SelectEngineSemantic<CSSProperties, 'list' | 'listItem'>;
};
export interface CascaderProps<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
  Multiple extends boolean = boolean,
> extends Omit<
    RcCascaderProps<OptionType, ValueField, Multiple>,
    'checkable' | 'classNames' | 'styles' | 'popupRender'
  > {
  multiple?: Multiple;
  size?: TaoSize | 'middle';
  variant?: SelectEngineVariant;
  status?: TaoStatus;
  bordered?: boolean;
  showArrow?: boolean;
  rootClassName?: string;
  classNames?:
    | CascaderSemanticType['classNames']
    | ((info: {
        props: CascaderProps<OptionType, ValueField, Multiple>;
      }) => CascaderSemanticType['classNames']);
  styles?:
    | CascaderSemanticType['styles']
    | ((info: {
        props: CascaderProps<OptionType, ValueField, Multiple>;
      }) => CascaderSemanticType['styles']);
  showSearch?:
    | boolean
    | (SearchConfig<OptionType> & { searchIcon?: ReactNode });
  dropdownClassName?: string;
  dropdownStyle?: CSSProperties;
  dropdownRender?: (menu: ReactElement) => ReactNode;
  popupRender?: (menu: ReactElement) => ReactNode;
  dropdownMenuColumnStyle?: CSSProperties;
  onDropdownVisibleChange?: (visible: boolean) => void;
  onOpenChange?: (open: boolean) => void;
}
export type CascaderAutoProps<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
> =
  | (CascaderProps<OptionType, ValueField, false> & { multiple?: false })
  | (CascaderProps<OptionType, ValueField, true> & { multiple: true });

function ExpandIcon() {
  return (
    <span data-tao-cascader-expand="">
      <ChevronDownIcon />
    </span>
  );
}

function InternalCascader<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
  Multiple extends boolean = boolean,
>(
  props: CascaderProps<OptionType, ValueField, Multiple>,
  ref: Ref<CascaderRef>,
) {
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
    multiple,
    suffix,
    suffixIcon,
    showArrow = true,
    allowClear = true,
    clearIcon,
    removeIcon = <CloseIcon small />,
    expandIcon = <ExpandIcon />,
    loadingIcon = <Spinner size="small" />,
    notFoundContent = config.locale.noResults,
    popupClassName,
    dropdownClassName,
    popupStyle,
    dropdownStyle,
    popupRender,
    dropdownRender,
    popupMenuColumnStyle,
    dropdownMenuColumnStyle,
    onOpenChange,
    onDropdownVisibleChange,
    onPopupVisibleChange,
    bordered: _bordered,
    ...rest
  } = props;
  const size = sizeProp === 'middle' ? 'medium' : sizeProp;
  const resolvedProps = { ...props, size, disabled, variant };
  const classes =
    typeof classNames === 'function'
      ? classNames({ props: resolvedProps })
      : classNames;
  const semanticStyles =
    typeof styles === 'function' ? styles({ props: resolvedProps }) : styles;
  const renderPopup = popupRender ?? dropdownRender;
  const [direction, directionRef] = useTaoDirection(props.direction);
  const mergedRef = useMemo(
    () =>
      mergeRefs<CascaderRef>(ref, (node) =>
        directionRef(node?.nativeElement ?? null),
      ),
    [ref, directionRef],
  );

  return (
    <RcCascaderComponent<OptionType, ValueField, Multiple>
      {...rest}
      ref={mergedRef}
      direction={direction}
      {...{ dir: direction }}
      prefixCls={prefixCls}
      popupPrefixCls="tao-cascader"
      data-tao-cascader=""
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
      checkable={multiple}
      expandIcon={expandIcon}
      loadingIcon={loadingIcon}
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
      notFoundContent={notFoundContent}
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
        <SelectEnginePopup direction={direction} size={size}>
          <div data-tao-cascader-popup="">
            {renderPopup ? renderPopup(menu) : menu}
          </div>
        </SelectEnginePopup>
      )}
      popupMenuColumnStyle={popupMenuColumnStyle ?? dropdownMenuColumnStyle}
      onPopupVisibleChange={
        onOpenChange ?? onPopupVisibleChange ?? onDropdownVisibleChange
      }
    />
  );
}

type PanelPickType =
  | 'value'
  | 'defaultValue'
  | 'changeOnSelect'
  | 'onChange'
  | 'options'
  | 'prefixCls'
  | 'multiple'
  | 'checkStrictly'
  | 'fieldNames'
  | 'showCheckedStrategy'
  | 'loadData'
  | 'expandTrigger'
  | 'expandIcon'
  | 'loadingIcon'
  | 'className'
  | 'rootClassName'
  | 'style'
  | 'direction'
  | 'notFoundContent'
  | 'disabled'
  | 'optionRender';
export type CascaderPanelProps<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
  Multiple extends boolean = boolean,
> = Pick<CascaderProps<OptionType, ValueField, Multiple>, PanelPickType>;
export type CascaderPanelAutoProps<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
> =
  | (CascaderPanelProps<OptionType, ValueField, false> & { multiple?: false })
  | (CascaderPanelProps<OptionType, ValueField, true> & { multiple: true });

export function CascaderPanel<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
  Multiple extends boolean = boolean,
>(props: CascaderPanelProps<OptionType, ValueField, Multiple>) {
  const config = useTaoInternalConfig();
  const {
    multiple,
    className,
    rootClassName,
    style,
    prefixCls = 'tao-cascader',
    disabled = config.disabled,
    notFoundContent = config.locale.noResults,
    expandIcon = <ExpandIcon />,
    loadingIcon = <Spinner size="small" />,
    ...rest
  } = props;
  const [direction, directionRef] = useTaoDirection(props.direction);
  return (
    <div
      ref={directionRef}
      data-tao-cascader-panel=""
      data-tao-cascader-popup=""
      className={cx(className, rootClassName)}
      style={style}
      dir={direction}
    >
      <RcPanel<OptionType, ValueField, Multiple>
        {...rest}
        direction={direction}
        prefixCls={prefixCls}
        checkable={multiple}
        disabled={disabled}
        notFoundContent={notFoundContent}
        expandIcon={expandIcon}
        loadingIcon={loadingIcon}
      />
    </div>
  );
}

const CascaderComponent = forwardRef(InternalCascader) as <
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
>(
  props: CascaderAutoProps<OptionType, ValueField> & RefAttributes<CascaderRef>,
) => ReactElement;
export const Cascader = Object.assign(CascaderComponent, {
  SHOW_PARENT: RcCascaderComponent.SHOW_PARENT,
  SHOW_CHILD: RcCascaderComponent.SHOW_CHILD,
  Panel: CascaderPanel,
});
