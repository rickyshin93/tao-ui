import type { CSSProperties, ReactNode } from 'react';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { TaoPortalScope, useTaoConfig } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Button } from '../button/button';
import './sonner.css';

export type SonnerSemanticPart =
  | 'viewport'
  | 'toast'
  | 'content'
  | 'title'
  | 'description'
  | 'actions'
  | 'action'
  | 'cancel'
  | 'close';

export type SonnerType =
  | 'default'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading'
  | 'custom';
export type SonnerPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface SonnerAction {
  label: ReactNode;
  onClick?: () => void;
}

export interface SonnerToastOptions {
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  action?: SonnerAction;
  cancel?: SonnerAction;
  duration?: number;
  closable?: boolean;
}

export interface SonnerPromiseMessages<T> {
  loading: SonnerToastOptions | ReactNode;
  success?:
    | SonnerToastOptions
    | ReactNode
    | ((value: T) => SonnerToastOptions | ReactNode);
  error?:
    | SonnerToastOptions
    | ReactNode
    | ((error: unknown) => SonnerToastOptions | ReactNode);
}

export interface SonnerToastItem extends SonnerToastOptions {
  id: string;
  type: SonnerType;
  createdAt: number;
  custom?: ReactNode;
  /** @deprecated Toast lifecycle state is internal and no longer exposed. */
  removing?: boolean;
}

export interface SonnerProps {
  position?: SonnerPosition;
  visibleToasts?: number;
  offset?: number;
  gap?: number;
  expand?: boolean;
  richColors?: boolean;
  closeButton?: boolean;
  duration?: number;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<SonnerSemanticPart>;
  styles?: SemanticStyles<SonnerSemanticPart>;
}

type Listener = () => void;

interface SonnerStoreState {
  toasts: StoredToast[];
}

type StoredToast = Omit<SonnerToastItem, 'removing'> &
  ({ phase: 'active' } | { phase: 'exiting' });

interface ToastRuntime {
  generation: number;
  dismissTimer?: ReturnType<typeof setTimeout>;
  removeTimer?: ReturnType<typeof setTimeout>;
}

const listeners = new Set<Listener>();
let state: SonnerStoreState = { toasts: [] };
let seed = 0;
let generationSeed = 0;
const runtimes = new Map<string, ToastRuntime>();
const REMOVE_DELAY = 220;

function emit() {
  listeners.forEach((listener) => {
    listener();
  });
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function clearRuntimeTimers(runtime: ToastRuntime) {
  if (runtime.dismissTimer) clearTimeout(runtime.dismissTimer);
  if (runtime.removeTimer) clearTimeout(runtime.removeTimer);
  runtime.dismissTimer = undefined;
  runtime.removeTimer = undefined;
}

function beginExit(id: string) {
  const runtime = runtimes.get(id);
  if (!runtime || !state.toasts.some((toast) => toast.id === id)) return;
  clearRuntimeTimers(runtime);
  state = {
    toasts: state.toasts.map((toast) =>
      toast.id === id ? { ...toast, phase: 'exiting' } : toast,
    ),
  };
  emit();
  const generation = runtime.generation;
  runtime.removeTimer = setTimeout(() => {
    const current = runtimes.get(id);
    if (!current || current.generation !== generation) return;
    runtimes.delete(id);
    state = { toasts: state.toasts.filter((toast) => toast.id !== id) };
    emit();
  }, REMOVE_DELAY);
}

function dismiss(id?: string) {
  if (id) {
    beginExit(id);
    return;
  }
  for (const toast of state.toasts) beginExit(toast.id);
}

function scheduleDismiss(id: string, duration: number | undefined) {
  const runtime = runtimes.get(id);
  if (!runtime) return;
  if (runtime.dismissTimer) clearTimeout(runtime.dismissTimer);
  if (duration == null || duration <= 0) return;
  const generation = runtime.generation;
  runtime.dismissTimer = setTimeout(() => {
    if (runtimes.get(id)?.generation === generation) beginExit(id);
  }, duration);
}

function isToastOptions(
  value: SonnerToastOptions | ReactNode,
): value is SonnerToastOptions {
  return (
    value != null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !('$$typeof' in value)
  );
}

function normalizeOptions(
  options: SonnerToastOptions | ReactNode,
): SonnerToastOptions {
  return isToastOptions(options)
    ? options
    : ({ title: options } as SonnerToastOptions);
}

function create(
  type: SonnerType,
  options: SonnerToastOptions | ReactNode,
  custom?: ReactNode,
) {
  const normalized = normalizeOptions(options);
  const id = normalized.id ?? `toast-${Date.now()}-${seed++}`;
  const previousRuntime = runtimes.get(id);
  if (previousRuntime) clearRuntimeTimers(previousRuntime);
  const runtime: ToastRuntime = { generation: generationSeed++ };
  runtimes.set(id, runtime);
  const next: StoredToast = {
    ...normalized,
    id,
    type,
    createdAt: Date.now(),
    custom,
    phase: 'active',
  };

  state = {
    toasts: [...state.toasts.filter((toast) => toast.id !== id), next],
  };
  emit();
  scheduleDismiss(id, normalized.duration);
  return id;
}

function replacePromiseToast(
  id: string,
  type: 'success' | 'error',
  options: SonnerToastOptions | ReactNode,
) {
  const normalized = normalizeOptions(options);
  create(type, { ...normalized, id });
}

function resolveDataType(type: SonnerType, richColors: boolean) {
  if (type === 'custom') return 'custom';
  if (type === 'loading') return 'loading';
  if (!richColors) return 'default';
  return type;
}

function getAriaLabel(type: SonnerType) {
  switch (type) {
    case 'success':
      return 'Success notification';
    case 'error':
      return 'Error notification';
    case 'warning':
      return 'Warning notification';
    case 'info':
      return 'Info notification';
    case 'loading':
      return 'Loading notification';
    default:
      return 'Notification';
  }
}

function renderPromiseState<T>(
  stateValue:
    | SonnerToastOptions
    | ReactNode
    | ((value: T) => SonnerToastOptions | ReactNode)
    | ((error: unknown) => SonnerToastOptions | ReactNode)
    | undefined,
  payload: T | unknown,
) {
  if (!stateValue) return undefined;
  if (typeof stateValue === 'function') {
    return stateValue(payload as never);
  }
  return stateValue;
}

export function Sonner({
  position = 'bottom-right',
  visibleToasts = 3,
  offset = 24,
  gap = 12,
  expand = true,
  richColors = false,
  closeButton = false,
  duration = 4000,
  className,
  style,
  classNames,
  styles,
}: SonnerProps) {
  useTaoConfig();
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [heights, setHeights] = useState<Map<string, number>>(() => new Map());

  useEffect(() => {
    for (const toast of snapshot.toasts) {
      const runtime = runtimes.get(toast.id);
      if (toast.phase === 'active' && runtime && !runtime.dismissTimer) {
        scheduleDismiss(toast.id, toast.duration ?? duration);
      }
    }
  }, [duration, snapshot.toasts]);

  const visible = useMemo(() => {
    const toasts = snapshot.toasts;
    const sliced = expand ? toasts : toasts.slice(-visibleToasts);
    return sliced.slice(-visibleToasts).reverse();
  }, [expand, snapshot.toasts, visibleToasts]);

  const frontToastHeight = heights.get(visible[0]?.id ?? '') ?? 0;
  let nextOffset = 0;

  return (
    <TaoPortalScope>
      <div
        className={cx(classNames?.viewport, className)}
        style={{
          ...styles?.viewport,
          ...style,
          ['--tao-sonner-offset' as string]: `${offset}px`,
          ['--tao-sonner-gap' as string]: `${gap}px`,
          ['--tao-sonner-front-height' as string]: `${frontToastHeight}px`,
        }}
        data-tao-sonner-viewport=""
        data-tao-position={position}
      >
        {visible.map((toast, index) => {
          const showClose = toast.closable ?? closeButton;
          const yPosition = position.startsWith('top') ? 'top' : 'bottom';
          const toastOffset = nextOffset;
          nextOffset += (heights.get(toast.id) ?? 0) + gap;
          return (
            <ToastView
              key={toast.id}
              toast={toast}
              richColors={richColors}
              showClose={showClose}
              yPosition={yPosition}
              index={index}
              visibleToasts={visible.length}
              expanded={expand}
              offset={toastOffset}
              frontToastHeight={frontToastHeight}
              setHeights={setHeights}
              classNames={classNames}
              styles={styles}
            />
          );
        })}
      </div>
    </TaoPortalScope>
  );
}

interface ToastViewProps {
  toast: StoredToast;
  richColors: boolean;
  showClose: boolean;
  yPosition: 'top' | 'bottom';
  index: number;
  visibleToasts: number;
  expanded: boolean;
  offset: number;
  frontToastHeight: number;
  setHeights: React.Dispatch<React.SetStateAction<Map<string, number>>>;
  classNames?: SemanticClassNames<SonnerSemanticPart>;
  styles?: SemanticStyles<SonnerSemanticPart>;
}

function ToastView({
  toast,
  richColors,
  showClose,
  yPosition,
  index,
  visibleToasts,
  expanded,
  offset,
  frontToastHeight,
  setHeights,
  classNames,
  styles,
}: ToastViewProps) {
  const [mounted, setMounted] = useState(false);
  const [offsetBeforeRemove, setOffsetBeforeRemove] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (toast.phase === 'exiting') setOffsetBeforeRemove(offset);
  }, [offset, toast.phase]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: toast content changes can change its measured height.
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const nextHeight = node.getBoundingClientRect().height;
    setHeights((current) => {
      if (current.get(toast.id) === nextHeight) return current;
      const next = new Map(current);
      next.set(toast.id, nextHeight);
      return next;
    });

    return () => {
      setHeights((current) => {
        if (!current.has(toast.id)) return current;
        const next = new Map(current);
        next.delete(toast.id);
        return next;
      });
    };
  }, [
    setHeights,
    toast.description,
    toast.id,
    toast.title,
    toast.action,
    toast.cancel,
    toast.custom,
  ]);

  const isFront = index === 0;
  const isVisible = index < visibleToasts;
  const activeOffset = toast.phase === 'exiting' ? offsetBeforeRemove : offset;

  return (
    <div
      ref={ref}
      className={cx(classNames?.toast)}
      role="status"
      aria-live="polite"
      aria-label={getAriaLabel(toast.type)}
      data-tao-sonner-toast=""
      data-tao-type={resolveDataType(toast.type, richColors)}
      data-tao-mounted={mounted}
      data-tao-y-position={yPosition}
      data-tao-removing={toast.phase === 'exiting' ? 'true' : 'false'}
      data-tao-front={isFront ? 'true' : 'false'}
      data-tao-expanded={expanded ? 'true' : 'false'}
      data-tao-visible={isVisible ? 'true' : 'false'}
      style={{
        ...styles?.toast,
        ['--tao-sonner-toasts-before' as string]: String(index),
        ['--tao-sonner-offset-y' as string]: `${activeOffset}px`,
        ['--tao-sonner-front-height' as string]: `${frontToastHeight}px`,
        ['--tao-sonner-z-index' as string]: String(visibleToasts - index),
      }}
    >
      {toast.custom ? (
        toast.custom
      ) : (
        <>
          <div
            className={cx(classNames?.content)}
            style={styles?.content}
            data-tao-sonner-content=""
          >
            {toast.title ? (
              <div
                className={cx(classNames?.title)}
                style={styles?.title}
                data-tao-sonner-title=""
              >
                {toast.title}
              </div>
            ) : null}
            {toast.description ? (
              <div
                className={cx(classNames?.description)}
                style={styles?.description}
                data-tao-sonner-description=""
              >
                {toast.description}
              </div>
            ) : null}
          </div>
          {(toast.action || toast.cancel || showClose) && (
            <div
              className={cx(classNames?.actions)}
              style={styles?.actions}
              data-tao-sonner-actions=""
              data-tao-close-only={
                !toast.action && !toast.cancel && showClose ? '' : undefined
              }
            >
              {toast.cancel ? (
                <Button
                  variant="ghost"
                  size="small"
                  className={cx(classNames?.cancel)}
                  style={styles?.cancel}
                  onClick={() => {
                    toast.cancel?.onClick?.();
                    dismiss(toast.id);
                  }}
                >
                  {toast.cancel.label}
                </Button>
              ) : null}
              {toast.action ? (
                <Button
                  variant="secondary"
                  size="small"
                  className={cx(classNames?.action)}
                  style={styles?.action}
                  onClick={() => {
                    toast.action?.onClick?.();
                    dismiss(toast.id);
                  }}
                >
                  {toast.action.label}
                </Button>
              ) : null}
              {showClose ? (
                <button
                  type="button"
                  aria-label="Close notification"
                  className={cx(classNames?.close)}
                  style={styles?.close}
                  data-tao-sonner-close=""
                  onClick={() => dismiss(toast.id)}
                >
                  ×
                </button>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const baseToast = (options: SonnerToastOptions | ReactNode) =>
  create('default', options);

export const toast = Object.assign(baseToast, {
  success: (options: SonnerToastOptions | ReactNode) =>
    create('success', options),
  error: (options: SonnerToastOptions | ReactNode) => create('error', options),
  warning: (options: SonnerToastOptions | ReactNode) =>
    create('warning', options),
  info: (options: SonnerToastOptions | ReactNode) => create('info', options),
  loading: (options: SonnerToastOptions | ReactNode) =>
    create(
      'loading',
      isToastOptions(options)
        ? { ...options, duration: options.duration ?? 0 }
        : { title: options, duration: 0 },
    ),
  custom: (
    node: ReactNode,
    options: Omit<SonnerToastOptions, 'title' | 'description'> = {},
  ) => create('custom', options, node),
  promise: async <T,>(
    promise: Promise<T>,
    messages: SonnerPromiseMessages<T>,
  ) => {
    const id = create(
      'loading',
      isToastOptions(messages.loading)
        ? { ...messages.loading, duration: messages.loading.duration ?? 0 }
        : { title: messages.loading, duration: 0 },
    );

    try {
      const value = await promise;
      const success = renderPromiseState(messages.success, value);
      if (success) replacePromiseToast(id, 'success', success);
      else dismiss(id);
      return value;
    } catch (error) {
      const failure = renderPromiseState(messages.error, error);
      if (failure) replacePromiseToast(id, 'error', failure);
      else dismiss(id);
      throw error;
    }
  },
  dismiss,
});
