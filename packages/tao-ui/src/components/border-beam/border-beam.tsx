import { Slot } from '@radix-ui/react-slot';
import {
  type CSSProperties,
  Fragment,
  isValidElement,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './border-beam.css';
export type BorderBeamGradient = { color: string; percent: number }[];
export type BorderBeamColor = string | BorderBeamGradient;
export type BorderBeamSemanticPart = 'root' | 'beam';
export interface BorderBeamItem {
  color?: BorderBeamColor;
  lineWidth?: number | string;
  outset?: number | string;
  size?: number | string;
}
export interface BorderBeamProps extends BorderBeamItem {
  prefixCls?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  count?: number;
  duration?: number;
  items?: BorderBeamItem[];
  classNames?: SemanticClassNames<BorderBeamSemanticPart>;
  styles?: SemanticStyles<BorderBeamSemanticPart>;
}
function gradient(color?: BorderBeamColor) {
  if (!color) return undefined;
  const stops =
    typeof color === 'string'
      ? [
          { color, percent: 0 },
          { color, percent: 100 },
        ]
      : [...color];
  const last = stops.at(-1);
  if (last && last.percent !== 100) stops.push({ ...last, percent: 100 });
  return `linear-gradient(to left, ${stops.map((stop) => `${stop.color} ${Math.min(100, Math.max(0, stop.percent)) * 0.7}%`).join(', ')}, transparent)`;
}
interface PathPoint {
  x: number;
  y: number;
  distance: number;
}
function borderPath(width: number, height: number, style: CSSStyleDeclaration) {
  const radii = [
    style.borderTopLeftRadius,
    style.borderTopRightRadius,
    style.borderBottomRightRadius,
    style.borderBottomLeftRadius,
  ].map((value) => {
    const [x = '0', y = x] = value.split(' ');
    const length = (part: string, total: number) =>
      Number.parseFloat(part) * (part.endsWith('%') ? total / 100 : 1) || 0;
    return [length(x, width), length(y, height)];
  });
  const [tl, tr, br, bl] = radii;
  const scale = Math.min(
    1,
    width / (tl[0] + tr[0] || 1),
    width / (bl[0] + br[0] || 1),
    height / (tl[1] + bl[1] || 1),
    height / (tr[1] + br[1] || 1),
  );
  radii.forEach((radius) => {
    radius[0] *= scale;
    radius[1] *= scale;
  });
  const points: PathPoint[] = [{ x: tl[0], y: 0, distance: 0 }];
  const add = (x: number, y: number) => {
    const previous = points[points.length - 1];
    const distance = Math.hypot(x - previous.x, y - previous.y);
    if (distance) points.push({ x, y, distance: previous.distance + distance });
  };
  [tr, br, bl, tl].forEach(([rx, ry], corner) => {
    const cx = corner < 2 ? width - rx : rx;
    const cy = corner === 0 || corner === 3 ? ry : height - ry;
    for (let step = 0; step <= 16; step++) {
      const angle =
        -Math.PI / 2 + (corner * Math.PI) / 2 + ((step / 16) * Math.PI) / 2;
      add(cx + rx * Math.cos(angle), cy + ry * Math.sin(angle));
    }
  });
  return points;
}
function perimeterPoint(distance: number, points: PathPoint[]) {
  const index = Math.max(
    1,
    points.findIndex((point) => point.distance >= distance),
  );
  const from = points[index - 1];
  const to = points[index] ?? from;
  const portion =
    (distance - from.distance) / (to.distance - from.distance || 1);
  return [
    from.x + (to.x - from.x) * portion,
    from.y + (to.y - from.y) * portion,
    (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI,
  ];
}
function BeamEffect({
  host,
  item,
  duration,
  phase,
  prefixCls,
  className,
  style,
  classNames,
  styles,
}: {
  host: HTMLElement;
  item: BorderBeamItem;
  duration: number;
  phase: number;
} & Pick<
  BorderBeamProps,
  'prefixCls' | 'className' | 'style' | 'classNames' | 'styles'
>) {
  const root = useRef<HTMLDivElement>(null);
  const beam = useRef<HTMLSpanElement>(null);
  const border = getComputedStyle(host);
  const inset =
    item.outset === undefined
      ? [
          border.borderTopWidth,
          border.borderRightWidth,
          border.borderBottomWidth,
          border.borderLeftWidth,
        ]
          .map((value) => `calc(-1 * ${value || '0px'})`)
          .join(' ')
      : typeof item.outset === 'number'
        ? -item.outset
        : `calc(-1 * ${item.outset})`;
  useEffect(() => {
    const overlay = root.current!;
    const light = beam.current!;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0;
    let height = 0;
    let path: PathPoint[] = [];
    let beamWidth = 0;
    let beamHeight = 0;
    let frame = 0;
    let start: number | undefined;
    const measure = () => {
      width = overlay.clientWidth;
      height = overlay.clientHeight;
      path = borderPath(width, height, getComputedStyle(overlay));
      beamWidth = light.offsetWidth;
      beamHeight = light.offsetHeight;
    };
    const tick = (now: number) => {
      start ??= now;
      const perimeter = path[path.length - 1].distance;
      const distance =
        (((now - start) / (duration * 1000) + phase) % 1) * perimeter;
      const [x, y, angle] = perimeterPoint(distance, path);
      light.style.transform = `translate(${x - beamWidth * 0.9}px, ${y - beamHeight / 2}px) rotate(${angle}deg)`;
      frame = requestAnimationFrame(tick);
    };
    const updateMotion = () => {
      cancelAnimationFrame(frame);
      if (!motion.matches) frame = requestAnimationFrame(tick);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(overlay);
    observer.observe(light);
    measure();
    updateMotion();
    motion.addEventListener('change', updateMotion);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      motion.removeEventListener('change', updateMotion);
    };
  }, [duration, phase]);
  return createPortal(
    <div
      ref={root}
      aria-hidden="true"
      data-tao-border-beam=""
      className={cx(prefixCls, classNames?.root, className)}
      style={{ inset, padding: item.lineWidth ?? 1, ...styles?.root, ...style }}
    >
      <span
        ref={beam}
        data-tao-border-beam-light=""
        className={classNames?.beam}
        style={{
          width: item.size ?? 100,
          backgroundImage: gradient(item.color),
          ...styles?.beam,
        }}
      />
    </div>,
    host,
  );
}
export function BorderBeam({
  prefixCls,
  className,
  style,
  children,
  color,
  count,
  duration,
  items,
  lineWidth,
  outset,
  size,
  classNames,
  styles,
}: BorderBeamProps) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const assignHost = useCallback(
    (node: HTMLElement | { nativeElement: HTMLElement } | null) =>
      setHost(
        node instanceof HTMLElement ? node : (node?.nativeElement ?? null),
      ),
    [],
  );
  useEffect(() => {
    if (!host || getComputedStyle(host).position !== 'static') return;
    const original = host.style.position;
    host.style.position = 'relative';
    return () => {
      if (host.style.position === 'relative') host.style.position = original;
    };
  }, [host]);
  const total =
    items?.length ??
    (count !== undefined && Number.isFinite(count) && count >= 1
      ? Math.floor(count)
      : 1);
  const seconds = duration !== undefined && duration > 0 ? duration : 6;
  const child =
    isValidElement(children) && children.type !== Fragment ? (
      <Slot ref={assignHost}>{children}</Slot>
    ) : (
      children
    );
  return (
    <>
      {child}
      {host &&
        Array.from({ length: total }, (_, index) => ({
          phase: index / total,
          item: items?.[index],
        })).map(({ phase, item }) => (
          <BeamEffect
            key={`${total}-${phase}`}
            host={host}
            item={{ color, lineWidth, outset, size, ...item }}
            phase={phase}
            duration={seconds}
            prefixCls={prefixCls}
            className={className}
            style={style}
            classNames={classNames}
            styles={styles}
          />
        ))}
    </>
  );
}
