# 部署完整工作台

## 直接部署

分发的 `liquid-glass-workbench-deploy.zip` 根目录是 `index.html` 与 `assets/`，不是源码项目。
上传整个 ZIP 或解压后的站点目录；不要单独上传 HTML。
所有壁纸、缩略图、封面和 MP4 都是独立文件，使用 `./assets/...` 相对地址。
源码里的相同静态站点位于 `dist-static/`。

## 部署到 Cloudflare Workers（免费）

纯静态资源托管，无 Worker 脚本调用，免费档资源请求不限量。

```bash
pnpm dlx wrangler login   # 首次：浏览器 OAuth 授权（免费账号即可）
pnpm run cf:deploy        # 构建 dist-static 并上传
```

- 线上地址：`https://glass.zs.uy`（自定义域，大陆网络通常可直连）；备用 `https://liquid-glass-workbench.zsio.workers.dev`
- 自定义域配置在 `wrangler.jsonc` 的 `routes`（zone `zs.uy` 需在本账号且 active）；DNS 与证书由 Cloudflare 自动签发。

## 使用 React 源码构建

- 安装命令：`npm install`
- 构建命令：`npm run build`
- 输出目录：`dist`
- 默认页面：完整工作台 `src/GlassStudio.tsx`

`npm run dev` 使用同一个完整页面。旧的 `ReactExample.tsx` 已从默认工程移除。

## 可选的静态源码构建

- 构建命令：`pnpm site:build`
- 输出目录：`dist-static`

该命令依次编译材质引擎、生成公开 registry、构建站点并检查产物；需要先安装项目依赖。
**两个输出目录已经分开，不会互相覆盖。**

## 本地预览静态部署包

```bash
python3 -m http.server 8080
```

已通过 wrangler 登录并部署到 Cloudflare Workers（见上）；CLI 未加入仓库依赖。`glass.zs.uy` 已实测直连可达（首页 200、资源 200、未知路径 404、`_headers` 安全头生效）；`workers.dev` 备用域名在部分网络不可达。
部署到子目录时，保留目录结构，并访问带结尾 `/` 的目录地址。

## 替换媒体

源码中修改 `public/assets/media.json` 和对应文件再重新构建。
React 版运行时读取 `./assets/media.json`；初始加载采用打包时的同一清单。
静态版使用构建生成的 `assets/media.js`；手动修改静态发布文件时同步更新它。
`tone: "dark"` 表示深色文字，适合浅色背景；`"light"` 表示白字。
界面内的本地导入只是预览，不会修改服务器文件。

## 组件安装入口

发布产物同时包含 `/r/liquid-glass.json`、`/r/registry.json` 和 `/INSTALL.md`。使用 `pnpm cf:deploy` 会同步发布工作台与 registry；请勿仅上传 `assets/`。

验证范围见 `TESTING.md`。构建及 HTTP 校验不等于跨浏览器视觉验收。
