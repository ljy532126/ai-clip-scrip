// 影视混剪Agent
const BaseAgent = require('./baseAgent')

class ClipAgent extends BaseAgent {
  constructor() { super('clip') }

  normalizeParams(params) {
    return {
      ...super.normalizeParams(params),
      wordCount: params.wordCount || 400,
      duration: params.duration || 45
    }
  }

  buildUserPrompt(params) {
    const base = super.buildUserPrompt(params)
    return base + '\n\n混剪文案额外要求：\n- 情感充沛氛围感强\n- 与画面节奏匹配\n- 提供BGM风格推荐\n- 标注情绪基调（燃/虐/暖）\n- 字幕出现时间节点建议'
  }
}

module.exports = new ClipAgent()
