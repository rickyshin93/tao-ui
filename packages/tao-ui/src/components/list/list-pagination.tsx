import RcPagination, {
  type PaginationProps as RcPaginationProps,
} from '@rc-component/pagination';
import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { type TaoSize, useTaoConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Select, type SelectProps } from '../select/select';
import './list-pagination.css';

export interface ListPagination
  extends Omit<
    RcPaginationProps,
    'showSizeChanger' | 'pageSizeOptions' | 'classNames' | 'styles'
  > {
  position?: 'top' | 'bottom' | 'both';
  size?: TaoSize | 'default';
  responsive?: boolean;
  rootClassName?: string;
  components?: {
    sizeChanger?: ComponentType<{
      value: number;
      onChange: (value: number) => void;
      disabled: boolean;
      className: string;
    }>;
  };
  selectComponentClass?: ComponentType<{
    value: number;
    onChange: (value: number) => void;
    disabled: boolean;
    className: string;
  }>;
  showSizeChanger?: boolean | SelectProps;
  pageSizeOptions?: (string | number)[];
  showQuickJumper?: boolean | { goButton?: ReactNode };
  classNames?:
    | SemanticClassNames<'root' | 'item'>
    | ((info: {
        props: ListPagination;
      }) => SemanticClassNames<'root' | 'item'>);
  styles?:
    | SemanticStyles<'root' | 'item'>
    | ((info: { props: ListPagination }) => SemanticStyles<'root' | 'item'>);
}
export function ListPaginationControl(props: ListPagination) {
  const {
    position: _position,
    size,
    responsive,
    prefixCls = 'tao-list-pages',
    rootClassName,
    className,
    classNames,
    styles,
    style,
    components,
    selectComponentClass,
    showSizeChanger,
    pageSizeOptions,
    itemRender,
    locale,
    sizeChangerRender,
    ...rest
  } = props;
  const { locale: contextLocale, size: contextSize, disabled } = useTaoConfig();
  const classes =
    typeof classNames === 'function' ? classNames({ props }) : classNames;
  const semanticStyles =
    typeof styles === 'function' ? styles({ props }) : styles;
  const chinese = contextLocale.locale?.startsWith('zh');
  const CustomSelect = components?.sizeChanger ?? selectComponentClass;
  const selectProps: Partial<SelectProps> =
    typeof showSizeChanger === 'object' ? showSizeChanger : {};
  const current = props.current ?? props.defaultCurrent ?? 1;
  const totalPages = Math.max(
    1,
    Math.ceil(
      (props.total ?? 0) / (props.pageSize ?? props.defaultPageSize ?? 10),
    ),
  );
  return (
    <div
      data-tao-list-pages=""
      data-tao-size={size === 'default' ? 'medium' : (size ?? contextSize)}
      data-tao-responsive={responsive ? '' : undefined}
    >
      <RcPagination
        {...rest}
        prefixCls={prefixCls}
        disabled={props.disabled ?? disabled}
        locale={{
          items_per_page: chinese ? '条/页' : '/ page',
          jump_to: chinese ? '跳至' : 'Go to',
          jump_to_confirm: chinese ? '确定' : 'Go',
          page: chinese ? '页' : 'page',
          prev_page: contextLocale.previous,
          next_page: contextLocale.next,
          page_size: chinese ? '每页条数' : 'Page size',
          ...locale,
        }}
        className={cx(classes?.root, rootClassName, className)}
        style={{ ...semanticStyles?.root, ...style }}
        classNames={{ item: classes?.item }}
        styles={{ item: semanticStyles?.item }}
        pageSizeOptions={pageSizeOptions?.map(Number)}
        showSizeChanger={
          typeof showSizeChanger === 'object' ? true : showSizeChanger
        }
        prevIcon={<span aria-hidden="true">‹</span>}
        nextIcon={<span aria-hidden="true">›</span>}
        jumpPrevIcon={<span aria-hidden="true">…</span>}
        jumpNextIcon={<span aria-hidden="true">…</span>}
        itemRender={
          itemRender ??
          ((page, type) => (
            <button
              type="button"
              aria-label={
                type === 'page'
                  ? `Page ${page}`
                  : type === 'prev'
                    ? contextLocale.previous
                    : type === 'next'
                      ? contextLocale.next
                      : type === 'jump-prev'
                        ? 'Previous pages'
                        : 'Next pages'
              }
              aria-current={
                type === 'page' && page === current ? 'page' : undefined
              }
              disabled={
                !!(props.disabled ?? disabled) || page < 1 || page > totalPages
              }
            >
              {type === 'page'
                ? page
                : type === 'prev'
                  ? '‹'
                  : type === 'next'
                    ? '›'
                    : '…'}
            </button>
          ))
        }
        sizeChangerRender={
          sizeChangerRender ??
          ((info) =>
            CustomSelect ? (
              <CustomSelect
                value={info.size}
                onChange={info.onSizeChange}
                disabled={info.disabled}
                className={info.className}
              />
            ) : (
              <Select
                {...selectProps}
                value={String(info.size)}
                onChange={(value, option) => {
                  info.onSizeChange(Number(value));
                  selectProps.onChange?.(value, option);
                }}
                options={info.options.map((option) => ({
                  ...option,
                  value: String(option.value),
                }))}
                disabled={info.disabled}
                size={size === 'default' ? 'medium' : (size ?? contextSize)}
                aria-label={info['aria-label']}
                style={{ minWidth: 100, ...selectProps.style } as CSSProperties}
              />
            ))
        }
      />
    </div>
  );
}
