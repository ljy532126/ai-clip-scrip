// 种子脚本：生成假用户 + 生成记录用于测试统计UI
// 用法: cd backend && node src/seed.js

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })
const mongoose = require('mongoose')
const User = require('./model/User')
const Record = require('./model/Record')
const { v4: uuidv4 } = require('uuid')

const AGENTS = ['oral', 'shop', 'flow', 'drama', 'clip', 'emotion']
const KEYWORDS = [
  '手机摄影技巧', '蓝牙耳机', 'APP推广', '办公室日常', '甄嬛传', '深夜emo',
  '职场沟通', '防晒霜测评', '在线课程', '情侣搞笑', '火影忍者', '治愈语录',
  '简历优化', '电动牙刷', '理财课程', '宿舍日常', '漫威混剪', '孤独瞬间',
  '股票入门', '素颜霜种草', '健身APP', '家庭伦理', '宫崎骏混剪', '温暖治愈'
]

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clip-script-platform')
  console.log('MongoDB connected')

  // 创建10个假用户
  const users = []
  for (let i = 0; i < 10; i++) {
    const uid = 'USER-' + uuidv4().slice(0, 6)
    const user = await User.findOneAndUpdate(
      { username: `testuser${i + 1}` },
      { userId: uid, username: `testuser${i + 1}`, password: '123456', nickname: randomNick(), role: 'user' },
      { upsert: true, new: true }
    )
    users.push(user)
  }
  console.log(`Created/updated ${users.length} test users`)

  // 创建50条假生成记录
  const records = []
  for (let i = 0; i < 50; i++) {
    const user = users[Math.floor(Math.random() * users.length)]
    const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)]
    const kw = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)]
    const daysAgo = Math.floor(Math.random() * 14) // 0-14天内
    const createdAt = new Date(Date.now() - daysAgo * 86400000 - Math.random() * 86400000)
    const wc = [300, 500, 800, 1200, 2500][Math.floor(Math.random() * 5)]
    const promptTok = wc * 3 + Math.floor(Math.random() * 500)
    const completionTok = wc * 2 + Math.floor(Math.random() * 1000)
    const totalTok = promptTok + completionTok

    records.push({
      agent, keywords: kw, detail: ['standard', 'detailed', 'ultra'][Math.floor(Math.random() * 3)],
      styles: [['professional', 'humorous', 'emotional'][Math.floor(Math.random() * 3)]],
      duration: [30, 45, 60, 90][Math.floor(Math.random() * 4)],
      wordCount: wc,
      tokensUsed: totalTok,
      promptTokens: promptTok,
      completionTokens: completionTok,
      documents: {
        script: `【${kw}】完整脚本内容...`,
        operation: `剪辑+运营方案...`,
        readme: `作品说明...`,
        seo: `#${kw} #短视频`
      },
      userId: user.userId,
      createdAt
    })
  }
  await Record.insertMany(records)
  console.log(`Created ${records.length} test records`)

  await mongoose.disconnect()
  console.log('Done!')
}

const NICK_POOL = ['小明', '阿杰', '大聪明', '小丸子', '老王', '阿花', '托尼老师', '程序猿小王', '剪辑师阿强', '运营小美']
function randomNick() { return NICK_POOL[Math.floor(Math.random() * NICK_POOL.length)] }

seed().catch(err => { console.error(err); process.exit(1) })
