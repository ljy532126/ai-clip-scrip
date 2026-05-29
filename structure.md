项目全局目录结构规范（Claude Code强制遵守）
 
前端 frontend
 
- src/- router/ 路由
- views/ 页面- Index 首页
- Generate 脚本生成页（四面板主页面）
- ToolBox 剪辑工具箱
- Record 历史记录/收藏
- User 个人中心
- Admin 后台管理
- components/ 公共组件- AgentForm 生成参数表单
- FilePreview 四文档预览面板组件
- DownloadBtn 下载/打包组件
- api/ 前后端接口
- store/ 状态管理
- utils/ 工具函数
- assets/ 静态资源
- vite.config.js
 
后端 backend
 
- src/- agent/ 【核心】六大独立智能体- oralAgent.js 口播干货
- shopAgent.js 电商带货
- flowAgent.js 信息流广告
- dramaAgent.js 达人剧情
- clipAgent.js 影视混剪
- emotionAgent.js 情感文案
- prompt/ 每个Agent独立prompt文本文件
- controller/ 业务控制
- routes/ 接口路由
- service/ AI请求封装
- utils/ 文件生成、打包、下载工具
- config/ 环境配置
- app.js
 
后端强制新增功能目录
 
- utils/fileGenerate.js 统一生成4份标准TXT
- utils/zipDownload.js 一键四文件打包压缩
 
根目录
 
- 5份项目规范md文档
- .env 配置
- Docker配置
 
强制架构规则
 
- 6个Agent 逻辑完全隔离
- 每个Agent固定输出 4文档结构
- 所有文件生成、预览、下载统一公共工具类