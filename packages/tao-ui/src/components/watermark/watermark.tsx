import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTaoInternalConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import {
  WatermarkContext,
  type WatermarkContextValue,
} from './watermark-context';
import './watermark.css';
export interface WatermarkFont {
  color?: CanvasFillStrokeStyles['fillStyle'];
  fontSize?: number | string;
  fontWeight?: 'normal' | 'lighter' | 'bold' | 'bolder' | number;
  fontStyle?: 'none' | 'normal' | 'italic' | 'oblique';
  fontFamily?: string;
  textAlign?: CanvasTextAlign;
}
export interface WatermarkText {
  text: string;
  font?: WatermarkFont;
}
export type WatermarkContent = string | WatermarkText;
export type WatermarkSemanticPart = 'root' | 'mark';
export interface WatermarkProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  zIndex?: number;
  rotate?: number;
  width?: number;
  height?: number;
  image?: string;
  content?: WatermarkContent | WatermarkContent[];
  font?: WatermarkFont;
  rootClassName?: string;
  gap?: [number, number];
  offset?: [number, number];
  children?: ReactNode;
  inherit?: boolean;
  onRemove?: () => void;
  classNames?: SemanticClassNames<WatermarkSemanticPart>;
  styles?: SemanticStyles<WatermarkSemanticPart>;
}
export interface WatermarkRef {
  nativeElement: HTMLDivElement;
}
interface Tile {
  url: string;
  width: number;
  height: number;
}
const EMPTY_FONT: WatermarkFont = {};
function fontString(font: WatermarkFont) {
  return `${font.fontStyle === 'none' ? 'normal' : (font.fontStyle ?? 'normal')} ${font.fontWeight ?? 400} ${typeof font.fontSize === 'number' ? `${font.fontSize}px` : (font.fontSize ?? '16px')} ${font.fontFamily ?? 'sans-serif'}`;
}
export const Watermark = forwardRef<WatermarkRef, WatermarkProps>(
  (props, ref) => {
    const {
      zIndex,
      rotate = -22,
      width,
      height,
      image,
      content,
      font = EMPTY_FONT,
      rootClassName,
      gap = [100, 100],
      offset,
      children,
      inherit = true,
      onRemove,
      classNames,
      styles,
      className,
      style,
      ...rest
    } = props;
    const theme = useTaoInternalConfig();
    const root = useRef<HTMLDivElement>(null);
    const [tile, setTile] = useState<Tile>();
    const [panels, setPanels] = useState<Set<HTMLElement>>(() => new Set());
    const removeCallback = useRef(onRemove);
    useImperativeHandle(ref, () => ({ nativeElement: root.current! }));
    useLayoutEffect(() => {
      removeCallback.current = onRemove;
    }, [onRemove]);
    const context = useMemo<WatermarkContextValue>(
      () => ({
        add: (element) =>
          setPanels((previous) =>
            previous.has(element) ? previous : new Set([...previous, element]),
          ),
        remove: (element) =>
          setPanels((previous) => {
            if (!previous.has(element)) return previous;
            const next = new Set(previous);
            next.delete(element);
            return next;
          }),
      }),
      [],
    );
    const [gapX, gapY] = gap;
    useEffect(() => {
      let cancelled = false;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx)
        throw new Error('Watermark requires a Canvas 2D rendering context.');
      const probe = document.createElement('span');
      probe.style.color = 'var(--tao-color-fill)';
      probe.dataset.taoTheme = theme.mode;
      Object.entries(theme.tokenStyle).forEach(([key, value]) => {
        probe.style.setProperty(key, String(value));
      });
      root.current!.append(probe);
      const defaultColor = getComputedStyle(probe).color;
      probe.remove();
      const lines = (
        Array.isArray(content)
          ? content
          : content === undefined
            ? []
            : [content]
      ).map((line) =>
        typeof line === 'string'
          ? { text: line, font }
          : { text: line.text, font: { ...font, ...line.font } },
      );
      const metrics = lines.map((line) => {
        ctx.font = fontString(line.font);
        const size = ctx.measureText(line.text);
        return {
          width: size.width,
          height:
            (size.fontBoundingBoxAscent ?? size.actualBoundingBoxAscent ?? 12) +
            (size.fontBoundingBoxDescent ?? size.actualBoundingBoxDescent ?? 4),
        };
      });
      const textWidth = Math.ceil(
        Math.max(0, ...metrics.map((metric) => metric.width)),
      );
      const textHeight =
        metrics.reduce((sum, metric) => sum + metric.height, 0) +
        Math.max(0, lines.length - 1) * 3;
      const radians = (rotate * Math.PI) / 180;
      const draw = (picture?: HTMLImageElement) => {
        if (cancelled) return;
        const markWidth =
          width ?? Math.max(image ? 120 : 0, picture ? 0 : textWidth);
        const markHeight =
          height ?? Math.max(image ? 64 : 0, picture ? 0 : textHeight);
        const rotatedWidth =
          Math.abs(markWidth * Math.cos(radians)) +
          Math.abs(markHeight * Math.sin(radians));
        const rotatedHeight =
          Math.abs(markWidth * Math.sin(radians)) +
          Math.abs(markHeight * Math.cos(radians));
        const tileWidth = Math.max(1, Math.ceil(rotatedWidth + gapX));
        const tileHeight = Math.max(1, Math.ceil(rotatedHeight + gapY));
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.ceil(tileWidth * ratio);
        canvas.height = Math.ceil(tileHeight * ratio);
        ctx.scale(ratio, ratio);
        ctx.translate(tileWidth / 2, tileHeight / 2);
        ctx.rotate(radians);
        if (picture)
          ctx.drawImage(
            picture,
            -markWidth / 2,
            -markHeight / 2,
            markWidth,
            markHeight,
          );
        else {
          let y = -markHeight / 2;
          lines.forEach((line, index) => {
            ctx.font = fontString(line.font);
            ctx.fillStyle = line.font.color ?? defaultColor;
            ctx.textAlign = line.font.textAlign ?? 'center';
            ctx.textBaseline = 'top';
            const x =
              ctx.textAlign === 'left' || ctx.textAlign === 'start'
                ? -markWidth / 2
                : ctx.textAlign === 'right' || ctx.textAlign === 'end'
                  ? markWidth / 2
                  : 0;
            ctx.fillText(line.text, x, y);
            y += metrics[index].height + 3;
          });
        }
        setTile({
          url: canvas.toDataURL(),
          width: tileWidth,
          height: tileHeight,
        });
      };
      let picture: HTMLImageElement | undefined;
      if (image) {
        picture = new Image();
        picture.crossOrigin = 'anonymous';
        picture.referrerPolicy = 'no-referrer';
        picture.onload = () => draw(picture);
        picture.onerror = () => draw();
        picture.src = image;
      } else draw();
      return () => {
        cancelled = true;
        if (picture) {
          picture.onload = null;
          picture.onerror = null;
        }
      };
    }, [
      rotate,
      width,
      height,
      image,
      content,
      font,
      gapX,
      gapY,
      theme.mode,
      theme.tokenStyle,
    ]);
    const offsetX = (offset?.[0] ?? gapX / 2) - gapX / 2;
    const offsetY = (offset?.[1] ?? gapY / 2) - gapY / 2;
    const rootPosition =
      style?.position ?? styles?.root?.position ?? 'relative';
    const rootOverflow = style?.overflow ?? styles?.root?.overflow ?? 'hidden';
    useEffect(() => {
      if (!tile) return;
      const holders = [root.current!, ...panels];
      const cleanups = holders.map((holder) => {
        const originalPosition = holder.style.position;
        if (getComputedStyle(holder).position === 'static')
          holder.style.position = 'relative';
        const mark = document.createElement('div');
        mark.setAttribute('data-tao-watermark-mark', '');
        mark.setAttribute('aria-hidden', 'true');
        const markStyle: CSSProperties = {
          position: 'absolute',
          left: Math.max(0, offsetX),
          top: Math.max(0, offsetY),
          width: offsetX > 0 ? `calc(100% - ${offsetX}px)` : '100%',
          height: offsetY > 0 ? `calc(100% - ${offsetY}px)` : '100%',
          zIndex: zIndex ?? 'calc(var(--tao-z-index-popup-base) - 1)',
          pointerEvents: 'none',
          backgroundRepeat: 'repeat',
          backgroundImage: `url("${tile.url}")`,
          backgroundSize: `${tile.width}px ${tile.height}px`,
          backgroundPosition: `${Math.min(0, offsetX)}px ${Math.min(0, offsetY)}px`,
          ...styles?.mark,
        };
        for (const [key, value] of Object.entries(markStyle)) {
          if (value == null) continue;
          const property = key.startsWith('--')
            ? key
            : key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
          mark.style.setProperty(property, String(value));
          if (
            typeof value === 'number' &&
            !mark.style.getPropertyValue(property)
          )
            mark.style.setProperty(property, `${value}px`);
        }
        mark.style.setProperty('visibility', 'visible', 'important');
        const expectedStyle = mark.style.cssText;
        const expectedClass = classNames?.mark ?? '';
        mark.className = expectedClass;
        holder.append(mark);
        const observer = new MutationObserver((records) => {
          const removed = mark.parentElement !== holder;
          const changed = records.some((record) => record.target === mark);
          const rootChanged =
            holder === root.current &&
            records.some(
              (record) =>
                record.target === holder && record.attributeName === 'style',
            );
          if (!removed && !changed && !rootChanged) return;
          observer.disconnect();
          if (removed) {
            holder.append(mark);
            removeCallback.current?.();
          }
          mark.style.cssText = expectedStyle;
          mark.className = expectedClass;
          mark.setAttribute('data-tao-watermark-mark', '');
          mark.setAttribute('aria-hidden', 'true');
          mark.removeAttribute('hidden');
          mark.replaceChildren();
          if (rootChanged) {
            holder.style.position = rootPosition;
            holder.style.overflow = rootOverflow;
          }
          observer.observe(holder, {
            childList: true,
            attributes: true,
            subtree: true,
          });
        });
        observer.observe(holder, {
          childList: true,
          attributes: true,
          subtree: true,
        });
        return () => {
          observer.disconnect();
          mark.remove();
          if (holder !== root.current && holder.style.position === 'relative')
            holder.style.position = originalPosition;
        };
      });
      return () => {
        cleanups.forEach((cleanup) => {
          cleanup();
        });
      };
    }, [
      tile,
      panels,
      zIndex,
      offsetX,
      offsetY,
      styles?.mark,
      classNames?.mark,
      rootPosition,
      rootOverflow,
    ]);
    return (
      <div
        {...rest}
        ref={root}
        data-tao-watermark=""
        className={cx(classNames?.root, className, rootClassName)}
        style={{
          position: 'relative',
          overflow: 'hidden',
          ...styles?.root,
          ...style,
        }}
      >
        <WatermarkContext.Provider value={inherit ? context : null}>
          {children}
        </WatermarkContext.Provider>
      </div>
    );
  },
);
Watermark.displayName = 'Watermark';
