// 信息流广告Agent
const BaseAgent = require('./baseAgent')

class FlowAgent extends BaseAgent {
  constructor() { super('flow') }

  normalizeParams(params) {
    return {
      ...super.normalizeParams(params),
      wordCount: params.wordCount || 300,
      duration: params.duration || 30     // 信息流广告最短
    }
  }

  buildUserPrompt(params) {
    const base = super.buildUserPrompt(params)
    return base + '\n\n信息流广告额外要求：\n- 前3秒强钩子\n- 痛点刺激+解决方案\n- 包含A/B测试两个版本开头\n- 强行动号召CTA结尾\n- 适配付费投放素材规范'
  }
}

module.exports = new FlowAgent()
