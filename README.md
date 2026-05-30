<div align="center">

<img src="frontend/public/favicon.svg" width="80" />

# AI 全能剪辑脚本生成平台

**六行业独立 AI Agent · 一键输出全套运营素材包**

[![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vuedotjs)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite)](https://vitejs.dev)
[![Node](https://img.shields.io/badge/Node-20+-339933?logo=nodedotjs)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Docker-✅-2496ED?logo=docker)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📖 目录

- [项目简介](#项目简介)
- [核心特色](#核心特色)
- [六大赛道](#六大赛道)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [Docker 部署](#docker-部署)
- [管理后台](#管理后台)
- [手机安装](#手机安装)
- [技术栈](#技术栈)

---

## 项目简介

面向短视频剪辑师、自媒体创作者、带货达人、剪辑工作室的 **全行业 AI 脚本一站式生成平台**。

每次生成固定产出 **4 套标准化成品文档**，从脚本到运营全部覆盖，拿到即可发布。

```
🎬 核心主文案 — 行业完整脚本，开箱即用
📋 运营全流程 — 剪辑+发布+运营全套指导
📝 作品说明 — 简介、用途、使用须知
🔑 SEO 标签库 — 关键词/话题标签完整列表
```

---

## 核心特色

| 特性 | 说明 |
|------|------|
| 🧠 **6 个独立 AI Agent** | 互不干扰，各自专属 Prompt，不同行业不同人设 |
| 📦 **4 文档标准化输出** | 每次生成固定产出，格式统一，可直接发布 |
| 🎨 **四面板预览** | PC 端左右布局，移动端 Tab 切换，全文可复制 |
| 📥 **灵活下载** | 单文件下载 + 一键 ZIP 打包四份 |
| 🛠 **全套剪辑工具箱** | 字幕处理、AI 润色、分镜表、爆款钩子库 |
| 🌓 **深浅色主题** | 暖调编辑室风格，护眼暗色模式 |
| 📱 **全端适配** | Web / H5 / PWA / Android APK |
| ⚡ **AI 可切换** | 后台可视化切换 DeepSeek / MiMo / 自定义 LLM |

---

## 六大赛道

<!-- 表格居中对齐示意图 -->
<table align="center">
<tr>
<td align="center"><b>🎙️ 口播干货</b></td>
<td align="center"><b>🛒 电商带货</b></td>
<td align="center"><b>📢 信息流广告</b></td>
</tr>
<tr>
<td align="center">知识科普<br>经验分享<br>真人朗读</td>
<td align="center">产品种草<br>卖点拆解<br>转化文案</td>
<td align="center">投流专用<br>强营销节奏<br>付费广告</td>
</tr>
<tr>
<td align="center"><b>🎭 达人剧情</b></td>
<td align="center"><b>🎬 影视混剪</b></td>
<td align="center"><b>💌 情感文案</b></td>
</tr>
<tr>
<td align="center">人物小剧场<br>反转剧情<br>人设短视频</td>
<td align="center">影视解说<br>氛围旁白<br>片段混剪</td>
<td align="center">治愈伤感<br>深夜感悟<br>文艺短句</td>
</tr>
</table>

---

## 快速开始

### 环境要求

- **Node.js** `>= 20`
- **MongoDB** `>= 6.0`
- **npm** `>= 9`

### 1. 克隆项目

```bash
git clone https://github.com/ljy532126/ai-clip-scrip.git
cd ai-clip-scrip
```

### 2. 环境配置

```bash
cp .env .env.local
```

编辑 `.env`，填入你的 AI API Key：

```env
# 服务端口
PORT=3013

# AI API（支持 DeepSeek / MiMo / 自定义）
MIMO_API_KEY=sk-your-key-here
MIMO_API_URL=https://api.deepseek.com/v1
MIMO_MODEL=deepseek-chat

# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/clip-script-platform
```

### 3. 启动后端

```bash
cd backend
npm install
npm run dev
```

### 4. 启动前端（新终端）

```bash
cd frontend
npm install
npm run dev
```

### 5. 打开浏览器

```
前端开发: http://localhost:5173
后端接口: http://localhost:3013
健康检查: http://localhost:3013/health
```

---

## 项目结构

```
ai-clip-scrip/
├── backend/                    # 后端服务
│   └── src/
│       ├── agent/              # 🧠 六大独立 Agent
│       │   ├── oralAgent.js    #   口播干货
│       │   ├── shopAgent.js    #   电商带货
│       │   ├── flowAgent.js    #   信息流广告
│       │   ├── dramaAgent.js   #   达人剧情
│       │   ├── clipAgent.js    #   影视混剪
│       │   └── emotionAgent.js #   情感文案
│       ├── prompt/             # 每个 Agent 独立 Prompt 文本
│       ├── controller/         # 业务控制器
│       ├── service/            # AI 请求封装
│       ├── model/              # MongoDB 数据模型
│       ├── routes/             # API 路由
│       ├── utils/              # 文件生成 / ZIP 打包
│       └── config/             # 环境配置
├── frontend/                   # 前端 Vue3 应用
│   └── src/
│       ├── views/              # 页面
│       │   ├── Index.vue       #   首页（Agent 选择）
│       │   ├── Generate.vue    #   生成页（四面板预览）
│       │   ├── ToolBox.vue     #   剪辑工具箱
│       │   ├── Record.vue      #   历史记录 & 收藏
│       │   ├── User.vue        #   个人中心
│       │   └── Admin.vue       #   后台管理
│       ├── components/         # 公共组件
│       │   ├── AgentForm.vue   #   参数表单
│       │   ├── FilePreview.vue #   四文档预览
│       │   └── DownloadBtn.vue #   下载/打包
│       ├── api/                # 接口封装
│       ├── store/              # Pinia 状态管理
│       ├── router/             # 路由配置
│       ├── styles/             # 主题 & 全局样式
│       └── utils/              # 工具函数
├── docker-compose.yml          # Docker 编排
├── Dockerfile                  # 多阶段构建
├── .dockerignore
└── .env                        # 环境变量（不入仓库）
```

---

## Docker 部署

### 一键部署

```bash
docker compose up -d --build
```

访问 `http://你的服务器IP:3013`

### 更新部署

```bash
cd /www/wwwroot/clip-script
git pull && docker compose down && docker compose build --no-cache && docker compose up -d
```

### Docker 架构

```
┌─────────────────────────────────┐
│  Docker 容器 (clip-script)      │
│  ┌──────────┐  ┌──────────────┐ │
│  │  Express  │  │  Vue SPA     │ │
│  │  :3013    │  │  (静态托管)   │ │
│  └─────┬─────┘  └──────────────┘ │
│        │                          │
└────────┼──────────────────────────┘
         │ network_mode: host
    ┌────▼────┐
    │ MongoDB │ (宿主机 127.0.0.1:27017)
    └─────────┘
```

---

## 管理后台

管理员登录后访问「后台管理」，包含以下功能：

| 模块 | 功能 |
|------|------|
| 🎛 **Prompt** | 可视化编辑 6 个 Agent 的系统提示词 |
| 📊 **统计** | 总/日/周/月生成量、字数、Token、7 天趋势图、Agent 分布、用户排名 |
| 👥 **用户管理** | 查看所有用户、封禁/解封操作 |
| 🤖 **LLM 配置** | 切换/添加/测试 AI 模型（支持 DeepSeek/MiMo/OpenAI/自定义） |
| 📢 **公告管理** | 发布/下架网站公告 |

### 管理员账号

```
用户名: admin
密码: admin123
```

> 首次启动自动创建，可在 `.env` 中修改初始密码。

---

## 手机安装

### PWA（推荐）

1. 手机和电脑连同一 WiFi
2. 手机浏览器打开 `http://电脑IP:5173`
3. 浏览器菜单 → **"添加到主屏幕"**
4. 桌面出现 App 图标，打开即全屏体验

### APK 安装

项目集成 GitHub Actions 自动构建 APK，推送代码即可出包：

1. GitHub 仓库 → **Actions** 标签
2. 选择 **Build Android APK**
3. 点击 **Run workflow**
4. 完成后在 **Artifacts** 下载 APK

> APK 安装前需修改 `frontend/.env.production` 中的服务器地址为你的实际 IP。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 + Vite |
| UI 组件库 | Vant 4（移动端优先） |
| 状态管理 | Pinia |
| 图表 | Chart.js (vue-chartjs) |
| 图标 | IconPark (字节跳动) |
| 后端框架 | Express |
| 数据库 | MongoDB + Mongoose |
| AI 对接 | 统一 SDK 封装，支持 DeepSeek / MiMo / OpenAI 兼容 API |
| 容器化 | Docker 多阶段构建 |
| 移动端 | Capacitor (Android APK) + PWA |
| CI/CD | GitHub Actions |

---

## License

MIT — 自由使用，随心创作 🎬
