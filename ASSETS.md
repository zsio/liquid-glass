# 浅色演示媒体说明

本版选择「随站点打包的静态资源」方案，而不是第三方免费图片 / 视频的热链接。
壁纸为用户提供的三张摄影图（见下表），统一转换为 1920 × 1200 WebP；两个动态视频仍由 `scripts/create-light-media.py` 程序化生成。
它们是抽象动画，不是实拍视频，没有使用 Apple 官方壁纸、用户参考图像素或第三方图库成片。
因此无需第三方素材 API Key，也没有需要额外下载的付费背景。

| 资源 | 文件 | 规格 |
| --- | --- | --- |
| 云曦 | `assets/wallpapers/yunxi.webp` | 1920 × 1200，WebP；高调雪山云海（中心裁切自 3688 × 2075 JPEG） |
| 雾枫 | `assets/wallpapers/wufeng.webp` | 1920 × 1200，WebP；雾林秋色（中心裁切自 2047 × 1291 JPEG） |
| 花语 | `assets/wallpapers/huayu.webp` | 1920 × 1200，WebP；花丛人像（中心裁切自 7281 × 4096 JPEG） |
| 柔光流动 | `assets/videos/pearl-motion.mp4` | 960 × 600，24 fps，8 秒，H.264，yuv420p，无音轨 |
| 云纱慢舞 | `assets/videos/cloud-motion.mp4` | 960 × 600，24 fps，8 秒，H.264，yuv420p，无音轨 |
| 视频封面 | `assets/posters/*.webp` | 对应视频起始帧，960 × 600 |
| 缩略图 | `assets/thumbnails/*.webp` | 240 × 150 |

视频不是运行时 CSS 动画：背景是原生 `<video>` 播放的 MP4 文件。
首尾周期函数使动画可以循环播放；Web 视频解码或系统调度仍可能在回环时有极短停顿，不承诺所有设备零间隙。
视频使用 faststart 索引，优先加载封面，进入视频模式后再设置视频地址。离开视频 / 页面隐藏时暂停。

脚本只在重新生成媒体时需要 Python、NumPy、Pillow、FFmpeg（libx264）。正常浏览和部署不需要这些依赖。
你自行添加的第三方照片 / 视频仍需遵守对应来源的许可；免费获取不自动等于没有使用限制。
