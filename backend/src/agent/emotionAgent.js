// 情感文案Agent
const BaseAgent = require('./baseAgent')

class EmotionAgent extends BaseAgent {
  constructor() { super('emotion') }

  normalizeParams(params) {
    return {
      ...super.normalizeParams(params),
      wordCount: params.wordCount || 300,
      duration: params.duration || 30
    }
  }

  buildUserPrompt(params) {
    const base = super.buildUserPrompt(params)
    return base + '\n\n情感文案额外要求：\n- 文字优美有画面感\n- 短句为主每句独立成段\n- 可选治愈/伤感/深夜感悟风格\n- 适配慢节奏氛围画面\n- 提供配乐风格和字幕设计建议'
  }
}

module.exports = new EmotionAgent()
