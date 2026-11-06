import RcImage, { type ImageProps as RcImageProps } from '@rc-component/image';
import type {
  GroupPreviewConfig as RcGroupPreviewConfig,
  PreviewGroupProps as RcPreviewGroupProps,
} from '@rc-component/image/es/PreviewGroup';
import {
  Children,
  type CSSProperties,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
} from 'react';
import { useTaoInternalConfig } from '../../provider/tao-provider';
import { cx } from '../../utils/semantic';
import { ImageControlIcon } from './image-icons';
import './image.css';
import { interopDefault } from '../../utils/interop-default';

const RcImageComponent = /*#__PURE__*/ interopDefault(RcImage);

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

function usePreviewContainer(getContainer: RcPreviewConfig['getContainer']) {
  const { tokenStyle, mode, compact } = useTaoInternalConfig();
  const containers = useRef<HTMLElement[]>([]);
  useEffect(() => {
    for (const container of containers.current) {
      if (mode === 'light') delete container.dataset.taoTheme;
      else container.dataset.taoTheme = mode;
      if (compact) container.dataset.taoDensity = 'compact';
      else delete container.dataset.taoDensity;
      container.removeAttribute('style');
      for (const [key, value] of Object.entries(tokenStyle ?? {}))
        container.style.setProperty(key, String(value));
    }
  }, [tokenStyle, mode, compact]);
  useEffect(
    () => () => {
      for (const container of containers.current) container.remove();
      containers.current = [];
    },
    [],
  );
  if (getContainer === false) return false;
  return () => {
    const target =
      typeof getContainer === 'function'
        ? getContainer()
        : typeof getContainer === 'string'
          ? document.querySelector(getContainer)
          : (getContainer ?? document.body);
    if (!target) return null;
    const existing = containers.current.find(
      (container) => container.parentNode === target,
    );
    if (existing) return existing;
    const container = document.createElement('div');
    container.dataset.taoImagePopup = '';
    container.dataset.taoProvider = '';
    if (mode !== 'light') container.dataset.taoTheme = mode;
    if (compact) container.dataset.taoDensity = 'compact';
    for (const [key, value] of Object.entries(tokenStyle ?? {}))
      container.style.setProperty(key, String(value));
    target.appendChild(container);
    containers.current.push(container);
    return container;
  };
}

function usePreviewOptions(
  preview: ImageProps['preview'] | PreviewGroupProps['preview'],
) {
  const { locale } = useTaoInternalConfig();
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
  const container = usePreviewContainer(getContainer);
  const maskConfig =
    typeof mask === 'object' &&
    mask !== null &&
    !isValidElement(mask) &&
    !Array.isArray(mask)
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
    disabled: preview === false,
    raw,
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
      ...(isValidElement(mask) ? { cover: mask } : {}),
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
  const progressAria = hasPercent
    ? {
        role: 'progressbar' as const,
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': percent,
        'aria-label': props['aria-label'] ?? percentText,
      }
    : {
        role: 'status' as const,
        'aria-label': props['aria-label'] ?? locale.messages.loading,
        'aria-busy': true,
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
  const { disabled, config, hiddenMask, blurMask } = usePreviewOptions(preview);
  const raw = typeof preview === 'object' ? preview : {};
  const isProgressConfig =
    placeholder !== null &&
    typeof placeholder === 'object' &&
    !isValidElement(placeholder) &&
    'progress' in placeholder;
  const progress = isProgressConfig ? placeholder.progress : undefined;
  if (progress || (!props.src && placeholder && !isProgressConfig))
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
                cover: raw.cover ?? config.cover ?? (
                  <span aria-hidden="true">⌕</span>
                ),
                onOpenChange:
                  raw.onOpenChange ??
                  (raw.onVisibleChange
                    ? (open) => raw.onVisibleChange!(open, !open)
                    : undefined),
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
  const { disabled, config, hiddenMask, blurMask } = usePreviewOptions(preview);
  const raw = typeof preview === 'object' ? preview : {};
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
          disabled
            ? false
            : ({
                ...config,
                onOpenChange:
                  raw.onOpenChange ??
                  (raw.onVisibleChange
                    ? (open, info) =>
                        raw.onVisibleChange!(open, !open, info.current)
                    : undefined),
              } as RcGroupPreviewConfig)
        }
      >
        {children}
      </RcImageComponent.PreviewGroup>
    </span>
  );
}
export const Image = Object.assign(ImageBase, {
  PreviewGroup: ImagePreviewGroup,
});
