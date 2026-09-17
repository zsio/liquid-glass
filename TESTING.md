# 验证记录

## 2026-09-17 · shadcn 独立安装

使用 `shadcn 4.21.0` 的真实 `add` 命令，从 HTTP registry 安装到两个独立临时项目；没有复制工作台源码或手动修复安装后的文件。测试项目不共享本仓库的 node_modules。

| 独立项目 | 环境 | 结果 |
| --- | --- | --- |
| Vite | Vite 6.3.6、React 18.3.1、TypeScript 5.9.2，`~/*` 路径别名 | CLI 创建全部 3 个文件；类型检查和生产构建通过 |
| Next.js App Router | Next.js 16.3.5、React 19.3.0、TypeScript 5.9.2，`@/*` 路径别名 | CLI 创建全部 3 个文件；Webpack 生产构建、类型检查、服务端页面预渲染通过 |

Vite 示例直接导入 `LiquidGlass` / `GlassButton`，没有引入 demo.css、工作台素材、Provider 或 Tailwind 插件。Next.js 示例包含服务端页面导入玻璃容器，以及客户端按钮、受控开关和滑块。

使用的命令：

```bash
pnpm dlx shadcn@4.21.0 add http://127.0.0.1:4187/r/liquid-glass.json --yes
# Vite 独立项目
pnpm build  # tsc --noEmit && vite build
# Next.js 独立项目
NEXT_TELEMETRY_DISABLED=1 pnpm build  # next build --webpack
```

本轮验证安装、别名解析、CSS 自动打包和 SSR 构建；没有新增跨浏览器视觉、触摸设备或性能验收。Vite 提示忽略组件文件的 `use client` 指令，但构建正常；Next.js 按客户端边界处理该指令。

## 2026-09-17 · 性能改动交付

React 工作台与静态工作台构建通过；模拟检查覆盖 Worker 任务合并、纹理缓冲复用、像素一致性，以及拖动和高光的单帧调度。用户反馈视频背景下的拖动已流畅。没有测量或承诺固定 FPS。

## 早期工作台回归记录

以下为历史记录，涉及“构建未运行”的描述仅代表当时环境。

# 3.4.0 验证记录

本轮检查用于定位并修复默认入口、缺失参数面板和卡片不可拖动的问题。
完整结果在 `tests/workbench-results.json` 和 `tests/static-results.json`。

- 原包确认：`src/main.tsx` 默认引用简化 `ReactExample`；标准 build 和静态构建都覆盖 dist。
- 修复：默认入口改成完整 React `GlassStudio`，复用现有演示 CSS；静态输出改成 dist-static。
- TypeScript：实际执行语法转换，不把它描述为完整类型检查。
- React：使用当前环境已有的 React 19.1.1 生产运行时加载转换后的真实组件源码；不是截图替代，不是 iframe 静态页。
- npm install：因 registry.npmjs.org DNS / EAI_AGAIN 失败；未完成常规 tsc + Vite 构建。
- 浏览器：本地 Chromium；通过请求路由从磁盘读取相对路径资源，未上线到 Cloudflare。
- 本轮没有 Safari、Firefox、实体触摸设备的实测，也没有高负载 GPU 基准。

测试用 React 运行时从环境已安装的 Playwright 所附 React 19.1.1 模块中读取，仅用于测试，不随源码或部署包分发。
该环境替代的是依赖获取方式，不改变被测的 GlassStudio、拖动 Hook、媒体 Hook 或材质组件源码。

本次 React 运行回归记录：**75 项通过**。

常规环境重跑：

```bash
npm install
npm run build
npm run site:build
npm run test:react
npm run site:test
```
