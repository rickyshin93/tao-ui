import {
  type ChangeEvent,
  cloneElement,
  forwardRef,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useRef,
} from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import { mergeRefs } from '../../utils/refs';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Button, type ButtonProps } from '../button/button';
import { SearchIcon } from '../select/select-icons';
import {
  BaseInput,
  type InputProps,
  type InputSemanticPart,
} from './base-input';
import type { InputSemanticValue } from './input-shared';

export type SearchSemanticPart = InputSemanticPart | 'button';
export interface SearchProps
  extends Omit<InputProps, 'onSearch' | 'classNames' | 'styles'> {
  enterButton?: ReactNode;
  loading?: boolean;
  searchIcon?: ReactNode;
  onSearch?: (
    value: string,
    event?:
      | ChangeEvent<HTMLInputElement>
      | MouseEvent<HTMLElement>
      | KeyboardEvent<HTMLInputElement>,
    info?: { source: 'input' | 'clear' },
  ) => void;
  classNames?: InputSemanticValue<
    SemanticClassNames<SearchSemanticPart>,
    SearchProps
  >;
  styles?: InputSemanticValue<SemanticStyles<SearchSemanticPart>, SearchProps>;
}
export const Search = forwardRef<HTMLInputElement, SearchProps>(
  function Search(props, ref) {
    const {
      enterButton = false,
      loading,
      searchIcon,
      onSearch,
      onChange,
      onPressEnter,
      classNames: customClassNames,
      styles: customStyles,
      className,
      style,
      addonAfter,
      ...rest
    } = props;
    const ctx = useTaoConfig();
    const disabled = props.disabled ?? ctx.disabled;
    const inputRef = useRef<HTMLInputElement>(null);
    const classNames =
      typeof customClassNames === 'function'
        ? customClassNames({ props })
        : customClassNames;
    const styles =
      typeof customStyles === 'function'
        ? customStyles({ props })
        : customStyles;
    const customButton =
      isValidElement<ButtonProps>(enterButton) &&
      (enterButton.type === 'button' || enterButton.type === Button);
    const isLoading =
      loading ||
      (customButton &&
        enterButton.type === Button &&
        enterButton.props.loading);
    const submitDisabled =
      disabled || isLoading || (customButton && enterButton.props.disabled);
    const search = (
      event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLInputElement>,
    ) => {
      const input = inputRef.current;
      if (input && !submitDisabled && !event.defaultPrevented)
        onSearch?.(input.value, event, { source: 'input' });
    };
    const buttonProps: ButtonProps = {
      type: 'button',
      disabled: submitDisabled,
      'aria-busy': isLoading || undefined,
      'aria-label': ctx.locale.search ?? 'Search',
      className: classNames?.button,
      style: styles?.button,
      onMouseDown: (event) => event.preventDefault(),
      onClick: search,
    };
    const hasButtonContent = enterButton === 0 || Boolean(enterButton);
    const button = customButton ? (
      cloneElement(enterButton as ReactElement<ButtonProps>, {
        ...buttonProps,
        className: cx(enterButton.props.className, classNames?.button),
        style: { ...enterButton.props.style, ...styles?.button },
        'aria-label':
          enterButton.props['aria-label'] ?? buttonProps['aria-label'],
        ...(enterButton.type === Button
          ? { loading: isLoading, size: props.size ?? enterButton.props.size }
          : {}),
        onMouseDown: (event) => {
          enterButton.props.onMouseDown?.(event);
          event.preventDefault();
        },
        onClick: (event) => {
          enterButton.props.onClick?.(event);
          search(event);
        },
      })
    ) : (
      <Button
        {...buttonProps}
        loading={isLoading}
        size={props.size}
        variant={hasButtonContent ? 'primary' : 'secondary'}
      >
        {enterButton === true || !hasButtonContent
          ? (searchIcon ?? <SearchIcon />)
          : enterButton}
      </Button>
    );
    return (
      <div
        data-tao-input-search=""
        className={cx(classNames?.root, className)}
        style={{ ...styles?.root, ...style }}
      >
        <BaseInput
          {...rest}
          ref={mergeRefs(inputRef, ref)}
          classNames={{ ...classNames, root: undefined }}
          styles={{ ...styles, root: undefined }}
          onChange={(event) => {
            onChange?.(event);
            if (
              event.type === 'click' &&
              !event.defaultPrevented &&
              !disabled &&
              !isLoading
            )
              onSearch?.('', event, { source: 'clear' });
          }}
          onPressEnter={(event) => {
            onPressEnter?.(event);
            search(event);
          }}
        />
        {button}
        {addonAfter}
      </div>
    );
  },
);
