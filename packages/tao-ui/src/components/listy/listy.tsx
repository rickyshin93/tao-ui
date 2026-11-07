import RcListy, {
  type ListyClassNames,
  type ListyRef,
  type ListyStyles,
  type ListyProps as RcListyProps,
} from '@rc-component/listy';
import {
  type CSSProperties,
  forwardRef,
  type Key,
  type ReactElement,
  type Ref,
  useImperativeHandle,
  useRef,
} from 'react';
import { useTaoDirection } from '../../provider/tao-provider';
import { cx } from '../../utils/semantic';
import './listy.css';
import { interopDefault } from '../../utils/interop-default';

const RcListyComponent = /*#__PURE__*/ interopDefault(RcListy);

export type {
  ListyClassNames,
  ListyRef,
  ListyScrollToConfig,
  ListyStyles,
  ScrollAlign,
} from '@rc-component/listy';
export type ListySemanticPart = 'root' | 'item' | 'groupHeader';
export interface ListyProps<T = Record<string, unknown>, K extends Key = Key>
  extends Omit<RcListyProps<T, K>, 'classNames' | 'styles' | 'itemHeight'> {
  rootClassName?: string;
  className?: string;
  style?: CSSProperties;
  rowHoverable?: boolean;
  classNames?:
    | ListyClassNames
    | ((info: { props: ListyProps<T, K> }) => ListyClassNames);
  styles?: ListyStyles | ((info: { props: ListyProps<T, K> }) => ListyStyles);
}
function ListyRoot<T, K extends Key = Key>(
  props: ListyProps<T, K>,
  ref: Ref<ListyRef>,
) {
  const {
    prefixCls = 'tao-listy',
    className,
    rootClassName,
    style,
    classNames,
    styles,
    rowHoverable = true,
    virtual = false,
    direction: directionProp,
    scrollWidth,
    ...rest
  } = props;
  const [direction, directionRef] = useTaoDirection(directionProp);
  const listRef = useRef<ListyRef>(null);
  useImperativeHandle(
    ref,
    () => ({
      scrollTo(config) {
        if (
          !virtual &&
          direction === 'rtl' &&
          config &&
          typeof config === 'object' &&
          'left' in config &&
          config.left !== undefined
        ) {
          // Match virtual list offsets while preserving native negative inputs.
          listRef.current?.scrollTo({ ...config, left: -Math.abs(config.left) });
          return;
        }
        listRef.current?.scrollTo(config);
      },
    }),
    [direction, virtual],
  );
  const rawWidth = !virtual ? scrollWidth : undefined;
  const classes =
    typeof classNames === 'function' ? classNames({ props }) : classNames;
  const semanticStyles =
    typeof styles === 'function' ? styles({ props }) : styles;
  return (
    <div
      ref={directionRef}
      dir={direction}
      data-tao-listy=""
      data-tao-hoverable={rowHoverable ? '' : undefined}
    >
      <RcListyComponent
        {...rest}
        ref={listRef}
        prefixCls={prefixCls}
        direction={direction}
        scrollWidth={scrollWidth}
        virtual={virtual}
        itemHeight={46}
        classNames={{
          ...classes,
          root: cx(classes?.root, rootClassName, className),
          item: cx('tao-listy-item-slot', classes?.item),
          groupHeader: cx('tao-listy-group-slot', classes?.groupHeader),
        }}
        styles={{
          ...semanticStyles,
          root: {
            overflowX: rawWidth ? 'auto' : undefined,
            ...semanticStyles?.root,
            ...style,
          },
          item: rawWidth
            ? { minWidth: rawWidth, ...semanticStyles?.item }
            : semanticStyles?.item,
          groupHeader: rawWidth
            ? { minWidth: rawWidth, ...semanticStyles?.groupHeader }
            : semanticStyles?.groupHeader,
        }}
      />
    </div>
  );
}
export const Listy = forwardRef(ListyRoot) as <
  T = Record<string, unknown>,
  K extends Key = Key,
>(
  props: ListyProps<T, K> & { ref?: Ref<ListyRef> },
) => ReactElement;
