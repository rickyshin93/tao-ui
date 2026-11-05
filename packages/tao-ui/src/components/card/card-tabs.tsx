import RcTabs, {
  type GetIndicatorSize,
  type MoreProps,
  type TabsProps as RcTabsProps,
  type Tab,
} from '@rc-component/tabs';
import type {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from 'react';
import { TaoPortalScope, useTaoDirection } from '../../provider/tao-provider';
import { interopDefault } from '../../utils/interop-default';
import { cx } from '../../utils/semantic';

const RcTabsComponent = /*#__PURE__*/ interopDefault(RcTabs);

type TabPart =
  | 'root'
  | 'item'
  | 'remove'
  | 'indicator'
  | 'body'
  | 'content'
  | 'header';
type TabClassNames = Partial<Record<TabPart, string>> & {
  popup?: { root?: string };
};
type TabStyles = Partial<Record<TabPart, CSSProperties>> & {
  popup?: { root?: CSSProperties };
};
export interface CardTabsProps
  extends Omit<
    RcTabsProps,
    'classNames' | 'styles' | 'items' | 'editable' | 'more'
  > {
  type?: 'line' | 'card' | 'editable-card';
  size?: 'small' | 'medium' | 'middle' | 'large';
  hideAdd?: boolean;
  centered?: boolean;
  rootClassName?: string;
  classNames?:
    | TabClassNames
    | ((info: { props: CardTabsProps }) => TabClassNames);
  styles?: TabStyles | ((info: { props: CardTabsProps }) => TabStyles);
  tabPlacement?: 'top' | 'bottom' | 'start' | 'end';
  onEdit?: (
    event: MouseEvent | KeyboardEvent | string,
    action: 'add' | 'remove',
  ) => void;
  children?: ReactNode;
  indicatorSize?: GetIndicatorSize;
  items?: (Tab & { destroyInactiveTabPane?: boolean })[];
  destroyInactiveTabPane?: boolean;
  addIcon?: ReactNode;
  moreIcon?: ReactNode;
  removeIcon?: ReactNode;
  more?: MoreProps & {
    visible?: boolean;
    onVisibleChange?: (open: boolean) => void;
  };
}

function TabIcon({ type }: { type: 'add' | 'remove' | 'more' }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {type === 'add' ? (
        <path d="M12 5v14M5 12h14" />
      ) : type === 'remove' ? (
        <path d="m6 6 12 12M18 6 6 18" />
      ) : (
        <>
          <circle cx="5" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
        </>
      )}
    </svg>
  );
}

export function CardTabs(props: CardTabsProps) {
  const {
    type = 'line',
    size = 'medium',
    hideAdd,
    centered,
    rootClassName,
    classNames,
    styles,
    tabPosition,
    tabPlacement,
    onEdit,
    children: _children,
    indicatorSize,
    items,
    destroyInactiveTabPane,
    destroyOnHidden,
    addIcon,
    moreIcon,
    removeIcon,
    more,
    prefixCls,
    className,
    style,
    direction: directionProp,
    animated,
    indicator,
    popupClassName,
    ...rest
  } = props;
  const [direction, directionRef] = useTaoDirection(directionProp);
  const classes =
    typeof classNames === 'function'
      ? classNames({ props: { ...props, size, type } })
      : classNames;
  const slots =
    typeof styles === 'function'
      ? styles({ props: { ...props, size, type } })
      : styles;
  const {
    root: rootClass,
    popup: popupClasses,
    ...partClasses
  } = classes ?? {};
  const { root: rootStyle, popup: popupStyles, ...partStyles } = slots ?? {};
  const position =
    tabPlacement === 'start'
      ? direction === 'rtl'
        ? 'right'
        : 'left'
      : tabPlacement === 'end'
        ? direction === 'rtl'
          ? 'left'
          : 'right'
        : (tabPlacement ?? tabPosition);
  const { visible, onVisibleChange, ...moreProps } = more ?? {};
  const motion =
    animated === false
      ? { inkBar: false, tabPane: false }
      : animated === true
        ? { inkBar: true, tabPane: true }
        : { inkBar: type === 'line', tabPane: false, ...animated };
  const animation = motion.tabPane
    ? {
        ...motion,
        tabPaneMotion: {
          motionAppear: false,
          motionEnter: true,
          motionLeave: true,
          motionName: 'tao-card-tab-switch',
          ...(typeof animated === 'object' ? animated.tabPaneMotion : {}),
        },
      }
    : motion;
  return (
    <div ref={directionRef} dir={direction} style={{ display: 'contents' }}>
      <RcTabsComponent
        {...rest}
        prefixCls="tao-card-tabs"
        data-tao-card-tabs=""
        data-tao-tab-type={type}
        data-tao-size={size === 'middle' ? 'medium' : size}
        data-tao-centered={centered || undefined}
        className={cx(prefixCls, rootClass, className, rootClassName)}
        style={{ ...rootStyle, ...style }}
        direction={direction}
        tabPosition={position}
        destroyOnHidden={destroyOnHidden ?? destroyInactiveTabPane}
        items={items?.map(
          ({ destroyInactiveTabPane: legacyDestroy, ...item }) => ({
            ...item,
            destroyOnHidden: item.destroyOnHidden ?? legacyDestroy,
          }),
        )}
        animated={animation}
        indicator={{ size: indicatorSize, ...indicator }}
        classNames={partClasses}
        styles={{ ...partStyles, popup: popupStyles?.root }}
        popupClassName={cx(popupClasses?.root, popupClassName)}
        more={{
          icon: moreIcon ?? <TabIcon type="more" />,
          ...moreProps,
          open: moreProps.open ?? visible,
          onOpenChange: moreProps.onOpenChange ?? onVisibleChange,
          popupRender: (menu, info) => (
            <TaoPortalScope asChild direction={direction}>
              {moreProps.popupRender ? moreProps.popupRender(menu, info) : menu}
            </TaoPortalScope>
          ),
        }}
        editable={
          type === 'editable-card'
            ? {
                showAdd: !hideAdd,
                addIcon: addIcon ?? <TabIcon type="add" />,
                removeIcon: removeIcon ?? <TabIcon type="remove" />,
                onEdit: (action, info) =>
                  onEdit?.(action === 'add' ? info.event : info.key!, action),
              }
            : undefined
        }
      />
    </div>
  );
}
