// 工具箱控制器
const config = require('../config')
const axios = require('axios')

// 字幕处理
exports.subtitle = (req, res) => {
  const { content, mode } = req.body
  if (!content) {
    return res.status(400).json({ message: '请输入字幕内容' })
  }

  let result = content

  switch (mode) {
    case 'toSRT':
      // 简单SRT格式转换
      result = content.split('\n').filter(Boolean).map((line, i) => {
        const start = formatSRTTime(i * 3)
        const end = formatSRTTime(i * 3 + 3)
        return `${i + 1}\n${start} --> ${end}\n${line.trim()}\n`
      }).join('\n')
      break
    case 'adjustTime':
      // 时间戳偏移
      result = content.replace(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/g, (match, h, m, s, ms) => {
        const totalSec = parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + (req.body.offset || 0)
        const newH = Math.floor(totalSec / 3600) % 24
        const newM = Math.floor((totalSec % 3600) / 60)
        const newS = totalSec % 60
        return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}:${String(newS).padStart(2, '0')},${ms}`
      })
      break
    case 'batchReplace':
      if (req.body.findText && req.body.replaceText) {
        result = content.split(req.body.findText).join(req.body.replaceText)
      }
      break
  }

  res.json({ result })
}

// AI文案润色 — 用当前激活的 LLM
exports.polish = async (req, res, next) => {
  const { content, style } = req.body
  if (!content) return res.status(400).json({ message: '请输入需要润色的文案' })

  try {
    const LLMConfig = require('../model/LLMConfig')
    const llm = await LLMConfig.findOne({ isActive: true })
    if (llm) {
      const resp = await axios.post(llm.apiUrl, {
        model: llm.model,
        messages: [
          { role: 'system', content: `你是一位文案润色专家。润色以下文案：去掉口水词、优化表达、提升质感，保持原意不变。直接返回润色后的文案，不要任何解释。风格：${style || '简洁流畅'}` },
          { role: 'user', content }
        ],
        temperature: 0.5, max_tokens: 2000
      }, {
        headers: { Authorization: `Bearer ${llm.apiKey}`, 'Content-Type': 'application/json' },
        timeout: 60000
      })
      return res.json({ result: resp.data?.choices?.[0]?.message?.content || '' })
    }
  } catch (err) {
    console.error('润色API失败:', err.message)
  }

  // 兜底：本地去除口水词
  res.json({ result: content.replace(/嗯|啊|呃|就是说|这个那个/g, '').replace(/然后然后/g, '然后').replace(/非常非常/g, '非常') })
}

// 分镜表生成
exports.storyboard = (req, res) => {
  const { script } = req.body
  if (!script) {
    return res.status(400).json({ message: '请输入脚本文案' })
  }

  // 基于脚本自动拆解分镜
  const sentences = script
    .replace(/[。！？；\n]/g, '|')
    .split('|')
    .filter(Boolean)
    .map(s => s.trim())

  const storyboard = sentences.map((sentence, i) => ({
    scene: i + 1,
    duration: '3-5秒',
    content: sentence.length > 30 ? sentence.slice(0, 30) + '...' : sentence,
    shot: ['远景', '中景', '近景', '特写', '中景'][i % 5],
    camera: ['固定', '推', '跟', '摇', '固定'][i % 5],
    notes: '按文案节奏自然切换'
  }))

  res.json({ storyboard })
}

function formatSRTTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},000`
}
