import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useId,
} from 'react';
import { useControlledOpen } from '../../utils/overlay';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Button, type ButtonProps } from '../button/button';
import { Popover, type PopoverPlacement } from '../popover/popover';
import { StatusIcon } from '../status-icon/status-icon';
import './popconfirm.css';
import { useTaoConfig } from '../../provider/tao-provider';

// ---- Types ----

export type PopconfirmSemanticPart =
  | 'content'
  | 'title'
  | 'description'
  | 'footer'
  | 'icon';

export interface PopconfirmProps {
  /** Main question text of the confirm popup (required, antd parity). */
  title: ReactNode;
  /** Secondary text shown under the title. */
  description?: ReactNode;
  /** Called when OK is clicked; the popup also closes. */
  onConfirm?: (e?: MouseEvent<HTMLElement>) => void;
  /** Called when Cancel is clicked; the popup also closes. */
  onCancel?: (e?: MouseEvent<HTMLElement>) => void;
  /** Text of the OK button. Defaults to `'OK'`. */
  okText?: ReactNode;
  /** Text of the Cancel button. Defaults to `'Cancel'`. */
  cancelText?: ReactNode;
  /** Extra props forwarded to the OK button. */
  okButtonProps?: ButtonProps;
  /** Extra props forwarded to the Cancel button. */
  cancelButtonProps?: ButtonProps;
  /** Icon shown before the title. Defaults to a warning triangle; pass `null` to hide it. */
  icon?: ReactNode | null;
  /** When true, the trigger still renders but the popup never opens. */
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Popup side relative to the trigger. Defaults to `'top'`. */
  placement?: PopoverPlacement;
  /** Merged onto the confirm content wrapper. */
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<PopconfirmSemanticPart>;
  styles?: SemanticStyles<PopconfirmSemanticPart>;
  /** Exactly one trigger element. */
  children: ReactNode;
}

// ---- Component ----

export function Popconfirm({
  title,
  description,
  onConfirm,
  onCancel,
  okText,
  cancelText,
  okButtonProps,
  cancelButtonProps,
  icon,
  disabled: disabledProp,
  open,
  defaultOpen,
  onOpenChange,
  placement = 'top',
  className,
  style,
  classNames,
  styles,
  children,
}: PopconfirmProps) {
  const { locale, disabled: providerDisabled } = useTaoConfig();
  const disabled = disabledProp ?? providerDisabled;
  const titleId = useId();
  const descriptionId = useId();
  // antd semantics: a disabled Popconfirm never opens on click,
  // while the trigger element itself stays enabled.
  const [realOpen, setOpen] = useControlledOpen({
    open,
    defaultOpen: !disabled && defaultOpen,
    onOpenChange,
    canOpen: !disabled,
  });
  useEffect(() => {
    if (disabled && realOpen && open == null) setOpen(false);
  }, [disabled, open, realOpen, setOpen]);

  const handleConfirm = (e: MouseEvent<HTMLElement>) => {
    onConfirm?.(e);
    setOpen(false);
  };
  const handleCancel = (e: MouseEvent<HTMLElement>) => {
    onCancel?.(e);
    setOpen(false);
  };

  const iconNode =
    icon === null ? null : (icon ?? <StatusIcon type="warning" size={16} />);

  const content = (
    <div
      data-tao-popconfirm=""
      className={cx(classNames?.content, className)}
      style={{ ...styles?.content, ...style }}
    >
      <div data-tao-popconfirm-message="">
        {iconNode != null && (
          <span
            data-tao-popconfirm-icon=""
            className={cx(classNames?.icon)}
            style={styles?.icon}
          >
            {iconNode}
          </span>
        )}
        <div data-tao-popconfirm-text="">
          {title != null && (
            <div
              data-tao-popconfirm-title=""
              id={titleId}
              className={cx(classNames?.title)}
              style={styles?.title}
            >
              {title}
            </div>
          )}
          {description != null && (
            <div
              data-tao-popconfirm-description=""
              id={descriptionId}
              className={cx(classNames?.description)}
              style={styles?.description}
            >
              {description}
            </div>
          )}
        </div>
      </div>
      <div
        data-tao-popconfirm-footer=""
        className={cx(classNames?.footer)}
        style={styles?.footer}
      >
        <Button
          variant="secondary"
          size="small"
          {...cancelButtonProps}
          disabled={cancelButtonProps?.disabled ?? disabled}
          onClick={(event) => {
            cancelButtonProps?.onClick?.(event);
            if (!event.defaultPrevented) handleCancel(event);
          }}
        >
          {cancelText === undefined ? locale.cancel : cancelText}
        </Button>
        <Button
          variant="primary"
          size="small"
          {...okButtonProps}
          disabled={okButtonProps?.disabled ?? disabled}
          onClick={(event) => {
            okButtonProps?.onClick?.(event);
            if (!event.defaultPrevented) handleConfirm(event);
          }}
        >
          {okText === undefined ? locale.ok : okText}
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      trigger="click"
      placement={placement}
      open={realOpen && !disabled}
      onOpenChange={setOpen}
      content={content}
      aria-labelledby={title != null ? titleId : undefined}
      aria-describedby={description != null ? descriptionId : undefined}
    >
      {children}
    </Popover>
  );
}
