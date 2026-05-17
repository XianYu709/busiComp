# Scanner 扫描模块说明文档

## 目录结构

```
Scanner/
├── ScannerPage.vue          # 核心页面组件（通用，不直接使用）
├── exam.vue                 # 考试扫描入口（包装 ScannerPage）
├── homework.vue             # 作业扫描入口（包装 ScannerPage）
├── api/
│   ├── scan.ts              # 所有接口请求
│   └── types.ts             # 接口类型定义
├── components/
│   ├── Should.vue           # 应考/应交列表
│   ├── Actual.vue           # 实考/实交列表
│   ├── Lack.vue             # 缺少列表
│   ├── Abnormal.vue         # 异常列表
│   ├── Other.vue            # 其他异常列表
│   ├── Repeated.vue         # 重复扫描列表
│   └── upload/
│       ├── uploadImage.vue  # 手动上传图片
│       ├── ManualParsing.vue # 手动解析
│       └── ViewCard.vue     # 图片预览卡片
├── js/
│   ├── scanWeb.ts           # WebSocket 扫描核心逻辑（全局状态）
│   ├── WebScanController.ts # WebSocket 控制器
│   ├── CTwainController.ts  # CTwain 扫描仪控制器
│   ├── ScanEvent.ts         # 事件常量定义
│   └── blobToFile.ts        # Blob 转 File 工具
├── constants/
│   └── CacheKey.ts          # sessionStorage key 常量
├── utils/
│   ├── WSS.ts               # WebSocket 封装
│   ├── AxiosUtils.ts        # Axios 工具
│   └── exportExcel.ts       # 导出 Excel 工具
└── images/                  # 静态图片资源
```

---

## 页面入口说明

`ScannerPage.vue` 是通用核心组件，不直接路由访问。外部通过传入 `config` prop 来适配不同业务场景。

### 入口1：直接进入（无 recordId）

适用场景：从菜单直接点击进入扫描页（如「扫描作业」）。

- URL 不携带 `?id=` 参数
- 用户操作扫描仪后，WebSocket 返回 `recordId`，页面据此查询结果
- `recordId` 存入 `sessionStorage`（key: `scan_record_id`），支持**浏览器刷新后恢复**
- 通过菜单切换离开再返回时，`sessionStorage` 会被清除，全新进入

### 入口2：带 recordId 进入

适用场景：从作业列表、考试列表点击「查看扫描结果」跳转。

- URL 携带 `?id=xxx` 参数
- 页面直接用 URL 中的 `id` 查询历史数据，不依赖 sessionStorage
- 刷新页面不影响（id 仍在 URL 中）

---

## ScannerConfig 接口说明

```ts
interface ScannerConfig {
  mode: 'exam' | 'homework';       // 业务模式
  title: string;                   // 页面标题
  name: string;                    // 考试名称 / 作业名称
  nameLabel: string;               // 名称标签文字
  gradeName: string;               // 年级名称（展示用）
  subjectName: string;             // 学科名称（展示用）
  examInfoId?: string;             // 考试ID（exam 模式）
  examProcessId?: string | number; // 考试流程ID（exam 模式）
  subjectId?: string;              // 学科ID
  scanType?: string;               // 扫描类型
  paperGenMethodOp?: string;       // 试卷生成方式
  showLayout: boolean;             // 是否显示栏数选项（exam=true, homework=false）
  pageOptions: { label: string; value: boolean }[]; // 页数选项
  labels: {                        // 各 Tab 的文案（exam/homework 不同）
    should: string;                // 「应考」或「应交」
    actual: string;                // 「实考」或「实交」
    lack: string;
    abnormal: string;
    unit: string;                  // 「张」或「个」
  };
  sessionKey: string;              // 记录当前激活 Tab 的 sessionStorage key
  getInitParams: () => {           // 扫描表单初始化参数
    gradeId?: string | number;
    subjectId?: string;
    classId?: string;
    locked: boolean;               // true=年级/学科/班级不可修改
  };
  fetchStats: (scanRecordId: string, subjectId: string) => Promise<StatsResult>; // 查询统计数据
  fetchList: (params: any) => Promise<{ rows: any[]; total: number }>;           // 查询列表数据
  onScanComplete?: (scanRecordId: string) => Promise<void>; // 扫描完成后回调（可选）
}
```

---

## 核心状态说明（scanWeb.ts）

`scanWeb.ts` 以模块级变量维护全局扫描状态，组件卸载时需手动重置。

| 导出变量 | 类型 | 说明 |
|---|---|---|
| `recordId` | `Ref<string>` | 当前扫描记录ID，扫描成功由 WebSocket 赋值 |
| `isClose` | `Ref<boolean>` | WebSocket 扫描结束信号 |
| `msg` | `Ref<string>` | WebSocket 返回的状态消息 |
| `isLoading` | `Ref<boolean>` | 全局上传 loading 状态 |
| `scanningState` | `Reactive` | 实时扫描进度（已扫张数、已上传张数等） |
| `wsConnectionState` | `Reactive` | WebSocket 连接状态 |
| `devices` | `Ref<string[]>` | 当前可用扫描仪设备列表 |
| `deviceName` | `Ref<string>` | 当前选中设备名 |

> **注意**：`recordId` 是模块单例，组件卸载（`onBeforeUnmount`）时会被置为 `""`，防止状态污染。

---

## recordId 持久化机制（刷新问题解决方案）

### 问题背景

入口1通过 WebSocket 获得 `recordId`，存在内存中。刷新页面后内存清空，导致查询不到数据。

### 解决方案

利用 `sessionStorage` 配合「刷新标志」区分两种离开场景：

```
刷新页面：
  beforeunload  →  写入 SCAN_PAGE_REFRESHING 标志
  onBeforeUnmount  →  检测到标志，保留 SCAN_RECORD_ID
  onMounted（重载后）→  检测到标志，从 sessionStorage 恢复 recordId

路由导航离开（菜单切换）：
  onBeforeUnmount  →  无标志，清除 SCAN_RECORD_ID
  onMounted（再次进入）→  无缓存，全新进入

点击「返回上一步」：
  goBack()  →  主动清除 SCAN_RECORD_ID，再执行 history.back()
```

### 相关 CacheKey

```ts
// constants/CacheKey.ts
export const SCAN_RECORD_ID = 'scan_record_id';       // 存储 recordId
export const SCAN_PAGE_REFRESHING = 'scan_page_refreshing'; // 刷新标志（临时）
```

### 入口2不受影响

`recordId` 的 sessionStorage 写入条件为 `!route.query.id`，入口2始终走 URL 参数，两者完全隔离。

---

## Tab 菜单说明

| index | 组件 | exam 文案 | homework 文案 |
|---|---|---|---|
| 1 | Should.vue | 应考 | 应交 |
| 2 | Actual.vue | 实考 | 实交 |
| 3 | Lack.vue | 缺少考卷 | 缺少作业 |
| 4 | Abnormal.vue | 异常考卷 | 异常作业 |
| 5 | Other.vue | 其他异常 | 其他异常 |
| 6 | Repeated.vue | 重复扫描 | 重复扫描 |

当前激活 Tab 通过 `sessionStorage` 持久化（key 由 `config.sessionKey` 指定），刷新后恢复选中状态。

---

## 数据加载流程

```
1. onMounted
   ├── 判断是否刷新，恢复 recordId（入口1）
   ├── openClient()  →  建立 WebSocket 连接
   └── initDefaultScanSettings()  →  初始化表单默认值

2. 用户点击「开始扫描」
   └── 打开扫描配置对话框 → 确认后调用 startScan()

3. WebSocket 返回 recordId
   └── recordId.value = data.recordId

4. watch(recordId) 触发
   └── loadScanResults(id)
       ├── 调用 config.onScanComplete（可选回调）
       ├── isScanOrReset=true：轮询 fetchStats（最多20次，2s间隔，稳定后停止）
       └── isScanOrReset=false（刷新恢复）：单次 fetchStats
           └── 全部 Tab fetchTabData()

5. 统计数据更新 → 菜单数字刷新 → 列表数据加载
```

---

## 新增业务场景

如需接入新的扫描场景（如「试卷扫描」），只需：

1. 新建一个入口 `.vue` 文件（参考 `exam.vue` / `homework.vue`）
2. 按照 `ScannerConfig` 接口实现 `fetchStats`、`fetchList` 等方法
3. 设置唯一的 `sessionKey`，避免与其他入口的 Tab 状态冲突
4. 传入 `<ScannerPage :config="config" />` 即可
