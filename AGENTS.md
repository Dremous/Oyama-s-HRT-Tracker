# AGENTS.md

## 项目架构

HRT Tracker 是一个多目标应用，同时构建为：
- **Web** (Vite + PWA，端口 3000)
- **Tauri 桌面端** (Rust + Tauri 1.x，MSI/DMG)
- **Android** (Capacitor 7.x)
- **Cloudflare Workers** (worker.ts，后端 API)

核心药代动力学逻辑位于仓库根目录的 `logic.ts`，非 `src/` 内。

## 开发命令

```bash
npm run dev          # Web 开发服务器 (localhost:3000)
npm run build        # 构建 Web 静态资源到 dist/

npm run tauri:dev    # Tauri 桌面开发
npm run tauri:build  # Tauri 桌面构建 (MSI/DMG)

npm run android:sync # 构建 Web 后同步到 Android
npm run android:open # 用 Android Studio 打开 Android 项目
npm run android:run  # 在设备/模拟器上运行

npm run wrangler:dev # 本地 Cloudflare Workers 开发
npm run wrangler:migrate:local   # 本地 D1 数据库迁移
npm run wrangler:migrate:remote   # 远程 D1 数据库迁移
```

## 平台特性差异

`src/platform/features.ts` 中定义了特性开关：
- `account`、`cloudSync`、`admin` 在 **Android 上被禁用**
- Android 构建使用 Capacitor，检测逻辑在 `src/platform/env.ts`

## 版本管理

版本号在三个地方必须保持同步：
1. `package.json` 的 `version`
2. `src-tauri/tauri.conf.json` 的 `package.version`
3. `src-tauri/Cargo.toml` 的 `version`

使用 `python scripts/bump_and_build.py X.Y.Z` 可自动更新并构建 Tauri。

## Cloudflare Workers

- API 前缀 `/api` 代理到 `127.0.0.1:8787`（wrangler dev）
- 需要 secrets：`JWT_SECRET`（≥32 字符）、`ADMIN_USERNAME`、`ADMIN_PASSWORD`
- 使用 D1 数据库 `hrt-tracker-prod` 和 R2 bucket `mahiro-contents`
- 数据库迁移文件：`schema.sql`

## CI

- GitHub Actions: `tauri-build.yml` 在 tag `v*.*.*` 或手动触发时构建 Windows MSI 和 macOS DMG
- Node 版本：20，Rust stable

## 样式

- Tailwind CSS v4 使用 `@tailwindcss/postcss` 插件（v4 写法，`@import "tailwindcss"`）
- PostCSS 配置在 `postcss.config.js`

## 目录结构

```
logic.ts          # 核心 PK 算法（根目录）
worker.ts         # Cloudflare Workers 后端（根目录）
src/              # React 前端
  contexts/       # AuthContext, LanguageContext, DialogContext
  pages/          # Home, History, Lab, Settings, Account, Admin
  components/     # 全部 UI 组件
  services/      # auth, cloud, admin, export
  hooks/          # useAppData, useAppNavigation, useEscape
  platform/       # env.ts (平台检测), features.ts (特性开关)
src-tauri/        # Tauri Rust 后端
android/          # Capacitor Android 项目
dist/             # Vite 构建输出（被 Tauri 和 Capacitor 使用）
```

## i18n

语言定义在 `src/i18n/translations.ts`，支持：`zh`, `zh-TW`, `yue`, `en`, `ru`, `uk`, `ja`, `ko`, `ar`, `he`
