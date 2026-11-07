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
          items_per_page: contextLocale.messages.itemsPerPage,
          jump_to: contextLocale.messages.jumpTo,
          jump_to_confirm: contextLocale.messages.jumpToConfirm,
          page: contextLocale.messages.pageUnit,
          prev_page: contextLocale.messages.previousPage,
          next_page: contextLocale.messages.nextPage,
          page_size: contextLocale.messages.pageSize,
          prev_5: contextLocale.messages.previousPages,
          next_5: contextLocale.messages.nextPages,
          prev_3: contextLocale.messages.previousPages,
          next_3: contextLocale.messages.nextPages,
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
              // rc-pagination omits the simple Next tab stop on page one.
              ref={
                type === 'next' && props.simple && current === 1
                  ? (button) => {
                      if (button && !button.disabled) button.tabIndex = 0;
                    }
                  : undefined
              }
              data-tao-list-page-button=""
              type="button"
              aria-label={
                type === 'page'
                  ? contextLocale.messages.page(page)
                  : type === 'prev'
                    ? contextLocale.previous
                    : type === 'next'
                      ? contextLocale.next
                      : type === 'jump-prev'
                        ? contextLocale.messages.previousPages
                        : contextLocale.messages.nextPages
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
