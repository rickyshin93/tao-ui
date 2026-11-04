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
import './empty.css';

export type EmptySemanticPart = 'root' | 'image' | 'description' | 'footer';

export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  prefixCls?: string;
  rootClassName?: string;
  image?: ReactNode;
  /** @deprecated Use styles.image. */
  imageStyle?: CSSProperties;
  description?: ReactNode;
  classNames?:
    | SemanticClassNames<EmptySemanticPart>
    | ((info: { props: EmptyProps }) => SemanticClassNames<EmptySemanticPart>);
  styles?:
    | SemanticStyles<EmptySemanticPart>
    | ((info: { props: EmptyProps }) => SemanticStyles<EmptySemanticPart>);
}

export interface EmptyRef {
  nativeElement: HTMLDivElement;
}

function EmptyImage({ simple = false }: { simple?: boolean }) {
  return (
    <svg
      viewBox="0 0 80 64"
      fill="none"
      aria-hidden="true"
      data-tao-empty-art=""
      data-tao-simple={simple || undefined}
    >
      {!simple && (
        <path
          d="M25 13h30v27H25z"
          fill="var(--tao-color-bg-container)"
          stroke="currentColor"
        />
      )}
      <path
        d="M12 37l10-13h36l10 13v17H12V37z"
        fill="var(--tao-color-bg-container)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 37h18l4 7h12l4-7h18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {!simple && (
        <path
          d="M32 20h16M32 26h12"
          stroke="currentColor"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

const defaultImage = <EmptyImage />;
const simpleImage = <EmptyImage simple />;

const EmptyRoot = forwardRef<EmptyRef, EmptyProps>(function Empty(props, ref) {
  const {
    prefixCls = 'tao-empty',
    rootClassName,
    className,
    style,
    image = defaultImage,
    imageStyle,
    description,
    children,
    classNames,
    styles,
    ...rest
  } = props;
  const { locale } = useTaoConfig();
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({ nativeElement: root.current! }));
  const names =
    typeof classNames === 'function' ? classNames({ props }) : classNames;
  const slots = typeof styles === 'function' ? styles({ props }) : styles;
  const text =
    description === undefined
      ? (locale.emptyDescription ?? 'No data')
      : description;
  const shownImage = image ?? defaultImage;
  return (
    <div
      {...rest}
      ref={root}
      data-tao-empty=""
      data-tao-simple={shownImage === simpleImage || undefined}
      className={cx(prefixCls, names?.root, className, rootClassName)}
      style={{ ...slots?.root, ...style }}
    >
      <div
        data-tao-empty-image=""
        className={cx(`${prefixCls}-image`, names?.image)}
        style={{ ...imageStyle, ...slots?.image }}
      >
        {typeof shownImage === 'string' ? (
          <img
            src={shownImage}
            alt={typeof text === 'string' ? text : 'empty'}
            draggable={false}
          />
        ) : (
          shownImage
        )}
      </div>
      {text !== null && text !== undefined && typeof text !== 'boolean' && (
        <div
          data-tao-empty-description=""
          className={cx(`${prefixCls}-description`, names?.description)}
          style={slots?.description}
        >
          {text}
        </div>
      )}
      {children !== null &&
        children !== undefined &&
        typeof children !== 'boolean' && (
          <div
            data-tao-empty-footer=""
            className={cx(`${prefixCls}-footer`, names?.footer)}
            style={slots?.footer}
          >
            {children}
          </div>
        )}
    </div>
  );
});

export const Empty = Object.assign(EmptyRoot, {
  PRESENTED_IMAGE_DEFAULT: defaultImage,
  PRESENTED_IMAGE_SIMPLE: simpleImage,
});
