# tao-ui 设计规范

> 道法自然 — 克制的、有序的、笃定的

本文档定义 tao-ui 的完整视觉语言。所有组件必须严格遵循这些 token，不允许硬编码值。

> **真值源**：`src/theme/theme.css`。本文档的数值与实现对齐；
> 若再次漂移，以 theme.css 为准并修文档。

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
  colorPrimary: string;       // 品牌主色 (默认: oklch(0.205 0.01 70)，近黑暖调)
  colorSuccess: string;       // 成功色   (默认: oklch(0.555 0.14 155))
  colorWarning: string;       // 警告色   (默认: oklch(0.7 0.15 70))
  colorError: string;         // 错误色   (默认: oklch(0.57 0.19 25))
  colorBgBase: string;        // 背景基色 (默认: oklch(0.985 0.004 70))
  colorTextBase: string;      // 文字基色 (默认: oklch(0.155 0.01 70))
  // colorBgSurface / colorTextLightSolid 目前仅 CSS 层种子
  // （dark scope 覆盖用），未暴露到 JS token——有需求再加。

  // ---- 尺寸种子 ----
  borderRadius: number;       // 基础圆角 px (默认: 10，shadcn 基线)
  fontSize: number;           // 基础字号 px (默认: 14)
  controlHeight: number;      // 控件基础高度 px (默认: 32)
  sizeUnit: number;           // 间距基础单位 px (默认: 4)
  sizeStep: number;           // 间距步长 (默认: 4)
  lineWidth: number;          // 边框宽度 px (默认: 1)

  // ---- 字体种子 ----
  fontFamily: string;
  fontFamilyCode: string;

  // ---- 动效种子 ----
  motionUnit: number;         // 动效时长单位 (默认: 0.1s)，0 表示关闭动画
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
  --tao-color-primary:   oklch(0.205 0.01 70);
  --tao-color-success:   oklch(0.555 0.14 155);
  --tao-color-warning:   oklch(0.7 0.15 70);
  --tao-color-error:     oklch(0.57 0.19 25);
  --tao-color-bg-base:   oklch(0.985 0.004 70);
  --tao-color-text-base: oklch(0.155 0.01 70);
  /* 仅 CSS 层的种子（JS token 未暴露） */
  --tao-color-bg-surface: oklch(1 0 0);        /* dark scope 覆盖为深灰 */
  --tao-color-text-light-solid: oklch(0.985 0.004 70); /* 语义色上的固定浅文字 */

  /* == Primary 派生 == */
  --tao-primary:            var(--tao-color-primary);
  --tao-primary-hover:      color-mix(in oklch, var(--tao-color-primary) 80%, white);
  --tao-primary-active:     color-mix(in oklch, var(--tao-color-primary) 90%, black);
  --tao-primary-bg:         color-mix(in oklch, var(--tao-color-primary) 8%, var(--tao-color-bg-base));
  --tao-primary-bg-hover:   color-mix(in oklch, var(--tao-color-primary) 12%, var(--tao-color-bg-base));
  --tao-primary-border:     color-mix(in oklch, var(--tao-color-primary) 30%, var(--tao-color-bg-base));
  --tao-primary-fg:         var(--tao-color-bg-base);  /* 文字反色，随 bg-base 翻转 */

  /* == Error 派生 == */
  --tao-error:              var(--tao-color-error);
  --tao-error-hover:        color-mix(in oklch, var(--tao-color-error) 80%, white);
  --tao-error-active:       color-mix(in oklch, var(--tao-color-error) 90%, black);
  --tao-error-bg:           color-mix(in oklch, var(--tao-color-error) 6%, var(--tao-color-bg-base));
  --tao-error-border:       color-mix(in oklch, var(--tao-color-error) 30%, var(--tao-color-bg-base));
  --tao-error-fg:           var(--tao-color-text-light-solid); /* 固定浅，不随模式翻转 */

  /* == Success / Warning 派生 == */
  --tao-success:            var(--tao-color-success);
  --tao-success-bg:         color-mix(in oklch, var(--tao-color-success) 6%, var(--tao-color-bg-base));
  --tao-success-border:     color-mix(in oklch, var(--tao-color-success) 30%, var(--tao-color-bg-base));
  --tao-warning:            var(--tao-color-warning);
  --tao-warning-bg:         color-mix(in oklch, var(--tao-color-warning) 6%, var(--tao-color-bg-base));
  --tao-warning-border:     color-mix(in oklch, var(--tao-color-warning) 30%, var(--tao-color-bg-base));

  /* == 中性色派生 == */
  --tao-color-text:              var(--tao-color-text-base);
  --tao-color-text-secondary:    color-mix(in oklch, var(--tao-color-text-base) 65%, var(--tao-color-bg-base));
  --tao-color-text-tertiary:     color-mix(in oklch, var(--tao-color-text-base) 45%, var(--tao-color-bg-base));
  --tao-color-text-quaternary:   color-mix(in oklch, var(--tao-color-text-base) 30%, var(--tao-color-bg-base));

  --tao-color-fill:              color-mix(in oklch, var(--tao-color-text-base) 15%, var(--tao-color-bg-base));
  --tao-color-fill-secondary:    color-mix(in oklch, var(--tao-color-text-base) 10%, var(--tao-color-bg-base));
  --tao-color-fill-tertiary:     color-mix(in oklch, var(--tao-color-text-base) 6%, var(--tao-color-bg-base));
  --tao-color-fill-quaternary:   color-mix(in oklch, var(--tao-color-text-base) 3%, var(--tao-color-bg-base));

  /* 背景 3 级：container/elevated 从 bg-surface 种子派生，
     dark 换种子不换公式；elevated 向 white mix，暗色下自动提亮一层 */
  --tao-color-bg-layout:         color-mix(in oklch, var(--tao-color-text-base) 4%, var(--tao-color-bg-base));
  --tao-color-bg-container:      var(--tao-color-bg-surface);
  --tao-color-bg-elevated:       color-mix(in oklch, var(--tao-color-bg-surface) 94%, white);

  /* 边框 2 级（shadcn 式浅边框 12%；secondary 用半透明，跨底色无断层） */
  --tao-color-border:            color-mix(in oklch, var(--tao-color-text-base) 12%, var(--tao-color-bg-base));
  --tao-color-border-secondary:  color-mix(in oklch, var(--tao-color-text-base) 5%, transparent);
}
```

#### 2.3.2 圆角派生

shadcn 语义：sm/md/lg/xl 相对 base 递增，非等比（base=10 时 xs=2, sm=8, md=10, lg=12, xl=14）：

```css
:root {
  /* == Seed == */
  --tao-radius: 10px;   /* shadcn baseline */

  /* == 派生 == */
  --tao-radius-xs:   2px;
  --tao-radius-sm:   calc(var(--tao-radius) - 2px);    /* 8 */
  --tao-radius-md:   var(--tao-radius);                 /* 10 */
  --tao-radius-lg:   calc(var(--tao-radius) + 2px);    /* 12 */
  --tao-radius-xl:   calc(var(--tao-radius) + 4px);    /* 14 */
  --tao-radius-2xl:  calc(var(--tao-radius) * 2);      /* 20 */
  --tao-radius-full: 9999px;
}
```

> CSS `calc()` 无法做 antd `genRadius()` 的分段逻辑。当前接受线性偏差；
> 若未来用户大改 borderRadius 需要精确映射，再在 TaoProvider JS 侧注入。

#### 2.3.3 控件高度派生

±4px 阶梯（对齐 shadcn h-8/h-9/h-10，与 antd 32 中档一致）：

```css
:root {
  /* == Seed == */
  --tao-control-height: 32px;

  /* == 派生 == */
  --tao-control-height-sm:  calc(var(--tao-control-height) - 4px);  /* 28 */
  --tao-control-height-lg:  calc(var(--tao-control-height) + 4px);  /* 36 */
}
```

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

固定阶梯（不做 antd 的自然对数阶梯——CSS 无法指数运算，
而 14px 基线下的常用档位固定值即可覆盖）：

```css
:root {
  /* == Seed == */
  --tao-font-size: 14px;

  /* == 派生 == */
  --tao-font-size-xs:        12px;
  --tao-font-size-sm:        13px;
  --tao-font-size-base:      14px;   /* = seed */
  --tao-font-size-lg:        16px;
  --tao-font-size-xl:        20px;

  /* 行高 (antd: (fontSize + 8) / fontSize) */
  --tao-line-height:         1.5714;  /* (14+8)/14 */
  --tao-line-height-sm:      1.6667;  /* (12+8)/12 */
  --tao-line-height-lg:      1.5;     /* (16+8)/16 */
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

  /* 缓动曲线 */
  --tao-motion-ease-out:          cubic-bezier(0.215, 0.61, 0.355, 1);
  --tao-motion-ease-in-out:       cubic-bezier(0.645, 0.045, 0.355, 1);
  --tao-motion-ease-out-quint:    cubic-bezier(0.23, 1, 0.32, 1);
  /* 进场强调（Modal/Drawer/DatePicker 弹出）：起步快、收尾长 */
  --tao-motion-ease-out-expo:     cubic-bezier(0.16, 1, 0.3, 1);
}
```

#### 2.3.7 阴影派生

```css
:root {
  /* xs：按钮/输入的极细一道，让元素"浮起来一层"而不喧宾夺主 */
  --tao-box-shadow-xs:        0 1px 2px 0 oklch(0 0 0 / 0.05);
  --tao-box-shadow:           0 1px 2px oklch(0 0 0 / 0.04),
                              0 0 1px oklch(0 0 0 / 0.08);
  --tao-box-shadow-secondary: 0 2px 8px oklch(0 0 0 / 0.06),
                              0 0 1px oklch(0 0 0 / 0.06);
  --tao-box-shadow-tertiary:  0 1px 2px oklch(0 0 0 / 0.04);
}
```

> dark scope 整体加深（0.35–0.5 alpha）：半透明黑在暗底上不可见。

#### 2.3.8 语义别名 (Alias Token)

参考 antd `AliasToken`，为组件消费提供语义化变量：

```css
:root {
  /* 文字 (antd: colorTextPlaceholder, colorTextDisabled, colorTextHeading, colorTextLabel, colorTextDescription) */
  /* placeholder 用 tertiary(45%)：quaternary 对比度 ~2.2:1 偏飘；
     disabled 保持 quaternary 的"熄灭"感 */
  --tao-color-text-placeholder:  var(--tao-color-text-tertiary);
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

  /* focus 环 (antd: controlOutline) — 3px ring，暗中性主色用 20% α 更透气 */
  --tao-control-outline:         color-mix(in oklch, var(--tao-color-primary) 20%, transparent);
  --tao-color-warning-outline:   color-mix(in oklch, var(--tao-color-warning) 25%, transparent);
  --tao-color-error-outline:     color-mix(in oklch, var(--tao-color-error) 25%, transparent);

  /* 遮罩与滚动提示阴影 */
  --tao-color-bg-mask:           oklch(0 0 0 / 0.1);   /* Modal/Drawer/Sheet dim 层 */
  --tao-color-shadow-hint:       oklch(0 0 0 / 0.05);  /* Table fixed 列、ScrollArea 渐变 */

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

  /** 明暗模式 (见 §3.5)。dark 输出 data-tao-theme="dark"，纯 CSS 算法 */
  mode?: 'light' | 'dark';

  /** 覆盖单个组件的 token (参考 antd ComponentsConfig) — 未实现，规划中 */
  components?: {
    Button?: Partial<ButtonComponentToken>;
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

### 3.5 主题模式（已实现：dark）

明暗模式不是硬编码另一套 token，而是**纯 CSS 算法**：`[data-tao-theme="dark"]`
scope 只覆盖 4 个 seed（bg-base/text-base/bg-surface/primary）+ 少数「翻转方向
不同」的 derived token（shadows、primary hover/active、mask），其余派生全部由
`color-mix` 公式自动适配。零 JS runtime。

```tsx
// 暗色主题
<TaoProvider theme={{ mode: 'dark' }}>
  <App />
</TaoProvider>
```

实现机制：
- `TaoProvider` 把 `mode: 'dark'` 输出为元素上的 `data-tao-theme="dark"` 属性
- `mode` 经 context 继承（嵌套 provider 未声明时跟随父级），portal 浮层
  （Modal/Drawer/Select 下拉）通过 `TaoPortalScope` 重建该属性，不会逃出暗色作用域
- 已知限制：dark 内显式 `mode: 'light'` **不会**翻回亮色——CSS 自定义属性
  无法"撤销"祖先的 seed 覆盖。需要亮/暗混排时，把亮部移出 dark provider。

Dark scope 覆盖值（theme.css）：

```css
[data-tao-theme="dark"] {
  --tao-color-bg-base:    oklch(0.165 0.005 70);
  --tao-color-text-base:  oklch(0.922 0.005 70);
  --tao-color-bg-surface: oklch(0.21  0.005 70);
  --tao-color-primary:    oklch(0.922 0.005 70);  /* 近黑主色翻为近白 */
  /* + shadows 加深、mask 加深、focus outline α 提高、
     primary hover/active 改向深色 mix */
}
```

#### 3.5.2 Compact 算法（未实现）

规划方向（参考 antd `genCompactSizeMapToken`）：

```ts
// tao-ui compact 算法（规划）：
--tao-size-step: 2;                       // 4 → 2
--tao-control-height: 32px;               // → 28
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

**库不捆绑字体文件**（与 antd 一致——antd seed 就是纯系统栈，零 @font-face）。
字体加载策略（preload、子集化、display）是应用层决策，组件库强制下载字体
对所有消费方是负担；且 Geist 无 CJK 字形，中文场景本就走系统回退。

```css
:root {
  /* Geist 未安装时落到 antd 同款系统栈 + 显式 CJK */
  --tao-font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
    'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  --tao-font-family-code: 'Geist Mono', ui-monospace, SFMono-Regular,
    Menlo, Consolas, 'Liberation Mono', monospace;
}
```

消费方启用 Geist（可选，一行安装）：

```bash
pnpm add @fontsource/geist-sans @fontsource/geist-mono
```

```ts
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-mono/400.css';
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

```css
/* focus-visible 统一样式：3px ring box-shadow（比 antd 2px outline 更可见） */
box-shadow: 0 0 0 var(--tao-ring-width) var(--tao-control-outline);
/* --tao-ring-width: 3px；--tao-control-outline = primary 20% α */
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
  sm:   h=control-height-sm(28px), px=padding-xs(8px),  text=font-size-sm, radius-sm
  md:   h=control-height(32px),    px=padding(16px),    text=font-size-base, radius-md  (默认)
  lg:   h=control-height-lg(36px), px=padding(16px),    text=font-size-base, radius-md

变体:
  primary:     bg=primary, fg=primary-fg, shadow=xs
  secondary:   bg=transparent, border=color-border, fg=color-text, shadow=xs
  ghost:       bg=transparent, fg=color-text-secondary, hover:bg=fill-tertiary
  destructive: bg=error, fg=error-fg, shadow=xs

状态:
  hover:    bg=primary-hover (或 error-hover)
  active:   bg=primary-active
  disabled: opacity=opacity-loading
  loading:  icon 位 idle/spinner 双层 opacity 切换，无回流
```

> 不做 `active: scale(0.98)`——按压缩放偏 C 端体感，与本库的克制语言不搭。

API:
```tsx
<Button variant="primary" size="md" disabled loading>Submit</Button>
```

### 12.2 Input

```
尺寸 (消费 --tao-control-height 派生):
  sm:   h=control-height-sm(28px), px=padding-xs(8px), text=font-size-sm
  md:   h=control-height(32px),    px=padding-sm(12px), text=font-size-base  (默认)
  lg:   h=control-height-lg(36px), px=padding-sm(12px), text=font-size-lg

状态:
  default:    border=color-border, bg=transparent
  hover:      border 加深一档 (text-base 20%)
  focus:      border=primary + 3px ring (control-outline)
  error:      border=error, ring=color-error-outline
  disabled:   bg=color-bg-disabled, fg=color-text-disabled

结构:
  [prefix?] [input] [suffix?]
  prefix 图标 ↔ input 内容: gap=size-unit(4px)，控件外沿 padding 不变
  RangePicker 起止内容: text-align=start，禁止居中制造无意义的左侧留白
  PC DatePicker: 使用真实 input，按 format 严格解析，Enter/blur 提交；mobile 保持 button + Drawer
```

API:
```tsx
<Input size="md" placeholder="Enter email" prefix={<MailIcon />} error />
```

### 12.3 Select

```
触发器 = Input 一致
PC + showSearch: 单选、multiple、tags 的 trigger 内都使用真实 input，直接输入即打开并过滤
mobile: 保持 Drawer 搜索结构
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

> 例外：`--tao-color-bg-surface` 默认值为纯白 `oklch(1 0 0)`——刻意的，
> 让 popover/控件融入消费方的白底宿主；暖调由 bg-base 派生的其余中性色承担。

---

## 15. 文件结构

```
src/
  theme/
    theme.css            ← Seed + Derived token 定义（含 dark scope）
    control.css          ← 表单控件共享交互态 (outlined/filled/borderless)
  provider/
    tao-provider.tsx     ← TaoProvider 组件 + TaoPortalScope + context
  components/
    button/  input/  select/  table/  tag/  modal/  drawer/  ...
  layouts/
    stack/  form-layout/
  index.tsx
```
