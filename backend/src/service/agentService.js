const axios = require('axios')
const LLMConfig = require('../model/LLMConfig')

// 六独立Agent实例
const agents = {
  oral: require('../agent/oralAgent'),
  shop: require('../agent/shopAgent'),
  flow: require('../agent/flowAgent'),
  drama: require('../agent/dramaAgent'),
  clip: require('../agent/clipAgent'),
  emotion: require('../agent/emotionAgent')
}

const VALID_AGENTS = Object.keys(agents)
const MAX_RETRIES = 2
const REQUEST_TIMEOUT = 300000

// ==================== LLM 配置缓存 ====================
let cachedLLM = null
let cacheTime = 0
const CACHE_TTL = 30000 // 30秒刷新一次

async function getActiveLLM() {
  const now = Date.now()
  if (cachedLLM && now - cacheTime < CACHE_TTL) return cachedLLM
  cachedLLM = await LLMConfig.findOne({ isActive: true }).lean()
  cacheTime = now
  return cachedLLM
}

// ==================== 生成入口 ====================
exports.generate = async (agentKey, params) => {
  if (!VALID_AGENTS.includes(agentKey)) {
    throw new Error(`无效的Agent: ${agentKey}`)
  }

  const agent = agents[agentKey]
  const normalizedParams = agent.normalizeParams(params)

  // 创意模式：creative.txt 作为通用基座，注入 Agent 类型和关键词
  let systemPrompt
  if (params.creativeMode) {
    const fs = require('fs'); const path = require('path')
    const creativeFP = path.join(__dirname, '../prompt/creative.txt')
    let baseCreative = fs.existsSync(creativeFP) ? fs.readFileSync(creativeFP, 'utf-8') : ''
    baseCreative = baseCreative
      .replace('{{AGENT_TYPE}}', agent.agentName)
      .replace('{{KEYWORDS}}', params.keywords || '')
    systemPrompt = baseCreative
  } else {
    systemPrompt = agent.getSystemPrompt()
  }

  const userPrompt = agent.buildUserPrompt(normalizedParams)
  const finalUserPrompt = params.creativeMode
    ? userPrompt + '\n\n【重要】以上是参考参数。\n请严格按照上面 System Prompt 中的【魔性互怼+人设反差+玩梗洗脑+轻种草】风格输出，内容必须围绕"{{AGENT_TYPE}} - {{KEYWORDS}}"。先用2-3个IP角色搞笑互怼玩梗，然后自然过渡到主题轻种草。全程口语化、快节奏、玩梗密集、不上价值不说教、让人想看完还想转发。'.replace('{{AGENT_TYPE}}', agent.agentName).replace('{{KEYWORDS}}', params.keywords || '')
    : userPrompt

  // 从DB读取当前激活的LLM配置
  const llm = await getActiveLLM()

  if (llm) {
    try {
      const result = await callLLMWithRetry(llm, systemPrompt, userPrompt, normalizedParams.maxTokens)
      return result
    } catch (err) {
      console.error(`LLM调用失败(${llm.provider}): ${err.message}, 降级模拟`)
    }
  }

  // 兜底模拟
  return { content: generateMockContent(agent, normalizedParams), tokensUsed: 0 }
}

exports.getAgent = (agentKey) => agents[agentKey] || null
exports.getAgentList = () => VALID_AGENTS.map(k => ({ key: k, name: agents[k].agentName }))

// 清除LLM缓存（切换供应商时调用）
exports.clearLLMCache = () => { cachedLLM = null; cacheTime = 0 }

// ==================== 通用LLM调用 ====================
async function callLLMWithRetry(llm, systemPrompt, userPrompt, maxTokens) {
  let lastError = null
  for (let i = 0; i <= MAX_RETRIES; i++) {
    try {
      return await callLLM(llm, systemPrompt, userPrompt, maxTokens)
    } catch (err) {
      lastError = err
      if (err.response?.status === 401) throw new Error('API Key 无效')
      if (err.response?.status === 429) throw new Error('请求过于频繁')
      if (i === MAX_RETRIES) break
      await sleep(1000 * (i + 1))
    }
  }
  throw new Error(`LLM调用失败: ${lastError.message}`)
}

async function callLLM(llm, systemPrompt, userPrompt, maxTokens) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]

  const body = {
    model: llm.model,
    messages,
    temperature: 0.8,
    max_tokens: maxTokens
  }

  const response = await axios.post(llm.apiUrl, body, {
    headers: {
      'Authorization': `Bearer ${llm.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: REQUEST_TIMEOUT
  })

  const choice = response.data?.choices?.[0]
  let content = choice?.message?.content

  // DeepSeek reasoning 模型：content 为空时取 reasoning_content
  if (!content && choice?.message?.reasoning_content) {
    content = choice.message.reasoning_content
  }

  if (!content) {
    // 检查是否是 DeepSeek 流式或其他格式
    content = response.data?.response || response.data?.text || ''
  }

  if (!content) throw new Error('API返回内容为空')

  const usage = response.data?.usage || {}
  return {
    content,
    tokensUsed: usage.total_tokens || 0,
    promptTokens: usage.prompt_tokens || 0,
    completionTokens: usage.completion_tokens || 0
  }
}

// ==================== 模拟数据 ====================
function generateMockContent(agent, params) {
  const name = agent.agentName; const kw = params.keywords; const wc = params.wordCount; const dur = params.duration
  return `【核心主脚本文案】【${name}】—— ${kw}\n大家好，今天我们来聊一聊${kw}。${generateMockBody(agent.agentKey, kw)}\n感谢观看！| 约${wc}字 ${dur}秒\n【发布运营全流程方案】\n一、剪辑/发布/运营指导（模拟数据）\n【README作品说明】\n作品：${kw}\n类型：${name}短视频脚本\n【SEO关键词标签库】\n#${kw.replace(/[,，\s]+/g, ' #')}\n#短视频 #${name}`
}

function generateMockBody(k, kw) {
  const b = { oral:`分享${kw}核心要点...`, shop:`${kw}产品测评来了！`, flow:`${kw}方案，必看！`, drama:`场景：办公室\n人物：小明\n关于${kw}的故事...`, clip:`"${kw}的意义..."`, emotion:`关于${kw}，深夜感悟...` }
  return b[k] || b.oral
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
