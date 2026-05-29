// 口播干货Agent
const BaseAgent = require('./baseAgent')

class OralAgent extends BaseAgent {
  constructor() { super('oral') }

  normalizeParams(params) {
    return {
      ...super.normalizeParams(params),
      wordCount: params.wordCount || 800,   // 口播类偏长
      duration: params.duration || 90       // 默认90秒
    }
  }

  buildUserPrompt(params) {
    const base = super.buildUserPrompt(params)
    return base + '\n\n口播文案额外要求：\n- 口语化强，适合真人朗读\n- 每句不超过25字\n- 开头3秒内抓住注意力\n- 结尾有明确互动引导'
  }
}

module.exports = new OralAgent()
