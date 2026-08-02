import { Slot } from '@radix-ui/react-slot';
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useRef,
} from 'react';

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
  inherit?: boolean;
}

// ---- Config Context ----

export type TaoSize = 'small' | 'medium' | 'large';
export type TaoVariant = 'outlined' | 'filled' | 'borderless';
export type TaoStatus = 'error' | 'warning';

export interface TaoConfig {
  size: TaoSize;
  disabled: boolean;
  variant: TaoVariant;
  /** Resolved 明暗模式，portal 浮层用它重建 data-tao-theme。 */
  mode: TaoThemeMode;
}

interface TaoConfigContextValue extends TaoConfig {
  /**
   * Merged CSS custom-property overrides from this provider and all ancestors.
   * Carried through context so portaled layers (Modal/Drawer/Select dropdown…)
   * — which render outside the provider's DOM subtree — can re-apply the theme.
   */
  tokenStyle: CSSProperties;
}

const TaoConfigContext = createContext<TaoConfigContextValue>({
  size: 'medium',
  disabled: false,
  variant: 'outlined',
  mode: 'light',
  tokenStyle: {},
});

export function useTaoConfig(): TaoConfig {
  const { size, disabled, variant, mode } = useContext(TaoConfigContext);
  return useMemo(
    () => ({ size, disabled, variant, mode }),
    [size, disabled, variant, mode],
  );
}

function useTaoInternalConfig(): TaoConfigContextValue {
  return useContext(TaoConfigContext);
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
}: {
  children: ReactNode;
  style?: CSSProperties;
  asChild?: boolean;
}) {
  const { tokenStyle, mode } = useTaoInternalConfig();
  const themeAttr = mode === 'light' ? undefined : { 'data-tao-theme': mode };
  if (asChild) {
    return (
      <Slot
        data-tao-provider=""
        {...themeAttr}
        style={{ ...tokenStyle, ...style }}
      >
        {children}
      </Slot>
    );
  }
  return (
    <div
      data-tao-provider=""
      {...themeAttr}
      style={{ display: 'contents', ...tokenStyle, ...style }}
    >
      {children}
    </div>
  );
}

// ---- Provider ----

export interface TaoProviderProps {
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

const DEFAULT_TOKEN_STYLE = {
  '--tao-color-primary': 'oklch(0.205 0.01 70)',
  '--tao-color-success': 'oklch(0.555 0.14 155)',
  '--tao-color-warning': 'oklch(0.7 0.15 70)',
  '--tao-color-error': 'oklch(0.57 0.19 25)',
  '--tao-color-bg-base': 'oklch(0.985 0.004 70)',
  '--tao-color-text-base': 'oklch(0.155 0.01 70)',
  '--tao-color-bg-surface': 'oklch(1 0 0)',
  '--tao-color-text-light-solid': 'oklch(0.985 0.004 70)',
  '--tao-radius': '10px',
  '--tao-font-size': '14px',
  '--tao-control-height': '32px',
  '--tao-size-unit': '4px',
  '--tao-size-step': '4',
  '--tao-line-width': '1px',
  '--tao-font-family':
    '"Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  '--tao-font-family-code':
    '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  '--tao-motion-unit': '0.1s',
  '--tao-z-index-base': '0',
  '--tao-z-index-popup-base': '1000',
} as CSSProperties;

/**
 * Stable memoization key for theme.token: users routinely inline
 * `theme={{ token: {...} }}` — a fresh object every render — which would
 * otherwise cascade through ownVars → tokenStyle → config and force every
 * `useTaoConfig()` consumer to rerender on every parent render.
 */
function useStableTokenKey(token: Partial<TaoSeedToken> | undefined): string {
  const key = JSON.stringify(token ?? null);
  const ref = useRef(key);
  if (ref.current !== key) ref.current = key;
  return ref.current;
}

export function TaoProvider({
  theme,
  size,
  disabled,
  variant,
  children,
}: TaoProviderProps) {
  const parentConfig = useContext(TaoConfigContext);
  const inherit = theme?.inherit ?? true;
  const token = theme?.token;
  const tokenKey = useStableTokenKey(token);

  const ownVars = useMemo(() => {
    const parsedToken = JSON.parse(tokenKey) as Partial<TaoSeedToken> | null;
    if (!parsedToken) return undefined;

    const vars: Record<string, string> = {};

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
      vars['--tao-motion-unit'] = '0s';
    } else if (parsedToken.motionUnit != null) {
      vars['--tao-motion-unit'] = `${parsedToken.motionUnit}s`;
    }

    return vars;
  }, [tokenKey]);

  const scopedVars = useMemo<CSSProperties>(
    () => (inherit ? { ...ownVars } : { ...DEFAULT_TOKEN_STYLE, ...ownVars }),
    [inherit, ownVars],
  );

  const tokenStyle = useMemo<CSSProperties>(
    () =>
      inherit
        ? { ...parentConfig.tokenStyle, ...scopedVars }
        : { ...scopedVars },
    [inherit, parentConfig.tokenStyle, scopedVars],
  );

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
  const parentMode = parentConfig.mode;
  const mode = theme?.mode ?? (inherit ? parentMode : 'light');

  const config = useMemo<TaoConfigContextValue>(
    () => ({
      size: size ?? (inherit ? parentSize : 'medium'),
      disabled: disabled ?? (inherit ? parentDisabled : false),
      variant: variant ?? (inherit ? parentVariant : 'outlined'),
      mode,
      tokenStyle,
    }),
    [
      size,
      disabled,
      variant,
      inherit,
      parentSize,
      parentDisabled,
      parentVariant,
      mode,
      tokenStyle,
    ],
  );

  return (
    <TaoConfigContext.Provider value={config}>
      <div
        style={divStyle}
        data-tao-provider=""
        data-tao-theme={mode === 'light' ? undefined : mode}
      >
        {children}
      </div>
    </TaoConfigContext.Provider>
  );
}
