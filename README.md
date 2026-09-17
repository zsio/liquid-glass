# Liquid Glass

真实 DOM 背景玻璃材质与 React 控件。提供透明容器、按钮、开关、滑块、分段选择、标签和工具栏；样式、纹理和生命周期由组件处理。

在线工作台：[glass.zs.uy](https://glass.zs.uy)。[交互示例与代码](https://glass.zs.uy/examples/)，组件使用方法见 [INSTALL.md](INSTALL.md)。

## 用 shadcn 安装

在已初始化 shadcn 的 React + TypeScript 项目中：

```bash
npx shadcn@latest add https://glass.zs.uy/r/liquid-glass.json
```

```tsx
import { LiquidGlass, GlassButton } from "@/components/ui/liquid-glass"

export function Example() {
  return (
    <section style={{ padding: 40, background: "linear-gradient(120deg,#bce5fa,#f9d8e8)" }}>
      <LiquidGlass contentStyle={{ padding: 24 }}>自己的内容</LiquidGlass>
      <GlassButton>继续</GlassButton>
    </section>
  )
}
```

安装目录跟随 `components.json` 的 `aliases.ui`；按项目别名调整 import。CSS 自动导入，无需 Provider、背景截图、API Key 或演示素材。安装的是可修改的源码，不是运行时远程依赖。

当前自动策略在符合条件的桌面 Chromium 开启增强折射；Safari、Firefox、iOS 默认使用 CSS 毛玻璃。玻璃背后需要有可见内容；纯色背景、祖先透明度与滤镜会影响观感。详细接口与边界见 [安装说明](INSTALL.md)。

## 使用示例

`examples/` 包含可直接复制的 React 示例：玻璃容器、按钮、受控设置与选择工具。运行 `pnpm dev` 后访问 `/examples/`，可切换背景、操作组件并复制其完整源码。页面展示的源码来自正在渲染的同一文件。

## 本地开发工作台

```bash
pnpm install
pnpm dev
```

`index.html → src/main.tsx → src/GlassStudio.tsx` 为完整 React 工作台入口。

```bash
pnpm build       # React 工作台及公开 registry，输出 dist/
pnpm site:build  # 编译引擎、生成 registry、构建静态工作台，输出 dist-static/
pnpm cf:deploy   # 构建静态站点并部署到现有 Cloudflare 配置
```

两个输出目录互不覆盖。`site:build` 自动从 `src/glass.ts` 编译 `lib/glass.js`，防止静态站点遗漏引擎更新。

## 组件分发

`pnpm registry` 从当前源码生成：

- `registry/liquid-glass.json`：包含组件、引擎和样式源码的 registry item。
- `public/r/liquid-glass.json`：公开 CLI 安装入口。
- `public/r/registry.json`：registry 索引。
- `public/INSTALL.md`：安装说明。

`public/r/` 与 `public/INSTALL.md` 是忽略的生成文件，每次正式构建都会重建。两个站点产物均包含安装文件。安装入口使用 `no-cache`，避免同名 URL 长期返回旧源码。

## 源码结构

```text
src/components/LiquidGlass.tsx  React 公共组件
src/glass.ts / glass.css        材质引擎与组件样式
src/GlassStudio.tsx             React 演示工作台
src/hooks/                     演示页拖动、媒体管理
src/demo-body.html / demo.js    静态工作台模板与交互
src/demo.css                   两版工作台共用的页面样式
public/assets/                 演示页图片、视频与素材清单
scripts/registry.mjs            源码 registry 生成
scripts/build-static.mjs        静态站点打包
scripts/check-build.mjs         工作台与 registry 产物检查
```

验证记录见 [TESTING.md](TESTING.md)，部署方式见 [DEPLOY.md](DEPLOY.md)。
