// 达人剧情Agent
const BaseAgent = require('./baseAgent')

class DramaAgent extends BaseAgent {
  constructor() { super('drama') }

  normalizeParams(params) {
    return {
      ...super.normalizeParams(params),
      wordCount: params.wordCount || 600,
      duration: params.duration || 60
    }
  }

  buildUserPrompt(params) {
    const base = super.buildUserPrompt(params)
    return base + '\n\n剧情文案额外要求：\n- 标准剧本格式（场景+人物+对话+动作）\n- 有起伏反转\n- 对话自然性格鲜明\n- 结尾有记忆点'
  }
}

module.exports = new DramaAgent()
