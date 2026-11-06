import { QRCodeCanvas, QRCodeSVG, type QRProps } from '@rc-component/qrcode';
import {
  type CanvasHTMLAttributes,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type SVGAttributes,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { enUS } from '../../provider/locale';
import { useTaoInternalConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Button } from '../button/button';
import { Spinner } from '../spinner/spinner';
import './qr-code.css';

export type { QRProps };
export type ImageSettings = QRProps['imageSettings'];
export type QRPropsCanvas = QRProps & CanvasHTMLAttributes<HTMLCanvasElement>;
export type QRPropsSvg = QRProps & SVGAttributes<SVGSVGElement>;
export type QRStatus = 'active' | 'expired' | 'loading' | 'scanned';
export type QRCodeSemanticPart = 'root' | 'cover';
export interface StatusRenderInfo {
  status: Exclude<QRStatus, 'active'>;
  locale: { expired: string; refresh: string; scanned: string };
  onRefresh?: () => void;
}
type SemanticValue<Value> = Value | ((info: { props: QRCodeProps }) => Value);
export interface QRCodeProps
  extends Omit<
      QRProps,
      'fgColor' | 'imageSettings' | 'includeMargin' | 'level' | 'minVersion'
    >,
    HTMLAttributes<HTMLDivElement> {
  type?: 'canvas' | 'svg';
  rootClassName?: string;
  prefixCls?: string;
  icon?: string;
  iconSize?: number | { width: number; height: number };
  bordered?: boolean;
  errorLevel?: 'L' | 'M' | 'Q' | 'H';
  status?: QRStatus;
  onRefresh?: () => void;
  statusRender?: (info: StatusRenderInfo) => ReactNode;
  classNames?: SemanticValue<SemanticClassNames<QRCodeSemanticPart>>;
  styles?: SemanticValue<SemanticStyles<QRCodeSemanticPart>>;
}
export interface QRCodeRef {
  nativeElement: HTMLDivElement;
}

export const QRCode = forwardRef<QRCodeRef, QRCodeProps>(
  function QRCode(props, ref) {
    const {
      value,
      type = 'canvas',
      size = 160,
      icon,
      iconSize = 40,
      bordered = true,
      errorLevel = 'M',
      status = 'active',
      onRefresh,
      statusRender,
      color,
      bgColor = 'transparent',
      marginSize,
      boostLevel,
      title,
      className,
      rootClassName,
      prefixCls,
      classNames,
      styles,
      style,
      ...rest
    } = props;
    const config = useTaoInternalConfig();
    const root = useRef<HTMLDivElement>(null);
    const [themeColor, setThemeColor] = useState('#000000');
    useImperativeHandle(ref, () => ({ nativeElement: root.current! }));
    useLayoutEffect(() => {
      if (root.current) setThemeColor(getComputedStyle(root.current).color);
    });
    const mergedProps = {
      ...props,
      type,
      size,
      bordered,
      errorLevel,
      status,
      bgColor,
    };
    const names =
      typeof classNames === 'function'
        ? classNames({ props: mergedProps })
        : classNames;
    const semanticStyles =
      typeof styles === 'function' ? styles({ props: mergedProps }) : styles;
    const locale = config.locale.qrCode ?? enUS.qrCode!;
    if (!value) return null;
    const qrProps = {
      value,
      size,
      level: errorLevel,
      fgColor: color ?? themeColor,
      bgColor,
      marginSize,
      boostLevel,
      title,
      imageSettings: icon
        ? {
            src: icon,
            height: typeof iconSize === 'number' ? iconSize : iconSize.height,
            width: typeof iconSize === 'number' ? iconSize : iconSize.width,
            excavate: true,
            crossOrigin: 'anonymous' as const,
          }
        : undefined,
      role: 'img',
      'aria-label': rest['aria-label'] ?? title ?? 'QR Code',
    };
    return (
      <div
        {...rest}
        ref={root}
        data-tao-qr-code=""
        data-bordered={bordered}
        data-status={status}
        className={cx(prefixCls, names?.root, rootClassName, className)}
        style={{
          width: size,
          height: size,
          backgroundColor: bgColor,
          ...semanticStyles?.root,
          ...style,
        }}
      >
        {type === 'svg' ? (
          <QRCodeSVG {...qrProps} />
        ) : (
          <QRCodeCanvas {...qrProps} />
        )}
        {status !== 'active' && (
          <div
            data-tao-qr-cover=""
            role="status"
            className={names?.cover}
            style={semanticStyles?.cover}
          >
            {statusRender ? (
              statusRender({ status, locale, onRefresh })
            ) : status === 'loading' ? (
              <Spinner aria-label={config.locale.messages.loadingQrCode} />
            ) : (
              <>
                <span>
                  {status === 'expired' ? locale.expired : locale.scanned}
                </span>
                {status === 'expired' && onRefresh && (
                  <Button variant="bare" onClick={onRefresh}>
                    {locale.refresh}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  },
);
