const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const config = require('./config')
const { connectDB } = require('./model/db')
const apiRoutes = require('./routes')

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use('/output', express.static(path.join(__dirname, '../output')))
app.use('/api', apiRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.use((err, req, res, next) => {
  console.error('Server Error:', err.message)
  res.status(500).json({ message: 'Server Error', error: err.message })
})

const start = async () => {
  await connectDB()

  const adminController = require('./controller/adminController')
  await adminController.initPrompts().catch(() => {})

  // 管理员：每次启动强制重置密码为 admin123 + 角色设为 admin
  const User = require('./model/User')
  const { v4: uuidv4 } = require('uuid')
  const adminUser = await User.findOne({ username: 'admin' })
  if (adminUser) {
    await User.findByIdAndUpdate(adminUser._id, { role: 'admin', password: 'admin123' })
  } else {
    await User.create({ userId: 'ADMIN-' + uuidv4().slice(0, 4), username: 'admin', password: 'admin123', nickname: 'Admin', role: 'admin' })
  }
  console.log('Admin account: admin / admin123')

  // 种子 LLM 配置
  const LLMConfig = require('./model/LLMConfig')
  const llmCount = await LLMConfig.countDocuments()
  if (llmCount === 0) {
    // MiMo (从 .env)
    if (config.mimo.apiKey) {
      await LLMConfig.create({ name: 'MiMo v2.5', provider: 'mimo', apiUrl: config.mimo.apiUrl + '/chat/completions', apiKey: config.mimo.apiKey, model: config.mimo.model, isActive: true })
    }
    // DeepSeek 模板
    await LLMConfig.create({ name: 'DeepSeek V3', provider: 'deepseek', apiUrl: 'https://api.deepseek.com/v1/chat/completions', apiKey: 'sk-your-deepseek-key', model: 'deepseek-chat', isActive: !config.mimo.apiKey })
    console.log('LLM配置已初始化')
  }

  // SPA fallback (after API routes)
  const publicDir = path.join(__dirname, '../../public')
  if (require('fs').existsSync(publicDir)) {
    app.use(express.static(publicDir))
    app.get('*', (req, res) => { res.sendFile(path.join(publicDir, 'index.html')) })
  }

  app.listen(config.port, () => {
    console.log('Server running on http://localhost:' + config.port)
  })

  // 检测当前激活的 LLM 连通性
  const activeLLM = await LLMConfig.findOne({ isActive: true })
  if (activeLLM) {
    const axios = require('axios')
    try {
      await axios.post(activeLLM.apiUrl, {
        model: activeLLM.model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1
      }, {
        headers: { Authorization: `Bearer ${activeLLM.apiKey}`, 'Content-Type': 'application/json' },
        timeout: 10000
      })
      console.log(`LLM连接正常: ${activeLLM.name} (${activeLLM.model})`)
    } catch (err) {
      console.log(`LLM未连通 (${activeLLM.name}): ${err.message}, 将降级为模拟数据`)
    }
  } else {
    console.log('未配置LLM，使用模拟数据')
  }
}

start()

module.exports = app
