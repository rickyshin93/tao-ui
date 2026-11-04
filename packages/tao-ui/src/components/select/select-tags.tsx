import {
  Fragment,
  type ReactNode,
  type SyntheticEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { useTaoConfig } from '../../provider/tao-provider';
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
  const { locale } = useTaoConfig();
  const responsive = maxTagCount === 'responsive';
  const containerRef = useRef<HTMLSpanElement>(null);
  const restRef = useRef<HTMLSpanElement>(null);
  const [fitCount, setFitCount] = useState(options.length);
  const count = responsive
    ? fitCount
    : typeof maxTagCount === 'number'
      ? maxTagCount
      : options.length;
  const visible = responsive ? options : options.slice(0, count);
  const omitted = options.slice(count);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!responsive || !container) return;
    const measure = () => {
      const items = Array.from(
        container.querySelectorAll<HTMLElement>(
          '[data-tao-select-tag-measure]',
        ),
      );
      const gap = Number.parseFloat(getComputedStyle(container).gap) || 0;
      const widths = items.map((item) => item.getBoundingClientRect().width);
      const available = container.clientWidth;
      const total =
        widths.reduce((sum, width) => sum + width, 0) +
        Math.max(0, widths.length - 1) * gap;
      let fit = widths.length;
      if (total > available) {
        let used = restRef.current?.getBoundingClientRect().width ?? 0;
        fit = 0;
        for (const width of widths) {
          if (used + gap + width > available) break;
          used += gap + width;
          fit++;
        }
      }
      setFitCount(fit);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    for (const child of container.children) observer.observe(child);
    return () => observer.disconnect();
  });

  if (options.length === 0) return null;

  const label = (option: SelectOption): ReactNode => {
    const text =
      typeof option.label === 'string' ? option.label : String(option.label);
    return maxTagTextLength != null && text.length > maxTagTextLength
      ? `${text.slice(0, maxTagTextLength)}…`
      : option.label;
  };

  const content = (
    <>
      {visible.map((option, index) => {
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
                aria-label={locale.remove(
                  typeof option.label === 'string'
                    ? option.label
                    : option.value,
                )}
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
        return responsive ? (
          <span
            key={option.value}
            data-tao-select-tag-measure=""
            data-tao-overflow={index >= count || undefined}
            aria-hidden={index >= count || undefined}
          >
            {tag}
          </span>
        ) : (
          <Fragment key={option.value}>{tag}</Fragment>
        );
      })}
      {(responsive || omitted.length > 0) && (
        <span
          ref={restRef}
          data-tao-overflow={(responsive && omitted.length === 0) || undefined}
          aria-hidden={(responsive && omitted.length === 0) || undefined}
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
  return responsive ? (
    <span ref={containerRef} data-tao-select-responsive-tags="">
      {content}
    </span>
  ) : (
    content
  );
}
