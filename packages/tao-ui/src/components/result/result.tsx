import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './result.css';

export type ExceptionStatusType = 403 | 404 | 500 | '403' | '404' | '500';
export type ResultStatusType =
  | ExceptionStatusType
  | 'success'
  | 'error'
  | 'info'
  | 'warning';
export type ResultSemanticPart =
  | 'root'
  | 'title'
  | 'subTitle'
  | 'body'
  | 'extra'
  | 'icon';

export interface ResultProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  status?: ResultStatusType;
  icon?: ReactNode;
  title?: ReactNode;
  subTitle?: ReactNode;
  extra?: ReactNode;
  prefixCls?: string;
  rootClassName?: string;
  classNames?:
    | SemanticClassNames<ResultSemanticPart>
    | ((info: {
        props: ResultProps;
      }) => SemanticClassNames<ResultSemanticPart>);
  styles?:
    | SemanticStyles<ResultSemanticPart>
    | ((info: { props: ResultProps }) => SemanticStyles<ResultSemanticPart>);
}

export interface ResultRef {
  nativeElement: HTMLDivElement;
}

function ResultIcon({ status }: { status: ResultStatusType }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {status === 'warning' ? (
        <path
          d="M24 6L44 41H4L24 6z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      ) : (
        <circle cx="24" cy="24" r="19" stroke="currentColor" strokeWidth="2" />
      )}
      {status === 'success' ? (
        <path
          d="m14 24 7 7 14-15"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : status === 'error' ? (
        <path
          d="m17 17 14 14m0-14L17 31"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path
            d={status === 'warning' ? 'M24 19v11' : 'M24 23v10'}
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle
            cx="24"
            cy={status === 'warning' ? 35 : 16}
            r="1.5"
            fill="currentColor"
          />
        </>
      )}
    </svg>
  );
}

function ForbiddenImage() {
  return <span data-tao-result-code="">403</span>;
}
function NotFoundImage() {
  return <span data-tao-result-code="">404</span>;
}
function ServerErrorImage() {
  return <span data-tao-result-code="">500</span>;
}

const exceptionImages = {
  '403': ForbiddenImage,
  '404': NotFoundImage,
  '500': ServerErrorImage,
};
const renderable = (value: ReactNode) =>
  value !== null && value !== undefined && typeof value !== 'boolean';

const ResultRoot = forwardRef<ResultRef, ResultProps>(
  function Result(props, ref) {
    const {
      status = 'info',
      icon,
      title,
      subTitle,
      extra,
      children,
      prefixCls = 'tao-result',
      className,
      rootClassName,
      style,
      classNames,
      styles,
      ...rest
    } = props;
    const resolvedProps = { ...props, status };
    const names =
      typeof classNames === 'function'
        ? classNames({ props: resolvedProps })
        : classNames;
    const slots =
      typeof styles === 'function' ? styles({ props: resolvedProps }) : styles;
    const root = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({ nativeElement: root.current! }));
    const exception =
      status === 403 ||
      status === '403' ||
      status === 404 ||
      status === '404' ||
      status === 500 ||
      status === '500';
    const ExceptionImage = exception
      ? exceptionImages[String(status) as keyof typeof exceptionImages]
      : undefined;
    return (
      <div
        {...rest}
        ref={root}
        data-tao-result=""
        data-tao-status={status}
        className={cx(
          prefixCls,
          `${prefixCls}-${status}`,
          names?.root,
          className,
          rootClassName,
        )}
        style={{ ...slots?.root, ...style }}
      >
        {(exception || (icon !== null && icon !== false)) && (
          <div
            data-tao-result-icon=""
            className={cx(`${prefixCls}-icon`, names?.icon)}
            style={slots?.icon}
          >
            {ExceptionImage ? (
              <ExceptionImage />
            ) : renderable(icon) ? (
              icon
            ) : (
              <ResultIcon status={status} />
            )}
          </div>
        )}
        {renderable(title) && (
          <div
            data-tao-result-title=""
            className={cx(`${prefixCls}-title`, names?.title)}
            style={slots?.title}
          >
            {title}
          </div>
        )}
        {renderable(subTitle) && (
          <div
            data-tao-result-subtitle=""
            className={cx(`${prefixCls}-subtitle`, names?.subTitle)}
            style={slots?.subTitle}
          >
            {subTitle}
          </div>
        )}
        {renderable(extra) && (
          <div
            data-tao-result-extra=""
            className={cx(`${prefixCls}-extra`, names?.extra)}
            style={slots?.extra}
          >
            {extra}
          </div>
        )}
        {renderable(children) && (
          <div
            data-tao-result-body=""
            className={cx(`${prefixCls}-body`, names?.body)}
            style={slots?.body}
          >
            {children}
          </div>
        )}
      </div>
    );
  },
);

export const Result = Object.assign(ResultRoot, {
  PRESENTED_IMAGE_403: ForbiddenImage,
  PRESENTED_IMAGE_404: NotFoundImage,
  PRESENTED_IMAGE_500: ServerErrorImage,
});
