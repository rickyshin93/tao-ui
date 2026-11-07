import RcImage, { type ImageProps as RcImageProps } from '@rc-component/image';
import type {
  GroupPreviewConfig as RcGroupPreviewConfig,
  PreviewGroupProps as RcPreviewGroupProps,
} from '@rc-component/image/es/PreviewGroup';
import {
  Children,
  type CSSProperties,
  cloneElement,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTaoInternalConfig } from '../../provider/tao-provider';
import { cx } from '../../utils/semantic';
import { ImageControlIcon } from './image-icons';
import './image.css';
import { interopDefault } from '../../utils/interop-default';

const RcImageComponent = /*#__PURE__*/ interopDefault(RcImage);
const PreviewDisabledContext = createContext(false);

type RcPreviewConfig = Exclude<NonNullable<RcImageProps['preview']>, boolean>;
export type ImageSemanticPart =
  | 'root'
  | 'image'
  | 'cover'
  | 'popup.root'
  | 'popup.mask'
  | 'popup.body'
  | 'popup.footer'
  | 'popup.actions'
  | 'popup.close'
  | 'placeholder.progress.root'
  | 'placeholder.progress.content'
  | 'placeholder.progress.rail'
  | 'placeholder.progress.indicator';
export type ProgressClassNames = Partial<
  Record<'root' | 'content' | 'rail' | 'indicator', string>
>;
export type ProgressStyles = Partial<
  Record<keyof ProgressClassNames, CSSProperties>
>;
export type ImageSemanticType = {
  classNames?: RcImageProps['classNames'] & {
    placeholder?: { progress?: ProgressClassNames };
  };
  styles?: RcImageProps['styles'] & {
    placeholder?: { progress?: ProgressStyles };
  };
};
type ImageMask =
  | boolean
  | { enabled?: boolean; blur?: boolean; closable?: boolean };
export type DeprecatedPreviewConfig = {
  visible?: boolean;
  rootClassName?: string;
  forceRender?: boolean;
  destroyOnClose?: boolean;
  toolbarRender?: RcPreviewConfig['actionsRender'];
};
export type PreviewConfig = Omit<RcPreviewConfig, 'maskClosable'> &
  DeprecatedPreviewConfig & {
    onVisibleChange?: (visible: boolean, prevVisible: boolean) => void;
    maskClassName?: string;
    mask?: ImageMask | ReactNode;
  };
export type GroupPreviewConfig = Omit<
  RcGroupPreviewConfig,
  'maskClosable' | 'toolbarRender'
> &
  Omit<DeprecatedPreviewConfig, 'toolbarRender'> & {
    toolbarRender?: RcGroupPreviewConfig['actionsRender'];
    onVisibleChange?: (
      visible: boolean,
      prevVisible: boolean,
      current: number,
    ) => void;
    mask?: ImageMask;
  };
export interface ImageProgressConfig {
  percent?: number;
  render?: (progress: ReactNode, percent: number) => ReactNode;
}
export type PlaceholderType =
  | ReactNode
  | { progress?: boolean | ImageProgressConfig };
export interface ImageProps
  extends Omit<
    RcImageProps,
    'preview' | 'classNames' | 'styles' | 'placeholder'
  > {
  preview?: boolean | PreviewConfig;
  wrapperStyle?: CSSProperties;
  classNames?:
    | ImageSemanticType['classNames']
    | ((info: { props: ImageProps }) => ImageSemanticType['classNames']);
  styles?:
    | ImageSemanticType['styles']
    | ((info: { props: ImageProps }) => ImageSemanticType['styles']);
  placeholder?: PlaceholderType;
}
export interface PreviewGroupProps
  extends Omit<RcPreviewGroupProps, 'preview' | 'classNames' | 'styles'> {
  preview?: boolean | GroupPreviewConfig;
  classNames?:
    | ImageSemanticType['classNames']
    | ((info: { props: ImageProps }) => ImageSemanticType['classNames']);
  styles?:
    | ImageSemanticType['styles']
    | ((info: { props: ImageProps }) => ImageSemanticType['styles']);
}

function usePreviewContainer(
  getContainer: RcPreviewConfig['getContainer'],
  allowCreate: boolean,
  disabled: boolean,
) {
  const { tokenStyle, mode, compact } = useTaoInternalConfig();
  const containerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (mode === 'light') delete container.dataset.taoTheme;
    else container.dataset.taoTheme = mode;
    if (compact) container.dataset.taoDensity = 'compact';
    else delete container.dataset.taoDensity;
    container.removeAttribute('style');
    for (const [key, value] of Object.entries(tokenStyle ?? {}))
      container.style.setProperty(key, String(value));
  }, [tokenStyle, mode, compact]);
  useEffect(() => {
    if (!disabled && getContainer !== false) return;
    containerRef.current?.remove();
    containerRef.current = null;
  }, [disabled, getContainer]);
  useEffect(
    () => () => {
      containerRef.current?.remove();
      containerRef.current = null;
    },
    [],
  );
  if (disabled) return undefined;
  if (getContainer === false) return false;
  return () => {
    if (!allowCreate && !containerRef.current) return null;
    const target =
      typeof getContainer === 'function'
        ? getContainer()
        : typeof getContainer === 'string'
          ? document.querySelector(getContainer)
          : (getContainer ?? document.body);
    const previous = containerRef.current;
    if (previous && previous.parentNode === target) return previous;
    if (previous) queueMicrotask(() => previous.remove());
    if (!target) {
      containerRef.current = null;
      return null;
    }
    const container = target.ownerDocument.createElement('div');
    container.dataset.taoImagePopup = '';
    container.dataset.taoProvider = '';
    if (mode !== 'light') container.dataset.taoTheme = mode;
    if (compact) container.dataset.taoDensity = 'compact';
    for (const [key, value] of Object.entries(tokenStyle ?? {}))
      container.style.setProperty(key, String(value));
    target.appendChild(container);
    containerRef.current = container;
    return container;
  };
}

function usePreviewOptions(
  preview: ImageProps['preview'] | PreviewGroupProps['preview'],
  internalOpen: boolean,
) {
  const { locale } = useTaoInternalConfig();
  const groupDisabled = useContext(PreviewDisabledContext);
  const raw = typeof preview === 'object' ? preview : {};
  const {
    visible,
    open,
    rootClassName,
    forceRender: _forceRender,
    destroyOnClose: _destroyOnClose,
    toolbarRender,
    mask,
    getContainer,
    ...rest
  } = raw;
  const disabled = groupDisabled || preview === false;
  const container = usePreviewContainer(
    getContainer,
    !disabled && (open ?? visible ?? internalOpen),
    disabled,
  );
  const iterableMask =
    mask !== null && typeof mask === 'object' && Symbol.iterator in mask
      ? (mask as Iterable<ReactNode>)
      : undefined;
  const maskCover =
    typeof mask === 'string' || typeof mask === 'number' || isValidElement(mask)
      ? mask
      : iterableMask;
  const maskConfig =
    typeof mask === 'object' &&
    mask !== null &&
    !isValidElement(mask) &&
    !iterableMask
      ? (mask as Exclude<ImageMask, boolean>)
      : undefined;
  const icons: RcPreviewConfig['icons'] = {
    close: <ImageControlIcon name="close" label={locale.close} />,
    prev: <ImageControlIcon name="prev" label={locale.previous} />,
    next: <ImageControlIcon name="next" label={locale.next} />,
    rotateLeft: <ImageControlIcon name="rotateLeft" />,
    rotateRight: <ImageControlIcon name="rotateRight" />,
    zoomIn: <ImageControlIcon name="zoomIn" />,
    zoomOut: <ImageControlIcon name="zoomOut" />,
    flipX: <ImageControlIcon name="flipX" />,
    flipY: <ImageControlIcon name="flipY" />,
    ...raw.icons,
  };
  const actionLabels: Record<string, string> = {
    prev: locale.previous,
    next: locale.next,
    flipY: locale.messages.flipY,
    flipX: locale.messages.flipX,
    rotateLeft: locale.messages.rotateLeft,
    rotateRight: locale.messages.rotateRight,
    zoomOut: locale.messages.zoomOut,
    zoomIn: locale.messages.zoomIn,
  };
  const localizeAction = (node: ReactNode): ReactNode => {
    if (!isValidElement<{ 'aria-label'?: string }>(node)) return node;
    const label = actionLabels[node.props['aria-label'] ?? ''];
    return label === undefined
      ? node
      : cloneElement(node, { 'aria-label': label });
  };
  const renderActions = raw.actionsRender ?? toolbarRender;
  const actionsRender: NonNullable<RcGroupPreviewConfig['actionsRender']> = (
    original,
    info,
  ) => {
    const actions = original as ReactElement<{ children: ReactNode }>;
    const localized = cloneElement(
      actions,
      undefined,
      Children.map(actions.props.children, localizeAction),
    );
    return renderActions
      ? renderActions(localized, {
          ...info,
          icons: {
            prevIcon: localizeAction(info.icons.prevIcon),
            nextIcon: localizeAction(info.icons.nextIcon),
            flipYIcon: localizeAction(info.icons.flipYIcon),
            flipXIcon: localizeAction(info.icons.flipXIcon),
            rotateLeftIcon: localizeAction(info.icons.rotateLeftIcon),
            rotateRightIcon: localizeAction(info.icons.rotateRightIcon),
            zoomOutIcon: localizeAction(info.icons.zoomOutIcon),
            zoomInIcon: localizeAction(info.icons.zoomInIcon),
          },
        })
      : localized;
  };
  return {
    disabled,
    raw,
    maskCover,
    hiddenMask: mask === false || maskConfig?.enabled === false,
    blurMask: maskConfig?.blur,
    config: {
      ...rest,
      open: open ?? visible,
      rootClassName,
      getContainer: container,
      icons,
      motionName: 'tao-image-preview-fade',
      maskClosable: maskConfig?.closable ?? true,
      actionsRender,
    },
  };
}

function ImageProgress({
  props,
  progress,
  placeholder,
}: {
  props: ImageProps;
  progress?: ImageProgressConfig;
  placeholder?: ReactNode;
}) {
  const classes =
    typeof props.classNames === 'function'
      ? props.classNames({ props })
      : props.classNames;
  const styles =
    typeof props.styles === 'function' ? props.styles({ props }) : props.styles;
  const { tokenStyle, locale } = useTaoInternalConfig();
  const cn = classes?.placeholder?.progress;
  const st = styles?.placeholder?.progress;
  const hasPercent =
    typeof progress?.percent === 'number' && Number.isFinite(progress.percent);
  const percent = hasPercent
    ? Math.max(0, Math.min(100, Math.round(progress.percent!)))
    : 0;
  const percentText = new Intl.NumberFormat(locale.numberLocale ?? 'en-US', {
    style: 'percent',
  }).format(percent / 100);
  const progressAria = {
    'aria-labelledby': props['aria-labelledby'],
    'aria-describedby': props['aria-describedby'],
    ...(hasPercent
      ? {
          role: 'progressbar' as const,
          'aria-valuemin': 0,
          'aria-valuemax': 100,
          'aria-valuenow': percent,
          'aria-label': props['aria-label'] ?? (props.alt || percentText),
        }
      : {
          role: 'status' as const,
          'aria-label':
            props['aria-label'] ?? (props.alt || locale.messages.loading),
          'aria-busy': true,
        }),
  };
  const bar = hasPercent ? (
    <div data-tao-image-progress-rail="" className={cn?.rail} style={st?.rail}>
      <span style={{ transform: `scaleX(${percent / 100})` }} />
    </div>
  ) : null;
  return (
    <div
      data-tao-image-progress=""
      className={cx(
        classes?.root,
        cn?.root,
        props.rootClassName,
        props.className,
      )}
      style={{
        ...tokenStyle,
        width: props.width,
        height: props.height,
        ...props.wrapperStyle,
        ...styles?.root,
        ...props.style,
        ...st?.root,
      }}
      {...progressAria}
    >
      <div
        data-tao-image-progress-content=""
        className={cn?.content}
        style={st?.content}
      >
        {placeholder ??
          (progress?.render ? (
            progress.render(bar, percent)
          ) : (
            <>
              {bar}
              {hasPercent && (
                <span className={cn?.indicator} style={st?.indicator}>
                  {percentText}
                </span>
              )}
            </>
          ))}
      </div>
    </div>
  );
}

function ImageBase(props: ImageProps) {
  const { tokenStyle } = useTaoInternalConfig();
  const [internalOpen, setInternalOpen] = useState(false);
  const {
    preview,
    wrapperStyle,
    classNames,
    styles,
    placeholder,
    prefixCls = 'tao-image',
    ...rest
  } = props;
  const classes =
    typeof classNames === 'function' ? classNames({ props }) : classNames;
  const css = typeof styles === 'function' ? styles({ props }) : styles;
  const { disabled, config, hiddenMask, blurMask, maskCover } =
    usePreviewOptions(preview, internalOpen);
  const raw = typeof preview === 'object' ? preview : {};
  const isProgressConfig =
    placeholder !== null &&
    typeof placeholder === 'object' &&
    !isValidElement(placeholder) &&
    'progress' in placeholder;
  const progress = isProgressConfig ? placeholder.progress : undefined;
  const showPlaceholder =
    !!progress ||
    (!props.src && (!!placeholder || placeholder === 0) && !isProgressConfig);
  useEffect(() => {
    if (disabled || config.open !== undefined || showPlaceholder)
      setInternalOpen(false);
  }, [disabled, config.open, showPlaceholder]);
  if (showPlaceholder)
    return (
      <ImageProgress
        props={props}
        progress={progress === true ? {} : progress || undefined}
        placeholder={isProgressConfig ? undefined : (placeholder as ReactNode)}
      />
    );
  return (
    <span data-tao-image-inline="">
      <RcImageComponent
        {...rest}
        data-tao-image=""
        prefixCls={prefixCls}
        previewPrefixCls="tao-image-preview"
        classNames={{
          ...classes,
          cover: cx(classes?.cover, raw.maskClassName),
        }}
        styles={{
          ...css,
          root: { ...tokenStyle, ...wrapperStyle, ...css?.root },
          popup: {
            ...css?.popup,
            root: { ...tokenStyle, ...css?.popup?.root },
            mask: {
              ...(hiddenMask ? { background: 'transparent' } : {}),
              ...(blurMask ? { backdropFilter: 'blur(4px)' } : {}),
              ...css?.popup?.mask,
            },
          },
        }}
        placeholder={isProgressConfig ? undefined : (placeholder as ReactNode)}
        preview={
          disabled
            ? false
            : ({
                ...config,
                open: config.open ?? internalOpen,
                cover: raw.cover ?? maskCover ?? (
                  <span aria-hidden="true">⌕</span>
                ),
                onOpenChange: (open) => {
                  if (config.open === undefined) setInternalOpen(open);
                  if (raw.onOpenChange) raw.onOpenChange(open);
                  else raw.onVisibleChange?.(open, !open);
                },
              } as RcPreviewConfig)
        }
      />
    </span>
  );
}

export function ImagePreviewGroup(props: PreviewGroupProps) {
  const { tokenStyle } = useTaoInternalConfig();
  const { preview, classNames, styles, children, ...rest } = props;
  const classes =
    typeof classNames === 'function'
      ? classNames({ props: props as ImageProps })
      : classNames;
  const css =
    typeof styles === 'function'
      ? styles({ props: props as ImageProps })
      : styles;
  const [internalOpen, setInternalOpen] = useState(false);
  const { disabled, config, hiddenMask, blurMask } = usePreviewOptions(
    preview,
    internalOpen,
  );
  const raw = typeof preview === 'object' ? preview : {};
  useEffect(() => {
    if (disabled || config.open !== undefined) setInternalOpen(false);
  }, [disabled, config.open]);
  return (
    <span data-tao-image-group="">
      <RcImageComponent.PreviewGroup
        {...rest}
        previewPrefixCls="tao-image-preview"
        classNames={classes}
        styles={{
          ...css,
          popup: {
            ...css?.popup,
            root: { ...tokenStyle, ...css?.popup?.root },
            mask: {
              ...(hiddenMask ? { background: 'transparent' } : {}),
              ...(blurMask ? { backdropFilter: 'blur(4px)' } : {}),
              ...css?.popup?.mask,
            },
          },
        }}
        preview={
          {
            ...config,
            open: !disabled && (config.open ?? internalOpen),
            motionName: disabled ? '' : config.motionName,
            onOpenChange: (open, info) => {
              if (config.open === undefined) setInternalOpen(open);
              if (raw.onOpenChange) raw.onOpenChange(open, info);
              else raw.onVisibleChange?.(open, !open, info.current);
            },
          } as RcGroupPreviewConfig
        }
      >
        <PreviewDisabledContext.Provider value={disabled}>
          {children}
        </PreviewDisabledContext.Provider>
      </RcImageComponent.PreviewGroup>
    </span>
  );
}
export const Image = Object.assign(ImageBase, {
  PreviewGroup: ImagePreviewGroup,
});
