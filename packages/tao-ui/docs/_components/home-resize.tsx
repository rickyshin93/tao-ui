/* Hero stage: a real app in an independent iframe viewport whose width moves
 * across the 576px breakpoint, so the same Select/DatePicker switch from desktop
 * popups to mobile drawers. Visitors can drag the edge or use arrow keys. */
import { useDark, useLang, withBase } from '@rspress/core/runtime';
import {
  AnimatePresence,
  type AnimationPlaybackControls,
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

const MIN = 360;
const MAX = 1200;
const WIDE = 780;
const NARROW = 390;
const BREAKPOINT = 576;
const HEIGHT = 500;
const BAR = 40;
const ease = [0.65, 0, 0.35, 1] as const;

export function HomeResize({ seed }: { seed: string }) {
  const zh = useLang() === 'zh';
  const dark = useDark();
  const reduced = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  const iframe = useRef<HTMLIFrameElement>(null);
  const running = useRef<AnimationPlaybackControls | null>(null);
  const [available, setAvailable] = useState(MAX);
  const [manual, setManual] = useState(false);
  const [mobile, setMobile] = useState(false);
  const inView = useInView(stage, { amount: 0.4 });
  const width = useMotionValue(WIDE);
  const label = useTransform(width, (value) => String(Math.round(value)));
  const scale = Math.min(1, available / MAX);

  useMotionValueEvent(width, 'change', (value) => {
    setMobile(value < BREAKPOINT);
    handle.current?.setAttribute('aria-valuenow', String(Math.round(value)));
    handle.current?.setAttribute('aria-valuetext', `${Math.round(value)}px`);
  });

  const demoId = zh ? '_zh_index_1' : '_en_index_1';
  const src =
    import.meta.env.DEV && process.env.RSPRESS_IFRAME_DEV_PORT
      ? `http://${window.location.hostname}:${process.env.RSPRESS_IFRAME_DEV_PORT}/${demoId}`
      : withBase(`/~demo/${demoId}`);

  const post = useCallback(
    (data: Record<string, unknown>) =>
      iframe.current?.contentWindow?.postMessage(
        { type: 'home-phone', chrome: 'window', ...data },
        '*',
      ),
    [],
  );

  const takeOver = useCallback(() => {
    running.current?.stop();
    setManual(true);
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setAvailable(entry.contentRect.width),
    );
    observer.observe(stage.current!);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sync = () => {
      iframe.current?.contentWindow?.postMessage(
        { type: 'theme-change', dark },
        '*',
      );
      post({ seed });
    };
    const receive = (event: MessageEvent) => {
      if (event.source !== iframe.current?.contentWindow) return;
      if (
        event.data?.type === 'home-phone-ready' ||
        event.data?.type === 'tao-demo-ready'
      )
        sync();
      if (event.data?.type === 'home-phone-manual') takeOver();
    };
    window.addEventListener('message', receive);
    sync();
    return () => window.removeEventListener('message', receive);
  }, [dark, seed, post, takeOver]);

  // The scripted tour: desktop pick -> shrink past 576 -> mobile pick -> date drawer -> back.
  useEffect(() => {
    if (!inView && !manual) post({ scene: 'idle' });
    if (manual || reduced || !inView) return;
    let cancelled = false;
    const wait = (ms: number) =>
      new Promise((resolve) => window.setTimeout(resolve, ms));
    const resize = async (to: number, duration: number) => {
      running.current = animate(width, to, { duration, ease });
      await running.current;
    };
    (async () => {
      while (!cancelled) {
        post({ scene: 'idle' });
        await resize(WIDE, 1.4);
        if (cancelled) return;
        await wait(500);
        post({ scene: 'pick' });
        await wait(3200);
        if (cancelled) return;
        post({ scene: 'idle' });
        await wait(300);
        await resize(NARROW, 1.8);
        if (cancelled) return;
        await wait(500);
        post({ scene: 'pick' });
        await wait(3400);
        if (cancelled) return;
        post({ scene: 'date' });
        await wait(2600);
      }
    })();
    return () => {
      cancelled = true;
      running.current?.stop();
    };
  }, [manual, reduced, inView, width, post]);

  const setFromPointer = (clientX: number) => {
    const left = frame.current!.getBoundingClientRect().left;
    width.set(Math.min(MAX, Math.max(MIN, (clientX - left) / scale)));
  };

  const ticks = Array.from({ length: MAX / 20 + 1 }, (_, index) => index * 20);

  return (
    <div className="tao-resize">
      <div
        ref={stage}
        className="tao-resize-stage"
        style={{ height: (HEIGHT + 36) * scale }}
        data-mobile={mobile || undefined}
      >
        <svg
          className="tao-ruler"
          width={MAX * scale}
          height={28}
          aria-hidden="true"
        >
          {ticks.map((tick) => (
            <line
              key={tick}
              x1={tick * scale + 0.5}
              x2={tick * scale + 0.5}
              y1={tick % 100 === 0 ? 10 : 18}
              y2={28}
            />
          ))}
          {[200, 400, 800, 1000].map((tick) => (
            <text key={tick} x={tick * scale + 4} y={10}>
              {tick}
            </text>
          ))}
        </svg>
        <div className="tao-breakpoint" style={{ left: BREAKPOINT * scale }}>
          <span>{zh ? '576px 断点' : '576px breakpoint'}</span>
        </div>

        <div
          ref={frame}
          className="tao-window-layer"
          style={{ top: 36, transform: `scale(${scale})` }}
        >
          <motion.div className="tao-window" style={{ width, height: HEIGHT }}>
            <div className="tao-window-bar" style={{ height: BAR }}>
              <span className="tao-window-url">tao-ui.app/trips/new</span>
              <span className="tao-window-size">
                <motion.span>{label}</motion.span>px
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.b
                    key={String(mobile)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    {mobile
                      ? zh
                        ? '移动端'
                        : 'Mobile'
                      : zh
                        ? '桌面'
                        : 'Desktop'}
                  </motion.b>
                </AnimatePresence>
              </span>
            </div>
            <iframe
              ref={iframe}
              src={src}
              title={
                zh
                  ? '可调整宽度的真实组件视口'
                  : 'Resizable viewport with real components'
              }
              style={{ height: HEIGHT - BAR }}
            />
            <div
              ref={handle}
              role="slider"
              tabIndex={0}
              aria-label={zh ? '视口宽度' : 'Viewport width'}
              aria-valuemin={MIN}
              aria-valuemax={MAX}
              aria-valuenow={WIDE}
              aria-valuetext={`${WIDE}px`}
              className="tao-window-handle"
              onPointerDown={(event) => {
                takeOver();
                event.currentTarget.setPointerCapture(event.pointerId);
                setFromPointer(event.clientX);
              }}
              onPointerMove={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId))
                  setFromPointer(event.clientX);
              }}
              onKeyDown={(event) => {
                const step = event.shiftKey ? 50 : 10;
                if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
                  return;
                event.preventDefault();
                takeOver();
                const next =
                  width.get() + (event.key === 'ArrowRight' ? step : -step);
                width.set(Math.min(MAX, Math.max(MIN, next)));
              }}
            >
              <i />
            </div>
          </motion.div>
        </div>
      </div>
      <p className="tao-resize-caption">
        {zh
          ? '拖动窗口右边缘或用方向键调整宽度。越过 576px，同一份代码里的 Select 与 DatePicker 换成底部抽屉。'
          : 'Drag the right edge or use the arrow keys. Past 576px, the same Select and DatePicker code switches to bottom drawers.'}
        {manual ? (
          <button type="button" onClick={() => setManual(false)}>
            {zh ? '重新演示' : 'Replay'}
          </button>
        ) : null}
      </p>
    </div>
  );
}
