import { FocusScope } from '@radix-ui/react-focus-scope';
import RcTour, {
  type TourProps as RcTourProps,
  type TourStepProps as RcTourStepProps,
} from '@rc-component/tour';
import { getPlacements } from '@rc-component/tour/es/placements';
import {
  type CSSProperties,
  type MouseEventHandler,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  TaoPortalScope,
  useTaoInternalConfig,
} from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { Button } from '../button/button';
import { CloseIcon } from '../select/select-icons';
import './tour.css';
import { interopDefault } from '../../utils/interop-default';

const RcTourComponent = /*#__PURE__*/ interopDefault(RcTour);

export type TourSemanticPart =
  | 'root'
  | 'cover'
  | 'close'
  | 'mask'
  | 'section'
  | 'footer'
  | 'actions'
  | 'indicator'
  | 'indicators'
  | 'header'
  | 'title'
  | 'description';
export type TourSemanticType = {
  classNames?: SemanticClassNames<TourSemanticPart>;
  styles?: SemanticStyles<TourSemanticPart>;
};
export interface TourLocale {
  Next: string;
  Previous: string;
  Finish: string;
}
type TourButtonProps = {
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  style?: CSSProperties;
};
export interface TourStepProps
  extends Omit<RcTourStepProps, 'styles' | 'classNames'> {
  cover?: ReactNode;
  nextButtonProps?: TourButtonProps;
  prevButtonProps?: TourButtonProps;
  type?: 'default' | 'primary';
  classNames?: TourSemanticType['classNames'];
  styles?: TourSemanticType['styles'];
}
export interface TourProps
  extends Omit<RcTourProps, 'renderPanel' | 'steps' | 'classNames' | 'styles'> {
  steps?: TourStepProps[];
  indicatorsRender?: (current: number, total: number) => ReactNode;
  actionsRender?: (
    originNode: ReactNode,
    info: { current: number; total: number },
  ) => ReactNode;
  type?: 'default' | 'primary';
  classNames?:
    | TourSemanticType['classNames']
    | ((info: { props: TourProps }) => TourSemanticType['classNames']);
  styles?:
    | TourSemanticType['styles']
    | ((info: { props: TourProps }) => TourSemanticType['styles']);
}

function TourPanel({
  step,
  current,
  type,
  indicatorsRender,
  actionsRender,
  classes,
  styles,
  masked,
  disabledInteraction,
  stepActions,
}: {
  step: TourStepProps;
  current: number;
  type: TourProps['type'];
  indicatorsRender: TourProps['indicatorsRender'];
  actionsRender: TourProps['actionsRender'];
  classes: TourSemanticType['classNames'];
  styles: TourSemanticType['styles'];
  masked: boolean;
  disabledInteraction?: boolean;
  stepActions?: TourStepProps;
}) {
  const { locale, mode, compact, tokenStyle } = useTaoInternalConfig();
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [hasTarget, setHasTarget] = useState(false);
  useLayoutEffect(() => {
    if (!masked || disabledInteraction) return;
    const target =
      typeof step.target === 'function' ? step.target() : step.target;
    const available = Boolean(target);
    if (available !== hasTarget) setHasTarget(available);
  });
  const modal = masked && (disabledInteraction || !hasTarget);
  const {
    total = 1,
    title,
    description,
    cover,
    nextButtonProps,
    prevButtonProps,
    closable = true,
  } = step;
  const cn = { ...classes, ...step.classNames };
  const st = { ...styles, ...step.styles };
  const primary = (step.type ?? type) === 'primary';
  const last = current === total - 1;
  const closeProps = closable && typeof closable === 'object' ? closable : {};
  const { closeIcon, ...closeAttrs } = closeProps;
  useEffect(() => {
    const popup = panelRef.current!.parentElement!;
    popup.dataset.taoTourPopup = '';
    popup.dataset.taoProvider = '';
    if (mode === 'light') delete popup.dataset.taoTheme;
    else popup.dataset.taoTheme = mode;
    if (compact) popup.dataset.taoDensity = 'compact';
    else delete popup.dataset.taoDensity;
    for (const [name, value] of Object.entries(tokenStyle ?? {}))
      popup.style.setProperty(name, String(value));
  }, [mode, compact, tokenStyle]);
  const actions = (
    <>
      {current > 0 && (
        <Button
          size="small"
          variant={primary ? 'ghost' : 'secondary'}
          {...prevButtonProps}
          onClick={(event) => {
            prevButtonProps?.onClick?.(event);
            if (event.defaultPrevented) return;
            stepActions?.onPrev?.();
            step.onPrev?.();
          }}
        >
          {prevButtonProps?.children ?? locale.previous}
        </Button>
      )}
      <Button
        size="small"
        variant={primary ? 'secondary' : 'primary'}
        {...nextButtonProps}
        onClick={(event) => {
          nextButtonProps?.onClick?.(event);
          if (event.defaultPrevented) return;
          if (last) {
            stepActions?.onFinish?.();
            step.onFinish?.();
          } else {
            stepActions?.onNext?.();
            step.onNext?.();
          }
        }}
      >
        {nextButtonProps?.children ?? (last ? locale.done : locale.next)}
      </Button>
    </>
  );
  return (
    <TaoPortalScope asChild>
      <FocusScope
        asChild
        trapped={modal}
        loop={modal}
        onMountAutoFocus={(event) => {
          event.preventDefault();
          panelRef.current?.focus();
        }}
      >
        <div
          ref={panelRef}
          data-tao-tour=""
          data-type={primary ? 'primary' : 'default'}
          role="dialog"
          aria-modal={modal || undefined}
          aria-labelledby={title != null ? titleId : undefined}
          aria-describedby={description != null ? descriptionId : undefined}
          tabIndex={-1}
          className={cn.root}
          style={st.root}
        >
          <div
            data-tao-tour-section=""
            className={cn.section}
            style={st.section}
          >
            {closable && (
              <button
                type="button"
                data-tao-tour-close=""
                aria-label={locale.close}
                {...closeAttrs}
                className={cn.close}
                style={st.close}
                onClick={() => {
                  stepActions?.onClose?.();
                  step.onClose?.();
                }}
              >
                {closeIcon ?? step.closeIcon ?? <CloseIcon />}
              </button>
            )}
            {cover != null && (
              <div data-tao-tour-cover="" className={cn.cover} style={st.cover}>
                {cover}
              </div>
            )}
            {title != null && (
              <div
                data-tao-tour-header=""
                className={cn.header}
                style={st.header}
              >
                <div
                  id={titleId}
                  data-tao-tour-title=""
                  className={cn.title}
                  style={st.title}
                >
                  {title}
                </div>
              </div>
            )}
            {description != null && (
              <div
                id={descriptionId}
                data-tao-tour-description=""
                className={cn.description}
                style={st.description}
              >
                {description}
              </div>
            )}
            <div
              data-tao-tour-footer=""
              className={cn.footer}
              style={st.footer}
            >
              {total > 1 && (
                <div
                  data-tao-tour-indicators=""
                  className={cn.indicators}
                  style={st.indicators}
                >
                  {indicatorsRender
                    ? indicatorsRender(current, total)
                    : Array.from({ length: total }, (_, index) => index).map(
                        (stepIndex) => (
                          <span
                            key={stepIndex}
                            data-tao-tour-indicator=""
                            data-active={stepIndex === current || undefined}
                            className={cn.indicator}
                            style={st.indicator}
                          />
                        ),
                      )}
                </div>
              )}
              <div
                data-tao-tour-actions=""
                className={cn.actions}
                style={st.actions}
              >
                {actionsRender
                  ? actionsRender(actions, { current, total })
                  : actions}
              </div>
            </div>
          </div>
        </div>
      </FocusScope>
    </TaoPortalScope>
  );
}

export function Tour(props: TourProps) {
  const { tokenStyle } = useTaoInternalConfig();
  const {
    steps = [],
    type,
    indicatorsRender,
    actionsRender,
    classNames,
    styles,
    className,
    style,
    prefixCls = 'tao-tour',
    rootClassName,
    keyboard = true,
    zIndex,
    open,
    defaultOpen,
    onClose,
    ...rest
  } = props;
  const [innerOpen, setInnerOpen] = useState(defaultOpen ?? true);
  const cn =
    typeof classNames === 'function' ? classNames({ props }) : classNames;
  const st = typeof styles === 'function' ? styles({ props }) : styles;
  const layer =
    zIndex ??
    'calc(var(--tao-z-index-base) + var(--tao-z-index-popup-base) + 170)';
  // The engine spreads step props after its navigation callbacks.
  const mergedSteps = steps.map(
    ({
      onClose: _close,
      onFinish: _finish,
      onNext: _next,
      onPrev: _prev,
      ...step
    }) => ({
      ...step,
      scrollIntoViewOptions:
        step.scrollIntoViewOptions ?? props.scrollIntoViewOptions,
      style: {
        ...tokenStyle,
        position: 'absolute' as const,
        zIndex: layer,
        width: 360,
        maxWidth: 'calc(100vw - 24px)',
        ...style,
        ...step.style,
      },
      className: cx(className, step.className),
    }),
  );
  return (
    <RcTourComponent
      {...rest}
      open={open ?? innerOpen}
      onClose={(current) => {
        if (open === undefined) setInnerOpen(false);
        onClose?.(current);
      }}
      prefixCls={prefixCls}
      steps={mergedSteps}
      keyboard={keyboard}
      zIndex={zIndex}
      builtinPlacements={
        props.builtinPlacements ??
        ((config) =>
          Object.fromEntries(
            Object.entries(getPlacements(config?.arrowPointAtCenter)).map(
              ([name, placement]) => [
                name,
                {
                  ...placement,
                  overflow: {
                    adjustX: true,
                    adjustY: true,
                    shiftX: 12,
                    shiftY: 12,
                  },
                },
              ],
            ),
          ))
      }
      rootClassName={rootClassName}
      classNames={{ mask: cx('tao-tour-mask-layer', cn?.mask) }}
      styles={{ mask: { ...tokenStyle, zIndex: layer, ...st?.mask } }}
      renderPanel={(step, current) => (
        <TourPanel
          step={step as TourStepProps}
          stepActions={steps[current]}
          current={current}
          type={type}
          classes={cn}
          styles={st}
          indicatorsRender={indicatorsRender}
          actionsRender={actionsRender}
          masked={(step.mask ?? props.mask) !== false}
          disabledInteraction={props.disabledInteraction}
        />
      )}
    />
  );
}
