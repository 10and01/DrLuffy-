# Drluffy

`Drluffy` 是一个可部署到 GitHub Pages 的未来科技风个人网站，基于原生 `HTML/CSS/JavaScript`。

![Icon](icon.svg)
## 功能

- 科技感背景 + 鼠标跟随粒子特效
- 白天（太阳升起）/ 黑夜（月亮发光）滑动切换主题
- Explore 入口支持淡出+景深动画，默认每个会话只出现一次
- 壁纸、相册、问候语、猫咪 SVG 均可作为项目资源直接部署到网站
- `Home / About / Articles / Article` 多页面结构
- Markdown 驱动文章系统（脚本生成 JSON）
- 初始访问时仅显示背景，点击 `Explore` 进入页面内容
- About 页面支持头像图片和社交图标行（X / Telegram / Email / GitHub）
- 右侧猫咪滑轮绳子滚动联动，滚到底触发跳跃和吃猫粮文案
- 30 秒无操作进入相册轮播，支持点击放大、按比例完整展示、自动切换与滑动浏览
- 支持中英切换（页面右上角语言按钮）

## 一键命令（Luffy CLI）

本项目内置 `Luffy` 命令，支持一键安装、运行、新建文章。

### 方式 A：项目内直接运行

```bash
node scripts/luffy.js install
node scripts/luffy.js run
```

新建文章：

```bash
node scripts/luffy.js create-article --title "我的新文章" --lang zh
```

### 方式 B：安装为全局命令后运行

在项目根目录执行：

```bash
npm install -g .
```

然后就可以直接用：

```bash
Luffy install
Luffy run --port=4173
Luffy create-article --title "My New Post" --lang en
Luffy create-page --name portfolio --title "Portfolio"
Luffy delete-page --name portfolio
```

### 命令说明

- `Luffy install`
   - 执行依赖安装并自动构建文章数据
- `Luffy run [--port=4173]`
   - 自动构建文章数据并启动本地静态服务
- `Luffy create-article --title "..." [--lang zh|en] [--slug custom-slug]`
   - 一键创建 Markdown 文章并自动更新 `data/articles.json`
- `Luffy create-page --name portfolio [--title "Portfolio"]`
   - 快速创建新的独立页面（根目录 `.html` 文件，带完整站点结构）
- `Luffy delete-page --name portfolio [--force]`
   - 删除已有页面文件；删除核心页面 `index/about/articles/article` 需要显式传 `--force`

## 常用 npm 脚本

```bash
npm run build:content
npm run run
npm run create-article -- --title "Hello"
npm run create-page -- --name portfolio --title "Portfolio"
npm run delete-page -- --name portfolio
```

## 文章写作规范

文章放在 `content/posts/*.md`，格式示例：

```md
---
title: "Article title"
date: 2026-03-14
tags: ["TagA", "TagB"]
excerpt: "Short summary"
cover: "/assets/images/covers/article-cover.jpg"
slug: "article-slug"
---

## Section

Content...
```

## 中英切换说明

- 站点右上角语言按钮可在 `EN / 中文` 间切换
- 语言状态保存在本地存储键：`drluffy.lang`

## 部署型资源配置

当前版本不再在前端提供图片导入入口。壁纸、相册、问候语、猫咪 SVG 都通过仓库文件直接部署。

核心配置文件：`data/site-config.json`

默认结构：

```json
{
   "theme": "night",
   "enableExploreGate": true,
   "entry": {
      "titleTypeSpeedMs": 38,
      "subtitleTypeSpeedMs": 18,
      "subtitleDelayMs": 180,
      "blinkMinOpacity": 0.45,
      "blinkGlowAlpha": 0.55,
      "blinkGlowSizePx": 10,
      "leaveDurationMs": 430
   },
   "enableIdleSlideshow": true,
   "idleTimeoutMs": 30000,
   "slideshowIntervalMs": 4500,
   "particles": {
      "dayDesktop": 260,
      "nightDesktop": 180,
      "dayMobile": 110,
      "nightMobile": 70
   },
   "wallpaper": {
      "day": "",
      "night": "",
      "default": ""
   },
   "gallery": [],
   "greetings": ["Hi", "Hello"],
   "cat": {
      "svg": ""
   },
   "visits": {
      "enabled": true,
      "provider": "countapi",
      "namespace": "drluffy",
      "key": "site"
   }
}
```

### 配置 Explore 入口

在 `data/site-config.json` 中设置：

```json
"enableExploreGate": true
```

- `true`：开启 Explore 入口。首次访问会显示入口层，点击 `Explore` 进入；同一浏览器会话内仅出现一次。
- `false`：关闭入口层，直接进入页面内容。

入口层动效默认包含：
- `System Ready` 闪烁
- `Drluffy` 与副标题打字机效果
- 点击 `Explore` 后淡出 + 景深过渡

并且为避免页面切换时闪烁，站点会在页面最早阶段根据会话状态预判是否显示 Explore 层。

### 配置 Explore 动画参数

在 `data/site-config.json` 中配置 `entry`：

```json
"entry": {
   "titleTypeSpeedMs": 38,
   "subtitleTypeSpeedMs": 18,
   "subtitleDelayMs": 180,
   "blinkMinOpacity": 0.45,
   "blinkGlowAlpha": 0.55,
   "blinkGlowSizePx": 10,
   "leaveDurationMs": 430
}
```

- `titleTypeSpeedMs` / `subtitleTypeSpeedMs`: 打字速度（毫秒，越小越快）
- `subtitleDelayMs`: 标题与副标题之间的等待时间
- `blinkMinOpacity`: 闪烁最低透明度
- `blinkGlowAlpha`: 发光强度（0~1）
- `blinkGlowSizePx`: 发光范围（像素）
- `leaveDurationMs`: 点击 Explore 后淡出+景深过渡时长

### 配置底部访问统计

页脚会显示访问量，默认使用 `countapi` 统计。

```json
"visits": {
   "enabled": true,
   "provider": "countapi",
   "namespace": "drluffy",
   "key": "site"
}
```

- `enabled`: 是否开启访问统计
- `provider`: 目前支持 `countapi`（其它值将走本地计数兜底）
- `namespace` + `key`: 统计键名
- 当远程统计不可用时，会自动显示本地计数作为 fallback

### 配置背景粒子数量

在 `data/site-config.json` 中设置：

```json
"particles": {
   "dayDesktop": 260,
   "nightDesktop": 180,
   "dayMobile": 110,
   "nightMobile": 70
}
```

说明：
- 白天默认粒子更多、可见度更高
- 你可以按设备和主题分别调整数量

### 配置待机相册是否开启

在 `data/site-config.json` 中设置：

```json
"enableIdleSlideshow": true
```

- `true`：开启空闲相册模式
- `false`：关闭空闲相册模式（即使配置了 `gallery` 也不会自动进入）

### 配置壁纸

1. 将图片放入：`assets/images/wallpapers/`
2. 在 `data/site-config.json` 中填写路径：

```json
"wallpaper": {
   "day": "/assets/images/wallpapers/day.jpg",
   "night": "/assets/images/wallpapers/night.jpg",
   "default": "/assets/images/wallpapers/night.jpg"
}
```

### 配置相册

1. 将图片放入：`assets/images/gallery/`
2. 在 `data/site-config.json` 中填写 `gallery`：

```json
"gallery": [
   {
      "src": "/assets/images/gallery/photo-1.jpg",
      "alt": "Sunrise over the city",
      "altZh": "城市日出",
      "caption": "Shot on a quiet morning.",
      "captionZh": "清晨拍摄。"
   },
   {
      "src": "/assets/images/gallery/photo-2.jpg",
      "alt": "Studio desk",
      "altZh": "工作台",
      "caption": "Workspace details.",
      "captionZh": "桌面细节。"
   }
]
```

说明：
- 空闲 30 秒后会自动进入相册模式
- 照片会按图片比例完整显示在相框内
- 点击可放大，支持触屏左右滑动和按钮翻页

### 配置问候语

在 `data/site-config.json` 中修改：

```json
"greetings": ["Hi", "Hello", "欢迎回来", "Good to see you"]
```

相册 `Exit` 后，猫咪会从这里随机取一句问候。

### 配置猫咪 SVG

1. 将 SVG 文件放入：`assets/images/cat/`
2. 在 `data/site-config.json` 中填写：

```json
"cat": {
   "svg": "/assets/images/cat/custom-cat.svg"
}
```

说明：
- 若未配置 `cat.svg`，页面使用内置 CSS 猫咪
- 若配置了 SVG，页面会自动切换为你的 SVG 猫咪，并保留滚动联动与跳跃动画

### 配置 About 头像与社媒

1. 将头像图片放到：`assets/images/about-photo.jpg`（可改名，但需同步修改 `about.html`）
2. 在 `about.html` 中更新社媒链接：
   - X: `https://x.com/...`
   - Telegram: `https://t.me/...`
   - Email: `mailto:...`
   - GitHub: `https://github.com/...`

## 详细部署流程（GitHub Pages）

1. 创建 GitHub 仓库并推送代码到 `main` 分支。
2. 确认仓库包含工作流文件：`.github/workflows/deploy.yml`。
3. 打开仓库 `Settings -> Pages`。
4. `Build and deployment` 下将 `Source` 设置为 `GitHub Actions`。
5. 回到仓库 `Actions` 页面，确认 `Deploy GitHub Pages` 工作流成功。
6. 部署完成后访问：
    - 用户主页仓库：`https://<username>.github.io/`
    - 普通仓库：`https://<username>.github.io/<repo>/`（本项目当前按根路径设计，建议用于用户主页仓库）
7. 每次推送到 `main` 都会自动重新部署。

## 推荐发布前检查

1. 本地构建文章数据：`Luffy install` 或 `npm run build:content`
2. 本地运行检查：`Luffy run`
3. 验证页面：`Home/About/Articles/Article` 可访问
4. 验证交互：粒子、日夜切换、猫咪滚动、30 秒空闲相册、点击放大、退出问候
5. 验证语言切换：中英切换后静态文案和动态分页文案正确
6. 验证 `data/site-config.json` 中配置的壁纸、相册、问候语、猫咪 SVG 全部可加载
7. 验证首次访问只显示背景与 `Explore`，点击后进入站点内容

## 目录概览

- `index.html` / `about.html` / `articles.html` / `article.html`
- `assets/css/*`
- `assets/js/*`
- `content/posts/*.md`
- `scripts/luffy.js` / `scripts/build-content.js` / `scripts/serve.js`
- `data/articles.json`, `data/article-map.json`

## 说明

- 壁纸、相册、问候语和猫咪 SVG 现在通过项目文件部署，不依赖浏览器本地导入。
- 低性能设备或用户设置减少动画时，动效会自动降级。
