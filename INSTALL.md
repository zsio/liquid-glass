# Liquid Glass · React 组件

将真实网页背景呈现为玻璃材质。安装后直接使用 React 组件，样式、纹理生成、尺寸监听和资源释放由组件处理。无需 Provider、API Key、背景截图或额外素材。

[查看实时示例与完整源码](./examples/)

## 安装

在已经初始化 shadcn 的 React + TypeScript 项目根目录运行：

```bash
npx shadcn@latest add https://glass.zs.uy/r/liquid-glass.json
```

还没有配置 shadcn 的项目，先按 [shadcn 安装说明](https://ui.shadcn.com/docs/installation)完成对应框架的初始化。

CLI 将组件、材质引擎和 CSS 写入 `components.json` 中 `aliases.ui` 对应目录下的 `liquid-glass/`。下面假设该别名是 `@/components/ui`；若你的项目使用其他别名，调整 import 即可。使用最新版 CLI，以支持 `@ui/` 安装路径占位符。

这是源码分发：文件安装到你的项目后，可以自行修改；运行时不访问本站。组件使用普通 CSS，不要求你为玻璃效果配置 Tailwind 插件。

## 最小示例

下面的渐变是示例页面背景，不是组件运行依赖。也可以放在你已有的图片、视频或文字前面。

```tsx
"use client"

import { LiquidGlass, GlassButton } from "@/components/ui/liquid-glass"

export default function GlassExample() {
  return (
    <section
      style={{
        padding: 48,
        color: "#253246",
        background: "linear-gradient(125deg, #c2e9fb, #f6d6ef 55%, #ffe5bb)",
      }}
    >
      <LiquidGlass
        style={{ maxWidth: 360 }}
        contentStyle={{ padding: 24 }}
      >
        <h2 style={{ marginTop: 0 }}>清晰的内容，流动的背景</h2>
        <p>前景保持正常的 HTML 内容，可以选择文字、点击链接。</p>
      </LiquidGlass>
      <div style={{ marginTop: 24 }}>
        <GlassButton onClick={() => alert("已保存")}>保存</GlassButton>
      </div>
    </section>
  )
}
```

组件自动导入 CSS。Next.js App Router 中，有点击回调或状态的使用文件应声明 `"use client"`；展示型组件可以从服务端页面导入。初始 HTML 有 CSS 玻璃样式，挂载后按浏览器能力启用折射。

## 开关与滑块

```tsx
"use client"

import { useState } from "react"
import { GlassSwitch, GlassSlider } from "@/components/ui/liquid-glass"

export function Settings() {
  const [enabled, setEnabled] = useState(true)
  const [volume, setVolume] = useState(50)

  return (
    <div>
      <GlassSwitch
        aria-label="接收通知"
        checked={enabled}
        onCheckedChange={setEnabled}
      />
      <GlassSlider
        aria-label="音量"
        value={volume}
        onValueChange={setVolume}
      />
    </div>
  )
}
```

## 组件接口

| 组件 | 主要参数 |
| --- | --- |
| `LiquidGlass` | `children`、`className`、`style`；内容内边距用 `contentStyle` / `contentClassName` |
| `GlassButton` | 原生 button 参数；`size="sm\|md\|lg\|icon"`、`variant="default\|accent"` |
| `GlassIconButton` | 同按钮；必须提供 `aria-label` |
| `GlassSwitch` | `checked`、`onCheckedChange`，以及可访问名称 |
| `GlassSlider` | `value`、`onValueChange`、`min`、`max`、`step`，以及可访问名称 |
| `GlassSegmented` | `options=[{value,label}]`、`value`、`onValueChange`、`aria-label` |
| `GlassChip` | `selected`、`onSelectedChange`、`children` |
| `GlassToolbar` | `aria-label`、原生 button 子元素；支持方向键导航 |
| `GlassToolbarSeparator` | 工具栏内分隔线 |

无需配置材质参数即可使用。需要细调时，`LiquidGlass` 可直接接收 `radius`、`refraction`、`bevel`、`blur`、`dispersion`、`tint`、`mode`；其他控件通过 `material={{ ... }}` 传入。默认 `mode="auto"`，无需手动探测浏览器。

容器的 `className` / `style` 管外层布局，`contentClassName` / `contentStyle` 管内容。`GlassButton` 的 `className` / `style` 管实际按钮，`wrapperClassName` 管外层材质。示例页的拖动、视频播放和文件上传不随组件安装。

## 背景、主题与兼容性

- 玻璃需要有可见背景。纯色背景上依然有透明、高光和阴影，但折射没有明显纹理可弯折。
- 当前自动策略在符合条件的桌面 Chromium 开启增强折射；Safari、Firefox、iOS 默认使用 CSS 毛玻璃，不保证跨浏览器像素一致。
- 字体和文字颜色继承你的页面。放在深色背景前时，请设置合适的文字颜色；组件不会自动分析背景明暗，也不会自动套用 shadcn 的完整颜色主题。
- 减少透明、高对比和强制颜色设置下使用实色；减少动态效果时停止指针高光动画。
- 父元素的 `opacity`、`filter`、`mask` 或其他背景滤镜可能限制采样。出现“背景没透过来”时，先检查这些祖先样式。避免默认把完整玻璃控件层层嵌套；嵌套效果取决于背景合成关系。
- 项目设置严格 CSP 时，纹理图片需要允许 `data:` 图片，后台生成需要允许 `blob:` Worker；Worker 不可用时会回退到主线程生成。按项目自身安全策略配置，组件不会改动 CSP。
- 大面积、多层玻璃叠加在视频前的开销取决于设备与浏览器。不要为追求分层随意给玻璃祖先添加 `opacity` 或 `filter`。

## 更新

先提交或备份你对组件的本地修改，再重新运行安装命令，按 CLI 提示审阅覆盖。安装后的源码不会自动更新。

## 验证范围

独立项目安装和构建记录见 [TESTING.md](./TESTING.md)。构建通过不代表所有浏览器均已完成视觉验收。

## 许可证

许可证尚待项目维护者确认，本页暂不声明 MIT 或 Apache-2.0 授权。
