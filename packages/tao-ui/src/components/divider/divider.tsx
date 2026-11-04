// biome-ignore-all lint/a11y/useSemanticElements: titled separators need children and the documented HTMLDivElement ref, which a void hr cannot provide.
import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useImperativeHandle,
  useRef,
} from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './divider.css';

export type DividerSemanticPart = 'root' | 'rail' | 'content';
export type DividerTitlePlacement =
  | 'start'
  | 'end'
  | 'center'
  | 'left'
  | 'right';
export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  prefixCls?: string;
  rootClassName?: string;
  /** @deprecated Use orientation. */
  type?: 'horizontal' | 'vertical';
  orientation?: 'horizontal' | 'vertical';
  vertical?: boolean;
  titlePlacement?: DividerTitlePlacement;
  /** @deprecated Use styles.content margins. */
  orientationMargin?: string | number;
  children?: ReactNode;
  dashed?: boolean;
  variant?: 'solid' | 'dashed' | 'dotted';
  size?: 'small' | 'medium' | 'middle' | 'large';
  plain?: boolean;
  classNames?:
    | SemanticClassNames<DividerSemanticPart>
    | ((info: {
        props: DividerProps;
      }) => SemanticClassNames<DividerSemanticPart>);
  styles?:
    | SemanticStyles<DividerSemanticPart>
    | ((info: { props: DividerProps }) => SemanticStyles<DividerSemanticPart>);
}
export interface DividerRef {
  nativeElement: HTMLDivElement;
}

export const Divider = forwardRef<DividerRef, DividerProps>((props, ref) => {
  const ctx = useTaoConfig();
  const {
    prefixCls,
    rootClassName,
    type,
    orientation,
    vertical,
    titlePlacement = 'center',
    orientationMargin,
    children,
    dashed,
    variant = 'solid',
    size = ctx.size,
    plain,
    className,
    style,
    classNames,
    styles,
    ...rest
  } = props;
  const direction =
    orientation ??
    (vertical === undefined
      ? (type ?? 'horizontal')
      : vertical
        ? 'vertical'
        : 'horizontal');
  const mergedProps = {
    ...props,
    orientation: direction,
    titlePlacement,
    variant,
    size,
  };
  const classes =
    typeof classNames === 'function'
      ? classNames({ props: mergedProps })
      : classNames;
  const slots =
    typeof styles === 'function' ? styles({ props: mergedProps }) : styles;
  const node = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({ nativeElement: node.current! }));
  const hasTitle =
    direction === 'horizontal' &&
    children !== null &&
    children !== undefined &&
    typeof children !== 'boolean';
  const margin =
    typeof orientationMargin === 'string' && /^\d+$/.test(orientationMargin)
      ? Number(orientationMargin)
      : orientationMargin;
  const titleStyle: CSSProperties = {
    ...(titlePlacement === 'start'
      ? { marginInlineStart: margin }
      : titlePlacement === 'end'
        ? { marginInlineEnd: margin }
        : titlePlacement === 'left'
          ? { marginLeft: margin }
          : titlePlacement === 'right'
            ? { marginRight: margin }
            : {}),
    ...slots?.content,
  };
  return (
    <div
      {...rest}
      ref={node}
      role="separator"
      aria-orientation={direction}
      data-tao-divider=""
      data-tao-orientation={direction}
      data-tao-placement={titlePlacement}
      data-tao-size={size === 'middle' ? 'medium' : size}
      data-tao-variant={dashed ? 'dashed' : variant}
      data-tao-plain={plain || undefined}
      data-tao-has-title={hasTitle || undefined}
      data-tao-custom-margin={orientationMargin !== undefined || undefined}
      className={cx(
        prefixCls,
        classes?.root,
        !hasTitle && classes?.rail,
        className,
        rootClassName,
      )}
      style={{ ...slots?.root, ...(!hasTitle ? slots?.rail : {}), ...style }}
    >
      {hasTitle && (
        <>
          <span
            data-tao-divider-rail="start"
            className={classes?.rail}
            style={slots?.rail}
          />
          <span
            data-tao-divider-content=""
            className={classes?.content}
            style={titleStyle}
          >
            {children}
          </span>
          <span
            data-tao-divider-rail="end"
            className={classes?.rail}
            style={slots?.rail}
          />
        </>
      )}
    </div>
  );
});
Divider.displayName = 'Divider';
