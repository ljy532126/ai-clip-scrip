# AI 全能剪辑脚本生成平台

## 快速启动

```bash
# 1. 启动后端
cd backend
npm install
npm run dev

# 2. 启动前端（新终端）
cd frontend
npm install
npm run dev
```

前端: `http://localhost:5173`  
后端: `http://localhost:3013`

---

## 手机 PWA 安装

1. 手机和电脑连同一个 WiFi
2. 手机浏览器打开: `http://电脑IP:5173`
3. 浏览器菜单 → **"添加到主屏幕"**

桌面图标打开就是全屏 App 体验。

---

## 打包 APK（GitHub Actions 自动构建）

无需安装 Android Studio，推送代码到 GitHub 自动出 APK：

```bash
# 1. 创建 GitHub 仓库
# 2. 推送代码
git add .
git commit -m "init"
git remote add origin https://github.com/你的用户名/仓库名.git
git branch -M main
git push -u origin main

# 3. GitHub 仓库 → Actions 标签 → Build Android APK → Run workflow
# 4. 完成后在 Artifacts 下载 APK
```

APK 安装前需修改 `frontend/.env.production` 中的服务器 IP。

---

## 管理员账号

```
用户名: admin
密码: admin123
```

---

## Docker 部署

```bash
docker-compose up -d
```

访问 `http://localhost:3013`

---

## 技术栈

- 前端: Vue 3 + Vite + Vant 4 + Pinia + Chart.js + IconPark
- 后端: Node.js + Express + MongoDB + Mongoose
- AI: MiMo / DeepSeek / 自定义 LLM（后台可切换）
- 部署: Docker + GitHub Actions + Capacitor APK + PWA
