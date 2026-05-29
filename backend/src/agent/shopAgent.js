// 电商带货Agent
const BaseAgent = require('./baseAgent')

class ShopAgent extends BaseAgent {
  constructor() { super('shop') }

  normalizeParams(params) {
    return {
      ...super.normalizeParams(params),
      wordCount: params.wordCount || 400,   // 电商文案短小精悍
      duration: params.duration || 45
    }
  }

  buildUserPrompt(params) {
    const base = super.buildUserPrompt(params)
    return base + '\n\n电商文案额外要求：\n- 痛点切入引发共鸣\n- 产品卖点清晰\n- 使用前后对比\n- 转化型结尾引导购买'
  }
}

module.exports = new ShopAgent()
