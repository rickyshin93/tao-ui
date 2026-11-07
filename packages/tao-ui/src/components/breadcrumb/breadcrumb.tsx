import { Slot } from '@radix-ui/react-slot';
import {
  type CSSProperties,
  cloneElement,
  Fragment,
  isValidElement,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Dropdown } from '../dropdown/dropdown';
import { menuItemAsChild } from '../menu/menu-render';
import './breadcrumb.css';

// ---- Types ----

export type BreadcrumbSemanticPart =
  | 'root'
  | 'list'
  | 'item'
  | 'link'
  | 'page'
  | 'separator'
  | 'ellipsis';

export interface BreadcrumbItemType {
  /** Stable key; falls back to the item index. */
  key?: string | number;
  /** Content to display. */
  title?: ReactNode;
  /** When set, the item renders as an `<a>`. */
  href?: string;
  /** Click handler; turns a title-only item into an interactive link. */
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  /** Disable interaction for this item. */
  disabled?: boolean;
}

export interface BreadcrumbProps {
  /** Breadcrumb path, root first. The last item renders as the current page. */
  items: BreadcrumbItemType[];
  /** Separator between items. Defaults to a chevron, like shadcn. */
  separator?: ReactNode;
  /**
   * Collapse the middle of long paths into an ellipsis once the number of
   * items exceeds this value. Shows the first item and the last
   * `maxItems - 1` items.
   */
  maxItems?: number;
  /**
   * Custom renderer for an item's content. Return a React element (e.g. a
   * router `<Link>`) and its props are merged onto the breadcrumb link via
   * Radix Slot — no extra `<a>` wrapper is added.
   */
  itemRender?: (
    item: BreadcrumbItemType,
    info: { index: number; isLast: boolean; items: BreadcrumbItemType[] },
  ) => ReactNode;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<BreadcrumbSemanticPart>;
  styles?: SemanticStyles<BreadcrumbSemanticPart>;
}

// ---- Default icons ----

function ChevronIcon() {
  return (
    <svg
      data-tao-breadcrumb-chevron=""
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EllipsisIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="3" cy="8" r="1.3" />
      <circle cx="8" cy="8" r="1.3" />
      <circle cx="13" cy="8" r="1.3" />
    </svg>
  );
}

// ---- Internal display entry ----

const ELLIPSIS = Symbol('ellipsis');
type DisplayEntry =
  | { item: BreadcrumbItemType; index: number }
  | typeof ELLIPSIS;

// ---- Component ----

export function Breadcrumb({
  items,
  separator,
  maxItems,
  itemRender,
  className,
  style,
  classNames,
  styles,
}: BreadcrumbProps) {
  const { size, disabled: ctxDisabled, locale } = useTaoConfig();
  const [ellipsisOpen, setEllipsisOpen] = useState(false);

  const path = items.map((item, index) => ({ item, index }));
  const tailCount = Math.max(1, (maxItems ?? 1) - 1);
  const tailStart = Math.trunc(items.length - tailCount);
  const hidden =
    maxItems != null && maxItems >= 1 && items.length > maxItems
      ? path.slice(1, tailStart)
      : [];
  const hasOverflow = hidden.length > 0;
  useEffect(() => {
    if (!hasOverflow || ctxDisabled) setEllipsisOpen(false);
  }, [hasOverflow, ctxDisabled]);
  const display: DisplayEntry[] = hasOverflow
    ? [path[0], ELLIPSIS, ...path.slice(tailStart)]
    : path;

  const sep = separator ?? <ChevronIcon />;

  const renderContent = (
    item: BreadcrumbItemType,
    index: number,
    isLast: boolean,
    collapsed = false,
  ) => {
    const content = itemRender
      ? itemRender(item, { index, isLast, items })
      : item.title;
    const disabled = item.disabled || ctxDisabled;

    // Current page: non-interactive, marked for assistive tech.
    if (isLast) {
      return (
        <span
          data-tao-breadcrumb-page=""
          aria-current="page"
          className={cx(classNames?.page)}
          style={styles?.page}
        >
          {content}
        </span>
      );
    }

    const linkProps = {
      'data-tao-breadcrumb-link': '',
      'data-tao-disabled': disabled || undefined,
      'aria-disabled': disabled || undefined,
      className: cx(classNames?.link),
      style: styles?.link,
      onClick:
        !disabled && (item.onClick || collapsed)
          ? (event: MouseEvent<HTMLElement>) => {
              item.onClick?.(event);
              // Client-side link handlers can prevent the menu's default close.
              if (collapsed && event.defaultPrevented) setEllipsisOpen(false);
            }
          : undefined,
    };

    // Custom element from itemRender → merge props onto it (asChild).
    if (
      itemRender &&
      isValidElement<Record<string, unknown>>(content) &&
      content.type !== Fragment
    ) {
      if (disabled) {
        return cloneElement(content, {
          ...linkProps,
          tabIndex: -1,
          ...(content.type === 'a' ? { href: undefined } : {}),
          ...(content.type === 'button' ? { disabled: true } : {}),
          onClick: (event: MouseEvent<HTMLElement>) => event.preventDefault(),
        });
      }
      return <Slot {...linkProps}>{content}</Slot>;
    }
    if (item.href != null) {
      return (
        <a href={disabled ? undefined : item.href} {...linkProps}>
          {content}
        </a>
      );
    }
    if (item.onClick) {
      return (
        <button type="button" disabled={disabled} {...linkProps}>
          {content}
        </button>
      );
    }
    // Plain, non-interactive label.
    return (
      <span
        data-tao-breadcrumb-text=""
        className={cx(classNames?.link)}
        style={styles?.link}
      >
        {content}
      </span>
    );
  };

  return (
    <nav
      data-tao-breadcrumb=""
      data-tao-size={size}
      aria-label={locale.messages.breadcrumb}
      className={cx(classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
    >
      <ol
        data-tao-breadcrumb-list=""
        className={cx(classNames?.list)}
        style={styles?.list}
      >
        {display.map((entry, i) => {
          const isEllipsis = entry === ELLIPSIS;
          const isLast = !isEllipsis && entry.index === items.length - 1;
          const key = isEllipsis
            ? `ellipsis-${i}`
            : (entry.item.key ?? entry.index);

          return (
            <Fragment key={key}>
              <li
                data-tao-breadcrumb-item=""
                className={cx(classNames?.item)}
                style={styles?.item}
              >
                {isEllipsis ? (
                  <Dropdown
                    open={ellipsisOpen}
                    onOpenChange={setEllipsisOpen}
                    menu={{
                      items: hidden.map(({ item, index }) => ({
                        key:
                          item.key != null
                            ? String(item.key)
                            : `breadcrumb-hidden-${index}`,
                        label: renderContent(item, index, false, true),
                        disabled: item.disabled,
                        [menuItemAsChild]: true,
                      })),
                    }}
                  >
                    <button
                      type="button"
                      data-tao-breadcrumb-ellipsis=""
                      aria-label={locale.messages.showMore}
                      className={cx(classNames?.ellipsis)}
                      style={styles?.ellipsis}
                    >
                      <EllipsisIcon />
                    </button>
                  </Dropdown>
                ) : (
                  renderContent(entry.item, entry.index, isLast)
                )}
              </li>
              {!isLast && sep !== false && (
                <li
                  data-tao-breadcrumb-separator=""
                  role="presentation"
                  aria-hidden="true"
                  className={cx(classNames?.separator)}
                  style={styles?.separator}
                >
                  {sep}
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
