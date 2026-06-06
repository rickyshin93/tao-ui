# tao-ui 设计规范

> 道法自然 — 克制的、有序的、笃定的

本文档定义 tao-ui 的完整视觉语言。所有组件必须严格遵循这些 token，不允许硬编码值。

---

## 1. 设计哲学

**约束即自由**。tao-ui 通过严格的 token 系统消除视觉决策，让 AI（和人类）只需选择"用哪个组件"，而非"用什么颜色/间距/圆角"。

核心原则：
- 能用间距解决的不用线条
- 能用灰度解决的不用颜色
- 能用留白解决的不用装饰
- 一个 token 值只出现一次定义

---

## 2. Token 架构（参考 antd v6）

### 2.1 分层模型

```
Seed Token (用户配置入口)
    ↓  CSS calc() / color-mix() 自动派生
Derived Token (组件消费)
    ↓  组件内部引用
Component Token (可选的单组件覆盖)
```

与 antd 的区别：
- antd: 3 层 (Seed → Map → Alias) + CSS-in-JS runtime 派生
- tao-ui: 2 层 (Seed → Derived) + **纯 CSS 派生，零 JS runtime**
- antd 用 `@ant-design/colors` 在运行时算色板 → tao-ui 用 `color-mix(in oklch)` 在浏览器原生计算

### 2.2 Seed Token（用户唯一配置入口）

参考 antd v6 `SeedToken` 接口，精简为 tao-ui 实际需要的种子：

```ts
interface TaoSeedToken {
  // ---- 色彩种子 ----
  colorPrimary: string;       // 品牌主色 (默认: oklch(0.205 0.010 70))
  colorSuccess: string;       // 成功色   (默认: oklch(0.555 0.140 155))
  colorWarning: string;       // 警告色   (默认: oklch(0.700 0.150 70))
  colorError: string;         // 错误色   (默认: oklch(0.570 0.190 25))
  colorBgBase: string;        // 背景基色 (默认: oklch(0.985 0.004 70))
  colorTextBase: string;      // 文字基色 (默认: oklch(0.155 0.010 70))

  // ---- 尺寸种子 ----
  borderRadius: number;       // 基础圆角 px (默认: 6)
  fontSize: number;           // 基础字号 px (默认: 14)
  controlHeight: number;      // 控件基础高度 px (默认: 36)
  sizeUnit: number;           // 间距基础单位 px (默认: 4)
  sizeStep: number;           // 间距步长 (默认: 4)
  lineWidth: number;          // 边框宽度 px (默认: 1)

  // ---- 字体种子 ----
  fontFamily: string;
  fontFamilyCode: string;

  // ---- 动效种子 ----
  motionUnit: number;         // 动效时长单位 (默认: 0.1)，0 表示关闭动画
  motion: boolean;            // 动效开关 (默认: true)

  // ---- z-index ----
  zIndexBase: number;         // 基础 z-index (默认: 0)
  zIndexPopupBase: number;    // 浮层基础 z-index (默认: 1000)
}
```

### 2.3 Derived Token（CSS 自动派生）

所有 Derived Token 在 CSS 中通过 `calc()` 和 `color-mix()` 从 Seed 自动计算。
**用户不需要手动设置任何 Derived Token。** 改一个 Seed → 所有下游自动跟随。

#### 2.3.1 色彩派生

参考 antd `ColorPrimaryMapToken`、`ColorSuccessMapToken` 等，每个语义色从 seed 派生出一组梯度：

```css
:root {
  /* == Seed == */
  --tao-color-primary:   oklch(0.205 0.010 70);
  --tao-color-success:   oklch(0.555 0.140 155);
  --tao-color-warning:   oklch(0.700 0.150 70);
  --tao-color-error:     oklch(0.570 0.190 25);
  --tao-color-bg-base:   oklch(0.985 0.004 70);
  --tao-color-text-base: oklch(0.155 0.010 70);

  /* == Primary 派生 (参考 antd colorPrimaryBg/Hover/Active) == */
  --tao-primary:            var(--tao-color-primary);
  --tao-primary-hover:      color-mix(in oklch, var(--tao-color-primary) 80%, white);
  --tao-primary-active:     color-mix(in oklch, var(--tao-color-primary) 90%, black);
  --tao-primary-bg:         color-mix(in oklch, var(--tao-color-primary) 8%, var(--tao-color-bg-base));
  --tao-primary-bg-hover:   color-mix(in oklch, var(--tao-color-primary) 12%, var(--tao-color-bg-base));
  --tao-primary-border:     color-mix(in oklch, var(--tao-color-primary) 30%, var(--tao-color-bg-base));
  --tao-primary-fg:         var(--tao-color-bg-base);  /* 文字反色 */

  /* == Error 派生 (参考 antd colorErrorBg/Hover/Active) == */
  --tao-error:              var(--tao-color-error);
  --tao-error-hover:        color-mix(in oklch, var(--tao-color-error) 80%, white);
  --tao-error-active:       color-mix(in oklch, var(--tao-color-error) 90%, black);
  --tao-error-bg:           color-mix(in oklch, var(--tao-color-error) 6%, var(--tao-color-bg-base));
  --tao-error-border:       color-mix(in oklch, var(--tao-color-error) 30%, var(--tao-color-bg-base));
  --tao-error-fg:           var(--tao-color-bg-base);

  /* == Success 派生 == */
  --tao-success:            var(--tao-color-success);
  --tao-success-hover:      color-mix(in oklch, var(--tao-color-success) 80%, white);
  --tao-success-bg:         color-mix(in oklch, var(--tao-color-success) 6%, var(--tao-color-bg-base));
  --tao-success-border:     color-mix(in oklch, var(--tao-color-success) 30%, var(--tao-color-bg-base));

  /* == Warning 派生 == */
  --tao-warning:            var(--tao-color-warning);
  --tao-warning-hover:      color-mix(in oklch, var(--tao-color-warning) 80%, white);
  --tao-warning-bg:         color-mix(in oklch, var(--tao-color-warning) 6%, var(--tao-color-bg-base));
  --tao-warning-border:     color-mix(in oklch, var(--tao-color-warning) 30%, var(--tao-color-bg-base));

  /* == 中性色派生 (参考 antd ColorNeutralMapToken) == */
  /* 文字 4 级梯度 (antd: colorText/Secondary/Tertiary/Quaternary) */
  --tao-color-text:              var(--tao-color-text-base);
  --tao-color-text-secondary:    color-mix(in oklch, var(--tao-color-text-base) 65%, var(--tao-color-bg-base));
  --tao-color-text-tertiary:     color-mix(in oklch, var(--tao-color-text-base) 45%, var(--tao-color-bg-base));
  --tao-color-text-quaternary:   color-mix(in oklch, var(--tao-color-text-base) 30%, var(--tao-color-bg-base));

  /* 填充 4 级梯度 (antd: colorFill/Secondary/Tertiary/Quaternary) */
  --tao-color-fill:              color-mix(in oklch, var(--tao-color-text-base) 15%, var(--tao-color-bg-base));
  --tao-color-fill-secondary:    color-mix(in oklch, var(--tao-color-text-base) 10%, var(--tao-color-bg-base));
  --tao-color-fill-tertiary:     color-mix(in oklch, var(--tao-color-text-base) 6%, var(--tao-color-bg-base));
  --tao-color-fill-quaternary:   color-mix(in oklch, var(--tao-color-text-base) 3%, var(--tao-color-bg-base));

  /* 背景 3 级 (antd: colorBgLayout/Container/Elevated) */
  --tao-color-bg-layout:         color-mix(in oklch, var(--tao-color-text-base) 4%, var(--tao-color-bg-base));
  --tao-color-bg-container:      var(--tao-color-bg-base);
  --tao-color-bg-elevated:       var(--tao-color-bg-base);
  --tao-color-bg-spotlight:      var(--tao-color-text-base);

  /* 边框 2 级 (antd: colorBorder/Secondary) */
  --tao-color-border:            color-mix(in oklch, var(--tao-color-text-base) 18%, var(--tao-color-bg-base));
  --tao-color-border-secondary:  color-mix(in oklch, var(--tao-color-text-base) 10%, var(--tao-color-bg-base));
}
```

#### 2.3.2 圆角派生

参考 antd `genRadius()` — 使用分段映射而非线性比例。
antd 对不同 radiusBase 范围有不同的映射策略，确保视觉协调：

```css
:root {
  /* == Seed == */
  --tao-radius: 6px;

  /* == 派生 (antd genRadius 算法简化版) == */
  /* antd: borderRadiusXS, borderRadiusSM, borderRadius, borderRadiusLG */
  --tao-radius-xs:   2px;                               /* antd: 2 when base>=6 */
  --tao-radius-sm:   calc(var(--tao-radius) - 2px);     /* antd: 4 when base=6 */
  --tao-radius-md:   var(--tao-radius);                  /* 基准值 */
  --tao-radius-lg:   calc(var(--tao-radius) + 2px);     /* antd: +2 when 6<=base<16 */
  --tao-radius-xl:   calc(var(--tao-radius) * 2);       /* 扩展: dialog/popover */
  --tao-radius-2xl:  calc(var(--tao-radius) * 2.67);    /* 扩展: 大型容器 */
  --tao-radius-full: 9999px;
}
```

> 注意：CSS `calc()` 无法做 antd 那种 if/else 分段逻辑。如果用户设的 borderRadius 偏离默认值较大，`TaoProvider` 会在 JS 侧用 antd 同款 `genRadius()` 算法计算并注入正确值。

#### 2.3.3 控件高度派生

参考 antd `genControlHeight()` — 使用比例因子：

```css
:root {
  /* == Seed == */
  --tao-control-height: 36px;

  /* == 派生 (antd: *0.75, *1.25) == */
  --tao-control-height-xs:  calc(var(--tao-control-height) * 0.5);    /* 18px — 极小控件 */
  --tao-control-height-sm:  calc(var(--tao-control-height) * 0.875);  /* 32px (≈31.5 四舍五入) */
  --tao-control-height-lg:  calc(var(--tao-control-height) * 1.11);   /* 40px (≈39.96) */
}
```

> 注：antd 的 `controlHeight` 默认 32，乘以 0.75=24, 1.25=40。tao-ui 默认 36，
> 调整系数使 sm=32, lg=40 保持和 antd 同样的阶梯差距。

#### 2.3.4 尺寸/间距派生

参考 antd `genSizeMapToken()` — 基于 `sizeUnit` 和 `sizeStep`：

```css
:root {
  /* == Seed == */
  --tao-size-unit: 4px;
  --tao-size-step: 4;

  /* == 派生 (antd 公式: sizeUnit * (sizeStep ± N)) == */
  --tao-size-xxs:  calc(var(--tao-size-unit) * (var(--tao-size-step) - 3));  /*  4px */
  --tao-size-xs:   calc(var(--tao-size-unit) * (var(--tao-size-step) - 2));  /*  8px */
  --tao-size-sm:   calc(var(--tao-size-unit) * (var(--tao-size-step) - 1));  /* 12px */
  --tao-size:      calc(var(--tao-size-unit) * var(--tao-size-step));         /* 16px */
  --tao-size-ms:   calc(var(--tao-size-unit) * var(--tao-size-step));         /* 16px (=size) */
  --tao-size-md:   calc(var(--tao-size-unit) * (var(--tao-size-step) + 1));  /* 20px */
  --tao-size-lg:   calc(var(--tao-size-unit) * (var(--tao-size-step) + 2));  /* 24px */
  --tao-size-xl:   calc(var(--tao-size-unit) * (var(--tao-size-step) + 4));  /* 32px */
  --tao-size-xxl:  calc(var(--tao-size-unit) * (var(--tao-size-step) + 8));  /* 48px */

  /* padding 语义别名 (参考 antd AliasToken padding 系列) */
  --tao-padding-xxs:  2px;
  --tao-padding-xs:   calc(var(--tao-size-unit) * 2);       /*  8px */
  --tao-padding-sm:   calc(var(--tao-size-unit) * 3);       /* 12px */
  --tao-padding:      calc(var(--tao-size-unit) * 4);       /* 16px */
  --tao-padding-md:   calc(var(--tao-size-unit) * 5);       /* 20px */
  --tao-padding-lg:   calc(var(--tao-size-unit) * 6);       /* 24px */
  --tao-padding-xl:   calc(var(--tao-size-unit) * 8);       /* 32px */

  /* margin 语义别名 (参考 antd AliasToken margin 系列) */
  --tao-margin-xxs:   calc(var(--tao-size-unit) * 1);       /*  4px */
  --tao-margin-xs:    calc(var(--tao-size-unit) * 2);       /*  8px */
  --tao-margin-sm:    calc(var(--tao-size-unit) * 3);       /* 12px */
  --tao-margin:       calc(var(--tao-size-unit) * 4);       /* 16px */
  --tao-margin-md:    calc(var(--tao-size-unit) * 5);       /* 20px */
  --tao-margin-lg:    calc(var(--tao-size-unit) * 6);       /* 24px */
  --tao-margin-xl:    calc(var(--tao-size-unit) * 8);       /* 32px */
  --tao-margin-xxl:   calc(var(--tao-size-unit) * 12);      /* 48px */
}
```

#### 2.3.5 字体派生

参考 antd `genFontSizes()` — 使用自然对数阶梯 (`Math.E ** (i/5)`)。
CSS 无法做指数运算，所以在 `TaoProvider` JS 侧计算后注入。

默认值（fontSize=14 时）：

```css
:root {
  /* == Seed == */
  --tao-font-size: 14px;

  /* == 派生 (antd 自然对数阶梯) == */
  --tao-font-size-sm:        12px;    /* antd fontSizeSM */
  --tao-font-size-base:      14px;    /* antd fontSize (= seed) */
  --tao-font-size-lg:        16px;    /* antd fontSizeLG */
  --tao-font-size-xl:        20px;    /* antd fontSizeXL */
  --tao-font-size-heading-5: 16px;    /* h5 */
  --tao-font-size-heading-4: 20px;    /* h4 */
  --tao-font-size-heading-3: 24px;    /* h3 */
  --tao-font-size-heading-2: 30px;    /* h2 */
  --tao-font-size-heading-1: 38px;    /* h1 */

  /* 行高 (antd: (fontSize + 8) / fontSize) */
  --tao-line-height:         1.5714;  /* (14+8)/14 */
  --tao-line-height-sm:      1.6667;  /* (12+8)/12 */
  --tao-line-height-lg:      1.5;     /* (16+8)/16 */
  --tao-line-height-heading-5: 1.5;
  --tao-line-height-heading-4: 1.4;
  --tao-line-height-heading-3: 1.3333;
  --tao-line-height-heading-2: 1.2667;
  --tao-line-height-heading-1: 1.2105;
}
```

#### 2.3.6 动效派生

参考 antd `genCommonMapToken()` — 基于 `motionUnit` + `motionBase`：

```css
:root {
  /* == Seed == */
  --tao-motion-unit: 0.1s;

  /* == 派生 (antd: base + unit*N) == */
  --tao-motion-duration-fast: calc(var(--tao-motion-unit) * 1);  /* 0.1s */
  --tao-motion-duration-mid:  calc(var(--tao-motion-unit) * 2);  /* 0.2s */
  --tao-motion-duration-slow: calc(var(--tao-motion-unit) * 3);  /* 0.3s */

  /* 缓动曲线 (参考 antd seed 中的预设) */
  --tao-motion-ease-out:          cubic-bezier(0.215, 0.61, 0.355, 1);
  --tao-motion-ease-in-out:       cubic-bezier(0.645, 0.045, 0.355, 1);
  --tao-motion-ease-out-circ:     cubic-bezier(0.08, 0.82, 0.17, 1);
  --tao-motion-ease-in-out-circ:  cubic-bezier(0.78, 0.14, 0.15, 0.86);
  --tao-motion-ease-out-quint:    cubic-bezier(0.23, 1, 0.32, 1);
}
```

#### 2.3.7 阴影派生

参考 antd `AliasToken` 的 `boxShadow` / `boxShadowSecondary` / `boxShadowTertiary`：

```css
:root {
  --tao-box-shadow:           0 1px 2px oklch(0 0 0 / 0.04),
                              0 0 1px oklch(0 0 0 / 0.08);
  --tao-box-shadow-secondary: 0 2px 6px oklch(0 0 0 / 0.04),
                              0 0 1px oklch(0 0 0 / 0.06);
  --tao-box-shadow-tertiary:  0 1px 2px oklch(0 0 0 / 0.04);
}
```

#### 2.3.8 语义别名 (Alias Token)

参考 antd `AliasToken`，为组件消费提供语义化变量：

```css
:root {
  /* 文字 (antd: colorTextPlaceholder, colorTextDisabled, colorTextHeading, colorTextLabel, colorTextDescription) */
  --tao-color-text-placeholder:  var(--tao-color-text-quaternary);
  --tao-color-text-disabled:     var(--tao-color-text-quaternary);
  --tao-color-text-heading:      var(--tao-color-text);
  --tao-color-text-label:        var(--tao-color-text-secondary);
  --tao-color-text-description:  var(--tao-color-text-tertiary);

  /* 背景 (antd: colorBgContainerDisabled, colorBgTextHover, colorBgTextActive) */
  --tao-color-bg-container-disabled: var(--tao-color-fill-tertiary);
  --tao-color-bg-text-hover:         var(--tao-color-fill-tertiary);
  --tao-color-bg-text-active:        var(--tao-color-fill-secondary);

  /* 控件交互 (antd: controlItemBgHover, controlItemBgActive, controlItemBgActiveHover) */
  --tao-control-item-bg-hover:         var(--tao-color-fill-tertiary);
  --tao-control-item-bg-active:        var(--tao-primary-bg);
  --tao-control-item-bg-active-hover:  var(--tao-primary-bg-hover);

  /* focus 环 (antd: controlOutline, colorWarningOutline, colorErrorOutline) */
  --tao-control-outline:         color-mix(in oklch, var(--tao-color-primary) 16%, transparent);
  --tao-color-warning-outline:   color-mix(in oklch, var(--tao-color-warning) 16%, transparent);
  --tao-color-error-outline:     color-mix(in oklch, var(--tao-color-error) 16%, transparent);

  /* 分割线 (antd: colorSplit) */
  --tao-color-split: var(--tao-color-border-secondary);

  /* 字重 (antd: fontWeightStrong) */
  --tao-font-weight-strong: 600;

  /* 线宽 (antd: lineWidthBold = lineWidth + 1) */
  --tao-line-width-bold: calc(var(--tao-line-width) + 1px);

  /* 控件 padding (antd: controlPaddingHorizontal, controlPaddingHorizontalSM) */
  --tao-control-padding-horizontal:    var(--tao-padding-sm);   /* 12px */
  --tao-control-padding-horizontal-sm: var(--tao-padding-xs);   /*  8px */

  /* 加载态透明度 */
  --tao-opacity-loading: 0.65;
}
```

---

## 3. TaoProvider（参考 antd ConfigProvider）

### 3.1 完整 API

参考 antd `ConfigProviderProps`，tao-ui 的 Provider 不仅管主题，还管全局行为：

```tsx
interface TaoProviderProps {
  children: React.ReactNode;

  // ---- 主题 (参考 antd theme) ----
  theme?: TaoThemeConfig;

  // ---- 全局 Size (参考 antd componentSize) ----
  /** 全局尺寸，所有子组件继承。组件自身 size prop 优先级更高 */
  size?: 'small' | 'medium' | 'large';

  // ---- 全局 Disabled (参考 antd componentDisabled) ----
  /** 全局禁用，所有子组件继承。用于"提交中"等场景一键禁用整个表单 */
  disabled?: boolean;

  // ---- 全局 Variant (参考 antd v6 Variants) ----
  /** 全局表单控件变体，所有 Input/Select 等继承 */
  variant?: 'outlined' | 'filled' | 'borderless';
}

interface TaoThemeConfig {
  /** 覆盖 Seed Token */
  token?: Partial<TaoSeedToken>;

  /** 主题算法 (参考 antd algorithm) */
  algorithm?: 'default' | 'dark' | 'compact' | TaoAlgorithm | TaoAlgorithm[];

  /** 覆盖单个组件的 token (参考 antd ComponentsConfig) */
  components?: {
    Button?: Partial<ButtonComponentToken>;
    Input?: Partial<InputComponentToken>;
    Select?: Partial<SelectComponentToken>;
    FormField?: Partial<FormFieldComponentToken>;
    // ...
  };

  /** 是否继承外层 TaoProvider 的主题 (默认 true) */
  inherit?: boolean;
}
```

### 3.2 全局 Size 传递（参考 antd componentSize + SizeContext）

antd 的 `componentSize` 通过 React Context 传递，每个组件内部 `const size = props.size ?? contextSize ?? 'middle'`。

```tsx
// 管理后台：全局用小尺寸提高信息密度
<TaoProvider size="small">
  <AdminApp />  {/* 所有 Button/Input/Select 自动变 small */}
</TaoProvider>

// 单个组件可覆盖
<TaoProvider size="small">
  <Input />                    {/* small */}
  <Button size="large">OK</Button>  {/* large，props 优先 */}
</TaoProvider>
```

组件内部消费：
```tsx
function Button({ size, ...props }: ButtonProps) {
  const { size: ctxSize } = useTaoConfig();
  const resolvedSize = size ?? ctxSize ?? 'medium';
  // ...
}
```

### 3.3 全局 Disabled（参考 antd componentDisabled）

```tsx
// 提交中 → 一键禁用整个表单
<TaoProvider disabled={isSubmitting}>
  <FormSection>
    <FormField label="Name"><Input /></FormField>
    <FormField label="Email"><Input /></FormField>
    <FormActions>
      <Button variant="primary" loading={isSubmitting}>Submit</Button>
    </FormActions>
  </FormSection>
</TaoProvider>
```

### 3.4 全局 Variant（参考 antd v6 Variants）

antd v6 引入 `Variants: ["outlined", "borderless", "filled", "underlined"]`，可在 ConfigProvider 级别统一设置。

```tsx
// 管理后台偏好 filled 风格（灰底无边框）
<TaoProvider variant="filled">
  <Input />     {/* 灰底填充，无边框 */}
  <Select />    {/* 灰底填充，无边框 */}
</TaoProvider>

// C端 portal 用 outlined 风格（白底带边框）
<TaoProvider variant="outlined">
  <Input />     {/* 白底，浅灰边框 */}
</TaoProvider>
```

tao-ui 支持 3 种 variant：

| Variant | 外观 | 适用场景 |
|---------|------|----------|
| `outlined` | 白底 + 边框 (默认) | Portal、表单页 |
| `filled` | 灰底填充，无边框 | 管理后台、紧凑布局 |
| `borderless` | 透明底，无边框 | 表格内编辑、嵌入式 |

### 3.5 主题算法（参考 antd algorithm）

antd 暗色/紧凑不是硬编码另一套 token，而是切换"派生算法"。
同样的 seed → 不同的 map 规则。算法可组合叠加。

```tsx
import { darkAlgorithm, compactAlgorithm } from 'tao-ui';

// 暗色主题
<TaoProvider theme={{ algorithm: 'dark' }}>
  <App />
</TaoProvider>

// 暗色 + 紧凑 (组合算法，参考 antd [dark, compact])
<TaoProvider theme={{ algorithm: [darkAlgorithm, compactAlgorithm] }}>
  <DashboardApp />
</TaoProvider>
```

#### 3.5.1 Dark 算法（参考 antd dark/colors.js）

暗色算法核心差异（参考 antd `generateNeutralColorPalettes` 暗色版）：

```ts
// 亮色: text 梯度用透明度递减
colorText = alpha(textBase, 0.88)
colorTextSecondary = alpha(textBase, 0.65)

// 暗色: 翻转 — bgBase=#000, textBase=#fff
colorText = alpha(textBase, 0.85)
colorBgContainer = lighten(bgBase, 8)   // 比纯黑提亮一点
colorBgElevated = lighten(bgBase, 12)   // 浮层比容器更亮
colorBorder = lighten(bgBase, 26)       // 边框更明显
```

tao-ui 用 `color-mix(in oklch)` 实现同样效果，无需 JS runtime：

```css
[data-tao-theme="dark"] {
  --tao-color-bg-base:  oklch(0.145 0.005 70);
  --tao-color-text-base: oklch(0.93 0.004 70);
  /* 其余 derived token 通过 color-mix 自动适应 */
}
```

#### 3.5.2 Compact 算法（参考 antd compact/index.js）

紧凑模式的核心（参考 antd `genCompactSizeMapToken`）：

```ts
// antd compact 算法：
sizeStep = defaultSizeStep - 2;           // 4 → 2
controlHeight = defaultControlHeight - 4; // 32 → 28
fontSize = fontSizeSM;                    // 14 → 12

// tao-ui compact 算法：
--tao-size-step: 2;                       // 4 → 2
--tao-control-height: 32px;               // 36 → 32
--tao-font-size: 12px;                    // 14 → 12
```

### 3.6 Component Token（参考 antd ComponentTokenMap）

每个组件有自己的 token，组件内部 `var(--tao-{component}-{token}, fallback)`：

```tsx
// 让某个区域的 Button 变成 pill 形
<TaoProvider theme={{
  components: {
    Button: { borderRadius: 9999 },
  }
}}>
  <PillButtons />
</TaoProvider>
```

#### Button ComponentToken（参考 antd ButtonToken）

```ts
interface ButtonComponentToken {
  fontWeight?: CSSProperties['fontWeight'];
  borderRadius?: number;
  paddingInline?: number;         // 水平内边距
  paddingInlineSM?: number;
  paddingInlineLG?: number;
  primaryColor?: string;          // 主按钮文字色
  primaryShadow?: string;
  defaultColor?: string;          // 默认按钮文字色
  defaultBg?: string;
  defaultBorderColor?: string;
  defaultHoverBg?: string;
  defaultHoverColor?: string;
  defaultHoverBorderColor?: string;
  contentFontSize?: number;
  contentFontSizeSM?: number;
  contentFontSizeLG?: number;
  onlyIconSize?: number;          // 纯图标按钮图标尺寸
}
```

#### Input ComponentToken（参考 antd InputToken）

```ts
interface InputComponentToken {
  paddingInline?: number;
  paddingInlineSM?: number;
  paddingInlineLG?: number;
  paddingBlock?: number;
  paddingBlockSM?: number;
  paddingBlockLG?: number;
  addonBg?: string;               // 前/后置标签背景色
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
```

#### FormField ComponentToken（参考 antd FormToken）

```ts
interface FormFieldComponentToken {
  labelColor?: string;
  labelFontSize?: number;
  labelHeight?: number | string;
  labelRequiredMarkColor?: string;  // 必填 * 号颜色
  labelColonMarginStart?: number;   // 冒号前间距
  labelColonMarginEnd?: number;     // 冒号后间距
  itemGap?: number;                 // FormField 之间的间距
  descriptionColor?: string;
  errorColor?: string;
  errorFontSize?: number;
}
```

### 3.7 嵌套 Provider

与 antd 一致，`TaoProvider` 可嵌套。子 Provider 只覆盖自己声明的变量，其余继承父级。
`size` / `disabled` / `variant` 同样级联：

```tsx
<TaoProvider size="medium" variant="outlined">
  <MainApp />

  {/* 侧栏：紧凑 + 填充风格 */}
  <TaoProvider size="small" variant="filled">
    <Sidebar />
  </TaoProvider>

  {/* 提交中：一键禁用 */}
  <TaoProvider disabled={isSubmitting}>
    <CheckoutForm />
  </TaoProvider>
</TaoProvider>
```

### 3.8 Hooks

#### `useTaoConfig()`（参考 antd ConfigProvider.useConfig）

```tsx
function useTaoConfig(): {
  size: 'small' | 'medium' | 'large';
  disabled: boolean;
  variant: 'outlined' | 'filled' | 'borderless';
}
```

组件内部用来读取 Provider 传递的全局配置。

#### `useTaoToken()`（参考 antd theme.useToken）

```tsx
function useTaoToken(): {
  token: ResolvedTaoToken;  // 当前生效的所有 token 值
}
```

用户在自定义组件中读取当前主题 token，确保和 tao-ui 组件视觉一致：

```tsx
function CustomCard({ children }: { children: React.ReactNode }) {
  const { token } = useTaoToken();
  return (
    <div style={{
      borderRadius: token.borderRadiusLG,
      border: `${token.lineWidth}px solid ${token.colorBorder}`,
      padding: token.paddingLG,
    }}>
      {children}
    </div>
  );
}
```

### 3.9 实现原理

```tsx
const TaoConfigContext = createContext<TaoConfigContextValue>({
  size: 'medium',
  disabled: false,
  variant: 'outlined',
});

function TaoProvider({ theme, size, disabled, variant, children }: TaoProviderProps) {
  const parentConfig = useContext(TaoConfigContext);
  const inherit = theme?.inherit ?? true;

  // 合并配置 (子覆盖父)
  const config = useMemo(() => ({
    size: size ?? (inherit ? parentConfig.size : 'medium'),
    disabled: disabled ?? (inherit ? parentConfig.disabled : false),
    variant: variant ?? (inherit ? parentConfig.variant : 'outlined'),
  }), [size, disabled, variant, parentConfig, inherit]);

  // 计算 CSS 变量
  const style = useMemo(() => {
    const vars: Record<string, string> = {};
    const algorithm = resolveAlgorithm(theme?.algorithm);

    if (theme?.token) {
      const t = theme.token;

      // 色彩 seed → CSS 变量 (color-mix 在浏览器自动派生)
      if (t.colorPrimary)  vars['--tao-color-primary'] = t.colorPrimary;
      if (t.colorError)    vars['--tao-color-error'] = t.colorError;
      if (t.colorSuccess)  vars['--tao-color-success'] = t.colorSuccess;
      if (t.colorWarning)  vars['--tao-color-warning'] = t.colorWarning;
      if (t.colorBgBase)   vars['--tao-color-bg-base'] = t.colorBgBase;
      if (t.colorTextBase) vars['--tao-color-text-base'] = t.colorTextBase;

      // 尺寸 seed → CSS 变量 (calc 在浏览器自动派生)
      if (t.borderRadius != null) {
        const radii = genRadius(t.borderRadius); // antd 分段逻辑
        vars['--tao-radius'] = `${t.borderRadius}px`;
        vars['--tao-radius-xs'] = `${radii.borderRadiusXS}px`;
        vars['--tao-radius-sm'] = `${radii.borderRadiusSM}px`;
        vars['--tao-radius-lg'] = `${radii.borderRadiusLG}px`;
      }
      if (t.controlHeight != null) vars['--tao-control-height'] = `${t.controlHeight}px`;
      if (t.sizeUnit != null)      vars['--tao-size-unit'] = `${t.sizeUnit}px`;
      if (t.lineWidth != null)     vars['--tao-line-width'] = `${t.lineWidth}px`;

      // 字体 seed → JS 计算注入 (antd 自然对数阶梯)
      if (t.fontSize != null) {
        const sizes = genFontSizes(t.fontSize);
        vars['--tao-font-size'] = `${t.fontSize}px`;
        sizes.forEach((s, i) => {
          vars[`--tao-font-size-${i}`] = `${s.size}px`;
          vars[`--tao-line-height-${i}`] = `${s.lineHeight}`;
        });
      }

      if (t.fontFamily)     vars['--tao-font-family'] = t.fontFamily;
      if (t.fontFamilyCode) vars['--tao-font-family-code'] = t.fontFamilyCode;
    }

    // Algorithm 覆盖 (dark/compact 注入额外变量)
    if (algorithm) {
      Object.assign(vars, algorithm.derive(theme?.token ?? {}));
    }

    // Component Token 覆盖
    if (theme?.components) {
      for (const [comp, tokens] of Object.entries(theme.components)) {
        for (const [key, value] of Object.entries(tokens as Record<string, unknown>)) {
          vars[`--tao-${kebab(comp)}-${kebab(key)}`] = String(value);
        }
      }
    }

    return vars;
  }, [theme]);

  return (
    <TaoConfigContext.Provider value={config}>
      <div style={style} data-tao-provider>
        {children}
      </div>
    </TaoConfigContext.Provider>
  );
}
```

---

## 4. 色彩系统

### 4.1 色彩空间

所有颜色使用 **OKLCH**。OKLCH 感知均匀 — 相同 lightness 值在视觉上亮度一致。

### 4.2 色调哲学

所有中性色统一偏向 **hue 70**（温暖的琥珀/砂岩方向）。chroma 极低（0.003-0.01），肉眼几乎不可见，但潜意识上创造温暖感。

### 4.3 60-30-10 指导

| 比例 | 角色 | Token |
|------|------|-------|
| 60% | 表面和背景 | `--tao-color-bg-*` 系列 |
| 30% | 文字和边框 | `--tao-color-text-*` + `--tao-color-border-*` |
| 10% | 交互高亮 | `--tao-primary` + 语义色 |

---

## 5. 字体系统

### 5.1 字体选择

| 角色 | 字体 | 理由 |
|------|------|------|
| **UI/正文** | **Geist Sans** | 几何骨架 + 人文主义细节，13-16px 下极清晰 |
| **等宽** | **Geist Mono** | 数字对齐完美，适合表格/代码/数值 |

```css
:root {
  --tao-font-family:      'Geist Sans', ui-sans-serif, system-ui, -apple-system, sans-serif;
  --tao-font-family-code: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

### 5.2 字重

```css
:root {
  --tao-font-weight-normal:   400;   /* 正文 */
  --tao-font-weight-medium:   500;   /* Label、导航项 */
  --tao-font-weight-strong:   600;   /* 标题、按钮 (antd: fontWeightStrong) */
}
```

> 不使用 700 (bold)。最重只到 600 — 克制。

### 5.3 规则

- 正文一律 `--tao-font-size-base` (14px)
- Label 使用 `--tao-font-size-sm` + `--tao-font-weight-medium`
- 单行最大宽度 `65ch`
- 不使用全大写（ALL CAPS）

---

## 6. 间距系统

由 Seed Token `sizeUnit`(4) + `sizeStep`(4) 自动派生。详见 §2.3.4。

语义间距约定：

| 场景 | Token | 默认值 |
|------|-------|----|
| 组件内部 padding | `--tao-padding-xs` ~ `--tao-padding-sm` | 8-12px |
| 表单字段间距 | `--tao-padding-md` | 20px |
| 表单分组间距 | `--tao-padding-xl` | 32px |
| Label ↔ Input | `--tao-margin-xxs` + 2px | 6px |
| Input ↔ Error | `--tao-margin-xxs` | 4px |
| 页面侧边 padding | `--tao-padding-lg` | 24px |

规则：
- 兄弟元素间距一律用 `gap`，不用 margin
- 层级越高，间距越大
- 间距只从 token 里选

---

## 7. 圆角系统

由 Seed Token `borderRadius`(6) 自动派生。详见 §2.3.2。

规则：
- 嵌套元素的圆角 = 外层圆角 - padding
- 一个组件内所有圆角来自同一级别或差一级

---

## 8. 阴影系统

```css
:root {
  --tao-box-shadow:           /* 默认阴影 */;
  --tao-box-shadow-secondary: /* 浮层阴影 */;
  --tao-box-shadow-tertiary:  /* 微弱阴影 */;
}
```

规则：
- 默认不加阴影。只有浮层（dropdown, popover, dialog）使用阴影
- Input/Button 不用 box-shadow 做装饰（focus ring 除外）

---

## 9. 边框系统

由 Seed Token `lineWidth`(1) 派生。

规则：
- 所有边框宽度 = `--tao-line-width`，默认 1px
- 边框颜色只用 `--tao-color-border` 或 `--tao-color-border-secondary`
- 禁止彩色侧边条（`border-left: 3px solid color`）

---

## 10. 动效系统

由 Seed Token `motionUnit`(0.1) 派生。详见 §2.3.6。

规则：
- 只 transition `opacity`, `transform`, `background-color`, `border-color`, `color`
- 不 animate `width`, `height`, `padding`, `margin`
- 高度展开用 `grid-template-rows: 0fr → 1fr`
- 尊重 `prefers-reduced-motion`: duration 设为 0
- 当 `motion: false` 时所有 duration 为 0

---

## 11. Focus 系统

参考 antd `controlOutline` + `controlOutlineWidth`：

```css
/* focus-visible 统一样式 */
outline: 2px solid var(--tao-control-outline);
outline-offset: 1px;
```

规则：
- 只在 `focus-visible` 时显示（keyboard only）
- Error 状态下切换为 `--tao-color-error-outline`
- 禁止移除 focus 样式

---

## 12. 组件规范

### 12.1 Button

```
尺寸 (消费 --tao-control-height 派生):
  sm:   h=control-height-sm(32px), px=padding-xs(8px),   text=font-size-sm, radius-sm
  md:   h=control-height(36px),    px=padding-sm(12px),   text=font-size-base, radius-md  (默认)
  lg:   h=control-height-lg(40px), px=padding(16px),      text=font-size-base, radius-md

变体:
  primary:     bg=primary, fg=primary-fg
  secondary:   bg=transparent, border=color-border, fg=color-text
  ghost:       bg=transparent, fg=color-text-secondary, hover:bg=color-bg-text-hover
  destructive: bg=error, fg=error-fg

状态:
  hover:    bg=primary-hover (或 error-hover)
  active:   bg=primary-active, scale(0.98)
  disabled: opacity=opacity-loading, pointer-events none
  loading:  spinner 替换文字，宽度锁定
```

API:
```tsx
<Button variant="primary" size="md" disabled loading>Submit</Button>
```

### 12.2 Input

```
尺寸 (消费 --tao-control-height 派生):
  sm:   h=control-height-sm(32px), px=control-padding-horizontal-sm(8px), text=font-size-sm
  md:   h=control-height(36px),    px=control-padding-horizontal(12px),    text=font-size-base  (默认)
  lg:   h=control-height-lg(40px), px=control-padding-horizontal(12px),    text=font-size-lg

状态:
  default:    border=color-border, bg=color-bg-container
  focus:      outline=control-outline
  error:      border=error-border, outline=color-error-outline
  disabled:   bg=color-bg-container-disabled, fg=color-text-disabled

结构:
  [prefix?] [input] [suffix?]
```

API:
```tsx
<Input size="md" placeholder="Enter email" prefix={<MailIcon />} error />
```

### 12.3 Select

```
触发器 = Input 一致
下拉面板:
  bg=color-bg-elevated, border=color-border, shadow=box-shadow-secondary, radius=radius-lg
  item: h=control-height, px=padding-xs, text=font-size-base
  item hover: bg=control-item-bg-hover
  item selected: bg=control-item-bg-active, font-weight=font-weight-strong
```

API:
```tsx
<Select options={[...]} placeholder="Choose..." value={value} onChange={setValue} />
```

### 12.4 FormField / FormSection / FormActions

与之前定义一致，但所有硬编码值替换为 token 引用。

---

## 13. Layout 组件规范

### 13.1 Stack

垂直或水平排列子元素，约束间距。

```
Props:
  direction: 'vertical' | 'horizontal'  (默认 vertical)
  gap:       'sm' | 'md' | 'lg'         (默认 md)
    sm = --tao-size-xs   (8px)
    md = --tao-size      (16px)
    lg = --tao-size-lg   (24px)
  align: 'start' | 'center' | 'end' | 'stretch' (默认 stretch)
```

### 13.2 FormLayout (页面模板)

```
  max-width: 640px, 居中
  padding: --tao-padding-lg 四边
  section 间 gap 由组件自控
```

---

## 14. 不做清单

| 不做 | 理由 |
|------|------|
| 渐变色文字 | AI slop 标志 |
| 彩色侧边条 | AI slop 标志 |
| 卡片嵌套卡片 | 视觉噪音 |
| 毛玻璃效果 | 装饰性大于功能性 |
| Bounce/elastic 动画 | 过时 |
| 纯黑 #000 / 纯白 #fff | 一律偏暖 |
| border-width > 1px | 除 focus ring 外无粗边框 |
| font-weight: 700 | 最重到 600 |
| ALL CAPS 文字 | 不用 |

---

## 15. 文件结构

```
src/
  theme/
    seed.ts              ← Seed Token 默认值 + 类型定义
    derived.css          ← CSS 变量定义 (Seed + Derived)
    gen-radius.ts        ← 圆角派生算法 (移植自 antd)
    gen-font-sizes.ts    ← 字号派生算法 (移植自 antd)
    gen-control-height.ts← 控件高度派生
    gen-size-map.ts      ← 间距派生
  provider/
    tao-provider.tsx     ← TaoProvider 组件
    context.ts           ← React Context
  components/
    button/
    input/
    select/
    form-field/
    form-section/
    form-actions/
  layouts/
    stack/
    form-layout/
  index.tsx
```
