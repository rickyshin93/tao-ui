---
title: 更新日志
description: 查看 @rockshin/tao-ui 各版本的更新，包括上传、选择、表单和弹层修复。
---

# 更新日志

按版本记录 `@rockshin/tao-ui` 的用户可见变更。日期使用 UTC+8。

## 0.0.52

2026-11-10

- [Upload](/zh/components/upload) 对齐图片卡片、圆形列表、缩略图及文件操作；卡片上传入口排列在文件列表末尾，并支持通过 `null` 或 `false` 隐藏。上传中的文件显示进度，下载操作仅对已完成文件展示；Dragger 高度单独作用于拖拽区域。
- [Input](/zh/components/input) 切换密码可见性时保持占位符字体一致；[Modal](/zh/components/modal) 为内容区保留纵向空间，避免裁切控件焦点环。
- Upload 文档扩充中英文示例与 API 说明，加入原创示例图片及响应式双列布局。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.51...v0.0.52)

## 0.0.51

2026-11-08

- Button 统一嵌套 SVG 图标的尺寸并保留显式宽高；Input 后缀内容居中；Select 多选单行保持预期高度；Transfer 选择箭头对齐并明确禁用状态。
- 文档新增中英文 Showcase 和响应式商城示例；全新构建时会先准备 Showcase 所用的图标包。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.49...v0.0.51)

## 0.0.50

2026-11-08

- [Button](/zh/components/button) 统一嵌套 SVG 图标的尺寸，同时保留显式指定的宽高。
- [Input](/zh/components/input) 的后缀内容居中；[Select](/zh/components/select) 多选内容为单行时保持预期高度。
- [Transfer](/zh/components/transfer) 的选择菜单箭头与 Select 对齐，并明确禁用状态。
- 文档新增中英文 Showcase 和响应式商城示例，并更新组件页与首页。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.49...v0.0.50)

## 0.0.49

2026-11-07

**数据录入与选择**

- [Form](/zh/components/form) 在字段重置时同步清空受控输入，完善校验反馈和原生提交行为。
- [Select](/zh/components/select) 在应用拒绝受控多选变更时保留搜索词，包含分隔符的选项值可以完整匹配。
- [Upload](/zh/components/upload) 会在出错的文件行显示请求初始化错误，同批其他文件继续上传。请求成功或失败后，迟到的回调不会改写结果。禁用上传时也会忽略粘贴的文件。
- [RangePicker](/zh/components/range-picker) 清空时丢弃尚未确认的输入。DatePicker 和 RangePicker 的键盘打开请求未被接受时，如果用户已移开焦点，后续打开不会抢回焦点。
- [Cascader](/zh/components/cascader) 在移动端点击「完成」时，跳过新增后被移除或禁用的路径，保留此前已经提交的路径。
- [Table](/zh/components/table) 全选时根据最新的禁用状态处理当前页可选行。响应式列出现时会保留配置的默认排序。
- [Input](/zh/components/input) 和 [Textarea](/zh/components/textarea) 在输入法组合被打断后，可以正常响应下一次回车。Textarea 自动高度计入自定义内边距和边框。修改 CheckboxGroup 和 Slider 回调传出的数组不会影响组件状态。

**弹层与展示**

- [Image](/zh/components/image) 在禁用预览时会移除已打开的弹层。重新启用后需再次打开，应用受控指定为打开时除外。
- [Modal](/zh/components/modal) 的 `Modal.destroyAll()` 遇到 `afterClose` 回调抛错时，会先关闭其余弹窗，再抛出异常。Tour 在步骤未配置滚动选项时使用顶层配置，FloatButton 支持在所在 iframe 内检测外部点击。
- [Badge](/zh/components/badge) 可以在包裹的内容上显示状态圆点，并按 RTL 方向定位。Card 支持在页签栏传入一组操作项，BorderBeam 更换宿主元素后会重新开始动画。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.48...v0.0.49)

## 0.0.48

2026-11-06

**修复与改进**

- **Form** 为单行反馈预留 24px（18px 文本行、上方 2px、下方 4px），适用于 12–14px 的反馈字号。提示保留原字号，单行出现时字段位置稳定，长提示仍可换行。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.47...v0.0.48)

## 0.0.47

2026-11-06

**修复与改进**

- **Form** 修复从表单子路径导入时丢失的必填与错误样式，缩小反馈间距，无校验和提示的字段不再留空行。
- **Cascader** 在移动端使用底部抽屉，支持抽屉内搜索，单选即时应用，多选在点击完成后应用。调整了清除入口和展开箭头的对齐。

**文档**

- 中英文文档统一配色、导航和并排示例布局。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.46...v0.0.47)

## 0.0.46

2026-11-06

**新增**

- **TaoProvider** 新增 17 个语言包，支持从包根或 `@rockshin/tao-ui/locale/*` 按需导入。全局语言覆盖组件标签、空态、弹窗操作和表单校验，也适用于通过 Portal 渲染的内容。
- **DatePicker、RangePicker、Calendar 和 TimePicker** 支持地区化文案和日历习惯。地区化日期和时间格式可解析用户输入，组件级语言设置优先。
- **InputNumber 和 Statistic** 按地区展示数字和分隔符。InputNumber 继续输出保留精度的十进制字符串，日期选择器在显式选择地区化格式时才改变默认输出格式。

**文档**

- 中英文站点更新矢量标志、深色版本和网站图标。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.45...v0.0.46)

## 0.0.45

2026-11-06

**新增**

- **TaoProvider** 新增 `direction`，组件和 Portal 继承方向，组件可单独覆盖或使用原生 `dir="auto"`。

**修复与改进**

- **RTL** 修复横向滚动、Splitter 拖拽、Rate 输入、分页图标、Table 对齐和固定列，以及选择控件的键盘操作。桌面和移动弹层继承触发端方向。

**兼容性**

- **Segmented** 修复 React 18 下键盘导航触发最大更新深度错误的问题。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.44...v0.0.45)

## 0.0.44

2026-11-05

**新增**

- **Form** 新增 `FormInstance.scrollToField(name, options)`，支持已挂载的嵌套字段、`Form.List` 路径和 `noStyle` 项。可设置滚动行为和聚焦，`FormScrollOptions` 可从包根和表单子路径导入。

**修复与改进**

- 修复中文 AI Agent 指南链接重复拼接语言路径的问题。

**迁移**

- 需要定位到自定义控件时，控件应转发 DOM 或 `nativeElement` ref，或转发字段 ID。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.43...v0.0.44)

## 0.0.43

2026-11-05

**新增**

- **Input** 增加清除和计数，补齐 Password、Search、TextArea、OTP 及下划线样式。
- **Collapse** 支持面板配置、手风琴交互和内置样式。

**修复与改进**

- 优化 Calendar 和 Carousel 控件、RadioGroup 选择、Form 反馈间距、Tree 和 TreeSelect 勾选以及响应式选择器标题，修复控件 CSS 隔离和深色主题细节。

**迁移**

- 将 `Collapsible` 和 `/collapsible` 导入迁移至 `Collapse` 和 `/collapse`。

**文档**

- 改版中英文站点，新增 Agent 指南、`agent-manifest.json`、包内 `component-manifest.json` 导出及可检索的 Markdown 文档。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.42...v0.0.43)

## 0.0.42

2026-11-05

**新增**

- 组件目录扩充至 73 个可视条目，新增 Cascader、Tree、TreeSelect、Upload、Transfer、Calendar、ColorPicker、Carousel 和用于应用级反馈的 App 等。
- 新增公开的 `GetProps`、`GetProp` 和 `GetRef` 工具类型，用于从组件推导类型。

**修复与改进**

- 改善选择控件的响应式布局、全局本地化与焦点处理，默认主题圆角统一为 6px。

**文档**

- 中英文文档补齐可运行示例，支持独立的手机和桌面预览、同步深色模式及代码复制。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.41...v0.0.42)

## 0.0.41

2026-11-04

**修复与改进**

- **Select** 修复限制高度的选项列表无法纵向滚动的问题，覆盖普通单选、可搜索、多选和标签模式。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.40...v0.0.41)

## 0.0.40

2026-10-30

**修复与改进**

- **表单字段、选择器和弹层** 改进原生标签、必填和禁用语义及焦点还原。RangePicker 为起止输入分别命名并播报已确认的范围，移动端 Select 暴露当前选项和搜索标签。
- **Tabs、Spinner 和 Tag** 完善键盘交互或无障碍状态。Popover 和确认对话框使用可见标题作为无障碍名称。

**兼容性**

- tao-ui 迁入 Bun workspace，构建升级至 Rslib 1.x，npm 包名仍为 `@rockshin/tao-ui`。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.39...v0.0.40)

## 0.0.39

2026-10-18

**修复与改进**

- **主题、Table、Tag 和 Steps** 使用 OKLab 混合彩色和中性色，使主色与状态背景更接近原色相，并提高表格悬停背景和行分割线的辨识度。
- **Select** 扩大 `allowClear` 的点击区域，点击清除图标边缘时可清空选项，避免误开弹层。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.38...v0.0.39)

## 0.0.38

2026-10-15

**新增**

- **Table** 在设置 `scroll.y` 后支持固定表头，新增 `expandable` 展开行和可固定、可对齐固定列的 `Table.Summary` 汇总区。

**修复与改进**

- **Table** 保持固定表头和单元格背景不透明，容器缩放时重新计算边缘阴影，加载遮罩覆盖整张表格。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.37...v0.0.38)

## 0.0.37

2026-10-12

**修复与改进**

- **Popover** 回到通用弹层层级，内嵌 Select、Menu 或 DatePicker 展开时会显示在父级 Popover 上方。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.36...v0.0.37)

## 0.0.36

2026-10-05

**修复与改进**

- **Table** 的排序、筛选和分页回调使用一致的数据视图，并以父组件传入的受控状态为准。
- **Select** 统一变更、选中、取消选中和清除的回调顺序。移动端确认后通知已提交的变化，取消时丢弃草稿。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.35...v0.0.36)

## 0.0.35

2026-09-13

**修复与改进**

- **Tabs** 的激活指示线使用直角端点，修复缩放到当前标签宽度时端点变尖的问题。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.34...v0.0.35)

## 0.0.34

2026-09-13

**新增**

- 新增 **Steps**，支持编号进度、各步骤独立状态、键盘激活和通过 `maxCount` 折叠长流程。

**修复与改进**

- **Table** 的行分割线在有色背景上保持可见，边角单元格背景沿表格圆角绘制。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.33...v0.0.34)

## 0.0.33

2026-09-08

**修复与改进**

- **Select** 的标签模式在禁用空态内容时不再弹出空白列表，仍可输入新标签、显示后缀图标、自定义空态和弹层。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.32...v0.0.33)

## 0.0.32

2026-09-06

**修复与改进**

- **DatePicker 和 RangePicker** 正确处理日期边界变化、受控编辑被拒绝和表单主动清空，并同步可见月份。
- **Select、Table、InputNumber 和 Splitter** 修复搜索、选中、分页、数字输入和拖拽状态的更新问题。
- **Popover、Modal、Checkbox、Tabs 和 Form** 改善焦点管理、标签关联、选中状态渲染和布尔字段清空。

**兼容性**

- 在 React 19 之外新增 React 18.2 支持和 ref 兼容，提供可单独导入组件及其样式的子路径。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.31...v0.0.32)

## 0.0.31

2026-09-01

**修复与改进**

- **Table** 固定表头使用当前变体的背景色，固定列在横向仍有可滚动内容时显示边缘阴影。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.30...v0.0.31)

## 0.0.30

2026-08-28

**新增**

- **Button** 新增 `bare` 变体，保留交互行为，外观可由调用方定义。

**修复与改进**

- **Button** 默认样式移到低优先级的组件层，消费方类名可以覆盖颜色、间距和形状。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.29...v0.0.30)

## 0.0.29

2026-08-27

**修复与改进**

- **Input** 居中原生文本行框，修复光标和选区在控件中偏高的问题。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.28...v0.0.29)

## 0.0.28

2026-08-25

**修复与改进**

- **Textarea** 将低优先级默认样式放入组件级联层，允许语义化 DOM 类名覆盖内部输入框样式。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.27...v0.0.28)

## 0.0.27

2026-08-19

**修复与改进**

- **DatePicker 和 RangePicker** 在受控编辑被拒绝时恢复当前值，关闭或收到新值时取消尚未完成的范围选择。
- **Select** 解析重复值时保留首个选项。**Sonner** 不再被旧退出定时器误删重建的通知，并在 Promise 结束时正确清理加载提示。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.26...v0.0.27)

## 0.0.26

2026-08-19

**新增**

- 新增支持字段校验、列表和依赖联动的 **Form**，以及 **Alert**、**Popover**、**Popconfirm** 和 **Tooltip**。
- **Table** 列支持响应式断点，新增公开的响应式辅助函数和主题 Token 工具。

**修复与改进**

- **Button** 在 Flex 居中时保留文本行框，改善不同应用字体下的垂直对齐。

**文档**

- 新增中英文 Rspress 文档，提供可运行示例和 API 表格。[文档 PR](https://github.com/rickyshin93/tao-ui/pull/2)

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.25...v0.0.26)

## 0.0.25

2026-08-04

**修复与改进**

- **Input** 分别校准文本和密码圆点的位置，调整掩码字形时保留密码选区的行框位置。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.24...v0.0.25)

## 0.0.24

2026-08-04

**修复与改进**

- **Input** 按控件尺寸设置垂直内边距，使原生文本和密码掩码字形居中。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.23...v0.0.24)

## 0.0.23

2026-08-04

**修复与改进**

- **Input** 将浏览器自动填充背景限制在圆角边界内，并保留正常的文本垂直度量。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.22...v0.0.23)

## 0.0.22

2026-08-03

**新增**

- 为可视组件提供带类型的语义化 DOM 契约，并提供独立的元数据和主题工具导入入口。

**修复与改进**

- **DatePicker** 改善键盘导航，**FormField** 为控件关联标签和帮助文本，**Select** 将选中勾标保留在弹层宽度内。
- **Button** 调整图标尺寸与文本间距。**TaoProvider** 响应禁用动效的配置，并在 `inherit={false}` 时重置继承的主题种子。

**迁移**

- 原先从包根导入元数据和主题工具的代码可迁移至 `@rockshin/tao-ui/meta` 和 `@rockshin/tao-ui/tokens`。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.21...v0.0.22)

## 0.0.21

2026-07-26

**新增**

- **Input** 支持 React SVG 前缀，自动定位图标并为输入文字预留空间。

**修复与改进**

- **Drawer 和 Modal** 在允许点击遮罩关闭时，仅响应实际的遮罩点击。操作内部 Portal 时对话框保持打开。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.20...v0.0.21)

## 0.0.20

2026-07-25

**修复与改进**

- **Input** 有前缀时去掉重复的起始内边距，让文字和前缀之间保持预期距离。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.19...v0.0.20)

## 0.0.19

2026-07-25

**兼容性**

- 更新 Rslib、Rstest 和 Storybook 开发工具，发版时同步 Bun 锁文件。此补丁未改动组件。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.18...v0.0.19)

## 0.0.18

2026-07-25

**新增**

- **TaoProvider** 通过 `theme.mode` 支持深色模式，嵌套 Provider 继承模式，Portal 组件带上触发端主题。[PR #1](https://github.com/rickyshin93/tao-ui/pull/1)
- **DatePicker 和 RangePicker** 桌面端支持按格式手输，移动端保留抽屉。可搜索 **Select** 支持桌面单选直接输入，以及多选和标签模式内联搜索。

**修复与改进**

- **Input 和 RangePicker** 改善前缀及文本对齐，Table、Tag、Modal 和 Drawer 的表面与遮罩颜色改为使用主题 Token。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.17...v0.0.18)

## 0.0.17

2026-07-12

**新增**

- **Button** 新增 `icon` 和 `loadingIcon`，切换加载状态时保留图标插槽，减少布局闪动。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.16...v0.0.17)

## 0.0.16

2026-07-12

**修复与改进**

- **Sonner** 根据通知实际高度计算展开后的堆叠位置，移除时保持位置稳定，并改善进出动画和关闭按钮的点击区域。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.15...v0.0.16)

## 0.0.15

2026-07-12

**新增**

- 新增 **Sonner** 和命令式 `toast()` API，支持状态色、自定义内容、操作按钮，以及 Promise 驱动的加载、成功和错误状态。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.14...v0.0.15)

## 0.0.14

2026-07-10

**新增**

- **Select** 新增搜索、多选和标签模式、自定义标签渲染及选择数量限制，移动端多选通过抽屉确认。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.13...v0.0.14)

## 0.0.13

2026-07-09

**修复与改进**

- **Checkbox 和 Radio** 将原生输入限制在可视控件范围内，保留聚焦和点击能力，避免拦截控件外的点击。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.12...v0.0.13)

## 0.0.12

2026-07-05

**修复与改进**

- **Select、DatePicker、RangePicker、Dropdown 和菜单** 将 Portal 主题 Token 直接应用到弹层元素，避免关闭时遗留空包装节点。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.11...v0.0.12)

## 0.0.11

2026-07-05

**新增**

- 新增组件元数据清单，并公开组件属性和语义化 DOM 类型。

**修复与改进**

- **Breadcrumb** 将操作项渲染为按钮。**DatePicker** 的日期单元使用可聚焦的原生按钮，提供无障碍名称和禁用状态。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.10...v0.0.11)

## 0.0.10

2026-07-05

**修复与改进**

- **FormSection** 消除原生 fieldset 和 legend 带来的额外留白，Portal 主题作用域不再占用 Flex 和 Grid 布局空间。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.9...v0.0.10)

## 0.0.9

2026-07-04

**新增**

- 新增主题化数字输入 **InputNumber**，支持数字分组、光标位置保持及保留精度的标准字符串值，同时提供无样式的数字输入能力。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.8...v0.0.9)

## 0.0.8

2026-07-03

**新增**

- **Table** 新增 `onRow`、`onHeaderRow`、`onCell` 和 `onHeaderCell`，支持行样式以及回调形式的语义化 DOM 定制。

**修复与改进**

- **Tag** 调整间距和行高，使文字与图标对齐更一致。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.7...v0.0.8)

## 0.0.7

2026-07-03

**新增**

- **Table** 默认使用新的 `modern` 变体，采用低对比度边框和更轻的表头，仍可显式指定已有变体。

**修复与改进**

- **Select** 调整文字和图标的对齐，支持 Enter 或空格清除。**Tag** 改善语义色背景和关闭按钮样式。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.6...v0.0.7)

## 0.0.6

2026-07-02

**修复与改进**

- **TaoProvider** 在嵌套作用域重新计算派生 Token，并让子元素保持在父级 Flex 或 Grid 布局中。相同的内联 Token 值不会触发多余的上下文更新。
- **主题和 Button** 将默认圆角从 6px 调整至 10px，优化焦点环、边框、按钮字重和阴影。

**迁移**

- **Input、Textarea、Select 和日期选择器** 默认占满可用宽度。依赖原先 200px 默认宽度的布局需显式指定宽度。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.5...v0.0.6)

## 0.0.5

2026-07-01

**修复与改进**

- **Input** 在 Flex 行内占满可用宽度，单行 **Textarea** 与同尺寸 Input 等高。

**兼容性**

- 修复严格 tree shaking 时包入口样式可能被移除的问题。

**迁移**

- 需要保留原先较高的 Textarea 默认高度时，显式设置 `rows={3}`。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.4...v0.0.5)

## 0.0.4

2026-06-08

**兼容性**

- 使用原生 CSS 替换 Tailwind 和 PostCSS 生成的样式，在包入口统一导入主题及控件样式。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.3...v0.0.4)

## 0.0.3

2026-06-07

**新增**

- **Select** 增加 Ant Design 风格的单选 API，支持受控开关、弹层方向和宽度、自定义渲染、分组选项及语义化样式。
- 新增 **Spinner**，支持延迟显示、自定义指示器、内容遮罩和全屏模式。

**修复与改进**

- Portal 中的控件继承主题 Token，弹层显示在 Modal 和 Drawer 上方，清空 Select 时保持弹层关闭。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.2...v0.0.3)

## 0.0.2

2026-06-07

**新增**

- 新增 **Breadcrumb、Collapsible、ContextMenu、Dropdown 和 Textarea**。Textarea 支持通用控件变体以及可指定最少和最多行数的 `autoSize`。
- 新增 **Modal**，支持受控 `open`、命令式确认和状态弹窗方法，以及 `Modal.useModal()`。

**修复与改进**

- 表单控件共用焦点和变体样式，容器与浮层表面使用白色和派生中性色。

[查看版本差异](https://github.com/rickyshin93/tao-ui/compare/v0.0.1...v0.0.2)

## 0.0.1

2026-06-06

**新增**

- **@rockshin/tao-ui** 首次发布，支持 React 19、语义化 DOM 定制和 OKLCH 主题 Token。
