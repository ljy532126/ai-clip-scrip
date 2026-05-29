const archiver = require('archiver')
const fs = require('fs')
const path = require('path')

// 输出目录
const OUTPUT_DIR = path.join(__dirname, '../../output')

// ZIP内固定的4个文件名（统一标准）
const FILE_NAMES = [
  { key: 'script', name: '1-核心主脚本文案.txt' },
  { key: 'operation', name: '2-发布运营全流程方案.txt' },
  { key: 'readme', name: '3-README作品说明.txt' },
  { key: 'seo', name: '4-SEO关键词标签库.txt' }
]

/**
 * 创建ZIP打包文件
 * @param {string} recordId - 记录ID
 * @param {{script, operation, readme, seo}} documents - 4份文档
 * @returns {Promise<string>} ZIP文件路径
 */
exports.createZip = (recordId, documents) => {
  return new Promise((resolve, reject) => {
    // 确保输出目录存在
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    }

    const zipPath = path.join(OUTPUT_DIR, `${recordId}.zip`)
    const output = fs.createWriteStream(zipPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    let resolved = false

    output.on('close', () => {
      resolved = true
      resolve(zipPath)
    })

    output.on('error', (err) => {
      if (!resolved) reject(err)
    })

    archive.on('error', (err) => {
      if (!resolved) reject(err)
    })

    archive.pipe(output)

    // 将4份文档按固定命名加入压缩包
    let fileCount = 0
    FILE_NAMES.forEach(({ key, name }) => {
      const content = documents[key]
      if (content && content.trim()) {
        archive.append(content, { name, date: new Date() })
        fileCount++
      }
    })

    // 至少有一份文档才打包
    if (fileCount === 0) {
      archive.append('暂无内容', { name: '说明.txt' })
    }

    archive.finalize()
  })
}

/**
 * 生成单个TXT文件到磁盘
 * @param {string} filename
 * @param {string} content
 * @returns {string} 文件路径
 */
exports.writeTxtFile = (filename, content) => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }
  const filePath = path.join(OUTPUT_DIR, filename)
  // 确保UTF-8 BOM以便Windows记事本正确显示中文
  fs.writeFileSync(filePath, '﻿' + content, 'utf-8')
  return filePath
}

/**
 * 清理过期的输出文件（保留最近N个）
 */
exports.cleanOldFiles = (keepCount = 100) => {
  try {
    if (!fs.existsSync(OUTPUT_DIR)) return
    const files = fs.readdirSync(OUTPUT_DIR)
      .map(f => ({
        name: f,
        time: fs.statSync(path.join(OUTPUT_DIR, f)).mtimeMs
      }))
      .sort((a, b) => b.time - a.time)

    // 删除超出保留数量的旧文件
    files.slice(keepCount).forEach(f => {
      fs.unlinkSync(path.join(OUTPUT_DIR, f.name))
    })
  } catch (e) {
    console.error('清理输出文件失败:', e.message)
  }
}
