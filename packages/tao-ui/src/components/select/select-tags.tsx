import { Fragment, type ReactNode, type SyntheticEvent } from 'react';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { CloseIcon } from './select-icons';
import type {
  SelectOption,
  SelectSemanticPart,
  TagRenderProps,
} from './select-types';

export function SelectTags({
  options,
  disabled,
  maxTagCount,
  maxTagPlaceholder,
  maxTagTextLength,
  removeIcon,
  tagRender,
  classNames,
  styles,
  onRemove,
}: {
  options: SelectOption[];
  disabled: boolean;
  maxTagCount?: number | 'responsive';
  maxTagPlaceholder?:
    | ReactNode
    | ((omittedValues: SelectOption[]) => ReactNode);
  maxTagTextLength?: number;
  removeIcon?: ReactNode;
  tagRender?: (props: TagRenderProps) => ReactNode;
  classNames?: SemanticClassNames<SelectSemanticPart>;
  styles?: SemanticStyles<SelectSemanticPart>;
  onRemove: (value: string, event: SyntheticEvent) => void;
}) {
  if (options.length === 0) return null;

  const visible =
    typeof maxTagCount === 'number' ? options.slice(0, maxTagCount) : options;
  const omitted =
    typeof maxTagCount === 'number' ? options.slice(maxTagCount) : [];

  const label = (option: SelectOption): ReactNode => {
    const text =
      typeof option.label === 'string' ? option.label : String(option.label);
    return maxTagTextLength != null && text.length > maxTagTextLength
      ? `${text.slice(0, maxTagTextLength)}…`
      : option.label;
  };

  return (
    <>
      {visible.map((option) => {
        const closable = !disabled && !option.disabled;
        const tag = tagRender ? (
          tagRender({
            label: label(option),
            value: option.value,
            closable,
            disabled: !!option.disabled,
            onClose: (event) => onRemove(option.value, event),
          })
        ) : (
          <span
            key={option.value}
            data-tao-select-tag=""
            data-tao-disabled={option.disabled || undefined}
            className={cx(classNames?.tag)}
            style={styles?.tag}
          >
            <span
              data-tao-select-tag-label=""
              className={cx(classNames?.tagLabel)}
              style={styles?.tagLabel}
            >
              {label(option)}
            </span>
            {closable && (
              // biome-ignore lint/a11y/useSemanticElements: nested buttons are invalid inside the Select trigger.
              <span
                data-tao-select-tag-close=""
                className={cx(classNames?.tagClose)}
                style={styles?.tagClose}
                role="button"
                tabIndex={0}
                aria-label={`Remove ${typeof option.label === 'string' ? option.label : option.value}`}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => onRemove(option.value, event)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    onRemove(option.value, event);
                  }
                }}
              >
                {removeIcon ?? <CloseIcon small />}
              </span>
            )}
          </span>
        );
        return <Fragment key={option.value}>{tag}</Fragment>;
      })}
      {omitted.length > 0 && (
        <span
          data-tao-select-tag=""
          data-tao-select-tag-rest=""
          className={cx(classNames?.tagRest)}
          style={styles?.tagRest}
        >
          {typeof maxTagPlaceholder === 'function'
            ? maxTagPlaceholder(omitted)
            : (maxTagPlaceholder ?? `+${omitted.length}…`)}
        </span>
      )}
    </>
  );
}
