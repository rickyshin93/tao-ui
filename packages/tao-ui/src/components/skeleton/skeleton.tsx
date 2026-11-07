import {
  type CSSProperties,
  forwardRef,
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
import './skeleton.css';

export type SkeletonSemanticPart =
  | 'root'
  | 'header'
  | 'section'
  | 'avatar'
  | 'title'
  | 'paragraph';
export type SkeletonElementSemanticPart = 'root' | 'content';
export type SkeletonSize = 'small' | 'medium' | 'large' | 'default';

export interface SkeletonElementProps {
  prefixCls?: string;
  className?: string;
  rootClassName?: string;
  style?: CSSProperties;
  size?: SkeletonSize | number;
  shape?: 'circle' | 'square' | 'round' | 'default';
  active?: boolean;
  classNames?: SemanticClassNames<SkeletonElementSemanticPart>;
  styles?: SemanticStyles<SkeletonElementSemanticPart>;
}

export interface SkeletonAvatarProps
  extends Omit<SkeletonElementProps, 'shape'> {
  shape?: 'circle' | 'square';
}
export interface SkeletonButtonProps
  extends Omit<SkeletonElementProps, 'size'> {
  size?: SkeletonSize;
  block?: boolean;
}
export interface SkeletonInputProps
  extends Omit<SkeletonElementProps, 'size' | 'shape'> {
  size?: SkeletonSize;
  block?: boolean;
}
export interface SkeletonNodeProps
  extends Omit<SkeletonElementProps, 'size' | 'shape'> {
  children?: ReactNode;
}
export interface SkeletonImageProps
  extends Omit<SkeletonNodeProps, 'children'> {}
export interface SkeletonTitleProps {
  prefixCls?: string;
  className?: string;
  style?: CSSProperties;
  width?: number | string;
}
export interface SkeletonParagraphProps
  extends Omit<SkeletonTitleProps, 'width'> {
  rows?: number;
  width?: number | string | (number | string)[];
}

export interface SkeletonProps {
  active?: boolean;
  loading?: boolean;
  prefixCls?: string;
  className?: string;
  rootClassName?: string;
  style?: CSSProperties;
  avatar?: boolean | Omit<SkeletonAvatarProps, 'active'>;
  title?: boolean | SkeletonTitleProps;
  paragraph?: boolean | SkeletonParagraphProps;
  round?: boolean;
  children?: ReactNode;
  classNames?:
    | SemanticClassNames<SkeletonSemanticPart>
    | ((info: {
        props: SkeletonProps;
      }) => SemanticClassNames<SkeletonSemanticPart>);
  styles?:
    | SemanticStyles<SkeletonSemanticPart>
    | ((info: {
        props: SkeletonProps;
      }) => SemanticStyles<SkeletonSemanticPart>);
}
export interface SkeletonRef {
  nativeElement: HTMLDivElement | null;
}

interface ElementProps extends SkeletonElementProps {
  kind: 'avatar' | 'button' | 'input' | 'node' | 'image';
  block?: boolean;
  children?: ReactNode;
}

function Element({
  kind,
  prefixCls = 'tao-skeleton',
  className,
  rootClassName,
  style,
  styles,
  classNames,
  size,
  shape,
  active,
  block,
  children,
}: ElementProps) {
  const { size: contextSize } = useTaoConfig();
  const resolvedSize = size === 'default' ? 'medium' : (size ?? contextSize);
  return (
    <div
      data-tao-skeleton-element=""
      data-tao-active={active || undefined}
      data-tao-block={block || undefined}
      aria-hidden="true"
      className={cx(
        prefixCls,
        `${prefixCls}-element`,
        classNames?.root,
        className,
        rootClassName,
      )}
      style={styles?.root}
    >
      <span
        data-tao-skeleton-placeholder=""
        data-tao-kind={kind}
        data-tao-size={
          typeof resolvedSize === 'number' ? undefined : resolvedSize
        }
        data-tao-shape={shape}
        className={cx(`${prefixCls}-${kind}`, classNames?.content)}
        style={{
          ...(typeof resolvedSize === 'number'
            ? { width: resolvedSize, height: resolvedSize }
            : {}),
          ...styles?.content,
          ...style,
        }}
      >
        {children}
      </span>
    </div>
  );
}

function SkeletonAvatar(props: SkeletonAvatarProps) {
  return <Element {...props} kind="avatar" shape={props.shape ?? 'circle'} />;
}
function SkeletonButton(props: SkeletonButtonProps) {
  return <Element {...props} kind="button" />;
}
function SkeletonInput(props: SkeletonInputProps) {
  return <Element {...props} kind="input" />;
}
function SkeletonNode(props: SkeletonNodeProps) {
  return <Element {...props} kind="node" />;
}
function SkeletonImage(props: SkeletonImageProps) {
  return (
    <Element {...props} kind="image">
      <svg
        viewBox="0 0 32 32"
        width="32"
        height="32"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="4"
          y="5"
          width="24"
          height="22"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <path
          d="m5 24 8-8 5 5 4-4 5 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </Element>
  );
}

const SkeletonRoot = forwardRef<SkeletonRef, SkeletonProps>(
  function Skeleton(props, ref) {
    const {
      active,
      avatar = false,
      title = true,
      paragraph = true,
      round,
      prefixCls = 'tao-skeleton',
      className,
      rootClassName,
      style,
      classNames,
      styles,
      children,
    } = props;
    const root = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({ nativeElement: root.current }));
    const resolvedProps = { ...props, avatar, title, paragraph };
    const names =
      typeof classNames === 'function'
        ? classNames({ props: resolvedProps })
        : classNames;
    const slots =
      typeof styles === 'function' ? styles({ props: resolvedProps }) : styles;
    if ('loading' in props && !props.loading) return <>{children}</>;

    const avatarProps = typeof avatar === 'object' ? avatar : {};
    const titleProps = typeof title === 'object' ? title : {};
    const paragraphProps = typeof paragraph === 'object' ? paragraph : {};
    const avatarSize = avatarProps.size ?? 'large';
    const rows = paragraphProps.rows ?? (!avatar && title ? 3 : 2);
    const paragraphWidth =
      paragraphProps.width ?? (!avatar || !title ? '61%' : undefined);
    const titleWidth =
      titleProps.width ?? (paragraph ? (avatar ? '50%' : '38%') : undefined);
    const rowNumbers = Array.from({ length: rows }, (_, index) => index);
    return (
      <div
        ref={root}
        data-tao-skeleton=""
        data-tao-active={active || undefined}
        data-tao-round={round || undefined}
        aria-busy="true"
        className={cx(prefixCls, names?.root, className, rootClassName)}
        style={{ ...slots?.root, ...style }}
      >
        {avatar && (
          <div
            data-tao-skeleton-header=""
            className={cx(
              `${prefixCls}-header`,
              names?.header,
              avatarProps.classNames?.root,
            )}
            style={{ ...avatarProps.styles?.root, ...slots?.header }}
            aria-hidden="true"
          >
            <span
              data-tao-skeleton-placeholder=""
              data-tao-kind="avatar"
              data-tao-size={
                typeof avatarSize === 'number' ? undefined : avatarSize
              }
              data-tao-shape={
                avatarProps.shape ?? (title && !paragraph ? 'square' : 'circle')
              }
              className={cx(
                avatarProps.prefixCls ?? `${prefixCls}-avatar`,
                names?.avatar,
                avatarProps.classNames?.content,
                avatarProps.className,
                avatarProps.rootClassName,
              )}
              style={{
                ...(typeof avatarSize === 'number'
                  ? { width: avatarSize, height: avatarSize }
                  : {}),
                ...avatarProps.styles?.content,
                ...avatarProps.style,
                ...slots?.avatar,
              }}
            />
          </div>
        )}
        {(title || paragraph) && (
          <div
            data-tao-skeleton-section=""
            className={cx(`${prefixCls}-section`, names?.section)}
            style={slots?.section}
            aria-hidden="true"
          >
            {title && (
              <div
                data-tao-skeleton-placeholder=""
                data-tao-kind="title"
                className={cx(
                  titleProps.prefixCls ?? `${prefixCls}-title`,
                  names?.title,
                  titleProps.className,
                )}
                style={{
                  width: titleWidth,
                  ...titleProps.style,
                  ...slots?.title,
                }}
              />
            )}
            {paragraph && (
              <ul
                data-tao-skeleton-paragraph=""
                className={cx(
                  paragraphProps.prefixCls ?? `${prefixCls}-paragraph`,
                  names?.paragraph,
                  paragraphProps.className,
                )}
                style={{ ...paragraphProps.style, ...slots?.paragraph }}
              >
                {rowNumbers.map((row) => (
                  <li
                    key={`row-${row}`}
                    data-tao-skeleton-placeholder=""
                    data-tao-kind="paragraph"
                    style={{
                      width: Array.isArray(paragraphWidth)
                        ? paragraphWidth[row]
                        : row === rows - 1
                          ? paragraphWidth
                          : undefined,
                    }}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  },
);

export const Skeleton = Object.assign(SkeletonRoot, {
  Avatar: SkeletonAvatar,
  Button: SkeletonButton,
  Input: SkeletonInput,
  Image: SkeletonImage,
  Node: SkeletonNode,
});
