<template>
  <div class="admin-page">
    <van-nav-bar title="后台管理" left-arrow @click-left="$router.back()" />

    <van-tabs v-model:active="activeTab" sticky swipeable>
      <!-- ====== Prompt管理 ====== -->
      <van-tab title="Prompt">
        <div class="prompt-list">
          <div class="prompt-card" v-for="agent in agents" :key="agent.key">
            <div class="pcard-hdr">
              <van-tag :type="agent.color" size="medium">{{ agent.label }}</van-tag>
              <van-button size="small" plain type="primary" @click="openEdit(agent)">编辑</van-button>
            </div>
            <div class="pcard-preview">{{ agent.prompt.slice(0, 200) || '未设置 Prompt' }}{{ agent.prompt.length > 200 ? '...' : '' }}</div>
          </div>
        </div>
      </van-tab>

      <!-- ====== 统计（管理员详细） ====== -->
      <van-tab title="统计">
        <div class="stats-page">
          <!-- KPI -->
          <div class="stats-kpi">
            <div class="kpi-card"><div class="kpi-icon" style="background:#fdf2e9;"><ChartHistogramIcon size="16" fill="#d4914a"/></div><div class="kpi-val">{{ stats.total }}</div><div class="kpi-label">总生成</div></div>
            <div class="kpi-card"><div class="kpi-icon" style="background:#eaf6ed;"><CalendarIcon size="16" fill="#7a9e7e"/></div><div class="kpi-val">{{ stats.today }}</div><div class="kpi-label">今日</div></div>
            <div class="kpi-card"><div class="kpi-icon" style="background:#eef3f8;"><CalendarDotIcon size="16" fill="#6b8da8"/></div><div class="kpi-val">{{ stats.week }}</div><div class="kpi-label">本周</div></div>
            <div class="kpi-card"><div class="kpi-icon" style="background:#f5effa;"><TrendIcon size="16" fill="#8b7aaa"/></div><div class="kpi-val">{{ stats.month }}</div><div class="kpi-label">本月</div></div>
            <div class="kpi-card"><div class="kpi-icon" style="background:#fef3e2;"><PeoplesIcon size="16" fill="#6b8da8"/></div><div class="kpi-val">{{ stats.userCount || 0 }}</div><div class="kpi-label">注册用户</div></div>
          </div>

          <!-- 字数 -->
          <div class="stats-row2">
            <div class="word-card"><div class="word-icon"><EditTwoIcon size="18" fill="#9e9689"/></div><div><div class="word-val">{{ formatNum(stats.totalWords) }}</div><div class="word-lbl">累计生成字数</div></div></div>
            <div class="word-card"><div class="word-icon"><RulerIcon size="18" fill="#9e9689"/></div><div><div class="word-val">{{ stats.avgWords }}字</div><div class="word-lbl">平均单次字数</div></div></div>
          </div>

          <!-- Chart.js 7天趋势折线图 -->
          <div class="chart-box" v-if="stats.days7 && stats.days7.length">
            <div class="section-label"><TrendTwoIcon size="16" fill="#d4914a" style="vertical-align:middle;margin-right:4px;"/>近7天生成趋势</div>
            <LineChart :data="lineChartData" :options="lineChartOptions" class="chart-canvas" />
          </div>

          <!-- Agent分布柱状图 -->
          <div class="chart-box" v-if="stats.agents && Object.keys(stats.agents).length">
            <div class="section-label"><TargetIcon size="16" fill="#c97b6b" style="vertical-align:middle;margin-right:4px;"/>各Agent生成分布</div>
            <BarChart :data="barChartData" :options="barChartOptions" class="chart-canvas" />
          </div>

          <!-- API调用统计 -->
          <div class="section-label"><ApiIcon size="16" fill="#6b8da8" style="vertical-align:middle;margin-right:4px;"/>API 调用统计</div>
          <div class="stats-row2">
            <div class="word-card">
              <div class="word-icon"><TotalIcon size="18" fill="#d4914a"/></div>
              <div><div class="word-val">{{ formatNum(stats.apiCalls?.total || 0) }}</div><div class="word-lbl">总调用次数</div></div>
            </div>
            <div class="word-card">
              <div class="word-icon"><TodayIcon size="18" fill="#7a9e7e"/></div>
              <div><div class="word-val">{{ formatNum(stats.apiCalls?.today || 0) }}</div><div class="word-lbl">今日调用</div></div>
            </div>
          </div>

          <!-- 用户使用排名 -->
          <div class="chart-box" v-if="stats.topUsers && stats.topUsers.length">
            <div class="section-label"><PeoplesIcon size="16" fill="#6b8da8" style="vertical-align:middle;margin-right:4px;"/>用户使用排名 TOP 20</div>
            <div class="rank-table-wrap">
              <table class="rank-table">
                <thead><tr><th>#</th><th>用户ID</th><th>昵称</th><th>生成次数</th><th>总字数</th><th>最近使用</th></tr></thead>
                <tbody>
                  <tr v-for="u in stats.topUsers" :key="u.userId" :class="{ 'top3': u.rank <= 3 }">
                    <td class="rank-col">{{ u.rank <= 3 ? ['🥇','🥈','🥉'][u.rank-1] : u.rank }}</td>
                    <td>{{ u.userId }}</td>
                    <td>{{ u.nickname }}</td>
                    <td class="num-col">{{ u.count }}</td>
                    <td class="num-col">{{ formatNum(u.totalWords) }}</td>
                    <td>{{ formatTimeShort(u.lastGen) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- Token消耗排名 -->
          <div class="chart-box">
            <div class="section-label"><RankingIcon size="16" fill="#d4914a" style="vertical-align:middle;margin-right:4px;"/>Token 消耗排名 TOP 10</div>
            <div class="date-filter">
              <input type="date" v-model="rankStartDate" class="date-input" @change="refreshStats" />
              <span class="date-sep">至</span>
              <input type="date" v-model="rankEndDate" class="date-input" @change="refreshStats" />
              <van-button size="mini" plain v-if="rankStartDate || rankEndDate" @click="clearDateFilter">清除</van-button>
            </div>
            <div class="rank-table-wrap" v-if="stats.tokenRanking && stats.tokenRanking.length">
              <table class="rank-table">
                <thead><tr><th>#</th><th>用户</th><th>昵称</th><th>总Token</th><th>输入</th><th>输出</th><th>次数</th></tr></thead>
                <tbody>
                  <tr v-for="u in stats.tokenRanking" :key="'tk'+u.userId" :class="{ 'top3': u.rank <= 3 }">
                    <td class="rank-col">{{ u.rank <= 3 ? ['🥇','🥈','🥉'][u.rank-1] : u.rank }}</td>
                    <td>{{ u.userId }}</td>
                    <td>{{ u.nickname }}</td>
                    <td class="num-col">{{ formatNum(u.totalTokens) }}</td>
                    <td class="num-col">{{ formatNum(u.promptTokens) }}</td>
                    <td class="num-col">{{ formatNum(u.completionTokens) }}</td>
                    <td class="num-col">{{ u.count }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="empty-chart" v-else>暂无数据</div>
          </div>
        </div>
      </van-tab>

      <!-- ====== LLM 大模型 ====== -->
      <van-tab title="LLM">
        <div class="llm-tab">
          <!-- 当前激活的模型 -->
          <div class="llm-active-badge" v-if="activeLLM">
            <span class="dot"></span> 当前使用：{{ activeLLM.name }} ({{ activeLLM.model }})
          </div>

          <!-- 每张卡片 -->
          <div class="llm-card-new" v-for="llm in llmList" :key="llm._id" :class="{ active: llm.isActive }">
            <div class="llm-card-top">
              <div class="llm-card-left">
                <div class="llm-provider-badge" :class="'pvd-'+llm.provider">{{ llm.provider }}</div>
                <div class="llm-name">{{ llm.name }}</div>
              </div>
              <van-button v-if="!llm.isActive" size="small" type="primary" plain @click="activateLLM(llm)">启用</van-button>
              <van-tag v-else type="success">已激活</van-tag>
            </div>
            <div class="llm-card-meta">
              <div class="llm-row"><span class="llm-label">模型</span><span class="llm-val">{{ llm.model }}</span></div>
              <div class="llm-row"><span class="llm-label">地址</span><span class="llm-val ltruncate">{{ llm.apiUrl }}</span></div>
              <div class="llm-row"><span class="llm-label">Key</span><span class="llm-val ltruncate">{{ maskKey(llm.apiKey) }}</span></div>
            </div>
            <div class="llm-card-actions">
              <van-button size="small" plain @click="editLLMPop(llm)">编辑</van-button>
              <van-button size="small" plain type="danger" @click="delLLM(llm)">删除</van-button>
              <van-button size="small" plain :loading="llm._testing" @click="testConnect(llm)">测试连通</van-button>
            </div>
            <div class="llm-test-result" v-if="llm._testResult" :class="llm._testResult.success ? 'success' : 'fail'">
              {{ llm._testResult.success ? `连通正常 ${llm._testResult.elapsed} — ${llm._testResult.content}` : llm._testResult.error }}
            </div>
          </div>

          <!-- 添加新配置 -->
          <div class="llm-add-card">
            <div class="llm-card-top clickable" @click="showAddLLM = !showAddLLM">
              <div class="llm-card-left">
                <div class="llm-provider-badge pvd-new">新增</div>
                <div class="llm-name">{{ showAddLLM ? '收起表单' : '添加新的 LLM 配置' }}</div>
              </div>
              <span class="expand-icon">{{ showAddLLM ? '▲' : '▼' }}</span>
            </div>
            <div class="llm-add-form" v-if="showAddLLM">
              <van-field v-model="llmForm.name" label="名称" placeholder="DeepSeek V3" />
              <van-field v-model="llmForm.provider" label="供应商" placeholder="deepseek / openai / custom" />
              <van-field v-model="llmForm.apiUrl" label="API地址" placeholder="https://api.deepseek.com/v1/chat/completions" />
              <van-field v-model="llmForm.apiKey" label="API Key" placeholder="sk-..." />
              <van-field v-model="llmForm.model" label="模型" placeholder="deepseek-chat" />
              <van-button type="primary" block round @click="addLLM" :loading="addingLLM" style="margin-top:10px;">添加配置</van-button>
            </div>
          </div>

          <van-empty v-if="!llmList.length" description="暂无 LLM 配置" />
        </div>
      </van-tab>

      <!-- ====== 公告管理 ====== -->
      <van-tab title="公告">
        <div class="ann-list">
          <div class="ann-form-card">
            <div class="section-label">发布新公告</div>
            <van-field v-model="annForm.title" placeholder="公告标题" />
            <van-field v-model="annForm.content" type="textarea" rows="3" placeholder="公告内容" />
            <div class="ann-switch-row">
              <span>仅显示一次</span>
              <van-switch v-model="annForm.showOnce" size="20" />
            </div>
            <van-button type="primary" block round @click="publishAnn" style="margin-top:10px;">发布</van-button>
          </div>
          <div class="ann-card" v-for="a in announcements" :key="a.id">
            <div class="ann-hdr">
              <span class="ann-title">{{ a.title }}</span>
              <van-tag :type="a.showOnce ? '' : 'primary'" size="mini">{{ a.showOnce ? '一次性' : '每次显示' }}</van-tag>
            </div>
            <div class="ann-content">{{ a.content }}</div>
            <div class="ann-ft">
              <span class="ann-time">{{ formatTime(a.createdAt) }}</span>
              <van-button size="mini" plain type="danger" @click="delAnn(a)">下架</van-button>
            </div>
          </div>
          <van-empty v-if="!announcements.length" description="暂无公告" />
        </div>
      </van-tab>
    </van-tabs>

    <!-- Prompt编辑弹窗 -->
    <van-popup v-model:show="showEditor" position="bottom" :style="{ height: '85vh' }" round :close-on-click-overlay="false">
      <div class="editor-wrap">
        <div class="editor-toolbar">
          <span class="editor-title">{{ editingAgent?.label }} — Prompt 编辑</span>
          <van-button size="small" plain type="primary" @click="savePrompt" :loading="saving">保存</van-button>
        </div>
        <textarea v-model="editingPrompt" class="editor-area" placeholder="输入该 Agent 的系统 Prompt..."></textarea>
        <div class="editor-bottom-bar">
          <span class="editor-hint">{{ editingPrompt.length }} 字</span>
          <van-button type="primary" round size="small" @click="savePrompt" :loading="saving">保存</van-button>
          <van-button plain round size="small" @click="showEditor = false">取消</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { adminAPI, announceAPI } from '../api'
import { showSuccessToast, showFailToast, showToast } from 'vant'
import { Line as LineChart, Bar as BarChart } from 'vue-chartjs'
import { ChartHistogram as ChartHistogramIcon, Calendar as CalendarIcon, CalendarDot as CalendarDotIcon, Trend as TrendIcon, EditTwo as EditTwoIcon, Ruler as RulerIcon, TrendTwo as TrendTwoIcon, TargetTwo as TargetIcon, Peoples as PeoplesIcon, ApiApp as ApiIcon, ChartHistogram as TotalIcon, Time as TodayIcon, Ranking as RankingIcon } from '@icon-park/vue-next'
import {
  Chart as ChartJS,
  LineElement, BarElement, PointElement, ArcElement,
  CategoryScale, LinearScale, Title, Tooltip, Legend, Filler
} from 'chart.js'

ChartJS.register(LineElement, BarElement, PointElement, ArcElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler)

const activeTab = ref(0)

// --- Prompt管理 ---
const agents = ref([]); const showEditor = ref(false); const editingAgent = ref(null); const editingPrompt = ref(''); const saving = ref(false)

onMounted(async () => {
  try { const d = await adminAPI.getPrompts(); agents.value = (d.list || []).map(a => ({ ...a, color: agentColor(a.key) })) } catch {}
  try { Object.assign(stats, await adminAPI.getStats()) } catch {}
  try { const a = await announceAPI.getList(); announcements.value = a.list || [] } catch {}
  try { const l = await adminAPI.getLLMConfigs(); llmList.value = l.list || [] } catch {}
})
const openEdit = (a) => { editingAgent.value = a; editingPrompt.value = a.prompt; showEditor.value = true }
const savePrompt = async () => {
  if (!editingAgent.value) return; saving.value = true
  try { await adminAPI.updatePrompt(editingAgent.value.key, { prompt: editingPrompt.value }); editingAgent.value.prompt = editingPrompt.value; showSuccessToast('已保存'); showEditor.value = false } catch (err) { showFailToast(err.message) } finally { saving.value = false }
}
const agentColor = (k) => ({ oral: 'primary', shop: 'danger', flow: 'warning', drama: '', clip: 'success', emotion: '' }[k] || '')

// --- 统计 ---
const stats = reactive({ total: 0, today: 0, week: 0, month: 0, totalWords: 0, avgWords: 0, agents: {}, days7: [], topUsers: [] })

const has7DayData = computed(() => (stats.days7 || []).some(d => d.count > 0))
const hasAgentData = computed(() => Object.keys(stats.agents || {}).length > 0)
const hasUserData = computed(() => (stats.topUsers || []).length > 0)

const lineChartData = computed(() => ({
  labels: (stats.days7 || []).map(d => d.date),
  datasets: [{ label: '生成次数', data: (stats.days7 || []).map(d => d.count), borderColor: '#d4914a', backgroundColor: 'rgba(212,145,74,0.1)', fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#d4914a' }]
}))
const lineChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }

const barChartData = computed(() => {
  const labels = { oral: '口播', shop: '电商', flow: '广告', drama: '剧情', clip: '混剪', emotion: '情感' }
  const colors = ['#d4914a', '#c97b6b', '#e0a84c', '#8b7aaa', '#7a9e7e', '#6b8da8']
  const keys = Object.keys(stats.agents || {})
  return {
    labels: keys.map(k => labels[k] || k),
    datasets: [{ label: '生成次数', data: keys.map(k => stats.agents[k]), backgroundColor: keys.map((k, i) => colors[i] || '#ccc'), borderRadius: 4 }]
  }
})
const barChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }

// 日期筛选
const rankStartDate = ref('')
const rankEndDate = ref('')
const refreshStats = async () => {
  const params = {}
  if (rankStartDate.value) params.startDate = rankStartDate.value
  if (rankEndDate.value) params.endDate = rankEndDate.value
  try { Object.assign(stats, await adminAPI.getRankedStats(params)) } catch {}
}
const clearDateFilter = () => { rankStartDate.value = ''; rankEndDate.value = ''; refreshStats() }

// --- 公告 ---
const announcements = ref([])
const annForm = reactive({ title: '', content: '', showOnce: false })
const publishAnn = async () => {
  if (!annForm.title.trim() || !annForm.content.trim()) { showToast('标题和内容不能为空'); return }
  try {
    await adminAPI.createAnnouncement({ title: annForm.title, content: annForm.content, showOnce: annForm.showOnce })
    showSuccessToast('已发布'); annForm.title = ''; annForm.content = ''; annForm.showOnce = false
    const a = await announceAPI.getList(); announcements.value = a.list || []
  } catch (err) { showFailToast(err.message) }
}
const delAnn = async (a) => { try { await adminAPI.deleteAnnouncement(a.id); showSuccessToast('已下架'); announcements.value = announcements.value.filter(x => x.id !== a.id) } catch (err) { showFailToast(err.message) } }

// --- LLM 管理 ---
const llmList = ref([])
const activeLLM = computed(() => llmList.value.find(l => l.isActive))
const showAddLLM = ref(false)
const addingLLM = ref(false)
const testingId = ref(null)
const testResult = ref(null)
const llmForm = reactive({ name: '', provider: 'custom', apiUrl: '', apiKey: '', model: '' })

const maskKey = (key) => key ? key.slice(0, 6) + '****' + key.slice(-4) : ''
const addLLM = async () => {
  if (!llmForm.name || !llmForm.apiUrl || !llmForm.apiKey || !llmForm.model) { showToast('请填写完整'); return }
  addingLLM.value = true
  try {
    await adminAPI.createLLMConfig({ ...llmForm })
    showSuccessToast('已添加'); llmForm.name = ''; llmForm.apiUrl = ''; llmForm.apiKey = ''; llmForm.model = ''; showAddLLM.value = false
    const l = await adminAPI.getLLMConfigs(); llmList.value = l.list || []
  } catch (err) { showFailToast(err.message) } finally { addingLLM.value = false }
}
const editLLMPop = (llm) => { llmForm.name = llm.name; llmForm.apiUrl = llm.apiUrl; llmForm.apiKey = llm.apiKey; llmForm.model = llm.model; llmForm.provider = llm.provider; showAddLLM.value = true; delLLM(llm) }
const delLLM = async (llm) => { if (!llm._id) return; try { await adminAPI.deleteLLMConfig(llm._id); showSuccessToast('已删除'); const l = await adminAPI.getLLMConfigs(); llmList.value = l.list || [] } catch (err) { showFailToast(err.message) } }
const activateLLM = async (llm) => { try { await adminAPI.activateLLMConfig(llm._id); showSuccessToast('已切换'); const l = await adminAPI.getLLMConfigs(); llmList.value = l.list || [] } catch (err) { showFailToast(err.message) } }
const testConnect = async (llm) => {
  llm._testing = true; llm._testResult = null
  try {
    llm._testResult = await adminAPI.testLLM({ apiUrl: llm.apiUrl, apiKey: llm.apiKey, model: llm.model })
  } catch {
    llm._testResult = { success: false, error: '测试请求失败' }
  }
  llm._testing = false
  // Force reactability for dynamic props
  const idx = llmList.value.findIndex(l => l._id === llm._id)
  if (idx >= 0) llmList.value.splice(idx, 1, { ...llm })
}

const formatNum = n => n >= 10000 ? (n / 10000).toFixed(1) + '万' : n.toLocaleString()
const formatTime = (iso) => iso ? `${new Date(iso).getMonth() + 1}/${new Date(iso).getDate()} ${String(new Date(iso).getHours()).padStart(2, '0')}:${String(new Date(iso).getMinutes()).padStart(2, '0')}` : ''
const formatTimeShort = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso); const now = new Date()
  const diff = Math.floor((now - d) / 86400000)
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  if (diff < 7) return diff + '天前'
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<style scoped>
.admin-page { min-height: 100vh; background: var(--bg-page); }

/* Prompt */
.prompt-list { padding: 12px; }
.prompt-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; margin-bottom: 10px; }
.pcard-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.pcard-preview { font-size: 13px; color: var(--text-secondary); padding: 10px; background: var(--bg-input); border-radius: var(--radius-sm); white-space: pre-wrap; max-height: 100px; overflow: hidden; line-height: 1.5; }

/* Stats */
.stats-page { padding: 12px; padding-bottom: 40px; }
.stats-kpi { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 12px; }
.kpi-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px 14px; text-align: center; }
.kpi-icon { width: 32px; height: 32px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 8px; }
.kpi-val { font-size: 28px; font-weight: 700; color: var(--text-primary); }
.kpi-label { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.stats-row2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }
.word-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; display: flex; align-items: center; gap: 12px; }
.word-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 32px; height: 32px; border-radius: 8px; background: var(--bg-input); }
.word-val { font-size: 18px; font-weight: 700; color: var(--text-primary); }
.word-lbl { font-size: 11px; color: var(--text-muted); }
.section-label { font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 0 0 8px; }

.chart-box { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; margin-bottom: 12px; position: relative; overflow: hidden; }
.chart-canvas { width: 100% !important; height: 220px !important; max-height: 220px; }
.chart-canvas-sm { width: 100% !important; height: 200px !important; max-height: 200px; max-width: 280px; margin: 0 auto; }

/* 排名表格 */
.rank-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.date-filter {
  display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
}
.date-input {
  padding: 6px 10px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);
  background: var(--bg-input); color: var(--text-primary); font-size: 12px; outline: none;
}
.date-sep { font-size: 12px; color: var(--text-muted); }
.rank-table { width: 100%; border-collapse: collapse; font-size: 12px; min-width: 500px; }
.rank-table th, .rank-table td { padding: 8px 10px; border-bottom: 1px solid var(--border-color); text-align: left; white-space: nowrap; }
.rank-table th { font-weight: 600; color: var(--text-secondary); font-size: 11px; }
.rank-table td { color: var(--text-primary); }
.rank-table .top3 td { background: rgba(212,145,74,0.04); font-weight: 600; }
.rank-col { font-size: 16px; text-align: center !important; width: 32px; }
.num-col { font-weight: 600; color: var(--accent) !important; }

/* LLM配置 */
.llm-tab { padding: 12px; }
.llm-active-badge {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; margin-bottom: 14px;
  background: rgba(122,158,126,0.1); border: 1px solid rgba(122,158,126,0.2);
  border-radius: var(--radius-sm); font-size: 13px; color: var(--sage);
}
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--sage); }
.llm-card-new {
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px; transition: border-color 0.2s;
}
.llm-card-new.active { border-color: var(--sage); box-shadow: 0 0 0 1px rgba(122,158,126,0.1); }
.llm-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.llm-card-left { display: flex; flex-direction: column; gap: 6px; }
.llm-provider-badge {
  display: inline-block; padding: 2px 10px; border-radius: 20px;
  font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; width: fit-content;
}
.pvd-mimo { background: rgba(0,240,255,0.1); color: #00a8b5; }
.pvd-deepseek { background: rgba(79,70,229,0.1); color: #4f46e5; }
.pvd-openai { background: rgba(16,163,127,0.1); color: #10a37f; }
.pvd-custom { background: var(--accent-soft); color: var(--accent); }
.pvd-new { background: rgba(122,158,126,0.1); color: var(--sage); }
.llm-name { font-weight: 600; color: var(--text-primary); font-size: 15px; }
.llm-card-meta { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.llm-row { display: flex; gap: 8px; font-size: 13px; }
.llm-label { color: var(--text-muted); min-width: 36px; flex-shrink: 0; }
.llm-val { color: var(--text-secondary); word-break: break-all; }
.ltruncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 260px; }
.llm-card-actions { display: flex; gap: 6px; }
.llm-test-result { margin-top: 10px; padding: 8px 12px; border-radius: var(--radius-sm); font-size: 12px; }
.llm-test-result.success { background: rgba(122,158,126,0.08); color: var(--sage); }
.llm-test-result.fail { background: rgba(201,123,107,0.08); color: var(--rose); }
.llm-add-card { background: var(--bg-card); border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px; }
.llm-card-top.clickable { cursor: pointer; }
.expand-icon { font-size: 12px; color: var(--text-muted); }
.llm-add-form { margin-top: 14px; background: var(--bg-input); border-radius: var(--radius-sm); padding: 8px; }

/* Announcements */
.ann-list { padding: 12px; }
.ann-form-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; margin-bottom: 12px; }
.ann-switch-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; font-size: 13px; color: var(--text-secondary); }
.ann-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; margin-bottom: 10px; }
.ann-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.ann-title { font-weight: 600; color: var(--text-primary); font-size: 15px; }
.ann-content { font-size: 13px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 8px; white-space: pre-wrap; }
.ann-ft { display: flex; justify-content: space-between; align-items: center; }
.ann-time { font-size: 11px; color: var(--text-muted); }

/* Editor */
.editor-wrap { display: flex; flex-direction: column; height: 100%; background: var(--bg-surface); border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
.editor-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--border-color); flex-shrink: 0; }
.editor-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.editor-area { flex: 1; width: 100%; padding: 16px; border: none; outline: none; resize: none; font-size: 13px; line-height: 1.8; color: var(--text-primary); background: var(--bg-page); font-family: monospace; min-height: 0; overflow-y: auto; }
.editor-area::placeholder { color: var(--text-muted); }
.editor-bottom-bar { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-top: 1px solid var(--border-color); background: var(--bg-surface); flex-shrink: 0; }
.editor-hint { flex: 1; font-size: 12px; color: var(--text-muted); }
</style>
