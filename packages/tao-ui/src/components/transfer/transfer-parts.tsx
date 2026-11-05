import {
  cloneElement,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import { Button } from '../button/button';
import { Input } from '../input/input';
import type {
  TransferOperationProps,
  TransferSearchProps,
} from './transfer-types';

export function TransferSearch({
  prefixCls,
  placeholder,
  onChange,
  handleClear,
  value,
  disabled,
  'aria-label': ariaLabel,
}: TransferSearchProps) {
  const { locale } = useTaoConfig();
  return (
    <Input
      className={prefixCls}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      aria-label={ariaLabel ?? placeholder}
      prefix={
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" />
          <path d="m10.5 10.5 3 3" stroke="currentColor" />
        </svg>
      }
      suffix={
        value ? (
          <button
            data-tao-transfer-clear=""
            type="button"
            disabled={disabled}
            aria-label={
              locale.locale?.startsWith('zh') ? '清空搜索' : 'Clear search'
            }
            onClick={handleClear}
          >
            ×
          </button>
        ) : undefined
      }
    />
  );
}

export function TransferOperation({
  className,
  actions,
  moveToLeft,
  moveToRight,
  leftActive,
  rightActive,
  style,
  disabled,
  direction,
  oneWay,
}: TransferOperationProps) {
  const { locale } = useTaoConfig();
  const action = (side: 'left' | 'right') => {
    const right = side === 'right';
    const content = actions[right ? 0 : 1];
    const handler = right ? moveToRight : moveToLeft;
    const inactive = !!disabled || !(right ? rightActive : leftActive);
    if (isValidElement(content)) {
      const element = content as ReactElement<{
        disabled?: boolean;
        onClick?: (
          event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
        ) => void;
      }>;
      const locked = inactive || element.props.disabled;
      return cloneElement(element, {
        disabled: locked,
        onClick: (event) => {
          if (locked) {
            event.preventDefault();
            return;
          }
          element.props.onClick?.(event);
          handler?.(event);
        },
      });
    }
    const label = locale.locale?.startsWith('zh')
      ? right
        ? '移至目标'
        : '移至源列表'
      : right
        ? 'Move to target'
        : 'Move to source';
    return (
      <Button
        size="small"
        disabled={inactive}
        onClick={handler}
        aria-label={label}
        icon={
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d={
                right !== (direction === 'rtl')
                  ? 'm6 4 4 4-4 4'
                  : 'm10 4-4 4 4 4'
              }
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
      >
        {content}
      </Button>
    );
  };
  return (
    <div data-tao-transfer-actions="" className={className} style={style}>
      {action('right')}
      {!oneWay && action('left')}
      {actions.slice(oneWay ? 1 : 2) as ReactNode}
    </div>
  );
}
