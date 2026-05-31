const Announcement = require('../model/Announcement')
const Record = require('../model/Record')
const Prompt = require('../model/Prompt')
const User = require('../model/User')
const LLMConfig = require('../model/LLMConfig')

const AGENT_LABELS = {
  oral: '口播干货', shop: '电商带货', flow: '信息流广告',
  drama: '达人剧情', clip: '影视混剪', emotion: '情感文案'
}

const DEFAULT_PROMPTS = {
  oral: '你是一位短视频口播文案专家。', shop: '你是一位电商带货文案专家。',
  flow: '你是一位信息流广告专家。', drama: '你是一位剧情编剧。',
  clip: '你是一位影视混剪文案专家。', emotion: '你是一位情感文案创作者。'
}

// 启动时从文件同步到DB
exports.initPrompts = async () => {
  const fs = require('fs')
  const path = require('path')
  for (const key of Object.keys(AGENT_LABELS)) {
    const exists = await Prompt.findOne({ agentKey: key })
    if (!exists) {
      let content = DEFAULT_PROMPTS[key]
      try {
        const fp = path.join(__dirname, '../prompt', `${key}.txt`)
        if (fs.existsSync(fp)) content = fs.readFileSync(fp, 'utf-8')
      } catch {}
      await Prompt.create({ agentKey: key, content })
    }
  }
}

// 解析token获取用户身份
function parseToken(req) {
  try {
    const auth = req.headers.authorization
    if (!auth) return { role: 'guest', userObjId: null, userId: '' }
    // "Bearer xxx" => "xxx"
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : auth.trim()
    const decoded = Buffer.from(token, 'base64').toString()
    const parts = decoded.split(':')
    // parts: [mongoId, userId, role, timestamp]
    return { role: parts[2] || 'guest', userObjId: parts[0], userId: parts[1] || '' }
  } catch { return { role: 'guest', userObjId: null, userId: '' } }
}

// ====== Prompt管理 ======
exports.getPrompts = async (req, res) => {
  try {
    const docs = await Prompt.find().lean()
    const list = Object.keys(AGENT_LABELS).map(key => {
      const doc = docs.find(d => d.agentKey === key)
      return { key, label: AGENT_LABELS[key], prompt: doc?.content || '' }
    })
    res.json({ list })
  } catch {
    res.json({ list: [] })
  }
}

exports.updatePrompt = async (req, res) => {
  try {
    const { role } = parseToken(req)
    if (role !== 'admin') return res.status(403).json({ message: '无权限' })
    const { id } = req.params
    if (!AGENT_LABELS[id]) return res.status(400).json({ message: '无效Agent' })
    await Prompt.findOneAndUpdate({ agentKey: id }, { content: req.body.prompt, updatedAt: new Date() }, { upsert: true })
    const fs = require('fs'); const path = require('path')
    fs.writeFileSync(path.join(__dirname, '../prompt', `${id}.txt`), req.body.prompt, 'utf-8')
    res.json({ message: '更新成功' })
  } catch {
    res.status(500).json({ message: '更新失败' })
  }
}

// ====== 数据统计（角色分离） ======
exports.getStats = async (req, res) => {
  try {
    const { role } = parseToken(req)
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // 日期筛选（tokenRanking/topUsers 专用）
    const { startDate, endDate } = req.query
    let dateFilter = {}
    if (startDate || endDate) {
      dateFilter.createdAt = {}
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate)
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z')
    }

    const [total, today, week, month, totalWordsObj] = await Promise.all([
      Record.countDocuments(),
      Record.countDocuments({ createdAt: { $gte: todayStart } }),
      Record.countDocuments({ createdAt: { $gte: weekStart } }),
      Record.countDocuments({ createdAt: { $gte: monthStart } }),
      Record.aggregate([{ $group: { _id: null, totalWords: { $sum: '$wordCount' }, avgWords: { $avg: '$wordCount' } } }])
    ])

    const totalWords = totalWordsObj[0]?.totalWords || 0
    const avgWords = Math.round(totalWordsObj[0]?.avgWords || 0)

    let agents = {}, days7 = [], topUsers = [], tokenRanking = [], userCount = 0
    if (role === 'admin') {
      const agentStats = await Record.aggregate([{ $group: { _id: '$agent', count: { $sum: 1 } } }])
      for (const a of agentStats) agents[a._id] = a.count

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i)
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        const end = new Date(start.getTime() + 86400000)
        days7.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, count: await Record.countDocuments({ createdAt: { $gte: start, $lt: end } }) })
      }

      userCount = await User.countDocuments()

      // 用户排名 + Token排名（支持日期筛选）
      const rankMatch = {
        userId: { $exists: true, $ne: '' },
        ...dateFilter
      }
      const userRanking = await Record.aggregate([
        { $match: rankMatch },
        { $group: { _id: '$userId', count: { $sum: 1 }, totalWords: { $sum: '$wordCount' }, totalTokens: { $sum: '$tokensUsed' }, promptTokens: { $sum: '$promptTokens' }, completionTokens: { $sum: '$completionTokens' }, lastGen: { $max: '$createdAt' } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ])

      // 双向匹配：既是 User.userId 也可能是 User._id
      const userIdValues = userRanking.map(u => u._id).filter(Boolean)
      const userDocs = userIdValues.length > 0
        ? await User.find({
            $or: [
              { userId: { $in: userIdValues } },
              { _id: { $in: userIdValues.filter(id => /^[0-9a-fA-F]{24}$/.test(id)) } }
            ].filter(g => g[Object.keys(g)[0]].$in.length > 0)
          }, 'username nickname userId').lean()
        : []
      const userMap = {}
      for (const u of userDocs) {
        userMap[u.userId || u._id.toString()] = u
        userMap[u._id.toString()] = u
      }
      topUsers = userRanking.filter(r => r._id).map((r, i) => ({
        rank: i + 1,
        userId: userMap[r._id.toString()]?.userId || '未知',
        nickname: userMap[r._id.toString()]?.nickname || userMap[r._id.toString()]?.username || '匿名',
        count: r.count,
        totalWords: r.totalWords || 0,
        totalTokens: r.totalTokens || 0,
        promptTokens: r.promptTokens || 0,
        completionTokens: r.completionTokens || 0,
        lastGen: r.lastGen
      }))

      tokenRanking = [...topUsers].sort((a, b) => b.totalTokens - a.totalTokens).slice(0, 10).map((u, i) => ({ ...u, rank: i + 1 }))
    }

    res.json({
      total, today, week, month, totalWords, avgWords,
      agents, days7, topUsers, tokenRanking, userCount,
      apiCalls: { total, today, week, month },
      role
    })
  } catch (e) {
    console.error('getStats error:', e.message, e.stack)
    res.json({ total: 0, today: 0, week: 0, month: 0, totalWords: 0, avgWords: 0, agents: {}, days7: [], topUsers: [], role: 'guest', error: e.message })
  }
}

// ====== 公告管理 ======
exports.getAnnouncements = async (req, res) => {
  try {
    const docs = await Announcement.find({ active: true }).sort({ createdAt: -1 }).lean()
    res.json({ list: docs.map(d => ({ id: d._id, title: d.title, content: d.content, showOnce: d.showOnce, createdAt: d.createdAt })) })
  } catch {
    res.json({ list: [] })
  }
}

exports.createAnnouncement = async (req, res) => {
  try {
    const { role } = parseToken(req)
    if (role !== 'admin') return res.status(403).json({ message: '无权限' })
    const { title, content, showOnce } = req.body
    if (!title || !content) return res.status(400).json({ message: '标题和内容不能为空' })
    const doc = await Announcement.create({ title, content, showOnce: !!showOnce, active: true })
    res.json({ id: doc._id, message: '发布成功' })
  } catch {
    res.status(500).json({ message: '发布失败' })
  }
}

exports.deleteAnnouncement = async (req, res) => {
  try {
    const { role } = parseToken(req)
    if (role !== 'admin') return res.status(403).json({ message: '无权限' })
    await Announcement.findByIdAndUpdate(req.params.id, { active: false })
    res.json({ message: '已下架' })
  } catch {
    res.status(500).json({ message: '操作失败' })
  }
}

// 标记用户已读某条公告
exports.markAnnouncementRead = async (req, res) => {
  res.json({ message: 'ok' })
}

// ====== LLM 大模型配置 ======
exports.getLLMConfigs = async (req, res) => {
  try {
    const docs = await LLMConfig.find().sort({ createdAt: -1 }).lean()
    res.json({ list: docs })
  } catch {
    res.json({ list: [] })
  }
}

exports.createLLMConfig = async (req, res) => {
  try {
    const { role } = parseToken(req)
    if (role !== 'admin') return res.status(403).json({ message: '无权限' })
    const { name, provider, apiUrl, apiKey, model } = req.body
    if (!name || !apiUrl || !apiKey || !model) return res.status(400).json({ message: '参数不完整' })
    const doc = await LLMConfig.create({ name, provider: provider || 'custom', apiUrl, apiKey, model, isActive: false })
    res.json({ id: doc._id, message: '添加成功' })
  } catch {
    res.status(500).json({ message: '添加失败' })
  }
}

exports.updateLLMConfig = async (req, res) => {
  try {
    const { role } = parseToken(req)
    if (role !== 'admin') return res.status(403).json({ message: '无权限' })
    const { name, apiUrl, apiKey, model } = req.body
    await LLMConfig.findByIdAndUpdate(req.params.id, { name, apiUrl, apiKey, model })
    res.json({ message: '更新成功' })
  } catch {
    res.status(500).json({ message: '更新失败' })
  }
}

exports.deleteLLMConfig = async (req, res) => {
  try {
    const { role } = parseToken(req)
    if (role !== 'admin') return res.status(403).json({ message: '无权限' })
    await LLMConfig.findByIdAndDelete(req.params.id)
    res.json({ message: '已删除' })
  } catch {
    res.status(500).json({ message: '删除失败' })
  }
}

exports.activateLLMConfig = async (req, res) => {
  try {
    const { role } = parseToken(req)
    if (role !== 'admin') return res.status(403).json({ message: '无权限' })
    await LLMConfig.updateMany({}, { isActive: false })
    await LLMConfig.findByIdAndUpdate(req.params.id, { isActive: true })
    const agentService = require('../service/agentService')
    agentService.clearLLMCache()
    res.json({ message: '已切换' })
  } catch {
    res.status(500).json({ message: '切换失败' })
  }
}

// 测试 LLM 连通性
exports.testLLM = async (req, res) => {
  try {
    const { apiUrl, apiKey, model } = req.body
    if (!apiUrl || !apiKey || !model) return res.status(400).json({ message: '参数不完整' })
    const axios = require('axios')
    const start = Date.now()
    const resp = await axios.post(apiUrl, {
      model,
      messages: [{ role: 'user', content: '回复"ok"' }],
      max_tokens: 10
    }, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 20000
    })
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    const content = resp.data?.choices?.[0]?.message?.content || ''
    res.json({ success: true, elapsed: elapsed + 's', content: content.slice(0, 50), status: resp.status })
  } catch (err) {
    const msg = err.response?.status
      ? `HTTP ${err.response.status}: ${(err.response.data?.error?.message || err.message).slice(0, 100)}`
      : err.message.slice(0, 100)
    res.json({ success: false, error: msg })
  }
}
