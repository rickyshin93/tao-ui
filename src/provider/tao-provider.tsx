import {
  type CSSProperties,
  type ReactNode,
  createContext,
  useContext,
  useMemo,
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

export interface TaoThemeConfig {
  token?: Partial<TaoSeedToken>;
  inherit?: boolean;
}

// ---- Config Context ----

export type TaoSize = 'small' | 'medium' | 'large';
export type TaoVariant = 'outlined' | 'filled' | 'borderless';

interface TaoConfigContextValue {
  size: TaoSize;
  disabled: boolean;
  variant: TaoVariant;
}

const TaoConfigContext = createContext<TaoConfigContextValue>({
  size: 'medium',
  disabled: false,
  variant: 'outlined',
});

export function useTaoConfig(): TaoConfigContextValue {
  return useContext(TaoConfigContext);
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

export function TaoProvider({
  theme,
  size,
  disabled,
  variant,
  children,
}: TaoProviderProps) {
  const parentConfig = useContext(TaoConfigContext);
  const inherit = theme?.inherit ?? true;

  const config = useMemo<TaoConfigContextValue>(
    () => ({
      size: size ?? (inherit ? parentConfig.size : 'medium'),
      disabled: disabled ?? (inherit ? parentConfig.disabled : false),
      variant: variant ?? (inherit ? parentConfig.variant : 'outlined'),
    }),
    [size, disabled, variant, parentConfig, inherit],
  );

  const style = useMemo(() => {
    if (!theme?.token) return undefined;

    const vars: Record<string, string> = {};
    const t = theme.token;

    for (const [key, varName] of Object.entries(TOKEN_TO_VAR)) {
      const val = t[key as keyof TaoSeedToken];
      if (val != null) vars[varName] = String(val);
    }

    for (const [key, varName] of Object.entries(TOKEN_TO_VAR_PX)) {
      const val = t[key as keyof TaoSeedToken];
      if (val != null) vars[varName] = `${val}px`;
    }

    return vars as CSSProperties;
  }, [theme?.token]);

  return (
    <TaoConfigContext.Provider value={config}>
      <div style={style} data-tao-provider="">
        {children}
      </div>
    </TaoConfigContext.Provider>
  );
}
