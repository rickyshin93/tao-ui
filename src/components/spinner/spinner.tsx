import { type CSSProperties, type ReactNode, useEffect, useState } from 'react';
import { type TaoSize, useTaoConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import './spinner.css';

export type SpinnerSemanticPart = 'root' | 'indicator' | 'tip' | 'overlay';

export interface SpinnerProps {
  /** Whether the spinner is visible. Defaults to true. */
  spinning?: boolean;
  /** Size of the indicator. Inherits from TaoProvider. */
  size?: TaoSize;
  /** Description text rendered under the indicator. */
  tip?: ReactNode;
  /** Delay (ms) before showing the spinner — prevents flicker on fast loads. */
  delay?: number;
  /** Custom indicator node, replaces the default spinner. */
  indicator?: ReactNode;
  /** Wrap content: the spinner overlays `children` while spinning. */
  children?: ReactNode;
  /** Render a full-screen backdrop with a centered spinner. */
  fullscreen?: boolean;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<SpinnerSemanticPart>;
  styles?: SemanticStyles<SpinnerSemanticPart>;
}

export function Spinner({
  spinning = true,
  size,
  tip,
  delay,
  indicator,
  children,
  fullscreen = false,
  className,
  style,
  classNames,
  styles,
}: SpinnerProps) {
  const ctx = useTaoConfig();
  const resolvedSize = size ?? ctx.size;

  // Delay: hold off showing the spinner for `delay` ms after it turns on.
  const [active, setActive] = useState(delay ? false : spinning);
  useEffect(() => {
    if (delay && spinning) {
      const t = setTimeout(() => setActive(true), delay);
      return () => clearTimeout(t);
    }
    setActive(spinning);
  }, [spinning, delay]);

  const spinnerCore = (
    <span
      data-tao-spinner=""
      data-tao-size={resolvedSize}
      className={cx(classNames?.root, !children && !fullscreen && className)}
      style={
        !children && !fullscreen ? { ...styles?.root, ...style } : styles?.root
      }
      role="status"
      aria-live="polite"
    >
      <span
        data-tao-spinner-indicator=""
        className={cx(classNames?.indicator)}
        style={styles?.indicator}
      >
        {indicator ?? <DefaultIndicator />}
      </span>
      {tip != null && (
        <span
          data-tao-spinner-tip=""
          className={cx(classNames?.tip)}
          style={styles?.tip}
        >
          {tip}
        </span>
      )}
    </span>
  );

  // ---- Full-screen backdrop ----
  if (fullscreen) {
    if (!active) return null;
    return (
      <div
        data-tao-spinner-fullscreen=""
        className={cx(classNames?.overlay, className)}
        style={{ ...styles?.overlay, ...style }}
      >
        {spinnerCore}
      </div>
    );
  }

  // ---- Wrapper / overlay mode ----
  if (children != null) {
    return (
      <div
        data-tao-spinner-container=""
        data-tao-spinning={active || undefined}
        className={className}
        style={style}
      >
        <div data-tao-spinner-content="">{children}</div>
        {active && (
          <div
            data-tao-spinner-overlay=""
            className={cx(classNames?.overlay)}
            style={styles?.overlay}
          >
            {spinnerCore}
          </div>
        )}
      </div>
    );
  }

  // ---- Standalone ----
  if (!active) return null;
  return spinnerCore;
}

function DefaultIndicator() {
  return (
    <svg data-tao-spinner-svg="" viewBox="0 0 50 50" fill="none" aria-hidden>
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="90 40"
      />
    </svg>
  );
}
