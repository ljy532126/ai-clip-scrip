const User = require('../model/User')
const Record = require('../model/Record')
const { v4: uuidv4 } = require('uuid')

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ message: '请输入用户名和密码' })

    const user = await User.findOne({ username })
    if (!user) return res.status(400).json({ message: '用户名不存在，请先注册' })
    if (user.banned) return res.status(403).json({ message: '账号已被封禁' })
    if (user.password !== password) return res.status(400).json({ message: '密码错误' })

    const token = Buffer.from(`${user._id}:${user.userId}:${user.role}:${Date.now()}`).toString('base64')
    res.json({ token, userInfo: { nickname: user.nickname || username, avatar: user.avatar || '', userId: user.userId, role: user.role } })
  } catch {
    res.status(500).json({ message: '登录失败' })
  }
}

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ message: '请输入用户名和密码' })
    const exists = await User.findOne({ username })
    if (exists) return res.status(400).json({ message: '用户名已存在' })
    const user = await User.create({
      userId: uuidv4().slice(0, 8),
      username, password,
      nickname: username,
      role: 'user'
    })
    const token = Buffer.from(`${user._id}:${user.userId}:${user.role}:${Date.now()}`).toString('base64')
    res.json({ token, userInfo: { nickname: username, avatar: '', userId: user.userId, role: 'user' } })
  } catch {
    res.status(500).json({ message: '注册失败' })
  }
}

exports.getInfo = async (req, res) => {
  try {
    const auth = req.headers.authorization
    if (!auth) return res.json({ nickname: '游客', avatar: '', userId: '', role: 'guest' })
    const decoded = Buffer.from(auth.replace('Bearer ', ''), 'base64').toString()
    const parts = decoded.split(':')
    const userId = parts[0]
    const user = await User.findById(userId).lean()
    if (user) {
      return res.json({
        nickname: user.nickname || user.username,
        avatar: user.avatar || '',
        userId: user.userId,
        role: user.role,
        favorites: (user.favorites || []).map(String)
      })
    }
  } catch {}
  res.json({ nickname: '游客', avatar: '', userId: '', role: 'guest' })
}

exports.addFavorite = async (req, res) => {
  try {
    const auth = req.headers.authorization; if (!auth) return res.status(401).json({ message: '请先登录' })
    const decoded = Buffer.from(auth.replace('Bearer ', ''), 'base64').toString()
    const userId = decoded.split(':')[0]
    await User.findByIdAndUpdate(userId, { $addToSet: { favorites: req.body.recordId } })
    res.json({ message: '收藏成功' })
  } catch { res.status(500).json({ message: '收藏失败' }) }
}

exports.removeFavorite = async (req, res) => {
  try {
    const auth = req.headers.authorization; if (!auth) return res.status(401).json({ message: '请先登录' })
    const decoded = Buffer.from(auth.replace('Bearer ', ''), 'base64').toString()
    const userId = decoded.split(':')[0]
    await User.findByIdAndUpdate(userId, { $pull: { favorites: req.body.recordId } })
    res.json({ message: '取消收藏' })
  } catch { res.status(500).json({ message: '操作失败' }) }
}

// 获取用户收藏列表
exports.getFavorites = async (req, res) => {
  try {
    const auth = req.headers.authorization; if (!auth) return res.status(401).json({ message: '请先登录' })
    const decoded = Buffer.from(auth.replace('Bearer ', ''), 'base64').toString()
    const userId = decoded.split(':')[0]
    const user = await User.findById(userId).populate('favorites', 'agent keywords detail createdAt').lean()
    if (!user) return res.json({ list: [] })
    const list = (user.favorites || []).map(f => ({
      id: f._id, agent: f.agent, keywords: f.keywords, detail: f.detail, time: f.createdAt
    }))
    res.json({ list })
  } catch { res.json({ list: [] }) }
}

// 获取当前用户的个人统计
exports.getMyStats = async (req, res) => {
  try {
    const auth = req.headers.authorization
    if (!auth) return res.json({ total: 0, today: 0, totalWords: 0 })
    const decoded = Buffer.from(auth.replace('Bearer ', ''), 'base64').toString()
    const userObjId = decoded.split(':')[0]
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [total, today, wordAgg] = await Promise.all([
      Record.countDocuments({ userId: userObjId }),
      Record.countDocuments({ userId: userObjId, createdAt: { $gte: todayStart } }),
      // userId 现在是 String，直接用字符串匹配
      Record.aggregate([
        { $match: { userId: userObjId } },
        { $group: { _id: null, totalWords: { $sum: '$wordCount' }, totalTokens: { $sum: '$tokensUsed' } } }
      ])
    ])

    res.json({
      total, today,
      totalWords: wordAgg[0]?.totalWords || 0,
      totalTokens: wordAgg[0]?.totalTokens || 0
    })
  } catch {
    res.json({ total: 0, today: 0, totalWords: 0, totalTokens: 0 })
  }
}

// ═══ 修改密码 ═══
exports.changePassword = async (req, res) => {
  try {
    const auth = req.headers.authorization; if (!auth) return res.status(401).json({ message: '请先登录' })
    const decoded = Buffer.from(auth.replace('Bearer ', ''), 'base64').toString()
    const userId = decoded.split(':')[0]
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) return res.status(400).json({ message: '请填写旧密码和新密码' })
    if (newPassword.length < 3) return res.status(400).json({ message: '新密码至少3位' })
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: '用户不存在' })
    if (user.password !== oldPassword) return res.status(400).json({ message: '旧密码错误' })
    user.password = newPassword
    await user.save()
    res.json({ message: '密码修改成功' })
  } catch { res.status(500).json({ message: '修改失败' }) }
}

// ═══ 设置头像 ═══
exports.updateAvatar = async (req, res) => {
  try {
    const auth = req.headers.authorization; if (!auth) return res.status(401).json({ message: '请先登录' })
    const decoded = Buffer.from(auth.replace('Bearer ', ''), 'base64').toString()
    const userId = decoded.split(':')[0]
    const { avatar } = req.body
    if (!avatar) return res.status(400).json({ message: '请提供头像URL' })
    await User.findByIdAndUpdate(userId, { avatar })
    res.json({ message: '头像更新成功', avatar })
  } catch { res.status(500).json({ message: '更新失败' }) }
}

// ═══ 管理员：用户列表 ═══
exports.adminListUsers = async (req, res) => {
  try {
    const auth = req.headers.authorization; if (!auth) return res.status(401).json({ message: '请先登录' })
    const decoded = Buffer.from(auth.replace('Bearer ', ''), 'base64').toString()
    const role = decoded.split(':')[2]; if (role !== 'admin') return res.status(403).json({ message: '无权限' })
    const users = await User.find({}, 'username nickname avatar role userId banned createdAt').sort({ createdAt: -1 }).lean()
    res.json({ list: users })
  } catch { res.status(500).json({ message: '查询失败' }) }
}

// ═══ 管理员：封禁/解封 ═══
exports.adminToggleBan = async (req, res) => {
  try {
    const auth = req.headers.authorization; if (!auth) return res.status(401).json({ message: '请先登录' })
    const decoded = Buffer.from(auth.replace('Bearer ', ''), 'base64').toString()
    const role = decoded.split(':')[2]; if (role !== 'admin') return res.status(403).json({ message: '无权限' })
    const user = await User.findById(req.body.userId)
    if (!user) return res.status(404).json({ message: '用户不存在' })
    if (user.role === 'admin') return res.status(400).json({ message: '不能封禁管理员' })
    user.banned = !user.banned
    await user.save()
    res.json({ message: user.banned ? '已封禁' : '已解封', banned: user.banned })
  } catch { res.status(500).json({ message: '操作失败' }) }
}
