import RcMentions, {
  type MentionsProps as RcMentionsProps,
} from '@rc-component/mentions';
import {
  type ComponentRef,
  type CSSProperties,
  forwardRef,
  type ReactNode,
} from 'react';
import {
  TaoPortalScope,
  type TaoSize,
  type TaoStatus,
  useTaoDirection,
  useTaoInternalConfig,
} from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { CloseIcon } from '../select/select-icons';
import { Spinner } from '../spinner/spinner';
import type { SelectEngineVariant } from '../tree-select/select-engine';
import './mentions.css';
import { interopDefault } from '../../utils/interop-default';

const RcMentionsComponent = /*#__PURE__*/ interopDefault(RcMentions);

export type MentionPlacement = 'top' | 'bottom';
export type MentionsOptionProps = NonNullable<
  RcMentionsProps['options']
>[number];
export type MentionsRef = ComponentRef<typeof RcMentions>;
export type MentionsSemanticPart = 'root' | 'textarea' | 'popup' | 'suffix';
export type MentionSemanticType = {
  classNames?: SemanticClassNames<MentionsSemanticPart>;
  styles?: SemanticStyles<MentionsSemanticPart>;
};
export interface MentionsProps
  extends Omit<RcMentionsProps, 'suffix' | 'classNames' | 'styles'> {
  rootClassName?: string;
  loading?: boolean;
  status?: TaoStatus;
  variant?: SelectEngineVariant;
  size?: TaoSize | 'middle';
  classNames?:
    | MentionSemanticType['classNames']
    | ((info: { props: MentionsProps }) => MentionSemanticType['classNames']);
  styles?:
    | MentionSemanticType['styles']
    | ((info: { props: MentionsProps }) => MentionSemanticType['styles']);
}
export type MentionProps = MentionsProps;
export interface MentionsConfig {
  prefix?: string | string[];
  split?: string;
}
export interface MentionsEntity {
  prefix: string;
  value: string;
}

function getMentions(
  value = '',
  { prefix = '@', split = ' ' }: MentionsConfig = {},
): MentionsEntity[] {
  const prefixes = Array.isArray(prefix) ? prefix : [prefix];
  return value.split(split).flatMap((text) => {
    const match = prefixes.find((candidate) => text.startsWith(candidate));
    return match !== undefined && text.length > match.length
      ? [{ prefix: match, value: text.slice(match.length) }]
      : [];
  });
}

const MentionsComponent = forwardRef<MentionsRef, MentionsProps>(
  (props, ref) => {
    const config = useTaoInternalConfig();
    const {
      size: sizeProp = config.size,
      disabled = config.disabled,
      variant = config.variant,
      status,
      loading = false,
      prefixCls = 'tao-mentions',
      className,
      rootClassName,
      style,
      classNames,
      styles,
      allowClear,
      options,
      children,
      filterOption,
      notFoundContent = config.locale.noResults,
      popupClassName,
      popupRender,
      ...rest
    } = props;
    const size = sizeProp === 'middle' ? 'medium' : sizeProp;
    const resolvedProps = { ...props, size, disabled, variant };
    const classes =
      typeof classNames === 'function'
        ? classNames({ props: resolvedProps })
        : classNames;
    const semanticStyles =
      typeof styles === 'function' ? styles({ props: resolvedProps }) : styles;
    const clearConfig = allowClear
      ? {
          clearIcon: <CloseIcon />,
          label: config.locale.clear,
          ...(typeof allowClear === 'object' ? allowClear : {}),
        }
      : false;
    const loadingOptions: MentionsOptionProps[] = [
      {
        value: '__tao_loading__',
        disabled: true,
        label: <Spinner size="small" />,
      },
    ];
    const [direction, directionRef] = useTaoDirection(props.direction);
    return (
      <div
        ref={directionRef}
        data-tao-mentions=""
        data-tao-control=""
        data-tao-size={size}
        data-tao-variant={variant}
        data-disabled={disabled || undefined}
        data-tao-error={status === 'error' || undefined}
        data-tao-warning={status === 'warning' || undefined}
        dir={direction}
        className={cx(className, rootClassName, classes?.root)}
        style={{ ...semanticStyles?.root, ...style }}
      >
        <RcMentionsComponent
          {...rest}
          direction={direction}
          ref={ref}
          prefixCls={prefixCls}
          disabled={disabled}
          silent={loading}
          allowClear={clearConfig}
          options={loading ? loadingOptions : options}
          filterOption={loading ? () => true : filterOption}
          notFoundContent={notFoundContent}
          classNames={{
            textarea: classes?.textarea,
            suffix: classes?.suffix,
            popup: cx(classes?.popup, popupClassName, rootClassName),
          }}
          styles={{
            textarea: { resize: style?.resize, ...semanticStyles?.textarea },
            suffix: semanticStyles?.suffix,
            popup: {
              ...config.tokenStyle,
              position: 'absolute',
              maxWidth: 'calc(100vw - 16px)',
              zIndex: 'var(--tao-z-index-popup)' as CSSProperties['zIndex'],
              ...semanticStyles?.popup,
            },
          }}
          popupRender={(menu) => (
            <TaoPortalScope asChild direction={direction}>
              <div data-tao-mentions-popup="" data-tao-size={size}>
                {popupRender ? popupRender(menu) : menu}
              </div>
            </TaoPortalScope>
          )}
        >
          {loading ? undefined : children}
        </RcMentionsComponent>
      </div>
    );
  },
);
MentionsComponent.displayName = 'Mentions';
export const Mentions = Object.assign(MentionsComponent, {
  Option: RcMentionsComponent.Option,
  getMentions,
});

/** @deprecated Prefer MentionsOptionProps and the options prop. */
export interface MentionsLegacyOptionProps {
  value: string;
  children: ReactNode;
  [key: string]: unknown;
}
