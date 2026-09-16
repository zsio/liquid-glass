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
