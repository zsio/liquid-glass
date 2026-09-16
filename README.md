# Liquid Glass · 完整工作台 3.4.0

本版修复默认入口不一致：`npm run dev`、`npm run build` 打开/构建的都是 **完整 React 工作台**。
保留左侧预览、右侧材质参数、下方六组紧凑控件，支持卡片拖动、键盘移动、背景切换及本地导入。
不再将简化 ReactExample 作为默认入口。浅色图片和视频均在 `public/assets/`，以相对路径加载。

## React 项目（默认）

```bash
npm install
npm run dev
```

生产构建与本地预览：

```bash
npm run build
npm run preview
```

生产输出：`dist/`。入口链为 `index.html → src/main.tsx → src/GlassStudio.tsx`。
`build` 先做 TypeScript 类型检查，再执行 Vite，最后验证产物中存在完整工作台和全部媒体。
目录名称固定，不需要手动替换 App 或切换路由。

## 已打包静态站点

另附的部署 ZIP 已经是完整工作台，解压后根目录含 `index.html` 和 `assets/`。
可直接上传，不需要 npm。源码包内的同一静态产物放在 `dist-static/`。

```bash
npm run site:build
```

这个可选命令只重建无框架依赖的静态工作台，输出 **dist-static/**，绝不会覆盖 React 的 **dist/**。
两版使用同一份 `src/demo.css`、浅色媒体和材质引擎，且本轮做了布局/交互对照检查。

## 源码

```text
src/
  main.tsx                        # 默认入口，仅引用完整工作台
  GlassStudio.tsx                 # 完整 React 页面、参数、控件
  hooks/useDraggableGlass.ts      # 指针拖动、键盘移动、尺寸约束
  hooks/useStudioMedia.ts         # 壁纸、视频、本地文件与生命周期
  components/LiquidGlass.tsx      # 可复用 React 材质与控件
  glass.ts / glass.css            # 原材质引擎及组件样式
  demo.css                       # React / 静态页共用的完整页面样式
  demo-body.html / demo.js        # 可选静态导出的模板与交互
public/assets/
  media.json                     # 两版共享的素材清单
  wallpapers/ posters/ thumbnails/ videos/
registry/liquid-glass.json        # 组件、引擎与样式的 shadcn 源码描述
scripts/check-build.mjs           # 防止再次构建出简化页面
```

## 操作

卡片可使用鼠标或触摸拖动；方向键移动 10 px，Shift + 方向键 30 px，Home 复位。
拖动卡片不显示蓝色焦点外圈，其他控件保留键盘焦点。
右侧调整折射强度、曲面边缘、模糊、色散；可切换形状与 CSS 降级模式。
重置恢复默认参数、卡片位置、背景和示例控件。

## 验证边界

见 `TESTING.md`。本轮 React 源码以 TypeScript 转换后，在本地可用的 React 19.1.1 生产运行时中进行了 Chromium 回归。
**这不等同于 npm install + tsc + vite build 验证**：本环境 npm DNS 失败，完整 Vite 构建仍未实跑。
可直接使用附带并已测试的静态部署产物。Safari、Firefox 与 Cloudflare 线上部署均未在本轮实测。
