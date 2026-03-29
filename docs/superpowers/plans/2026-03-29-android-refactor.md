# Android Refactor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保留现有 Web/Tauri 代码的前提下，为项目接入 Capacitor 安卓工程，交付首版可安装、纯本地功能可用的安卓 App。

**Architecture:** 保持 `src/` 作为唯一前端业务来源，新增 `android/` 作为 Capacitor 安卓容器，通过统一的平台能力适配层处理安卓与浏览器环境差异。首版通过能力开关隐藏账号、云同步和管理员功能，避免侵入式重写业务逻辑。

**Tech Stack:** React、TypeScript、Vite、Capacitor、Android Studio、npm

---

## 文件结构映射

### 新增文件

- `E:\Oyama-s-HRT-Tracker-main\capacitor.config.ts`
  - Capacitor 主配置，定义应用标识、应用名、Web 构建目录和安卓配置。
- `E:\Oyama-s-HRT-Tracker-main\src\platform\env.ts`
  - 统一环境判断，识别浏览器、Tauri、Capacitor 安卓。
- `E:\Oyama-s-HRT-Tracker-main\src\platform\features.ts`
  - 统一能力开关，控制账号、云同步、管理员入口是否可用。
- `E:\Oyama-s-HRT-Tracker-main\src\services\deviceExport.ts`
  - 统一导出/分享/下载适配层，封装安卓与浏览器差异。
- `E:\Oyama-s-HRT-Tracker-main\src\styles\mobile.css`
  - 安卓安全区、小屏弹窗和输入场景补丁样式。

### 重点修改文件

- `E:\Oyama-s-HRT-Tracker-main\package.json`
  - 增加 Capacitor 依赖和安卓构建脚本。
- `E:\Oyama-s-HRT-Tracker-main\src\App.tsx`
  - 接入能力开关，隐藏账号与管理员页面入口，替换导出实现，补充安卓适配初始化。
- `E:\Oyama-s-HRT-Tracker-main\src\hooks\useAppNavigation.ts`
  - 让导航由能力开关驱动，而不是固定展示 `account/admin`。
- `E:\Oyama-s-HRT-Tracker-main\src\services\export.ts`
  - 保留 PDF/CSV 生成逻辑，但避免页面直接调用浏览器下载。
- `E:\Oyama-s-HRT-Tracker-main\src\index.css`
  - 引入移动端补丁样式。
- `E:\Oyama-s-HRT-Tracker-main\src\components\ExportModal.tsx`
  - 如有需要，调整导出交互文案与按钮行为，使其适配安卓首版。
- `E:\Oyama-s-HRT-Tracker-main\src\components\ImportModal.tsx`
  - 如有需要，补充安卓环境的导入提示或降级提示。
- `E:\Oyama-s-HRT-Tracker-main\src\services\cloud.ts`
  - 保持实现，但通过能力开关避免安卓版误调用。

### 可能生成的目录

- `E:\Oyama-s-HRT-Tracker-main\android\`
  - Capacitor 生成的安卓原生工程目录。

### 验证命令

- `npm install`
- `npm run build`
- `npx cap sync android`
- `npm run android:open`
- `npm run android:apk` 或通过 Android Studio 构建 Debug APK

---

## Chunk 1: Capacitor 安卓工程接入

### Task 1: 为项目补齐 Capacitor 依赖和脚本

**Files:**
- Modify: `E:\Oyama-s-HRT-Tracker-main\package.json`

- [ ] **Step 1: 在 `package.json` 中添加 Capacitor 依赖**

添加以下依赖：

```json
{
  "dependencies": {
    "@capacitor/core": "^7.0.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^7.0.0",
    "@capacitor/android": "^7.0.0"
  }
}
```

- [ ] **Step 2: 在 `package.json` 中添加安卓相关脚本**

新增脚本：

```json
{
  "scripts": {
    "android:sync": "npm run build && npx cap sync android",
    "android:open": "npx cap open android",
    "android:run": "npm run build && npx cap run android",
    "android:copy": "npm run build && npx cap copy android"
  }
}
```

- [ ] **Step 3: 运行依赖安装**

Run: `npm install`  
Expected: 成功安装 Capacitor 相关依赖，`package-lock.json` 更新

- [ ] **Step 4: 复查 `package.json` 是否无语法错误**

Run: `npm run build`  
Expected: 至少进入前端构建流程，不因 `package.json` 配置错误而中断

- [ ] **Step 5: 提交本任务**

```bash
git add package.json package-lock.json
git commit -m "feat: add capacitor dependencies and android scripts"
```

### Task 2: 新增 Capacitor 主配置

**Files:**
- Create: `E:\Oyama-s-HRT-Tracker-main\capacitor.config.ts`

- [ ] **Step 1: 创建 `capacitor.config.ts`**

写入最小配置：

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.oyama.hrttracker',
  appName: 'HRT Tracker',
  webDir: 'dist',
  bundledWebRuntime: false,
};

export default config;
```

- [ ] **Step 2: 运行构建验证配置可被识别**

Run: `npx cap sync android`  
Expected: Capacitor 能读取配置；若安卓工程尚未创建，会提示添加平台

- [ ] **Step 3: 提交本任务**

```bash
git add capacitor.config.ts
git commit -m "feat: add capacitor base config"
```

### Task 3: 生成安卓工程

**Files:**
- Create: `E:\Oyama-s-HRT-Tracker-main\android\...`

- [ ] **Step 1: 添加安卓平台**

Run: `npx cap add android`  
Expected: 生成 `android/` 目录

- [ ] **Step 2: 同步前端资源到安卓工程**

Run: `npm run android:sync`  
Expected: `dist/` 构建完成，资源同步进安卓工程

- [ ] **Step 3: 打开安卓工程确认结构生成**

Run: `npm run android:open`  
Expected: Android Studio 可打开工程或系统正确响应打开请求

- [ ] **Step 4: 提交本任务**

```bash
git add capacitor.config.ts android package.json package-lock.json
git commit -m "feat: scaffold android app with capacitor"
```

---

## Chunk 2: 平台环境识别与功能开关

### Task 4: 增加统一环境识别模块

**Files:**
- Create: `E:\Oyama-s-HRT-Tracker-main\src\platform\env.ts`

- [ ] **Step 1: 创建环境识别文件**

实现以下接口：

```ts
export const isBrowser = () => typeof window !== 'undefined';
export const isTauriApp = () => isBrowser() && '__TAURI__' in window;
export const isCapacitorApp = () => isBrowser() && !!(window as any).Capacitor;
export const isAndroidApp = () => isCapacitorApp() && /Android/i.test(navigator.userAgent);
```

- [ ] **Step 2: 导出统一的平台枚举或辅助函数**

例如：

```ts
export type RuntimePlatform = 'web' | 'tauri' | 'android';
export const getRuntimePlatform = (): RuntimePlatform => { /* ... */ };
```

- [ ] **Step 3: 构建验证**

Run: `npm run build`  
Expected: TypeScript 构建通过

- [ ] **Step 4: 提交本任务**

```bash
git add src/platform/env.ts
git commit -m "feat: add runtime platform detection"
```

### Task 5: 增加安卓版能力开关

**Files:**
- Create: `E:\Oyama-s-HRT-Tracker-main\src\platform\features.ts`
- Modify: `E:\Oyama-s-HRT-Tracker-main\src\hooks\useAppNavigation.ts`

- [ ] **Step 1: 创建 `features.ts`**

定义能力开关：

```ts
import { isAndroidApp } from './env';

export const featureFlags = {
  account: !isAndroidApp(),
  cloudSync: !isAndroidApp(),
  admin: !isAndroidApp(),
};
```

- [ ] **Step 2: 修改 `useAppNavigation.ts` 使用能力开关**

要求：

- 导航项默认只包含 `home/history/lab/settings`
- 只有 `featureFlags.account` 为真时才加入 `account`
- 只有 `featureFlags.admin` 且 `user?.isAdmin` 为真时才加入 `admin`

- [ ] **Step 3: 修正 `ViewKey` 与导航顺序**

确保即使隐藏 `account/admin`，现有切页逻辑仍稳定，不出现跳转到不可见页面的情况

- [ ] **Step 4: 构建验证**

Run: `npm run build`  
Expected: 导航相关类型通过，构建成功

- [ ] **Step 5: 提交本任务**

```bash
git add src/platform/features.ts src/hooks/useAppNavigation.ts
git commit -m "feat: gate account and admin features by platform"
```

---

## Chunk 3: 导出能力适配与页面接线

### Task 6: 抽离统一导出适配服务

**Files:**
- Create: `E:\Oyama-s-HRT-Tracker-main\src\services\deviceExport.ts`
- Modify: `E:\Oyama-s-HRT-Tracker-main\src\services\export.ts`

- [ ] **Step 1: 创建 `deviceExport.ts`**

最小接口建议：

```ts
export interface ExportFilePayload {
  filename: string;
  mimeType: string;
  content: string;
}

export const exportJsonFile = async (payload: ExportFilePayload): Promise<void> => { /* ... */ };
export const copyTextToClipboard = async (text: string): Promise<void> => { /* ... */ };
```

- [ ] **Step 2: 先实现浏览器兼容版本**

要求：

- 浏览器环境下保留 Blob 下载
- 如果下载不可用，则退回到剪贴板复制
- 保持报错可被上层捕获

- [ ] **Step 3: 为安卓环境预留分支**

要求：

- 先通过 `isAndroidApp()` 识别
- 首版可先复用浏览器下载或剪贴板回退
- 接口命名和结构要能容纳后续 Capacitor Share/FileSystem 扩展

- [ ] **Step 4: 让 `export.ts` 只保留数据格式生成职责**

如果 `export.ts` 中存在直接触发下载的逻辑，应逐步改为“返回内容，由设备导出服务负责交付”

- [ ] **Step 5: 构建验证**

Run: `npm run build`  
Expected: 导出相关代码编译通过

- [ ] **Step 6: 提交本任务**

```bash
git add src/services/deviceExport.ts src/services/export.ts
git commit -m "feat: add platform-aware export service"
```

### Task 7: 在 `App.tsx` 中接入导出适配层

**Files:**
- Modify: `E:\Oyama-s-HRT-Tracker-main\src\App.tsx`

- [ ] **Step 1: 在 `App.tsx` 中移除内联下载实现**

目标：

- 不再由组件内部直接创建 `<a>`、`Blob`、`ObjectURL`
- 统一调用 `deviceExport.ts`

- [ ] **Step 2: 改造 JSON 导出确认逻辑**

要求：

- 继续支持明文导出
- 继续支持加密导出
- 保持现有密码弹窗逻辑
- 将最终导出内容交给统一导出服务

- [ ] **Step 3: 改造快速导出逻辑**

要求：

- 快速导出优先复制到剪贴板
- 文案与异常处理保持清晰

- [ ] **Step 4: 为安卓版屏蔽云端入口触发**

要求：

- 安卓环境下不展示或不触发 `onCloudSave/onCloudLoad`
- 不让用户进入 `Account` 页面后再碰到不可用行为

- [ ] **Step 5: 构建验证**

Run: `npm run build`  
Expected: `App.tsx` 编译通过，页面逻辑无明显类型错误

- [ ] **Step 6: 提交本任务**

```bash
git add src/App.tsx
git commit -m "feat: wire android-safe export flow into app shell"
```

---

## Chunk 4: 安卓首版 UI 稳定性改造

### Task 8: 增加移动端补丁样式

**Files:**
- Create: `E:\Oyama-s-HRT-Tracker-main\src\styles\mobile.css`
- Modify: `E:\Oyama-s-HRT-Tracker-main\src\index.css`

- [ ] **Step 1: 创建 `mobile.css`**

至少包含以下方向的样式：

- 安卓安全区 `env(safe-area-inset-*)`
- 底部导航与弹窗底部留白
- 小屏弹窗最大高度与内部滚动
- 键盘顶起时表单区域的可滚动策略

- [ ] **Step 2: 在 `index.css` 中引入补丁样式**

确保新样式不会破坏现有主题变量和全局样式

- [ ] **Step 3: 构建验证**

Run: `npm run build`  
Expected: 样式打包通过

- [ ] **Step 4: 提交本任务**

```bash
git add src/styles/mobile.css src/index.css
git commit -m "feat: add android mobile layout patches"
```

### Task 9: 调整关键交互组件的移动端表现

**Files:**
- Modify: `E:\Oyama-s-HRT-Tracker-main\src\components\DoseFormModal.tsx`
- Modify: `E:\Oyama-s-HRT-Tracker-main\src\components\LabResultModal.tsx`
- Modify: `E:\Oyama-s-HRT-Tracker-main\src\components\ImportModal.tsx`
- Modify: `E:\Oyama-s-HRT-Tracker-main\src\components\ExportModal.tsx`

- [ ] **Step 1: 检查每个弹窗容器是否支持小屏滚动**

要求：

- 内容区可滚动
- 标题与操作区尽量固定
- 不超出可视区域

- [ ] **Step 2: 检查输入密集表单的按钮可达性**

要求：

- 键盘弹起后主操作按钮仍能访问
- 不出现底部按钮被遮挡

- [ ] **Step 3: 校准导入导出弹窗文案**

要求：

- 安卓首版文案以“本地导入/导出”为核心
- 不暗示不可用的云能力

- [ ] **Step 4: 构建验证**

Run: `npm run build`  
Expected: 关键弹窗组件均通过编译

- [ ] **Step 5: 提交本任务**

```bash
git add src/components/DoseFormModal.tsx src/components/LabResultModal.tsx src/components/ImportModal.tsx src/components/ExportModal.tsx
git commit -m "feat: improve modal usability for android screens"
```

---

## Chunk 5: 安卓构建验证与交付收尾

### Task 10: 同步安卓工程并验证构建链路

**Files:**
- Modify: `E:\Oyama-s-HRT-Tracker-main\android\...`（如同步产生变更）

- [ ] **Step 1: 运行前端构建**

Run: `npm run build`  
Expected: Vite 构建成功，生成 `dist/`

- [ ] **Step 2: 运行安卓同步**

Run: `npm run android:sync`  
Expected: 前端资源被同步进安卓工程

- [ ] **Step 3: 打开 Android Studio 工程**

Run: `npm run android:open`  
Expected: 安卓工程可打开

- [ ] **Step 4: 构建 Debug APK**

Run: 在 Android Studio 中执行 `Build > Build Bundle(s) / APK(s) > Build APK(s)`  
Expected: 生成可安装的 Debug APK

- [ ] **Step 5: 记录 APK 路径与已验证能力**

至少记录：

- APK 生成路径
- 已验证页面
- 已验证交互
- 未验证项或残余风险

- [ ] **Step 6: 提交本任务**

```bash
git add android
git commit -m "build: sync android project and verify apk pipeline"
```

### Task 11: 最终回归检查

**Files:**
- Modify: `E:\Oyama-s-HRT-Tracker-main\README.md`（如需要补充安卓运行说明）

- [ ] **Step 1: 检查 Web 端构建未被破坏**

Run: `npm run build`  
Expected: Web 构建继续成功

- [ ] **Step 2: 检查安卓首版范围是否满足规格**

核对项：

- `Home / History / Lab / Settings` 可访问
- `Account / Admin` 不在安卓首版误暴露
- 导入导出存在至少一条稳定路径
- 本地数据逻辑仍然可用

- [ ] **Step 3: 如有必要，在 README 中补充安卓开发说明**

至少补充：

- 如何同步安卓工程
- 如何打开 Android Studio
- 如何构建 APK

- [ ] **Step 4: 完成最终提交**

```bash
git add README.md src package.json package-lock.json capacitor.config.ts android
git commit -m "feat: deliver first android app build target"
```

---

## 备注

- 当前仓库环境未确认存在完整的 Git 元数据；如果 `git commit` 无法执行，实施时应保留对应步骤但在交付说明中明确记录。
- 当前仓库未看到现成测试框架；本计划中的“测试”以 `npm run build`、安卓同步、工程打开与 APK 构建验证为主。若后续补充测试框架，可将关键平台逻辑补成自动化测试。
- 如果实施过程中发现某些浏览器 API 在安卓 WebView 下行为异常，应优先在 `src/platform/` 或 `src/services/deviceExport.ts` 中修复，不要把平台分支散落到多个页面组件内。
