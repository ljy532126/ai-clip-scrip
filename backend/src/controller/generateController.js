const Record = require('../model/Record')
const Prompt = require('../model/Prompt')
const agentService = require('../service/agentService')
const fileGenerate = require('../utils/fileGenerate')
const zipDownload = require('../utils/zipDownload')

// 提交生成任务
exports.generate = async (req, res, next) => {
  try {
    const { agent, keywords, duration, detail, styles, style, wordCount, bilingual, filterSensitive, creativeMode } = req.body
    if (!agent || !keywords) {
      return res.status(400).json({ message: '请选择Agent并输入关键词' })
    }

    const result = await agentService.generate(agent, {
      keywords, duration: duration || 60, detail: detail || 'standard',
      styles: styles || [style || 'professional'], wordCount: wordCount || 500, creativeMode: !!creativeMode
    })

    const documents = fileGenerate.parseAndGenerate(agent, result.content)

    // 从 token 解析用户ID
    let userId = null
    try {
      const auth = req.headers.authorization
      if (auth) {
        const decoded = Buffer.from(auth.replace('Bearer ', ''), 'base64').toString()
        userId = decoded.split(':')[0]
      }
    } catch {}

    let recordId = 'mem-' + Date.now()
    try {
      const doc = await Record.create({
        agent, keywords, detail: detail || 'standard',
        styles: styles || [style || 'professional'],
        duration: duration || 60, wordCount: wordCount || 500,
        documents, tokensUsed: result.tokensUsed || 0,
        promptTokens: result.promptTokens || 0,
        completionTokens: result.completionTokens || 0,
        userId, createdAt: new Date()
      })
      recordId = doc._id.toString()
    } catch (dbErr) {
      console.warn('存储记录失败:', dbErr.message)
    }

    res.json({
      id: recordId,
      script: documents.script,
      operation: documents.operation,
      readme: documents.readme,
      seo: documents.seo,
      // 单条统计
      scriptChars: documents.script.replace(/\s/g, '').length,
      operationChars: documents.operation.replace(/\s/g, '').length,
      readmeChars: documents.readme.replace(/\s/g, '').length,
      seoChars: documents.seo.replace(/\s/g, '').length,
      totalChars: Object.values(documents).join('').replace(/\s/g, '').length,
      tokensUsed: result.tokensUsed || 0
    })
  } catch (err) {
    next(err)
  }
}

// 获取生成历史
exports.history = async (req, res) => {
  try {
    const docs = await Record.find({}, 'agent keywords detail createdAt')
      .sort({ createdAt: -1 }).limit(50).lean()
    const list = docs.map(d => ({
      id: d._id, agent: d.agent, keywords: d.keywords,
      detail: d.detail, time: d.createdAt
    }))
    res.json({ list })
  } catch {
    res.json({ list: [] })
  }
}

// 获取单条记录
exports.getRecord = async (req, res) => {
  try {
    const doc = await Record.findById(req.params.id).lean()
    if (!doc) return res.status(404).json({ message: '记录不存在' })
    res.json({
      id: doc._id, agent: doc.agent, keywords: doc.keywords,
      script: doc.documents.script, operation: doc.documents.operation,
      readme: doc.documents.readme, seo: doc.documents.seo
    })
  } catch {
    res.status(404).json({ message: '记录不存在' })
  }
}

// 删除记录
exports.deleteRecord = async (req, res) => {
  try {
    await Record.findByIdAndDelete(req.params.id)
    res.json({ message: '删除成功' })
  } catch {
    res.status(400).json({ message: '删除失败' })
  }
}

// 单文件下载
exports.downloadSingle = (req, res) => {
  const fs = require('fs')
  const path = require('path')
  const filePath = path.join(__dirname, '../../output', req.params.filename)
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: '文件不存在' })
  res.download(filePath)
}

// ZIP打包下载
exports.downloadZip = async (req, res, next) => {
  try {
    const doc = await Record.findById(req.params.id).lean()
    if (!doc) return res.status(404).json({ message: '记录不存在' })
    const zipPath = await zipDownload.createZip(doc._id.toString(), doc.documents)
    res.download(zipPath, '剪辑脚本全套素材包.zip')
  } catch (err) {
    next(err)
  }
}
