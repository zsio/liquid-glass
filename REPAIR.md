# 默认入口与布局修复 / 3.4.0

## 根因

上一源码包的入口链是 `index.html → src/main.tsx → src/ReactExample.tsx`。
ReactExample 的注释明确为独立用法示例；它没有完整工作台的右侧 inspector 或卡片拖动逻辑。
同时，标准 `npm run build` 与 `node scripts/build-static.mjs` 都输出 dist，后运行的流程覆盖先前产物。
因此截图与此前完整 HTML 工作台不同。这是交付入口设计问题，不是浏览器布局异常。

## 本次修复

默认链改成 `index.html → src/main.tsx → src/GlassStudio.tsx`。简化示例和其专用 CSS 已移除。
参数与控件由 React state 管理；拖动由 useDraggableGlass 处理；媒体由 useStudioMedia 处理。
复用原完整工作台的 demo.css，保留轻量控件、浅色壁纸和视频、相对路径资源。
React 标准构建输出 dist；静态备用构建输出 dist-static，不再覆盖。
构建完成增加 check-build 脚本，检查完整工作台标识、inspector、拖动处理及媒体完整性。

## 实际验证

React 源码运行回归：75 项通过，Chromium 144.0.7559.96，React 19.1.1 生产运行时。
与完整静态页面对照 320 / 390 / 768 / 1024 / 1440 px 六个主体区域的位置和尺寸，差异均小于 1.1 px。
拖动、键盘移动、焦点圈移除、四参数实际滤镜更新、五类背景、视频播放暂停、文件导入、六组控件、子路径均已覆盖。
完整 npm / Vite 构建未实跑，原因是 npm registry DNS 不可达；不把运行时测试或语法转换等同于这一步。详见 TESTING.md。
