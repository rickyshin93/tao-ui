# Select withSearch 输入失效修复

## 根因
Radix `SelectTrigger` 本质是 `button`，其 `onPointerDown` 在 mouse 点击时 `preventDefault()`，阻止焦点进入 trigger 内的 input；且 Radix trigger/button 禁止嵌套 interactive 元素。当前搜索 `<input>` 放在 trigger 内部，永远拿不到输入。此为原始实现缺陷，非回归。

## 方案
搜索框从 trigger 移到 content（下拉面板）顶部，单选 trigger 改用 span 显示值。对齐 antd / Radix 原生交互模型。mobile 端 sheet 搜索框现状已正确，不动。

## 改动

### 1. desktop trigger（select.tsx ~906-987）
- 移除 trigger `onPointerDown` 中的 `inputRef.focus()` 分支
- 多选 trigger：删内联搜索 `<input>`，空值时显示 `<span data-tao-select-placeholder>` + placeholder
- 单选 trigger：`<input readonly value={label}>` → `<span data-tao-select-value>{label}</span>`；无选中时 `<span data-tao-select-placeholder>{placeholder}</span>`。保留 icon / labelRender 分支
- `inputRef` 转为指向 content 内搜索 input

### 2. content 顶部搜索框（select.tsx ~995 `RadixSelect.Content` 内，menuNode 之前）
仅 `showSearch && !isMobile` 时渲染：
```tsx
<div data-tao-select-search="">
  <SearchIcon />
  <input data-tao-select-search-input="" ref={inputRef}
    value={search}
    onChange={e => handleSearchChange(e.target.value)}
    onKeyDown={e => e.stopPropagation()}
    placeholder="Search..." autoComplete="off" />
</div>
```
- 复用 CSS 里已存在但闲置的 `[data-tao-select-search]` / `[data-tao-select-search-input]`（select.css 236-261）
- `onKeyDown stopPropagation`：阻止冒泡到 Radix Content 的 typeahead（吞字符键）和方向键导航
- 聚焦：`onOpenChange(true)` 时 `setTimeout(() => inputRef.current?.focus())`（Radix `onMountAutoFocus` 已被 preventDefault，焦点空闲）

### 3. mobile 单选 trigger（select.tsx ~715-745）
`<input readonly>` → span，与 desktop 一致

### 4. SearchIcon
从 mobile-select.tsx 导出 `SearchIcon`，select.tsx 引入复用

### 5. CSS 清理（select.css）
- 删 `[data-tao-select-input]`（45-66）和 `[data-tao-select-search-inline]`（405-421）—— 改后无引用，死代码
- 验证 `[data-tao-select-search]` 在当前 size 变量下对齐

### 6. 测试（tests/select/select.test.tsx）
- `showSearch: typing filters options`（194）：`trigger.querySelector('input')` 失效 → 打开下拉，在 content 内 `[data-tao-select-search-input]` 输入 `app`，断言列表只剩 Apple。从「测 input DOM」升级为「测真输入+过滤」
- `allowClear clears...`（300）：`trigger.querySelector('[data-tao-select-input]').value==='Beta'` → 断言 `[data-tao-select-value]` 的 textContent 含 Beta

## 不动
searchValue / onSearch / filterOption / handleSearchChange / handleSearchKeyDown(tokenSeparators) / tags 渲染 / clear / maxTagCount / mobile-select.tsx sheet 搜索框

## 验证
1. `rslib build`（含 d.ts）
2. `pnpm test` select 测试通过
3. Storybook 里 WithSearch：点开下拉能输入并过滤
