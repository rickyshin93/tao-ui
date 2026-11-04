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
} from 'react';
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
    ...rest
  } = props;
  const classes =
    typeof classNames === 'function' ? classNames({ props }) : classNames;
  const semanticStyles =
    typeof styles === 'function' ? styles({ props }) : styles;
  return (
    <div data-tao-listy="" data-tao-hoverable={rowHoverable ? '' : undefined}>
      <RcListyComponent
        {...rest}
        ref={ref}
        prefixCls={prefixCls}
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
          root: { ...semanticStyles?.root, ...style },
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
