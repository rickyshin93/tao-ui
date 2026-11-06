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
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type Ref,
  type RefAttributes,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  type TaoSize,
  type TaoStatus,
  useTaoInternalConfig,
} from '../../provider/tao-provider';
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
import { useBreakpoint } from '../../utils/breakpoint';
import { useMobileTitle } from '../../utils/field-label';
import { interopDefault } from '../../utils/interop-default';
import { mergeRefs } from '../../utils/refs';
import { Button } from '../button/button';
import { Drawer } from '../drawer/drawer';

const RcCascaderComponent = /*#__PURE__*/ interopDefault(RcCascader);
const NAVIGATION_KEYS: Record<string, number> = {
  ArrowLeft: 37,
  ArrowUp: 38,
  ArrowRight: 39,
  ArrowDown: 40,
  Enter: 13,
};

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
  /** Use a bottom drawer. Automatically enabled below 576px. */
  mobile?: boolean;
  /** Drawer title; defaults to the field label, then localized selection text. */
  mobileTitle?: ReactNode;
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
    mobile,
    mobileTitle,
    open: openProp,
    defaultOpen = false,
    value: valueProp,
    defaultValue,
    onChange,
    showSearch,
    searchValue: searchValueProp,
    onSearch,
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
  const screens = useBreakpoint();
  const requestedMobile = mobile ?? screens.xs;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = openProp ?? internalOpen;
  const [mobilePresentation, setMobilePresentation] = useState(requestedMobile);
  if (
    (!open || mobilePresentation === undefined) &&
    mobilePresentation !== requestedMobile
  ) {
    setMobilePresentation(requestedMobile);
  }
  const isMobile = (open ? mobilePresentation : requestedMobile) ?? false;
  const title = useMobileTitle(mobileTitle, config.locale.select);
  const triggerRef = useRef<CascaderRef>(null);
  type ChangeArgs = Parameters<NonNullable<typeof onChange>>;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = valueProp !== undefined ? valueProp : internalValue;
  const [draft, setDraft] = useState<ChangeArgs>();
  const [previousOpen, setPreviousOpen] = useState(open);
  if (previousOpen !== open) {
    setPreviousOpen(open);
    setDraft(undefined);
  }
  const [mobileContainer, setMobileContainer] =
    useState<HTMLFieldSetElement | null>(null);
  const [internalSearch, setInternalSearch] = useState('');
  const searchConfig = typeof showSearch === 'object' ? showSearch : {};
  const searchValue =
    searchConfig.searchValue ?? searchValueProp ?? internalSearch;
  const changeSearch = (next: string) => {
    setInternalSearch(next);
    (searchConfig.onSearch ?? onSearch)?.(next);
  };
  const changeOpen = (next: boolean) => {
    setInternalOpen(next);
    setDraft(undefined);
    if (!next && isMobile) {
      if (searchValue) changeSearch('');
      triggerRef.current?.focus();
    }
    (onOpenChange ?? onPopupVisibleChange ?? onDropdownVisibleChange)?.(next);
  };
  const commit = (...args: ChangeArgs) => {
    setInternalValue(args[0]);
    onChange?.(...args);
  };
  const changeValue = (...args: ChangeArgs) => {
    if (isMobile && open && multiple) {
      setDraft(args);
      return;
    }
    commit(...args);
    if (isMobile && open) {
      const selected = args[1] as OptionType[];
      const last = selected?.at(-1);
      const children = last?.[props.fieldNames?.children ?? 'children'];
      if (!last || (last.isLeaf ?? !children?.length)) changeOpen(false);
    }
  };
  const navigateMobile = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (
      searchValue &&
      (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
    )
      return;
    const keyCode = NAVIGATION_KEYS[event.key];
    if (!keyCode) return;
    event.preventDefault();
    // Keep the engine's path navigation and disabled-option handling while
    // keyboard focus stays inside the drawer.
    triggerRef.current?.nativeElement.querySelector('input')?.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: event.key,
        keyCode,
        which: keyCode,
        bubbles: true,
      }),
    );
  };

  return (
    <>
      <RcCascaderComponent<OptionType, ValueField, Multiple>
        {...rest}
        ref={mergeRefs(triggerRef, ref)}
        open={open}
        value={(isMobile && open && multiple && draft ? draft[0] : value) ?? []}
        onChange={changeValue}
        showSearch={
          isMobile && showSearch
            ? { ...searchConfig, searchValue, onSearch: changeSearch }
            : showSearch
        }
        searchValue={isMobile ? searchValue : searchValueProp}
        onSearch={isMobile ? changeSearch : onSearch}
        expandTrigger={isMobile ? 'click' : props.expandTrigger}
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
        allowClear={selectAllowClear(
          allowClear,
          clearIcon,
          config.locale.clear,
        )}
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
          ...(isMobile ? { display: 'contents' } : {}),
        }}
        popupRender={(menu) => {
          if (isMobile) {
            return mobileContainer ? (
              createPortal(
                <div data-tao-cascader-popup="" data-tao-cascader-mobile="">
                  {renderPopup ? renderPopup(menu) : menu}
                </div>,
                mobileContainer,
              )
            ) : (
              <></>
            );
          }
          return (
            <SelectEnginePopup size={size}>
              <div data-tao-cascader-popup="">
                {renderPopup ? renderPopup(menu) : menu}
              </div>
            </SelectEnginePopup>
          );
        }}
        popupMenuColumnStyle={popupMenuColumnStyle ?? dropdownMenuColumnStyle}
        onPopupVisibleChange={(next) => {
          // The portaled Drawer owns mobile dismissal; rc's outside-click handler
          // cannot distinguish its content from elements outside the anchored popup.
          if (!isMobile || next) changeOpen(next);
        }}
      />
      {isMobile && (
        <Drawer
          open={open && !disabled}
          onClose={() => changeOpen(false)}
          placement="bottom"
          title={title}
          height="70vh"
          classNames={{ root: classes?.popup?.root }}
          styles={{ root: semanticStyles?.popup?.root }}
          footer={
            multiple ? (
              <Button
                size="large"
                style={{ width: '100%' }}
                disabled={disabled}
                onClick={() => {
                  if (draft) commit(...draft);
                  changeOpen(false);
                }}
              >
                {config.locale.done}
              </Button>
            ) : undefined
          }
        >
          {showSearch && (
            <input
              data-tao-cascader-search=""
              type="search"
              aria-label={config.locale.searchOptions}
              placeholder={config.locale.searchPlaceholder}
              value={searchValue}
              disabled={disabled}
              onChange={(event) => changeSearch(event.target.value)}
              onKeyDown={navigateMobile}
            />
          )}
          <fieldset
            data-tao-cascader-mobile-container=""
            ref={setMobileContainer}
            aria-label={config.locale.select}
            tabIndex={showSearch ? -1 : 0}
            onKeyDown={navigateMobile}
          />
        </Drawer>
      )}
    </>
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
  return (
    <div
      data-tao-cascader-panel=""
      data-tao-cascader-popup=""
      className={cx(className, rootClassName)}
      style={style}
      dir={props.direction}
    >
      <RcPanel<OptionType, ValueField, Multiple>
        {...rest}
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
