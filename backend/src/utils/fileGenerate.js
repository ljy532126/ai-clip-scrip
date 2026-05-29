// 四文档统一生成工具
// 任何Agent输出都必须通过此工具解析为4份标准文档

// 文档模板（当某部分解析失败时的默认占位）
const FALLBACK_TEMPLATES = {
  operation: (agentName) => `【发布运营全流程方案】

一、剪辑建议
1. 节奏控制：根据脚本文案把控视频节奏
2. BGM选择：选择与内容氛围匹配的背景音乐
3. 字幕样式：清晰醒目，关键信息突出显示

二、发布策略
1. 平台选择：抖音、快手、B站、小红书、视频号同步分发
2. 发布时间：参考行业最佳发布时间，工作日午休与晚间黄金档
3. 频率控制：保持稳定更新节奏，每日1-2条

三、运营要点
1. 积极回复评论，提升互动率
2. 利用SEO标签扩大曝光
3. 持续关注完播率、点赞率、转发率等核心指标`,

  readme: (agentName, keywords) => `【README作品说明】

作品名称：${keywords} - ${agentName}短视频脚本
作品类型：短视频脚本文案
适用平台：抖音、快手、B站、小红书、视频号
创作工具：AI全能剪辑脚本生成平台

使用须知：
1. 本脚本为AI辅助生成，建议结合实际需求调整
2. 遵守各平台内容规范
3. 脚本版权归生成者所有`,

  seo: (agentName, keywords) => `【SEO关键词标签库】

核心关键词：
#${keywords.replace(/[,，\s]+/g, ' #')}

话题标签：
#短视频 #${agentName} #原创内容 #热门话题

搜索优化词：
${keywords} 短视频 内容创作 爆款文案`
}

/**
 * 解析AI返回的原始文本，拆分为4份标准文档
 * @param {string} agentKey - Agent标识
 * @param {string} rawContent - AI返回的原始文本
 * @returns {{ script: string, operation: string, readme: string, seo: string }}
 */
exports.parseAndGenerate = (agentKey, rawContent) => {
  const agentName = getAgentName(agentKey)

  // 安全类型检查
  if (!rawContent || typeof rawContent !== 'string') {
    return emptyResult(agentName, '')
  }

  const trimmed = rawContent.trim()

  // 正则匹配四部分（支持多种变体写法）
  const scriptRe = /【核心主?脚?本文案】([\s\S]*?)(?=【发布运营|【README|【SEO|【SEO关键词|$)/i
  const opRe = /【发布运营全流程[方案文档指引]*】([\s\S]*?)(?=【README|【SEO|【SEO关键词|【核心|$)/i
  const readmeRe = /【README[作品说明文档]*】([\s\S]*?)(?=【SEO|【SEO关键词|【核心|【发布|$)/i
  const seoRe = /【SEO关键词[标签库库]*】([\s\S]*?)$/i

  const scriptMatch = trimmed.match(scriptRe)
  const opMatch = trimmed.match(opRe)
  const readmeMatch = trimmed.match(readmeRe)
  const seoMatch = trimmed.match(seoRe)

  // 提取各部分内容
  let script = cleanContent(scriptMatch ? scriptMatch[1] : '')
  let operation = cleanContent(opMatch ? opMatch[1] : '')
  let readme = cleanContent(readmeMatch ? readmeMatch[1] : '')
  let seo = cleanContent(seoMatch ? seoMatch[1] : '')

  // 兜底：如果完全没匹配到任何标记，说明AI没按格式输出
  const anyMatch = scriptMatch || opMatch || readmeMatch || seoMatch

  if (!anyMatch) {
    // 全文作为脚本文案，其余部分用模板填充
    script = trimmed
    operation = ''
    readme = ''
    seo = ''
  }

  // 对空白部分使用兜底模板
  if (!operation) {
    operation = FALLBACK_TEMPLATES.operation(agentName)
  }
  if (!readme) {
    const keywords = extractKeywords(trimmed)
    readme = FALLBACK_TEMPLATES.readme(agentName, keywords)
  }
  if (!seo) {
    const keywords = extractKeywords(trimmed)
    seo = FALLBACK_TEMPLATES.seo(agentName, keywords)
  }

  return { script, operation, readme, seo }
}

/**
 * 生成标准4份TXT文件的文件名
 * @param {string} agentKey
 * @returns {string[]}
 */
exports.getFileNames = (agentKey) => {
  return [
    `核心主脚本文案_${agentKey}.txt`,
    `发布运营全流程_${agentKey}.txt`,
    `README作品说明_${agentKey}.txt`,
    `SEO关键词标签库_${agentKey}.txt`
  ]
}

// ===== 内部工具 =====

function cleanContent(text) {
  return text
    .replace(/^[\s\n\r]+/, '')    // 去开头空白
    .replace(/[\s\n\r]+$/, '')    // 去结尾空白
    .trim()
}

function getAgentName(key) {
  const names = {
    oral: '口播干货', shop: '电商带货', flow: '信息流广告',
    drama: '达人剧情', clip: '影视混剪', emotion: '情感文案'
  }
  return names[key] || key
}

function emptyResult(agentName, keywords) {
  return {
    script: '',
    operation: FALLBACK_TEMPLATES.operation(agentName),
    readme: FALLBACK_TEMPLATES.readme(agentName, keywords),
    seo: FALLBACK_TEMPLATES.seo(agentName, keywords)
  }
}

// 从文本中尝试提取关键词
function extractKeywords(text) {
  // 尝试从"关键词"行提取
  const match = text.match(/关键词[：:]\s*(.+)/)
  return match ? match[1].trim() : '短视频'
}
