import type { BaseSelectPropsWithoutPrivate } from '@rc-component/select';
import type { CSSProperties, ReactNode, Ref } from 'react';
import { TaoPortalScope } from '../../provider/tao-provider';
import { CloseIcon } from '../select/select-icons';

export type SelectEnginePart =
  | 'root'
  | 'prefix'
  | 'suffix'
  | 'input'
  | 'clear'
  | 'placeholder'
  | 'content'
  | 'item'
  | 'itemContent'
  | 'itemRemove';
export type SelectEngineSemantic<Value, Popup extends string> = Partial<
  Record<SelectEnginePart, Value>
> & {
  popup?: Partial<Record<'root' | Popup, Value>>;
};
export type SelectEngineVariant =
  | 'outlined'
  | 'filled'
  | 'borderless'
  | 'underlined';

export function selectAllowClear(
  allowClear: BaseSelectPropsWithoutPrivate['allowClear'],
  clearIcon: ReactNode,
  label: string,
) {
  if (!allowClear) return false;
  return {
    clearIcon: clearIcon ?? <CloseIcon />,
    label,
    ...(typeof allowClear === 'object' ? allowClear : {}),
  };
}

export function SelectEnginePopup({
  direction,
  children,
  tree,
  treeLine,
  size,
  style,
  contentRef,
}: {
  direction?: 'ltr' | 'rtl';
  children: ReactNode;
  tree?: boolean;
  treeLine?: boolean;
  size: string;
  style?: CSSProperties;
  contentRef?: Ref<HTMLDivElement>;
}) {
  return (
    <TaoPortalScope asChild direction={direction}>
      <div
        ref={contentRef}
        data-tao-select-engine-popup=""
        data-tao-size={size}
        data-tao-tree={tree ? '' : undefined}
        data-tao-show-line={treeLine || undefined}
        data-tao-selectable={tree || undefined}
        data-tao-block={tree || undefined}
        style={style}
      >
        {children}
      </div>
    </TaoPortalScope>
  );
}
