# React 使用示例

运行 `pnpm dev`，访问 `/examples/`。

- `basic.tsx`：玻璃容器、布局与内容内边距。
- `buttons.tsx`：按钮回调、图标按钮与切换状态。
- `settings.tsx`：受控开关和滑块。
- `selection.tsx`：分段选择、标签多选与工具栏键盘操作。

这四个文件使用安装后的标准导入路径 `@/components/ui/liquid-glass`。仓库通过 Vite / TypeScript 别名将其指向本地组件，文件本身可直接复制到已安装组件的 React 项目。使用其他 shadcn 路径别名时，调整 import 即可。

`main.tsx` 直接渲染这些组件，并以 `?raw` 读取同一文件作为页面代码示例。`page.css` 仅负责示例文档和预览背景，不是组件运行依赖。

`pnpm build` 和 `pnpm site:build` 均生成 `examples/index.html`，支持直接访问与刷新。Cloudflare 发布产物中包含此路由。
