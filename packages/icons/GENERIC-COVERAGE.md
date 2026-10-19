# 高频通用 UI 扩展目录

新增 224 枚，通用总数由 200 增至 424；另有已确认保险 130 枚，合计 554。原 330 不变，新 224 为原创待确认候选。67 枚 P0、157 枚 P1 是依据常见界面任务的设计优先级，不是实测使用频率排名。

## 参考与选择方法

参考 Lucide（https://lucide.dev/icons）、Ant Design（https://ant.design/components/icon/）与 Heroicons（https://heroicons.com/）的官方目录，对照常见语义与场景缺口。不导入它们的图形、SVG 路径或包源码。没有追求覆盖主流库的全部图标、所有品牌、全部货币或装饰性变体。

现有名称的同义检索保存在 manifest 顶层 reuseAliases；不生成重复 SVG 或 React 导出，也不改变已批准条目的 tags。car 重用 insurance-auto，volume-high 重用 volume。

`data/manifest.json` 为完整 554 枚程序目录；`svg/` 包含全部 SVG；独立设计资产包提供离线预览、sprite、分类图和 16/20/24px 原生尺寸验证。本文提供本次 224 枚新增清单。

## 新增清单

### 导航与移动（13）

| ID / 子路径 | 组件 | 中文语义 | 优先级 |
|---|---|---|---|
| arrow-up-left | ArrowUpLeftIcon | 左上箭头 | P1 |
| arrow-down-left | ArrowDownLeftIcon | 左下箭头 | P1 |
| arrow-down-right | ArrowDownRightIcon | 右下箭头 | P1 |
| arrow-left-right | ArrowLeftRightIcon | 左右交换 | P1 |
| arrow-up-down | ArrowUpDownIcon | 上下交换 | P1 |
| chevrons-up | ChevronsUpIcon | 双上尖括号 | P1 |
| chevrons-down | ChevronsDownIcon | 双下尖括号 | P1 |
| chevrons-up-down | ChevronsUpDownIcon | 上下选择 | P1 |
| corner-down-left | CornerDownLeftIcon | 回车 | P1 |
| move-horizontal | MoveHorizontalIcon | 水平移动 | P1 |
| move-vertical | MoveVerticalIcon | 垂直移动 | P1 |
| mouse-pointer | MousePointerIcon | 鼠标指针 | P1 |
| hand | HandIcon | 抓手 | P1 |

### 操作与表单控件（20）

| ID / 子路径 | 组件 | 中文语义 | 优先级 |
|---|---|---|---|
| checkbox | CheckboxIcon | 未选复选框 | P0 |
| checkbox-checked | CheckboxCheckedIcon | 已选复选框 | P0 |
| checkbox-indeterminate | CheckboxIndeterminateIcon | 半选复选框 | P0 |
| radio-button | RadioButtonIcon | 未选单选框 | P0 |
| radio-button-selected | RadioButtonSelectedIcon | 已选单选框 | P0 |
| toggle-left | ToggleLeftIcon | 开关关闭 | P0 |
| toggle-right | ToggleRightIcon | 开关开启 | P0 |
| plus-circle | PlusCircleIcon | 圆形加号 | P1 |
| minus-circle | MinusCircleIcon | 圆形减号 | P1 |
| filter-clear | FilterClearIcon | 清除筛选 | P1 |
| list-filter | ListFilterIcon | 列表筛选 | P1 |
| pin | PinIcon | 固定 | P1 |
| pin-off | PinOffIcon | 取消固定 | P1 |
| clipboard-check | ClipboardCheckIcon | 剪贴板完成 | P1 |
| clipboard-list | ClipboardListIcon | 任务清单 | P1 |
| clipboard-paste | ClipboardPasteIcon | 粘贴 | P1 |
| check-check | CheckCheckIcon | 全部已读 | P1 |
| search-x | SearchXIcon | 无搜索结果 | P1 |
| grip-vertical | GripVerticalIcon | 纵向拖动手柄 | P0 |
| grip-horizontal | GripHorizontalIcon | 横向拖动手柄 | P0 |

### 文件与文档（19）

| ID / 子路径 | 组件 | 中文语义 | 优先级 |
|---|---|---|---|
| file-minus | FileMinusIcon | 删除文件 | P1 |
| file-x | FileXIcon | 文件失败 | P1 |
| file-search | FileSearchIcon | 查找文件 | P0 |
| file-download | FileDownloadIcon | 下载文件 | P0 |
| file-upload | FileUploadIcon | 上传文件 | P0 |
| file-lock | FileLockIcon | 加密文件 | P1 |
| file-spreadsheet | FileSpreadsheetIcon | 电子表格 | P0 |
| file-chart | FileChartIcon | 数据报告 | P1 |
| file-audio | FileAudioIcon | 音频文件 | P1 |
| file-video | FileVideoIcon | 视频文件 | P1 |
| file-archive | FileArchiveIcon | 压缩文件 | P1 |
| folder-minus | FolderMinusIcon | 删除文件夹 | P1 |
| folder-search | FolderSearchIcon | 查找文件夹 | P0 |
| folder-check | FolderCheckIcon | 文件夹完成 | P1 |
| folder-lock | FolderLockIcon | 私密文件夹 | P1 |
| folders | FoldersIcon | 文件夹组 | P1 |
| book-open | BookOpenIcon | 打开的书 | P1 |
| bookmark-plus | BookmarkPlusIcon | 添加书签 | P1 |
| bookmark-minus | BookmarkMinusIcon | 移除书签 | P1 |

### 编辑与排版（25）

| ID / 子路径 | 组件 | 中文语义 | 优先级 |
|---|---|---|---|
| list-bullets | ListBulletsIcon | 无序列表 | P0 |
| list-ordered | ListOrderedIcon | 有序列表 | P0 |
| list-checks | ListChecksIcon | 勾选列表 | P1 |
| indent-increase | IndentIncreaseIcon | 增加缩进 | P0 |
| indent-decrease | IndentDecreaseIcon | 减少缩进 | P0 |
| heading | HeadingIcon | 标题 | P0 |
| quote | QuoteIcon | 引用 | P0 |
| paragraph | ParagraphIcon | 段落 | P1 |
| text-cursor | TextCursorIcon | 文本光标 | P1 |
| text-wrap | TextWrapIcon | 自动换行 | P1 |
| text-color | TextColorIcon | 文字颜色 | P0 |
| highlighter | HighlighterIcon | 文本高亮 | P0 |
| remove-formatting | RemoveFormattingIcon | 清除格式 | P1 |
| superscript | SuperscriptIcon | 上标 | P1 |
| subscript | SubscriptIcon | 下标 | P1 |
| palette | PaletteIcon | 调色板 | P1 |
| pipette | PipetteIcon | 吸管取色 | P1 |
| pen-tool | PenToolIcon | 钢笔工具 | P1 |
| ruler | RulerIcon | 标尺 | P1 |
| rotate-left | RotateLeftIcon | 向左旋转 | P1 |
| rotate-right | RotateRightIcon | 向右旋转 | P1 |
| flip-horizontal | FlipHorizontalIcon | 水平翻转 | P1 |
| flip-vertical | FlipVerticalIcon | 垂直翻转 | P1 |
| triangle | TriangleIcon | 三角形 | P1 |
| diamond | DiamondIcon | 菱形 | P1 |

### 布局与排列（16）

| ID / 子路径 | 组件 | 中文语义 | 优先级 |
|---|---|---|---|
| align-top | AlignTopIcon | 顶端对齐 | P1 |
| align-bottom | AlignBottomIcon | 底端对齐 | P1 |
| align-middle | AlignMiddleIcon | 垂直居中 | P1 |
| distribute-horizontal | DistributeHorizontalIcon | 水平分布 | P1 |
| distribute-vertical | DistributeVerticalIcon | 垂直分布 | P1 |
| group | GroupIcon | 组合 | P1 |
| ungroup | UngroupIcon | 取消组合 | P1 |
| bring-to-front | BringToFrontIcon | 置于顶层 | P1 |
| send-to-back | SendToBackIcon | 置于底层 | P1 |
| panel-left-close | PanelLeftCloseIcon | 收起左侧栏 | P1 |
| panel-left-open | PanelLeftOpenIcon | 展开左侧栏 | P1 |
| panel-right-close | PanelRightCloseIcon | 收起右侧栏 | P1 |
| panel-right-open | PanelRightOpenIcon | 展开右侧栏 | P1 |
| layout-template | LayoutTemplateIcon | 布局模板 | P1 |
| gallery-horizontal | GalleryHorizontalIcon | 横向画廊 | P1 |
| split | SplitIcon | 分屏 | P1 |

### 数据与图表（17）

| ID / 子路径 | 组件 | 中文语义 | 优先级 |
|---|---|---|---|
| chart-pie | ChartPieIcon | 饼图 | P0 |
| chart-donut | ChartDonutIcon | 环形图 | P1 |
| chart-area | ChartAreaIcon | 面积图 | P0 |
| chart-scatter | ChartScatterIcon | 散点图 | P1 |
| chart-bar-horizontal | ChartBarHorizontalIcon | 横向柱状图 | P1 |
| chart-stacked | ChartStackedIcon | 堆叠柱状图 | P1 |
| trending-up | TrendingUpIcon | 上升趋势 | P0 |
| trending-down | TrendingDownIcon | 下降趋势 | P0 |
| activity | ActivityIcon | 活动监测 | P0 |
| gauge | GaugeIcon | 仪表盘 | P1 |
| calculator | CalculatorIcon | 计算器 | P0 |
| percent | PercentIcon | 百分比 | P0 |
| sigma | SigmaIcon | 求和 | P1 |
| table-add-row | TableAddRowIcon | 插入行 | P1 |
| table-add-column | TableAddColumnIcon | 插入列 | P1 |
| table-delete-row | TableDeleteRowIcon | 删除行 | P1 |
| table-delete-column | TableDeleteColumnIcon | 删除列 | P1 |

### 用户与身份安全（11）

| ID / 子路径 | 组件 | 中文语义 | 优先级 |
|---|---|---|---|
| user-minus | UserMinusIcon | 移除用户 | P0 |
| user-x | UserXIcon | 用户禁用 | P0 |
| user-settings | UserSettingsIcon | 用户设置 | P1 |
| user-search | UserSearchIcon | 查找用户 | P1 |
| contact | ContactIcon | 联系人 | P1 |
| badge-check | BadgeCheckIcon | 认证徽章 | P1 |
| shield-alert | ShieldAlertIcon | 安全警告 | P1 |
| shield-x | ShieldXIcon | 防护失败 | P1 |
| shield-off | ShieldOffIcon | 防护关闭 | P1 |
| lock-keyhole | LockKeyholeIcon | 密码锁 | P1 |
| scan-face | ScanFaceIcon | 人脸识别 | P1 |

### 沟通与反馈（20）

| ID / 子路径 | 组件 | 中文语义 | 优先级 |
|---|---|---|---|
| bell-off | BellOffIcon | 关闭通知 | P0 |
| bell-ring | BellRingIcon | 通知提醒 | P0 |
| mail-check | MailCheckIcon | 邮件已发送 | P1 |
| mail-plus | MailPlusIcon | 新建邮件 | P1 |
| mail-x | MailXIcon | 邮件失败 | P1 |
| mail-search | MailSearchIcon | 搜索邮件 | P1 |
| message-plus | MessagePlusIcon | 新建消息 | P1 |
| message-check | MessageCheckIcon | 消息已读 | P1 |
| message-typing | MessageTypingIcon | 正在输入 | P1 |
| reply | ReplyIcon | 回复 | P0 |
| reply-all | ReplyAllIcon | 回复全部 | P0 |
| forward | ForwardIcon | 转发 | P0 |
| megaphone | MegaphoneIcon | 公告 | P1 |
| phone-incoming | PhoneIncomingIcon | 来电 | P1 |
| phone-outgoing | PhoneOutgoingIcon | 去电 | P1 |
| phone-missed | PhoneMissedIcon | 未接来电 | P1 |
| phone-off | PhoneOffIcon | 通话关闭 | P1 |
| smile | SmileIcon | 笑脸 | P0 |
| frown | FrownIcon | 难过 | P1 |
| thumbs-down | ThumbsDownIcon | 不赞同 | P0 |

### 音频与视频（18）

| ID / 子路径 | 组件 | 中文语义 | 优先级 |
|---|---|---|---|
| video | VideoIcon | 录像 | P0 |
| video-off | VideoOffIcon | 关闭视频 | P0 |
| camera-off | CameraOffIcon | 关闭相机 | P1 |
| image-plus | ImagePlusIcon | 添加图片 | P0 |
| images | ImagesIcon | 图片集 | P1 |
| image-off | ImageOffIcon | 图片不可用 | P1 |
| volume-low | VolumeLowIcon | 低音量 | P0 |
| fast-forward | FastForwardIcon | 快进 | P1 |
| rewind | RewindIcon | 快退 | P1 |
| repeat | RepeatIcon | 循环播放 | P0 |
| repeat-one | RepeatOneIcon | 单曲循环 | P1 |
| shuffle | ShuffleIcon | 随机播放 | P0 |
| play-circle | PlayCircleIcon | 圆形播放 | P1 |
| pause-circle | PauseCircleIcon | 圆形暂停 | P1 |
| audio-waveform | AudioWaveformIcon | 音频波形 | P1 |
| screen-share | ScreenShareIcon | 共享屏幕 | P0 |
| screen-share-off | ScreenShareOffIcon | 停止共享 | P1 |
| picture-in-picture | PictureInPictureIcon | 画中画 | P1 |

### 设备与连接（14）

| ID / 子路径 | 组件 | 中文语义 | 优先级 |
|---|---|---|---|
| wifi-off | WifiOffIcon | 无线网络断开 | P0 |
| bluetooth-off | BluetoothOffIcon | 蓝牙关闭 | P0 |
| battery-charging | BatteryChargingIcon | 电池充电 | P0 |
| battery-low | BatteryLowIcon | 低电量 | P0 |
| battery-full | BatteryFullIcon | 电量充足 | P1 |
| signal | SignalIcon | 移动信号 | P0 |
| signal-off | SignalOffIcon | 无移动信号 | P1 |
| router | RouterIcon | 路由器 | P1 |
| ethernet | EthernetIcon | 有线网络 | P1 |
| usb | UsbIcon | USB连接 | P1 |
| cast | CastIcon | 无线投屏 | P1 |
| monitor-off | MonitorOffIcon | 显示器关闭 | P1 |
| printer-check | PrinterCheckIcon | 打印完成 | P1 |
| smartwatch | SmartwatchIcon | 智能手表 | P1 |

### 商业与地点（18）

| ID / 子路径 | 组件 | 中文语义 | 优先级 |
|---|---|---|---|
| store | StoreIcon | 商店 | P0 |
| shopping-cart-plus | ShoppingCartPlusIcon | 加入购物车 | P1 |
| shopping-cart-check | ShoppingCartCheckIcon | 购物车完成 | P1 |
| barcode | BarcodeIcon | 条形码 | P1 |
| qr-code | QrCodeIcon | 二维码 | P0 |
| banknote | BanknoteIcon | 纸币 | P1 |
| coins | CoinsIcon | 硬币 | P0 |
| landmark | LandmarkIcon | 银行机构 | P1 |
| currency-dollar | CurrencyDollarIcon | 美元 | P1 |
| currency-euro | CurrencyEuroIcon | 欧元 | P1 |
| currency-yuan | CurrencyYuanIcon | 人民币 | P1 |
| ticket | TicketIcon | 票券 | P1 |
| map-pin-off | MapPinOffIcon | 位置关闭 | P1 |
| locate | LocateIcon | 定位当前位置 | P0 |
| route | RouteIcon | 路线 | P1 |
| signpost | SignpostIcon | 路标 | P1 |
| plane | PlaneIcon | 飞机 | P1 |
| train | TrainIcon | 火车 | P1 |

### 时间与任务状态（8）

| ID / 子路径 | 组件 | 中文语义 | 优先级 |
|---|---|---|---|
| calendar-plus | CalendarPlusIcon | 新建日程 | P0 |
| calendar-x | CalendarXIcon | 取消日程 | P1 |
| calendar-range | CalendarRangeIcon | 日期范围 | P0 |
| calendar-clock | CalendarClockIcon | 日程时间 | P1 |
| hourglass | HourglassIcon | 等待中 | P1 |
| alarm-off | AlarmOffIcon | 关闭闹钟 | P1 |
| flag-off | FlagOffIcon | 取消标记 | P1 |
| circle-dashed | CircleDashedIcon | 待处理 | P1 |

### 无障碍（5）

| ID / 子路径 | 组件 | 中文语义 | 优先级 |
|---|---|---|---|
| accessibility | AccessibilityIcon | 无障碍 | P0 |
| captions | CaptionsIcon | 字幕 | P0 |
| contrast | ContrastIcon | 对比度 | P0 |
| text-size | TextSizeIcon | 文字大小 | P0 |
| hearing | HearingIcon | 听觉辅助 | P1 |

### 开发与人工智能（20）

| ID / 子路径 | 组件 | 中文语义 | 优先级 |
|---|---|---|---|
| sparkles | SparklesIcon | 智能生成 | P0 |
| bot | BotIcon | 智能助手 | P0 |
| brain | BrainIcon | 智能分析 | P1 |
| wand | WandIcon | 智能优化 | P1 |
| lightbulb | LightbulbIcon | 灵感 | P0 |
| zap | ZapIcon | 快捷操作 | P0 |
| command | CommandIcon | 命令键 | P0 |
| code-block | CodeBlockIcon | 代码块 | P1 |
| git-pull-request | GitPullRequestIcon | 合并请求 | P0 |
| git-compare | GitCompareIcon | 比较分支 | P1 |
| git-fork | GitForkIcon | 代码分叉 | P1 |
| network | NetworkIcon | 网络拓扑 | P1 |
| database-backup | DatabaseBackupIcon | 数据库备份 | P1 |
| cloud-off | CloudOffIcon | 云端断开 | P1 |
| cloud-check | CloudCheckIcon | 云端同步完成 | P1 |
| container | ContainerIcon | 容器 | P1 |
| brackets | BracketsIcon | 方括号 | P1 |
| variable | VariableIcon | 变量 | P1 |
| rocket | RocketIcon | 发布上线 | P1 |
| wrench | WrenchIcon | 工具 | P0 |

