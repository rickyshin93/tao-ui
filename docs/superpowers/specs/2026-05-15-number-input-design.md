# NumberInput 设计规格

- **日期**：2026-05-15
- **作者**：rihua.chen + Claude
- **状态**：草案，待 review
- **目标仓库**：`rihua-ui`
- **来源**：从 `portal-web/src/components/atom/input-number/lib/pure-input-currency.tsx` 抽出，**完全重写**为通用 NumberInput 组件
- **不做替换**：旧组件保留在 portal-web，本规格生产的是全新组件

---

## 1. 背景

`portal-web` 内的 `pure-input-currency` 实现了金额/百分比输入，功能可用但有大量技术债：

- 用 `useEffect as useLayoutEffect` 别名（命名撒谎）
- `isNeedFocus` 布尔翻转当事件总线（anti-pattern）
- `isPercentageCachedValueRef` 影子缓存（受控/非受控混乱）
- `min: string + isNumber(min)` 永远 false 的死分支 bug
- `addSuffix / addonAfter / statisticValueStyle / precision` 等 prop 未被全项目调用
- 两个百分比转换函数 99% 重复，silent failure 吞错
- 重度依赖 big.js 但实际只用 `×100 / ÷100`（小数点平移）

需求是把这块逻辑抽成 rihua-ui 组件库的一等公民，从零设计，不背 portal-web 的兼容包袱。

---

## 2. 目标 / 非目标

### 目标

- 提供 **headless hook + 薄组件** 双层 API，零业务依赖（无 antd / formily / big.js）
- 处理金额、百分比、负数三大场景
- 千分位 / 自定义小数分隔符
- min/max blur 钳制
- blur 时按策略补尾零
- token-based 光标算法（千分位插入/删除时光标不抖）
- 严格 TDD（红绿循环）开发
- 符合 KISS / YAGNI / DRY / SOLID

### 非目标（v1）

- ❌ 不内置货币符号或货币对照表
- ❌ 不支持 `formatter / parser` 自定义函数（封堵口子，要定制走 hook）
- ❌ 不支持 `locale: 'en-US'` 自动推导分隔符
- ❌ 不实现 spinner（上下箭头）
- ❌ 不暴露 imperative `focus / setValue / reset`
- ❌ 不支持 ref 合并（v2 加 `mergeRefs`）
- ❌ 不内置任何视觉样式（unstyled，用户自渲染）
- ❌ 不在本仓做 portal-web 端的迁移（独立 PR）
- ❌ 不写 Rspress 文档（等 v1 在生产上用过再写）

---

## 3. 架构

### 3.1 文件布局

```
rihua-ui/
├── src/
│   ├── number-input/
│   │   ├── format.ts              # 纯函数：千分位、小数截断、blur 补零
│   │   ├── cursor.ts              # 纯函数：token-based 光标定位
│   │   ├── percentage.ts          # 纯函数：shiftDecimal / fromPercent / toPercent
│   │   ├── validate.ts            # 纯函数：合法性检查、min/max 钳制、负号剥离
│   │   ├── use-number-input.ts    # Hook：状态编排 + DOM 副作用（唯一含 React）
│   │   ├── number-input.tsx       # 组件：useNumberInput 的薄糖衣 + adornment 渲染
│   │   ├── types.ts               # 公共类型
│   │   └── index.ts               # 子模块出口
│   └── index.tsx                  # 加 export
├── tests/
│   └── number-input/
│       ├── format.test.ts
│       ├── cursor.test.ts
│       ├── percentage.test.ts
│       ├── validate.test.ts
│       ├── use-number-input.test.tsx
│       └── number-input.test.tsx
└── stories/
    └── number-input.stories.tsx   # 一个 story 用于手测
```

### 3.2 依赖图（单向）

```
number-input.tsx
    ↓
use-number-input.ts
    ↓
┌─────────┬──────────┬──────────────┬────────────┐
│format.ts│cursor.ts │percentage.ts │validate.ts │
└─────────┴──────────┴──────────────┴────────────┘
    ↓ all share
  types.ts (zero deps)
```

**铁律**：

- 4 个纯模块**互不依赖**，只 import `types.ts`
- 4 个纯模块**不 import React**
- `use-number-input.ts` 是唯一含 `useState/useRef/useEffect` 的文件
- `number-input.tsx` 不写业务逻辑，只渲染 + 调 hook

### 3.3 文件大小预算

| 文件 | 上限（破则拆） |
|---|---|
| 4 个纯模块 each | ≤ 80 行 |
| `use-number-input.ts` | ≤ 150 行 |
| `number-input.tsx` | ≤ 50 行 |

---

## 4. 公共 API

### 4.1 Hook

```ts
type PadDecimalsOnBlur = 'never' | 'always' | 'whenHasDecimal'

export interface UseNumberInputOptions {
  // value 契约（全部 string）
  value?: string                          // 受控值；'' 表示空
  defaultValue?: string                   // 非受控初值
  onChange?: (value: string) => void      // 抛 actual 值（非 display）
  onBlur?: (value: string) => void        // 抛 actual 值

  // 格式
  decimalSeparator?: '.' | ','            // default '.'
  thousandsSeparator?: ',' | '.' | "'" | ' ' | ''  // default ','
  decimalPlaces?: number                  // default 2
  padDecimalsOnBlur?: PadDecimalsOnBlur   // default 'never'

  // 语义
  isPercentage?: boolean                  // default false
  allowNegative?: boolean                 // default false
  min?: number                            // 应用于 actual 值；blur 时 clamp
  max?: number                            // 应用于 actual 值；blur 时 clamp
}

export interface UseNumberInputReturn {
  inputProps: {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => void
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
    ref: React.RefObject<HTMLInputElement | null>
    inputMode: 'decimal' | 'numeric'
  }
  /** actual canonical 值（与父 value 同语义）*/
  value: string
  /** 当前显示串（debug / 受控旁路）*/
  displayValue: string
}

export function useNumberInput(opts: UseNumberInputOptions): UseNumberInputReturn
```

### 4.2 组件

```ts
export interface NumberInputProps
  extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'min' | 'max' | 'prefix'
    >,
    UseNumberInputOptions {
  /** adornment：渲染在 <input> 之前，**不进入** value */
  prefix?: React.ReactNode
  /** adornment：渲染在 <input> 之后，**不进入** value */
  suffix?: React.ReactNode
  /** 容器 className */
  containerClassName?: string
  /** input 的 className（透传）*/
  className?: string
}

export function NumberInput(props: NumberInputProps): JSX.Element
```

### 4.3 渲染结构

```tsx
<span className={containerClassName} data-rh-number-input>
  {prefix && <span data-rh-prefix>{prefix}</span>}
  <input {...inputProps} {...nativeAttrs} />
  {suffix && <span data-rh-suffix>{suffix}</span>}
</span>
```

- prefix/suffix 是 **adornment slot**（不进入 value）—— 解决了原代码 prefix 进 value 导致光标算法复杂的问题
- 容器用 `<span>` 不是 `<div>`，避免 inline 场景塌陷
- `data-rh-*` 属性而非 className，无样式风险
- 零内置样式，完全 unstyled

### 4.4 关键约束

- **min/max 作用于 actual 值**。`isPercentage=true, min=0, max=1` 表示 0%-100%
- **`min/max: number`**，修了原代码 `min: string + isNumber(min)` 永远 false 的 bug
- **`allowNegative` 默认 `false`**：货币场景默认安全
- **`inputMode`**：`decimalPlaces > 0 ? 'decimal' : 'numeric'`（移动端键盘提示）
- **不暴露 imperative API**：YAGNI
- **不支持 ref 合并**：v1 KISS

### 4.5 主入口

```ts
// src/index.tsx
export { Button } from './Button'
export { NumberInput, useNumberInput } from './number-input'
export type {
  NumberInputProps,
  UseNumberInputOptions,
  UseNumberInputReturn,
  PadDecimalsOnBlur,
} from './number-input'
```

---

## 5. 纯模块契约

### 5.1 types.ts

```ts
export type PadDecimalsOnBlur = 'never' | 'always' | 'whenHasDecimal'

export interface FormatOptions {
  decimalSeparator: '.' | ','
  thousandsSeparator: ',' | '.' | "'" | ' ' | ''
}
```

### 5.2 format.ts

**Canonical form**：`.` 作小数点 / 无千分位 / 可选首位 `-` / 保留尾零（中途打字状态）
**Display form**：应用了用户指定分隔符的字符串（不含 prefix）

```ts
/** canonical → display */
export function format(canonical: string, opts: FormatOptions): string

/** display → canonical。容错：剔除非法字符，只留首个 `-` 和首个小数点 */
export function parse(display: string, opts: FormatOptions): string

/** 截断到指定小数位 */
export function truncateDecimals(canonical: string, decimalPlaces: number): string

/** blur 时按 mode 补/不补尾零。`whenHasDecimal` 时 "5." → "5"（剥孤悬点） */
export function padOnBlur(
  canonical: string,
  decimalPlaces: number,
  mode: PadDecimalsOnBlur,
): string
```

**不变量**：`parse(format(x, opts), opts) === x` 对所有合法 canonical 成立。

### 5.3 percentage.ts（零依赖）

```ts
/**
 * 把小数点平移 N 位。负数=左移，正数=右移。
 * "0.5" shift -2 → "0.005"
 * "50"  shift -2 → "0.5"
 * "1.234" shift 2 → "123.4"
 */
export function shiftDecimal(value: string, places: number): string

/** 显示值 → actual（除以 100）。"50" → "0.5" */
export function fromPercent(displayValue: string): string

/** actual → 显示值（乘以 100）。"0.5" → "50" */
export function toPercent(actualValue: string): string
```

**不变量**：`toPercent(fromPercent(x)) === x` 对所有合法 x 成立。

### 5.4 cursor.ts（token-based）

**核心思路**：cursor 锚定在"逻辑 token"上，而非字符索引。
逻辑 token = `digits ∪ {-, decimalSeparator}`。**千分位不算 token**。

```ts
export function countAnchored(
  display: string,
  upTo: number,
  thousandsSeparator: string,
): number

export function findCursorAt(
  display: string,
  anchorCount: number,
  thousandsSeparator: string,
): number

/**
 * reformat 后重新定位 cursor。
 * 算法：count(before, cursor) → 找到 after 中第 count 个 token 后的位置
 */
export function reposition(args: {
  before: string
  beforeCursor: number
  after: string
  thousandsSeparator: string
}): number

/** Backspace 时若光标前是千分位，告诉 hook 跳一格再删 */
export function isThousandSepBeforeCursor(
  display: string,
  cursor: number,
  thousandsSeparator: string,
): boolean
```

**不变量**：千分位的插入/删除不影响光标视觉位置。`"1,|234"` 输入 `5` → `"15,|234"` 而不是 `"1,5|234"`。

### 5.5 validate.ts

```ts
/** /^-?\d*\.?\d*$/ */
export function isValidCanonical(canonical: string): boolean

/** !allowNegative 时剥掉 `-` */
export function stripDisallowedSign(
  canonical: string,
  allowNegative: boolean,
): string

/** blur 时把 actual 钳到 [min, max] 区间内（用 Number() 比较） */
export function clampToRange(
  canonical: string,
  min: number | undefined,
  max: number | undefined,
): string
```

### 5.6 命名族（避免心智冲突）

| 文件 | 动词族 |
|---|---|
| format.ts | `format` / `parse` / `truncate` / `pad` |
| percentage.ts | `shift` / `fromPercent` / `toPercent` |
| cursor.ts | `count` / `find` / `reposition` |
| validate.ts | `isValid` / `strip` / `clamp` |

---

## 6. 状态模型与同步规则

### 6.1 状态清单

| 名字 | 类型 | 用途 |
|---|---|---|
| `displayBuffer` | `useState<string>` | 当前 input 显示串。**唯一状态来源** |
| `isFocusedRef` | `useRef<boolean>` | "正在输入" 标志，决定是否屏蔽外部 value 同步 |
| `inputRef` | `useRef<HTMLInputElement>` | DOM 引用，用于 setSelectionRange |
| `pendingCursorRef` | `useRef<number \| null>` | reformat 后要在 layout effect 设的 cursor |

**显式不要的东西**（与原代码对比）：
- ❌ `isPercentageCachedValueRef` —— 改用纯函数转换
- ❌ `formattedValue.current` 影子 state —— 用 `inputRef.current.value` 读最新
- ❌ `isNeedFocus` 翻转 —— 改用 `pendingCursorRef` + buffer state

### 6.2 Canonical 中间态

允许形态：`""`、`"-"`、`"0."`、`"5."`、`"-5.5"`、`"0.5"` …
`onChange` **每键触发**，可能抛出 `"-"` 或 `"5."` 这种"半成品"。文档明示，父组件需要时自己 `Number()` 处理 NaN。

### 6.3 同步规则

**A. 外部 value 变化（受控模式）**

```ts
useEffect(() => {
  if (value === undefined) return                  // 非受控
  if (isFocusedRef.current) return                 // 正在打字，别打断
  const display = canonicalToDisplay(value)
  if (display !== displayBuffer) setDisplayBuffer(display)
}, [value])
```

focus 期间外部 value 变化**被忽略**。设计取舍：优先保护用户输入。

**B. 用户输入（onChange）**

```
1. raw = e.target.value, cursor = e.target.selectionStart
2. canonical = parse(raw, fmtOpts)
3. canonical = stripDisallowedSign(canonical, allowNegative)
4. canonical = truncateDecimals(canonical, decimalPlaces)
5. if (!isValidCanonical(canonical)) {
     // 拒绝：不更新 buffer、不发 onChange、不动 cursor。input 自动回滚到上次 value
     return
   }
6. newDisplay = format(canonical, fmtOpts)
7. pendingCursorRef = reposition({ before:raw, beforeCursor:cursor, after:newDisplay, thousandsSep })
8. setDisplayBuffer(newDisplay)
9. actual = isPercentage ? fromPercent(canonical) : canonical
10. onChange(actual)
```

**C. Layout effect → 落 cursor**

```ts
useLayoutEffect(() => {
  if (pendingCursorRef.current === null) return
  inputRef.current?.setSelectionRange(pendingCursorRef.current, pendingCursorRef.current)
  pendingCursorRef.current = null
}, [displayBuffer])
```

**D. onBlur**

```
1. isFocusedRef = false
2. raw = inputRef.current.value                       // 不读 state，避免 batch 内 stale
3. canonical = parse(raw, fmtOpts)
4. canonical = padOnBlur(canonical, decimalPlaces, padDecimalsOnBlur)
5. actual = isPercentage ? fromPercent(canonical) : canonical
6. actual = clampToRange(actual, min, max)
7. canonicalAfter = isPercentage ? toPercent(actual) : actual
8. newDisplay = format(canonicalAfter, fmtOpts)
9. setDisplayBuffer(newDisplay)
10. onChange(actual)                                  // 注意：blur 也调 onChange，form 库友好
11. onBlur(actual)
```

**E. onFocus**

```ts
const handleFocus = () => { isFocusedRef.current = true }
```

**F. onKeyDown（千分位 backspace 特例）**

```ts
if (e.key === 'Backspace') {
  const cursor = inputRef.current?.selectionStart ?? 0
  if (cursor > 0 && isThousandSepBeforeCursor(displayBuffer, cursor, thousandsSep)) {
    inputRef.current?.setSelectionRange(cursor - 1, cursor - 1)  // 跳过千分位让 BS 删数字
  }
}
```

不阻止默认行为 —— BS 继续执行删除并触发 onChange。

### 6.4 初始值

```ts
const [displayBuffer, setDisplayBuffer] = useState<string>(() => {
  const initial = value ?? defaultValue ?? ''
  return canonicalToDisplay(initial)
})

function canonicalToDisplay(actual: string): string {
  const canonical = isPercentage ? toPercent(actual) : actual
  return format(canonical, fmtOpts)
}
```

`value/defaultValue` 都是 actual canonical（即父组件存什么）。

### 6.5 受控 vs 非受控

经典 React 约定：
- `value !== undefined` → 受控
- `value === undefined && defaultValue` → 非受控
- 切换会触发 React 警告（依赖原生行为，不自己处理）

### 6.6 Hook return value 派生

`UseNumberInputReturn` 的 `value` 和 `displayValue` 在每次 render 派生（不存额外 state）：

```ts
const displayValue = displayBuffer

const value = useMemo(() => {
  const canonical = parse(displayBuffer, fmtOpts)
  return isPercentage ? fromPercent(canonical) : canonical
}, [displayBuffer, isPercentage, fmtOpts.decimalSeparator, fmtOpts.thousandsSeparator])
```

理由：
- `displayBuffer` 是唯一真相源
- `value` 仅用于 hook 消费方（通常用不到，因为他们自己持父 state），但提供作 debug / 受控旁路
- 派生比维持双 state 便宜且无同步 bug

### 6.7 边界场景清单

| 场景 | 行为 |
|---|---|
| value="" 受控 + 用户输入 | onChange("5"), buffer="5" |
| value="0.5" 受控 + isPercentage | 初始 buffer="50" |
| 已 focus，父组件改 value | 忽略，不动 buffer |
| 失焦时父组件改 value | 同步到 buffer |
| 在 "1,234" 中按 BS（光标在 5 前）| 删 "4"，千分位重新分布 |
| 在 "1,\|234" 按 BS（光标在 , 后）| 跳光标到 1 之后再 BS，删 "1" |
| 输入 "." 到空 input | parse → "0." → display "0." → onChange("0.") |
| 输入 "-" 到空 input（allowNegative=true）| canonical="-" → display "-" → onChange("-") |
| 输入 "-" 到空 input（allowNegative=false）| canonical="" → 拒绝 |
| 粘贴 "1.2.3.4" | 只留首小数点 → "1.234" |
| 粘贴 "abc123" | 剥非法 → "123" |
| min=0 max=100 + blur 时值 200 | clamp → "100" |
| isPercentage + min=0 max=1 + blur 时 actual=2 | clamp → "1" → display "100" |

---

## 7. 测试计划（严格红绿循环）

约 70+ 测试。按 Phase 顺序、Phase 内按编号顺序，每条 red → green → refactor。每 Phase 一个 commit。

### Phase 1 — percentage.ts (10 测)

| # | 红测 |
|---|---|
| 1.1 | `shiftDecimal('5', 0) === '5'` |
| 1.2 | `shiftDecimal('50', -2) === '0.5'` |
| 1.3 | `shiftDecimal('0.5', -2) === '0.005'` |
| 1.4 | `shiftDecimal('5', 2) === '500'` |
| 1.5 | `shiftDecimal('1.234', 2) === '123.4'` |
| 1.6 | `shiftDecimal('-50', -2) === '-0.5'` |
| 1.7 | `shiftDecimal('', n) === ''` |
| 1.8 | `shiftDecimal('-', n) === '-'` |
| 1.9 | `shiftDecimal('0', n) === '0'` |
| 1.10 | round-trip：`fromPercent(toPercent(x)) === x` for `x ∈ {'0','0.5','1','-1.234','0.001'}` |

### Phase 2 — format.ts (24 测)

默认 opts `{decimal:'.', thousands:','}` 除非另注。

| # | 红测 |
|---|---|
| 2.1 | `format('', opts) === ''` |
| 2.2 | `format('0', opts) === '0'` |
| 2.3 | `format('1234', opts) === '1,234'` |
| 2.4 | `format('1234567', opts) === '1,234,567'` |
| 2.5 | `format('1234.56', opts) === '1,234.56'` |
| 2.6 | `format('-1234.5', opts) === '-1,234.5'` |
| 2.7 | `format('5.', opts) === '5.'` |
| 2.8 | `format('-', opts) === '-'` |
| 2.9 | `format('1234.5', {decimal:',', thousands:'.'}) === '1.234,5'` |
| 2.10 | `format('1234.5', {decimal:'.', thousands:''}) === '1234.5'` |
| 2.11 | `parse('1,234.56', opts) === '1234.56'` |
| 2.12 | `parse('abc1.2.3def', opts) === '1.23'` |
| 2.13 | `parse('1--2', opts) === '12'` |
| 2.14 | `parse('.5', opts) === '0.5'` |
| 2.15 | reversibility：`parse(format(x, opts), opts) === x` for canonical 集 |
| 2.16 | `truncateDecimals('1.23456', 2) === '1.23'` |
| 2.17 | `truncateDecimals('1', 2) === '1'` |
| 2.18 | `padOnBlur('5', 2, 'never') === '5'` |
| 2.19 | `padOnBlur('5', 2, 'always') === '5.00'` |
| 2.20 | `padOnBlur('5.1', 2, 'always') === '5.10'` |
| 2.21 | `padOnBlur('5', 2, 'whenHasDecimal') === '5'` |
| 2.22 | `padOnBlur('5.1', 2, 'whenHasDecimal') === '5.10'` |
| 2.23 | `padOnBlur('5.', 2, 'whenHasDecimal') === '5'` |
| 2.24 | `padOnBlur('5.', 2, 'always') === '5.00'` |

### Phase 3 — validate.ts (13 测)

| # | 红测 |
|---|---|
| 3.1 | `isValidCanonical('') === true` |
| 3.2 | `isValidCanonical('0') === true` |
| 3.3 | `isValidCanonical('-1.5') === true` |
| 3.4 | `isValidCanonical('5.') === true` |
| 3.5 | `isValidCanonical('1.2.3') === false` |
| 3.6 | `isValidCanonical('a') === false` |
| 3.7 | `stripDisallowedSign('-5', false) === '5'` |
| 3.8 | `stripDisallowedSign('-5', true) === '-5'` |
| 3.9 | `clampToRange('5', 0, 10) === '5'` |
| 3.10 | `clampToRange('20', 0, 10) === '10'` |
| 3.11 | `clampToRange('-5', 0, 10) === '0'` |
| 3.12 | `clampToRange('', 0, 10) === ''` |
| 3.13 | `clampToRange('5', undefined, undefined) === '5'` |

### Phase 4 — cursor.ts (14 测)

| # | 红测 |
|---|---|
| 4.1 | `countAnchored('1,234', 0, ',') === 0` |
| 4.2 | `countAnchored('1,234', 1, ',') === 1` |
| 4.3 | `countAnchored('1,234', 2, ',') === 1` |
| 4.4 | `countAnchored('1,234', 3, ',') === 2` |
| 4.5 | `countAnchored('1,234', 5, ',') === 4` |
| 4.6 | `findCursorAt('1,234', 1, ',') === 1` |
| 4.7 | `findCursorAt('1,234', 2, ',') === 3` |
| 4.8 | `findCursorAt('1,234', 4, ',') === 5` |
| 4.9 | `reposition({ before:'234', beforeCursor:1, after:'1,234', thousandsSeparator:',' }) === 3` |
| 4.10 | `reposition({ before:'1234', beforeCursor:4, after:'1,234', thousandsSeparator:',' }) === 5` |
| 4.11 | `reposition({ before:'1,234', beforeCursor:5, after:'234', thousandsSeparator:',' }) === 3` |
| 4.12 | `isThousandSepBeforeCursor('1,234', 2, ',') === true` |
| 4.13 | `isThousandSepBeforeCursor('1,234', 3, ',') === false` |
| 4.14 | `isThousandSepBeforeCursor('1,234', 0, ',') === false` |

### Phase 5 — use-number-input.ts (17 测)

用 `@testing-library/react` 的 `renderHook` + 真实 `<input>`。

| # | 红测 |
|---|---|
| 5.1 | 初始化：value="" → displayBuffer="" |
| 5.2 | 初始化：value="1234.5" + 默认 opts → displayBuffer="1,234.5" |
| 5.3 | 初始化：value="0.5" + isPercentage → displayBuffer="50" |
| 5.4 | 输入 "5" → onChange("5") + display="5" |
| 5.5 | 输入 "1234" → display="1,234"，cursor 在末尾 |
| 5.6 | 粘贴 "1.2.3" → display="1.23"（首小数点 + truncate 2 位）|
| 5.7 | percentage 模式：输入 "50" → onChange("0.5") |
| 5.8 | allowNegative=false：按 "-" → 拒绝，display 不变 |
| 5.9 | allowNegative=true：按 "-" → display="-", onChange("-") |
| 5.10 | 千分位 BS：display="1,234" cursor=2，按 BS → display="234"，cursor=0 |
| 5.11 | focus 时父组件改 value="999" → buffer 不变（focus lock） |
| 5.12 | blur 时父组件改 value="999" → buffer 同步成 "999" |
| 5.13 | blur + padDecimalsOnBlur='always' + 当前 "5" → display="5.00", onChange("5.00") + onBlur("5.00")（emit padded canonical 以保持 display 稳定） |
| 5.14 | blur + min=0 max=10 + 当前 "20" → display="10", onChange("10") + onBlur("10") |
| 5.15 | blur + isPercentage + min=0 max=1 + 当前 actual=2 → display="100", onChange("1") |
| 5.16 | onBlur 也调 onChange |
| 5.17 | 非受控（无 value）+ defaultValue="5" → 初始 display="5"，外部不再同步 |

### Phase 6 — number-input.tsx (5 测)

| # | 红测 |
|---|---|
| 6.1 | 渲染：单 `<input>` 在 `<span>` 容器内 |
| 6.2 | `prefix="$"` → `<span data-rh-prefix>$</span><input>`，prefix 不在 input value 里 |
| 6.3 | `suffix="USD"` → `<input><span data-rh-suffix>USD</span>` |
| 6.4 | 透传 native 属性（id/name/placeholder/disabled/aria-label）到 `<input>` |
| 6.5 | `containerClassName` 到容器，`className` 到 `<input>`，互不混淆 |

---

## 8. 实施顺序

```
Phase 0  仓库准备
   └─ 创建 src/number-input/ 骨架（空文件 + types.ts）
   └─ 创建 tests/number-input/ 目录
   └─ 跑 bun test 确认测试运行器 OK
   └─ commit: chore(number-input): scaffold

Phase 1  percentage.ts (10 测)        ← 严格红绿
Phase 2  format.ts     (24 测)
Phase 3  validate.ts   (13 测)
Phase 4  cursor.ts     (14 测)
Phase 5  use-number-input.ts (17 测)
Phase 6  number-input.tsx (5 测)
Phase 7  src/index.tsx 加 export
Phase 8  stories/number-input.stories.tsx ← 手测验证
```

每 Phase 一个 commit。Commit 格式：`feat(number-input): <english title> [AI]`（rihua-ui 不强制 GIS 编号）。

---

## 9. 验收门（Definition of Done）

- [ ] 70+ 测试全绿（`bun run test`）
- [ ] `bun run build` 成功，dist 输出 `number-input/*.js + *.d.ts`
- [ ] `bun run lint` 零 warning
- [ ] 主入口 `import { NumberInput, useNumberInput } from 'rihua-ui'` 可用
- [ ] Storybook 启动后能手玩：千分位、百分比、negative、min/max clamp、padOnBlur 五个场景
- [ ] `use-number-input.ts` ≤ 150 行、各纯模块 ≤ 80 行（违反就回炉拆）

---

## 10. 风险登记

| 风险 | 影响 | 缓解 |
|---|---|---|
| react-compiler 重写 handler 后 ref 行为变化 | 中 | Phase 5 测试覆盖 cursor + focus 同步；如出 bug，handler 加 `'use no memo'` 指令 |
| happy-dom 不模拟所有光标行为 | 中 | Phase 8 Story 手测兜底；遇到怪异处文档说明 |
| IME/composition 事件（中日韩输入法）触发时机异常 | 中 | v1 不显式处理；Story 手测；如出问题 v2 加 onCompositionStart/End |
| 粘贴混合 locale 字符串 | 低 | parse 严格按 opts 解析，不智能猜测；文档说明 |
| token-based cursor 边界（minus 锚定、首位 0 剥离） | 中 | Phase 4 多覆盖 `-` 锚定 case；如有漏，回退原"长度差"算法局部修复 |
| rstest + happy-dom 对 React 19 兼容性 | 低 | Phase 5 第一条测试就会暴露 |

---

## 11. 决策记录索引

| Grill | 决定 |
|---|---|
| Q1 | A：只迁 pure，antd wrapper 留 portal-web |
| Q2a | hook + 组件双层 |
| Q2b | `NumberInput` / `useNumberInput` |
| Q3a | actual 出入 + 内部 displayBuffer + focus-aware sync |
| Q3b | 全 string 契约 |
| Q3c-revised | 0 依赖，自写 `shiftDecimal` |
| Q4 | `padDecimalsOnBlur: 'never' \| 'always' \| 'whenHasDecimal'`，默认 `'never'` |
| 小问 | 支持负数 / 支持 max / 空值 `''` / 不要 locale shorthand / 测试在 `tests/` |
| Q5 | A：核心 + 单测 + 一个 story + index 导出 |
| 收口 | prefix → adornment slot / cursor → token-based / 严格红绿循环 |

---

## 12. 不在 v1 范围

1. 不暴露 `inputMode` 覆盖
2. 不支持 ref 合并（v2 加 `mergeRefs`）
3. `onChange` 不防抖
4. 复制粘贴跨 locale 不智能识别
5. 不内置 currency 符号 / 货币对照表
6. 不暴露 `formatter / parser` 自定义函数
7. portal-web 端迁移单独 PR 做（不在本仓 scope）
