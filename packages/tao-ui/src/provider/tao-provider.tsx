import { Slot } from '@radix-ui/react-slot';
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type TaoTokenName, taoTokenVars } from '../theme/tokens';
import { enUS, type TaoLocale } from './locale';
import { mergeLocale, type ResolvedTaoLocale } from './merge-locale';

export { enUS, type TaoLocale, zhCN } from './locale';

// ---- Seed Token ----

export interface TaoSeedToken {
  colorPrimary?: string;
  colorSuccess?: string;
  colorWarning?: string;
  colorError?: string;
  colorBgBase?: string;
  colorTextBase?: string;
  borderRadius?: number;
  fontSize?: number;
  controlHeight?: number;
  sizeUnit?: number;
  sizeStep?: number;
  lineWidth?: number;
  fontFamily?: string;
  fontFamilyCode?: string;
  motionUnit?: number;
  motion?: boolean;
  zIndexBase?: number;
  zIndexPopupBase?: number;
}

// ---- Theme Config ----

export type TaoThemeMode = 'light' | 'dark';

// ---- Component Tokens (DESIGN.md §3.6) ----
// Serialized to `--tao-{component}-{kebab-key}` CSS custom properties;
// component CSS consumes them via `var(--tao-button-x, <default>)` chains.
// Number values are emitted in px, except unitless props (fontWeight).

export interface ButtonComponentToken {
  fontWeight?: CSSProperties['fontWeight'];
  borderRadius?: number;
  paddingInline?: number;
  paddingInlineSM?: number;
  paddingInlineLG?: number;
  primaryColor?: string;
  primaryShadow?: string;
  defaultColor?: string;
  defaultBg?: string;
  defaultBorderColor?: string;
  defaultHoverBg?: string;
  defaultHoverColor?: string;
  defaultHoverBorderColor?: string;
  contentFontSize?: number;
  contentFontSizeSM?: number;
  contentFontSizeLG?: number;
}

export interface InputComponentToken {
  paddingInline?: number;
  paddingInlineSM?: number;
  paddingInlineLG?: number;
  hoverBorderColor?: string;
  activeBorderColor?: string;
  activeShadow?: string;
  errorActiveShadow?: string;
  hoverBg?: string;
  activeBg?: string;
  inputFontSize?: number;
  inputFontSizeSM?: number;
  inputFontSizeLG?: number;
}

export interface FormFieldComponentToken {
  labelColor?: string;
  labelFontSize?: number;
  labelRequiredMarkColor?: string;
  itemGap?: number;
  descriptionColor?: string;
  errorColor?: string;
  errorFontSize?: number;
}

export interface TaoComponentTokenMap {
  Button?: ButtonComponentToken;
  Input?: InputComponentToken;
  FormField?: FormFieldComponentToken;
}

export interface TaoThemeConfig {
  token?: Partial<TaoSeedToken>;
  /**
   * 明暗模式。'dark' 在 provider 元素上输出 data-tao-theme="dark"，
   * 激活 theme.css 的 dark scope（纯 CSS 算法，无 JS runtime）。
   * 嵌套 provider 未声明 mode 时继承父级；portal 浮层经 context 透传。
   *
   * 已知限制：dark 内显式 mode: 'light' 不会翻回亮色——CSS 自定义属性
   * 无法"撤销"祖先的 seed 覆盖（antd 靠 JS 重算 token 实现，tao-ui 为
   * 零 runtime 放弃此路径）。需要亮/暗混排时，把亮部移出 dark provider。
   */
  mode?: TaoThemeMode;
  /**
   * 紧凑密度。true 时输出 data-tao-density="compact"，激活 theme.css 的
   * compact scope（控件高度 32→28、padding/margin 各降一档）。经 context
   * 级联，portal 浮层透传。与 antd compactAlgorithm 对应，纯 CSS 实现。
   */
  compact?: boolean;
  /** Per-component token overrides (DESIGN.md §3.6). */
  components?: TaoComponentTokenMap;
  inherit?: boolean;
}

// ---- Config Context ----

export type TaoSize = 'small' | 'medium' | 'large';
export type TaoVariant = 'outlined' | 'filled' | 'borderless';
export type TaoStatus = 'error' | 'warning';
export type TaoDirection = 'ltr' | 'rtl';

export interface TaoConfig {
  direction?: TaoDirection;
  locale: TaoLocale;
  size: TaoSize;
  disabled: boolean;
  variant: TaoVariant;
  /** Resolved 明暗模式，portal 浮层用它重建 data-tao-theme。 */
  mode: TaoThemeMode;
  /** Resolved 紧凑密度，portal 浮层用它重建 data-tao-density。 */
  compact: boolean;
}

interface TaoConfigContextValue extends TaoConfig {
  locale: ResolvedTaoLocale;
  /**
   * Merged CSS custom-property overrides from this provider and all ancestors.
   * Carried through context so portaled layers (Modal/Drawer/Select dropdown…)
   * — which render outside the provider's DOM subtree — can re-apply the theme.
   */
  tokenStyle: Record<string, string>;
  /** Caller-provided tokens, excluding generated defaults used to isolate a scope. */
  tokenOverrides: Record<string, string>;
}

const TaoConfigContext = createContext<TaoConfigContextValue>({
  size: 'medium',
  disabled: false,
  variant: 'outlined',
  mode: 'light',
  compact: false,
  tokenStyle: {},
  tokenOverrides: {},
  locale: enUS,
});

export function useTaoConfig(): TaoConfig & { locale: ResolvedTaoLocale } {
  const { size, disabled, variant, mode, compact, locale, direction } =
    useContext(TaoConfigContext);
  return useMemo(
    () => ({ size, disabled, variant, mode, compact, locale, direction }),
    [size, disabled, variant, mode, compact, locale, direction],
  );
}

/** Internal component access for token propagation through third-party portals. */
export function useTaoInternalConfig(): TaoConfigContextValue {
  return useContext(TaoConfigContext);
}

function directionParent(element: Element): Element | null {
  if (element.assignedSlot) return element.assignedSlot;
  if (element.parentElement) return element.parentElement;
  const root = element.getRootNode();
  return 'host' in root ? (root as ShadowRoot).host : null;
}

/** Resolve DOM inheritance at a component's source, before it creates portals. */
export function useTaoDirection(
  explicit?: TaoDirection | 'auto',
  source: 'parent' | 'self' = 'parent',
) {
  const { direction: contextDirection } = useContext(TaoConfigContext);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [inherited, setInherited] = useState<TaoDirection>();
  useLayoutEffect(() => {
    if ((explicit && explicit !== 'auto') || !element) return;
    // Components writing their resolved dir read the parent to avoid feedback.
    // External triggers and dir="auto" must resolve from their own DOM instead.
    const target =
      source === 'self' || explicit === 'auto'
        ? element
        : directionParent(element);
    if (!target) return;
    const update = () => {
      const value =
        getComputedStyle(target).direction ||
        target.closest('[dir]')?.getAttribute('dir') ||
        contextDirection;
      setInherited(value === 'rtl' ? 'rtl' : 'ltr');
      for (
        let ancestor: Element | null = target;
        ancestor;
        ancestor = directionParent(ancestor)
      ) {
        const auto = ancestor.getAttribute('dir') === 'auto';
        observer.observe(ancestor, {
          attributes: true,
          attributeFilter: ['dir', 'style', 'class'],
          childList: auto,
          characterData: auto,
          subtree: auto,
        });
      }
    };
    const observer = new MutationObserver(update);
    update();
    return () => observer.disconnect();
  }, [element, explicit, contextDirection, source]);
  return [
    (explicit === 'auto' ? undefined : explicit) ??
      inherited ??
      contextDirection ??
      'ltr',
    setElement,
  ] as const;
}

/**
 * antd `theme.useToken` counterpart, zero-runtime edition: returns every
 * design token as a `var(--tao-*)` reference string, so custom components can
 * stay visually consistent with tao-ui and still resolve in the browser
 * against the live theme (dark mode, seed overrides, compact density):
 *
 * ```tsx
 * const { token } = useTaoToken();
 * <div style={{ borderRadius: token['--tao-radius-lg'], padding: token['--tao-padding-lg'] }} />
 * ```
 */
export function useTaoToken(): { token: Record<TaoTokenName, string> } {
  return useMemo(() => ({ token: taoTokenVars }), []);
}

/**
 * Re-establishes the theme token scope inside a portal. Floating components
 * portal their popup to document.body, escaping the `[data-tao-provider]`
 * element that carries custom token overrides; wrapping the portal content in
 * this component re-applies those overrides so colors/sizes stay consistent.
 *
 * With `asChild`, merges the tokens onto the immediate child (via Radix Slot)
 * instead of adding a wrapper div. Prefer `asChild` inside portals whose Radix
 * primitive does NOT Presence-gate its Portal (notably `@radix-ui/react-select`
 * — see `SelectPortal` in `node_modules/@radix-ui/react-select`): the wrapper
 * div would otherwise render even while the popup is closed, leaving a ghost
 * `<div data-tao-provider>` in the body for every mounted-but-closed Select.
 */
export function TaoPortalScope({
  children,
  style,
  asChild,
  direction: directionProp,
}: {
  children: ReactNode;
  style?: CSSProperties;
  asChild?: boolean;
  direction?: TaoDirection;
}) {
  const config = useTaoInternalConfig();
  const { tokenStyle, mode, compact } = config;
  const direction = directionProp ?? config.direction;
  const portalConfig = useMemo(
    () => ({ ...config, direction }),
    [config, direction],
  );
  const themeAttr = mode === 'light' ? undefined : { 'data-tao-theme': mode };
  const densityAttr = compact ? { 'data-tao-density': 'compact' } : undefined;
  if (asChild) {
    return (
      <TaoConfigContext.Provider value={portalConfig}>
        <Slot
          dir={direction}
          data-tao-provider=""
          {...themeAttr}
          {...densityAttr}
          style={{ ...tokenStyle, ...style }}
        >
          {children}
        </Slot>
      </TaoConfigContext.Provider>
    );
  }
  return (
    <TaoConfigContext.Provider value={portalConfig}>
      <div
        dir={direction}
        data-tao-provider=""
        {...themeAttr}
        {...densityAttr}
        style={{ display: 'contents', ...tokenStyle, ...style }}
      >
        {children}
      </div>
    </TaoConfigContext.Provider>
  );
}

// ---- Provider ----

export interface TaoProviderProps {
  /** Text and interaction direction. Defaults to the surrounding DOM direction. */
  direction?: TaoDirection;
  /** Component text and regional settings; omitted keys inherit from the parent. */
  locale?: Partial<TaoLocale>;
  children: ReactNode;
  theme?: TaoThemeConfig;
  size?: TaoSize;
  disabled?: boolean;
  variant?: TaoVariant;
}

const TOKEN_TO_VAR: Record<string, string> = {
  colorPrimary: '--tao-color-primary',
  colorSuccess: '--tao-color-success',
  colorWarning: '--tao-color-warning',
  colorError: '--tao-color-error',
  colorBgBase: '--tao-color-bg-base',
  colorTextBase: '--tao-color-text-base',
  fontFamily: '--tao-font-family',
  fontFamilyCode: '--tao-font-family-code',
};

const TOKEN_TO_VAR_PX: Record<string, string> = {
  borderRadius: '--tao-radius',
  fontSize: '--tao-font-size',
  controlHeight: '--tao-control-height',
  sizeUnit: '--tao-size-unit',
  lineWidth: '--tao-line-width',
};

const TOKEN_TO_VAR_NUMBER: Record<string, string> = {
  sizeStep: '--tao-size-step',
  zIndexBase: '--tao-z-index-base',
  zIndexPopupBase: '--tao-z-index-popup-base',
};

const CONTROL_HEIGHT = '--tao-control-height';
const MOTION_UNIT = '--tao-motion-unit';
const DARK_SCOPE_SEEDS = [
  '--tao-color-primary',
  '--tao-color-bg-base',
  '--tao-color-text-base',
  '--tao-color-bg-surface',
  '--tao-border-text-weight',
] as const;

const DEFAULT_TOKEN_STYLE = {
  '--tao-border-text-weight': '12%',
  '--tao-color-primary': 'oklch(0.205 0.01 70)',
  '--tao-color-success': 'oklch(0.555 0.14 155)',
  '--tao-color-warning': 'oklch(0.7 0.15 70)',
  '--tao-color-error': 'oklch(0.57 0.19 25)',
  '--tao-color-bg-base': 'oklch(0.985 0.004 70)',
  '--tao-color-text-base': 'oklch(0.155 0.01 70)',
  '--tao-color-bg-surface': 'oklch(1 0 0)',
  '--tao-color-text-light-solid': 'oklch(0.985 0.004 70)',
  '--tao-radius': '6px',
  '--tao-font-size': '14px',
  [CONTROL_HEIGHT]: '32px',
  '--tao-size-unit': '4px',
  '--tao-size-step': '4',
  '--tao-line-width': '1px',
  '--tao-font-family':
    '"Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  '--tao-font-family-code':
    '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  [MOTION_UNIT]: '0.1s',
  '--tao-z-index-base': '0',
  '--tao-z-index-popup-base': '1000',
};

/**
 * Stable memoization key for theme.token/components: users routinely inline
 * `theme={{ token: {...} }}` — a fresh object every render — which would
 * otherwise cascade through ownVars → tokenStyle → config and force every
 * `useTaoConfig()` consumer to rerender on every parent render.
 */
function useStableThemeKey(
  token: Partial<TaoSeedToken> | undefined,
  components: TaoComponentTokenMap | undefined,
): string {
  const key = JSON.stringify({
    token: token ?? null,
    components: components ?? null,
  });
  const ref = useRef(key);
  if (ref.current !== key) ref.current = key;
  return ref.current;
}

/** camelCase / PascalCase → kebab-case (`paddingInlineSM` → `padding-inline-sm`). */
function kebabCase(key: string): string {
  return key
    .replace(/[A-Z]+/g, (match) => `-${match.toLowerCase()}`)
    .replace(/^-/, '');
}

/** Component token keys whose numeric values stay unitless. */
const UNITLESS_COMPONENT_TOKEN_KEYS = new Set(['fontWeight']);

export function TaoProvider({
  direction: directionProp,
  locale: localeProp,
  theme,
  size,
  disabled,
  variant,
  children,
}: TaoProviderProps) {
  const [direction, directionRef] = useTaoDirection(directionProp);
  const parentConfig = useContext(TaoConfigContext);
  const locale = useMemo(
    () => mergeLocale(parentConfig.locale, localeProp),
    [parentConfig.locale, localeProp],
  );
  const inherit = theme?.inherit ?? true;
  const parentCompact = parentConfig.compact;
  const mode = theme?.mode ?? (inherit ? parentConfig.mode : 'light');
  const explicitLight = theme?.mode === 'light';
  const compact = theme?.compact ?? (inherit ? parentCompact : false);
  const motionEnabled = theme?.token?.motion === true;
  const themeKey = useStableThemeKey(theme?.token, theme?.components);

  const ownVars = useMemo(() => {
    const parsedTheme = JSON.parse(themeKey) as {
      token: Partial<TaoSeedToken> | null;
      components: TaoComponentTokenMap | null;
    };
    const parsedToken = parsedTheme.token;
    if (!parsedToken && !parsedTheme.components) return undefined;

    const vars: Record<string, string> = {};

    if (parsedToken) {
      for (const [key, varName] of Object.entries(TOKEN_TO_VAR)) {
        const val = parsedToken[key as keyof TaoSeedToken];
        if (val != null) vars[varName] = String(val);
      }

      for (const [key, varName] of Object.entries(TOKEN_TO_VAR_PX)) {
        const val = parsedToken[key as keyof TaoSeedToken];
        if (val != null) vars[varName] = `${val}px`;
      }

      for (const [key, varName] of Object.entries(TOKEN_TO_VAR_NUMBER)) {
        const val = parsedToken[key as keyof TaoSeedToken];
        if (val != null) vars[varName] = String(val);
      }

      if (parsedToken.motion === false) {
        vars[MOTION_UNIT] = '0s';
      } else if (parsedToken.motionUnit != null) {
        vars[MOTION_UNIT] = `${parsedToken.motionUnit}s`;
      }
    }

    // Component tokens → `--tao-button-border-radius` style overrides
    if (parsedTheme.components) {
      for (const [component, tokens] of Object.entries(
        parsedTheme.components,
      )) {
        if (!tokens) continue;
        for (const [key, value] of Object.entries(tokens)) {
          if (value == null) continue;
          const varName = `--tao-${kebabCase(component)}-${kebabCase(key)}`;
          vars[varName] =
            typeof value === 'number' && !UNITLESS_COMPONENT_TOKEN_KEYS.has(key)
              ? `${value}px`
              : String(value);
        }
      }
    }

    return vars;
  }, [themeKey]);

  const { scopedVars, tokenStyle, tokenOverrides } = useMemo(() => {
    const overrides = {
      ...(inherit ? parentConfig.tokenOverrides : {}),
      ...ownVars,
    };
    const scoped: Record<string, string> = inherit
      ? {}
      : { ...DEFAULT_TOKEN_STYLE };
    if (!inherit) {
      // Component variables otherwise keep cascading through the DOM.
      for (const name of Object.keys(parentConfig.tokenStyle)) {
        if (!Object.hasOwn(scoped, name)) scoped[name] = 'initial';
      }
    } else {
      if (!compact && parentCompact) {
        scoped[CONTROL_HEIGHT] =
          overrides[CONTROL_HEIGHT] ?? DEFAULT_TOKEN_STYLE[CONTROL_HEIGHT];
      }
      if (explicitLight) {
        for (const name of DARK_SCOPE_SEEDS) {
          scoped[name] = overrides[name] ?? DEFAULT_TOKEN_STYLE[name];
        }
      }
    }
    Object.assign(scoped, ownVars);
    if (
      inherit &&
      motionEnabled &&
      parentConfig.tokenStyle[MOTION_UNIT] === '0s' &&
      ownVars?.[MOTION_UNIT] === undefined
    ) {
      scoped[MOTION_UNIT] = overrides[MOTION_UNIT] =
        DEFAULT_TOKEN_STYLE[MOTION_UNIT];
    }

    // The CSS algorithms redeclare these seeds on every scope. Replay
    // explicit overrides and let CSS supply the defaults for this scope.
    const algorithmSeeds: string[] =
      mode === 'dark' ? [...DARK_SCOPE_SEEDS] : [];
    if (compact) algorithmSeeds.push(CONTROL_HEIGHT);
    const portal: Record<string, string> = {
      ...(inherit ? parentConfig.tokenStyle : {}),
      ...scoped,
    };
    for (const name of algorithmSeeds) {
      if (Object.hasOwn(overrides, name)) {
        scoped[name] = portal[name] = overrides[name];
      } else {
        delete scoped[name];
        delete portal[name];
      }
    }
    return {
      scopedVars: scoped,
      tokenStyle: portal,
      tokenOverrides: overrides,
    };
  }, [
    inherit,
    mode,
    compact,
    parentCompact,
    motionEnabled,
    explicitLight,
    parentConfig.tokenStyle,
    parentConfig.tokenOverrides,
    ownVars,
  ]);

  /**
   * `display: contents` makes this wrapper layout-transparent so a
   * `<TaoProvider>` nested inside a flex/grid parent doesn't collapse its
   * children into one grid/flex item. CSS custom properties still cascade
   * to descendants regardless of `display: contents`.
   */
  const divStyle = useMemo<CSSProperties>(
    () => ({ display: 'contents', ...scopedVars }),
    [scopedVars],
  );

  const parentSize = parentConfig.size;
  const parentDisabled = parentConfig.disabled;
  const parentVariant = parentConfig.variant;
  const config = useMemo<TaoConfigContextValue>(
    () => ({
      direction,
      size: size ?? (inherit ? parentSize : 'medium'),
      disabled: disabled ?? (inherit ? parentDisabled : false),
      variant: variant ?? (inherit ? parentVariant : 'outlined'),
      mode,
      compact,
      tokenStyle,
      tokenOverrides,
      locale,
    }),
    [
      direction,
      size,
      disabled,
      variant,
      inherit,
      parentSize,
      parentDisabled,
      parentVariant,
      mode,
      compact,
      tokenStyle,
      tokenOverrides,
      locale,
    ],
  );

  return (
    <TaoConfigContext.Provider value={config}>
      <div
        ref={directionRef}
        dir={directionProp}
        style={divStyle}
        data-tao-provider=""
        data-tao-theme={mode === 'light' ? undefined : mode}
        data-tao-density={compact ? 'compact' : undefined}
      >
        {children}
      </div>
    </TaoConfigContext.Provider>
  );
}
