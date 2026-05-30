// Agent基类 - 所有Agent的公共逻辑
// 6个Agent各自独立继承，互不干扰

class BaseAgent {
  constructor(agentKey) {
    this.agentKey = agentKey
    this.agentName = this._getAgentName()
  }

  // --- 子类必须/可选重写 ---

  // 各Agent独立的System Prompt（优先从DB读，否则从文件读）
  getSystemPrompt() {
    const fs = require('fs')
    const path = require('path')
    const promptPath = path.join(__dirname, '../prompt', `${this.agentKey}.txt`)
    try {
      if (fs.existsSync(promptPath)) {
        const content = fs.readFileSync(promptPath, 'utf-8').trim()
        if (content) return content
      }
    } catch {}
    return this._defaultPrompt()
  }

  // 各Agent独立的参数标准化
  normalizeParams(params) {
    const detail = params.detail || 'standard'
    const detailConfig = detailLevels[detail] || detailLevels.standard
    const wordCount = params.wordCount || detailConfig.wordCount
    return {
      keywords: params.keywords || '',
      duration: params.duration || 60,
      styles: params.styles || [params.style || 'professional'],
      wordCount,
      detail,
      maxTokens: detailConfig.maxTokens
    }
  }

  // 各Agent独立的User Prompt构造
  buildUserPrompt(params) {
    const p = this.normalizeParams(params)
    const styleNames = p.styles.map(s => styleMap[s] || s).join('+')
    const detailHint = detailHints[p.detail] || ''
    return [
      `请根据以下参数生成短视频文案：`,
      `- 行业类型：${this.agentName}`,
      `- 关键词：${p.keywords}`,
      `- 视频时长：${p.duration}秒`,
      `- 文案风格：${styleNames}`,
      `- 字数范围：${p.wordCount}字左右`,
      `- 详细程度：${p.detail}${detailHint}`,
      ``,
      `请严格按照以下4个部分输出，用【】标记标题：`,
      ``,
      `【核心主脚本文案】`,
      `完整脚本内容`,
      ``,
      `【发布运营全流程方案】`,
      `剪辑+发布+运营指导`,
      ``,
      `【README作品说明】`,
      `作品简介、用途、使用须知`,
      ``,
      `【SEO关键词标签库】`,
      `相关关键词和话题标签`
    ].join('\n')
  }

  // Agent标识
  getKey() { return this.agentKey }

  // --- 内部 ---

  _getAgentName() {
    const names = {
      oral: '口播干货', shop: '电商带货', flow: '信息流广告',
      drama: '达人剧情', clip: '影视混剪', emotion: '情感文案'
    }
    return names[this.agentKey] || this.agentKey
  }

  _defaultPrompt() {
    const defaults = {
      oral: '你是一个敢说真话的口播博主。每条文案必须带个人观点、行业真相、犀利吐槽。禁用"大家好""希望对你有帮助"等模板化开头。',
      shop: '你是一个揭露行业内幕的电商老炮。每条文案必须带成本分析、竞品对比、避坑指南。禁用"种草""推荐""真的很好用"等空洞用语。',
      flow: '你是一个操盘千万级广告费的投手。每条文案必须有数据、有潜规则揭露、有A/B版分型。禁用"重磅消息""震撼来袭"等低级营销话术。',
      drama: '你是一个写真实生活的野生编剧。每条剧本必须有社会洞察、刺痛金句、真实对话感。禁用正能量说教、巧合反转、书面化台词。',
      clip: '你是一个敢骂烂片的剪刀手。每条文案必须有行业批判、个人影史观、精准画面匹配。禁用"燃爆了""泪目""回忆杀"等评论区用语。',
      emotion: '你是一个从低谷爬出来的情感博主。每条文案必须有具体场景、颠覆鸡汤的洞察、留白银句。禁用"愿你""希望""生活总会好起来"等许愿池文风。'
    }
    return defaults[this.agentKey] || ''
  }
}

// 风格中文映射
const styleMap = {
  professional: '专业严谨',
  humorous: '轻松幽默',
  emotional: '感性文艺',
  concise: '简洁有力',
  enthusiastic: '激情澎湃',
  storytelling: '故事叙述',
  suspense: '悬念反转',
  inspiring: '励志向上',
  nostalgic: '怀旧复古',
  trendy: '潮流时尚'
}

// 详细程度配置
const detailLevels = {
  standard: { wordCount: 500, maxTokens: 16000 },
  detailed: { wordCount: 1200, maxTokens: 24000 },
  ultra: { wordCount: 2500, maxTokens: 40000 }
}

const detailHints = {
  standard: '',
  detailed: '\n请输出更详细完整的内容，每个部分都要有充分的细节和实例。核心文案需包含完整开场+主体+结尾。运营方案需包含具体步骤、时间安排、注意事项。README需包含完整的作品分析和使用指南。SEO需包含丰富的关键词分类。',
  ultra: '\n请输出最全面、最详尽、最专业的版本。核心脚本文案必须包含：完整开场白、详细分点论述（每点展开说明+案例）、过渡段落、总结升华、互动引导。运营方案必须包含：分阶段的完整运营策略、多平台差异化发布方案、数据分析指标、长期运营规划。README必须包含：深度作品分析、详细使用指南、适用场景说明、注意事项清单。SEO必须包含：所有相关核心词、长尾词、话题标签、搜索优化建议、内容标签体系。全文字数不能少于2500字。'
}

module.exports = BaseAgent
