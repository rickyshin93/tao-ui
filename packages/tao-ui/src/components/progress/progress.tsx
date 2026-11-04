import {
  type AriaAttributes,
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useId,
} from 'react';
import { useTaoConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Tooltip } from '../tooltip/tooltip';
import './progress.css';

export type ProgressSemanticPart =
  | 'root'
  | 'body'
  | 'rail'
  | 'track'
  | 'indicator';
export type ProgressType = 'line' | 'circle' | 'dashboard';
export type ProgressStatus = 'normal' | 'exception' | 'active' | 'success';
export type ProgressSize = 'small' | 'medium' | 'default';
export type StringGradients = Record<string, string>;
export type ProgressGradient = { direction?: string } & (
  | StringGradients
  | { from: string; to: string }
);
export interface PercentPositionType {
  align?: 'start' | 'center' | 'end';
  type?: 'inner' | 'outer';
}
export interface SuccessProps {
  percent?: number;
  strokeColor?: string;
}
export type GapPlacement = 'top' | 'bottom' | 'start' | 'end';
export type GapPosition = 'top' | 'bottom' | 'left' | 'right';

export interface ProgressProps
  extends Pick<AriaAttributes, 'aria-label' | 'aria-labelledby'> {
  prefixCls?: string;
  className?: string;
  rootClassName?: string;
  type?: ProgressType;
  percent?: number;
  format?: (percent?: number, successPercent?: number) => ReactNode;
  status?: ProgressStatus;
  showInfo?: boolean;
  strokeWidth?: number;
  strokeLinecap?: 'butt' | 'square' | 'round';
  strokeColor?: string | string[] | ProgressGradient;
  /** @deprecated Use railColor. */
  trailColor?: string;
  railColor?: string;
  /** @deprecated Use size. */
  width?: number;
  success?: SuccessProps;
  style?: CSSProperties;
  gapDegree?: number;
  gapPlacement?: GapPlacement;
  /** @deprecated Use gapPlacement. */
  gapPosition?: GapPosition;
  size?:
    | number
    | [number | string, number]
    | ProgressSize
    | { width?: number; height?: number };
  steps?: number | { count: number; gap: number };
  percentPosition?: PercentPositionType;
  children?: ReactNode;
  rounding?: (step: number) => number;
  classNames?:
    | SemanticClassNames<ProgressSemanticPart>
    | ((info: {
        props: ProgressProps;
      }) => SemanticClassNames<ProgressSemanticPart>);
  styles?:
    | SemanticStyles<ProgressSemanticPart>
    | ((info: {
        props: ProgressProps;
      }) => SemanticStyles<ProgressSemanticPart>);
}

const clamp = (percent = 0) => Math.min(100, Math.max(0, percent || 0));

function gradientStops(gradient: ProgressGradient) {
  if ('from' in gradient && 'to' in gradient)
    return [
      { offset: 0, color: gradient.from },
      { offset: 100, color: gradient.to },
    ];
  return Object.entries(gradient)
    .filter(([key]) => key !== 'direction')
    .map(([offset, color]) => ({ offset: Number.parseFloat(offset), color }))
    .sort((a, b) => a.offset - b.offset);
}

function arcPath(radius: number, start: number, sweep: number) {
  const point = (angle: number) => {
    const radians = (angle * Math.PI) / 180;
    return `${50 + radius * Math.cos(radians)} ${50 + radius * Math.sin(radians)}`;
  };
  if (sweep >= 360)
    return `M ${point(start)} A ${radius} ${radius} 0 1 1 ${point(start + 180)} A ${radius} ${radius} 0 1 1 ${point(start + 360)}`;
  return `M ${point(start)} A ${radius} ${radius} 0 ${sweep > 180 ? 1 : 0} 1 ${point(start + sweep)}`;
}

function StatusIcon({ status }: { status: 'success' | 'exception' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="1em"
      height="1em"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={status === 'success' ? 'm4 10 4 4 8-9' : 'm5 5 10 10m0-10L5 15'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  function Progress(props, ref) {
    const {
      prefixCls = 'tao-progress',
      className,
      rootClassName,
      style,
      classNames,
      styles,
      type = 'line',
      percent = 0,
      status,
      showInfo = true,
      format,
      strokeWidth,
      strokeLinecap = 'round',
      strokeColor,
      railColor,
      trailColor,
      success,
      width,
      gapDegree,
      gapPlacement,
      gapPosition,
      steps,
      percentPosition = {},
      rounding = Math.round,
    } = props;
    const { size: contextSize } = useTaoConfig();
    const size =
      props.size ??
      (type === 'line'
        ? contextSize === 'small'
          ? 'small'
          : 'medium'
        : (width ?? (contextSize === 'small' ? 'small' : 'medium')));
    const value = clamp(percent);
    const successValue = clamp(success?.percent);
    const resolvedStatus =
      status ?? ((success?.percent ?? percent) >= 100 ? 'success' : 'normal');
    const resolvedProps = {
      ...props,
      type,
      percent,
      size,
      showInfo,
      percentPosition,
    };
    const names =
      typeof classNames === 'function'
        ? classNames({ props: resolvedProps })
        : classNames;
    const slots =
      typeof styles === 'function' ? styles({ props: resolvedProps }) : styles;
    const color = Array.isArray(strokeColor) ? strokeColor[0] : strokeColor;
    const gradient = color && typeof color === 'object' ? color : undefined;
    const stops = gradient ? gradientStops(gradient) : [];
    const gradientId = `tao-progress-${useId().replace(/:/g, '')}`;
    const trackColor = typeof color === 'string' ? color : undefined;
    const rail = railColor ?? trailColor;
    const infoPosition = percentPosition.type ?? 'outer';
    const infoAlign = percentPosition.align ?? 'end';
    const count = typeof steps === 'number' ? steps : steps?.count;
    const radiusStyle = strokeLinecap === 'round' ? undefined : 0;
    const info = showInfo ? (
      <span
        data-tao-progress-indicator=""
        className={cx(`${prefixCls}-indicator`, names?.indicator)}
        style={slots?.indicator}
      >
        {format ? (
          format(value, successValue)
        ) : infoPosition === 'inner' ||
          resolvedStatus === 'normal' ||
          resolvedStatus === 'active' ? (
          `${value}%`
        ) : (
          <StatusIcon status={resolvedStatus} />
        )}
      </span>
    ) : null;

    let content: ReactNode;
    if (type === 'line') {
      const isNumeric = typeof size === 'number';
      const dimensions = Array.isArray(size)
        ? size
        : typeof size === 'object'
          ? [size.width, size.height]
          : undefined;
      const lineWidth = isNumeric ? size : dimensions?.[0];
      const height = isNumeric
        ? size
        : (dimensions?.[1] ??
          strokeWidth ??
          (size === 'small' && !count ? 6 : 8));
      if (count) {
        const unitWidth = lineWidth ?? (size === 'small' ? 2 : 14);
        const filled = rounding((count * value) / 100);
        const stepNumbers = Array.from({ length: count }, (_, index) => index);
        content = (
          <div
            data-tao-progress-body=""
            data-tao-progress-steps=""
            className={cx(`${prefixCls}-body`, names?.body)}
            style={slots?.body}
          >
            {stepNumbers.map((index) => (
              <span
                key={`step-${index}`}
                data-tao-progress-step=""
                data-tao-active={index < filled || undefined}
                className={cx(`${prefixCls}-steps-item`, names?.track)}
                style={{
                  width: unitWidth,
                  height,
                  borderRadius: radiusStyle,
                  background:
                    index < filled
                      ? Array.isArray(strokeColor)
                        ? strokeColor[index]
                        : trackColor
                      : rail,
                  ...slots?.track,
                }}
              />
            ))}
            {info}
          </div>
        );
      } else {
        const background = gradient
          ? `linear-gradient(${gradient.direction ?? 'to right'}, ${stops.map((stop) => `${stop.color} ${stop.offset}%`).join(', ')})`
          : trackColor;
        content = (
          <div
            data-tao-progress-body=""
            className={cx(`${prefixCls}-body`, names?.body)}
            style={{ width: lineWidth ?? '100%', ...slots?.body }}
          >
            <div
              data-tao-progress-rail=""
              className={cx(`${prefixCls}-rail`, names?.rail)}
              style={{
                height,
                borderRadius: radiusStyle,
                background: rail,
                ...slots?.rail,
              }}
            >
              <div
                data-tao-progress-track=""
                className={cx(`${prefixCls}-track`, names?.track)}
                style={{
                  width: `${value}%`,
                  borderRadius: radiusStyle,
                  background,
                  ...slots?.track,
                }}
              />
              {success?.percent !== undefined && (
                <div
                  data-tao-progress-track=""
                  data-tao-success=""
                  className={cx(
                    `${prefixCls}-track`,
                    `${prefixCls}-track-success`,
                    names?.track,
                  )}
                  style={{
                    width: `${successValue}%`,
                    borderRadius: radiusStyle,
                    background: success.strokeColor,
                    ...slots?.track,
                  }}
                />
              )}
              {infoPosition === 'inner' && info}
            </div>
            {infoPosition === 'outer' && info}
          </div>
        );
      }
    } else {
      const diameter =
        typeof size === 'number'
          ? size
          : Array.isArray(size)
            ? size[0]
            : typeof size === 'object'
              ? (size.width ?? size.height ?? 120)
              : size === 'small'
                ? 60
                : 120;
      const numericDiameter = typeof diameter === 'number' ? diameter : 120;
      const thickness = strokeWidth ?? Math.max(300 / numericDiameter, 6);
      const radius = 50 - thickness / 2;
      const gap = Math.min(
        295,
        Math.max(0, gapDegree ?? (type === 'dashboard' ? 75 : 0)),
      );
      const placement = gapPlacement ?? gapPosition ?? 'bottom';
      const center =
        placement === 'top'
          ? 270
          : placement === 'left' || placement === 'start'
            ? 180
            : placement === 'right' || placement === 'end'
              ? 0
              : 90;
      const start = gap ? center + gap / 2 : -90;
      const sweep = 360 - gap;
      const path = arcPath(radius, start, sweep);
      const circleStroke = gradient ? `url(#${gradientId})` : trackColor;
      const stepNumbers = Array.from(
        { length: count ?? 0 },
        (_, index) => index,
      );
      const stepGap = typeof steps === 'object' ? steps.gap : 2;
      const gapAngle = (stepGap * 180) / (Math.PI * radius);
      const filled = count
        ? Math.round((count * clamp(value - successValue)) / 100)
        : 0;
      const circleContent = (
        <div
          data-tao-progress-body=""
          data-tao-small-circle={numericDiameter <= 20 || undefined}
          data-tao-gap-placement={placement}
          className={cx(`${prefixCls}-body`, names?.body)}
          style={{
            width: diameter,
            height: diameter,
            fontSize: numericDiameter * 0.15 + 6,
            ...slots?.body,
          }}
        >
          <svg
            data-tao-progress-circle=""
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
          >
            {gradient && (
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                  {stops.map((stop) => (
                    <stop
                      key={stop.offset}
                      offset={`${stop.offset}%`}
                      stopColor={stop.color}
                    />
                  ))}
                </linearGradient>
              </defs>
            )}
            {count ? (
              stepNumbers.map((index) => (
                <path
                  key={`step-${index}`}
                  data-tao-progress-step=""
                  data-tao-active={index < filled || undefined}
                  d={arcPath(
                    radius,
                    start + (index * sweep) / count + gapAngle / 2,
                    Math.max(0, sweep / count - gapAngle),
                  )}
                  className={cx(`${prefixCls}-track`, names?.track)}
                  strokeWidth={thickness}
                  strokeLinecap="butt"
                  style={{
                    stroke: index < filled ? circleStroke : rail,
                    ...slots?.track,
                  }}
                />
              ))
            ) : (
              <>
                <path
                  data-tao-progress-rail=""
                  className={cx(`${prefixCls}-rail`, names?.rail)}
                  d={path}
                  pathLength="100"
                  strokeWidth={thickness}
                  strokeLinecap={strokeLinecap}
                  style={{ stroke: rail, ...slots?.rail }}
                />
                {value > 0 && (
                  <path
                    data-tao-progress-track=""
                    className={cx(`${prefixCls}-track`, names?.track)}
                    d={path}
                    pathLength="100"
                    strokeWidth={thickness}
                    strokeLinecap={strokeLinecap}
                    strokeDasharray={`${value} 100`}
                    style={{ stroke: circleStroke, ...slots?.track }}
                  />
                )}
                {successValue > 0 && (
                  <path
                    data-tao-progress-track=""
                    data-tao-success=""
                    className={cx(`${prefixCls}-track`, names?.track)}
                    d={path}
                    pathLength="100"
                    strokeWidth={thickness}
                    strokeLinecap={strokeLinecap}
                    strokeDasharray={`${successValue} 100`}
                    style={{ stroke: success?.strokeColor, ...slots?.track }}
                  />
                )}
              </>
            )}
          </svg>
          {numericDiameter > 20 && info}
        </div>
      );
      content =
        numericDiameter <= 20 && showInfo ? (
          <Tooltip title={format ? format(value, successValue) : `${value}%`}>
            {circleContent}
          </Tooltip>
        ) : (
          circleContent
        );
    }

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={props['aria-label']}
        aria-labelledby={props['aria-labelledby']}
        data-tao-progress=""
        data-tao-type={type}
        data-tao-status={resolvedStatus}
        data-tao-info-position={infoPosition}
        data-tao-info-align={infoAlign}
        className={cx(
          prefixCls,
          `${prefixCls}-status-${resolvedStatus}`,
          names?.root,
          className,
          rootClassName,
        )}
        style={{ ...slots?.root, ...style }}
      >
        {content}
      </div>
    );
  },
);
