# 推送到 GitHub + 自动打包 APK 完整教程

## 第一步：创建 GitHub 仓库

1. 打开 https://github.com/new
2. Repository name 填：`ai-clip-script`（或你喜欢的名字）
3. 选 **Public**（免费 Actions 额度）
4. 不要勾选任何初始化选项（README / .gitignore 都不选）
5. 点击 **Create repository**

## 第二步：复制你仓库的地址

创建完成后 GitHub 会显示类似：
```
https://github.com/你的用户名/ai-clip-script.git
```

复制这个地址。

## 第三步：在你的项目目录打开终端

```bash
cd C:\Users\Administrator\Desktop\视频文案生成器
```

## 第四步：一行一行执行以下命令

```bash
# 1. 初始化 git（已完成，跳过）
git init

# 2. 添加所有文件
git add .

# 3. 第一次提交
git commit -m "初始化：AI全能剪辑脚本生成平台"

# 4. 设置主分支名为 main
git branch -M main

# 5. 关联你的 GitHub 仓库（替换成你的地址！）
git remote add origin https://github.com/你的用户名/ai-clip-script.git

# 6. 推送到 GitHub
git push -u origin main
```

输入你的 GitHub 用户名和密码（或 token）后，代码就上传了。

## 第五步：自动打包 APK

1. 打开你的 GitHub 仓库页面
2. 顶部菜单点 **Actions**
3. 左侧找到 **Build Android APK**
4. 点击 **Run workflow** → **Run workflow**
5. 等 5-10 分钟构建完成
6. 完成后在底部的 **Artifacts** 下载 `ai-clipscript-apk.zip`

## 第六步：装到手机上

1. 解压 zip 得到 `app-debug.apk`
2. 传到手机上安装
3. 安装前确保 `frontend\.env.production` 里的 IP 是你电脑的正确 IP

## 之后每次改完代码

```bash
git add .
git commit -m "描述你改了什么"
git push
```

GitHub Actions 会自动打包新的 APK。
