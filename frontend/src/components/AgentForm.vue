<template>
  <div class="agent-form">
    <!-- Agent选择 -->
    <div class="form-section">
      <div class="section-label">行业 Agent</div>
      <div class="agent-select">
        <div v-for="a in agents" :key="a.key" class="agent-chip" :class="{ active: form.agent === a.key }" @click="form.agent = a.key">
          <component :is="a.icon" size="20" :fill="form.agent === a.key ? '#d4914a' : '#6b6255'"/>
          <span class="chip-name">{{ a.name }}</span>
        </div>
      </div>
    </div>

    <!-- 关键词 -->
    <div class="form-section">
      <div class="section-label">内容关键词</div>
      <van-field v-model="form.keywords" type="textarea" rows="2" :placeholder="keywordPlaceholder" />
    </div>

    <!-- 时长 -->
    <div class="form-section">
      <div class="section-label">视频时长</div>
      <div class="duration-row">
        <van-stepper v-model="form.duration" min="15" max="300" step="15" />
        <span class="hint">{{ formatDuration(form.duration) }}</span>
      </div>
    </div>

    <!-- 详细程度 -->
    <div class="form-section">
      <div class="section-label">详细程度</div>
      <div class="detail-row">
        <div v-for="d in detailOptions" :key="d.value" class="detail-chip" :class="{ active: form.detail === d.value }" @click="form.detail = d.value">
          <span class="detail-name">{{ d.label }}</span><span class="detail-meta">{{ d.desc }} · {{ d.time }}</span>
        </div>
      </div>
    </div>

    <!-- 风格多选 -->
    <div class="form-section">
      <div class="section-label">文案风格 · 可多选</div>
      <div class="style-grid">
        <div v-for="s in styleOptions" :key="s.value" class="style-chip" :class="{ active: form.styles.includes(s.value) }" @click="toggleStyle(s.value)">{{ s.text }}</div>
      </div>
      <div class="selected-tags" v-if="form.styles.length">
        <span v-for="sv in form.styles" :key="sv" class="tag" @click="removeStyle(sv)">{{ styleLabel(sv) }} <b>×</b></span>
      </div>
    </div>

    <!-- 字数 -->
    <div class="form-section">
      <div class="section-label">字数 · {{ form.wordCount }}字</div>
      <van-slider v-model="form.wordCount" :min="100" :max="5000" :step="100" bar-height="4px" />
    </div>

    <!-- 额外开关 -->
    <div class="form-section">
      <div class="switch-row">
        <label class="switch-item"><span>中英双语</span><van-switch v-model="form.bilingual" size="22" /></label>
        <label class="switch-item"><span>敏感词过滤</span><van-switch v-model="form.filterSensitive" size="22" /></label>
      </div>
    </div>

    <!-- 生成按钮 -->
    <van-button type="primary" block round size="large" :loading="loading" :disabled="!form.keywords.trim()" @click="onSubmit">
      {{ loading ? 'AI 正在生成...' : '开始生成' }}
    </van-button>

    <!-- 进度 -->
    <div class="progress-box" v-if="loading">
      <van-progress :percentage="progressPercent" stroke-width="4" :show-pivot="false" />
      <div class="progress-info">
        <span class="progress-stage">{{ progressStage }}</span>
        <span class="progress-timer">{{ elapsed }}s / ~{{ estimateTime }}s</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, watch, onUnmounted } from 'vue'
import { VolumeNotice, ShoppingMall, AdProduct, Movie, Clue, EmotionHappy } from '@icon-park/vue-next'
import { useGenerateStore } from '../store'
const emit = defineEmits(['submit'])
const props = defineProps({ loading: { type: Boolean, default: false } })
const generateStore = useGenerateStore()

const elapsed = ref(0); const progressPercent = ref(0); const progressStage = ref('')
let timer = null; let progressTimer = null

watch(() => props.loading, (val) => {
  if (val) {
    elapsed.value = 0; progressPercent.value = 0; progressStage.value = '构建 Prompt...'
    timer = setInterval(() => elapsed.value++, 1000)
    const step = (estimateTime.value * 1000) / 100
    progressTimer = setInterval(() => {
      if (progressPercent.value < 95) {
        progressPercent.value += 1
        if (progressPercent.value < 20) progressStage.value = '构建 Prompt...'
        else if (progressPercent.value < 50) progressStage.value = 'AI 深度推理中...'
        else if (progressPercent.value < 85) progressStage.value = '解析拆分文档...'
        else progressStage.value = '即将完成...'
      }
    }, step)
  } else {
    progressPercent.value = 100; progressStage.value = '生成完成'
    clearInterval(timer); clearInterval(progressTimer)
    setTimeout(() => { elapsed.value = 0; progressPercent.value = 0 }, 1500)
  }
})
onUnmounted(() => { clearInterval(timer); clearInterval(progressTimer) })

const agents = [
  { key:'oral',name:'口播干货',icon:VolumeNotice},{ key:'shop',name:'电商带货',icon:ShoppingMall},{ key:'flow',name:'信息流广告',icon:AdProduct},
  { key:'drama',name:'达人剧情',icon:Movie},{ key:'clip',name:'影视混剪',icon:Clue},{ key:'emotion',name:'情感文案',icon:EmotionHappy }
]
const styleOptions = [
  { text:'专业严谨',value:'professional'},{ text:'轻松幽默',value:'humorous'},{ text:'感性文艺',value:'emotional'},
  { text:'简洁有力',value:'concise'},{ text:'激情澎湃',value:'enthusiastic'},{ text:'故事叙述',value:'storytelling'},
  { text:'悬念反转',value:'suspense'},{ text:'励志向上',value:'inspiring'},{ text:'怀旧复古',value:'nostalgic'},{ text:'潮流时尚',value:'trendy' }
]
const detailOptions = [
  { value:'standard',label:'标准',desc:'500字',time:'20-30s'},{ value:'detailed',label:'详细',desc:'1200字',time:'40-60s'},{ value:'ultra',label:'超详细',desc:'2500字+',time:'60-90s' }
]

const form = reactive({
  agent: generateStore.currentAgent, keywords: '', duration: 60, detail: 'standard',
  styles: ['professional'], wordCount: 500, bilingual: false, filterSensitive: true
})
const estimateTime = computed(() => ({ standard:25, detailed:50, ultra:80 }[form.detail] || 25))

const keywordPlaceholder = computed(() => {
  const t = { oral:'输入主题，如：职场沟通、手机摄影...', shop:'输入产品，如：蓝牙耳机、素颜霜...', flow:'输入内容，如：APP推广、课程广告...', drama:'输入主题，如：办公室日常、情侣...', clip:'输入影视，如：甄嬛传、火影忍者...', emotion:'输入主题，如：深夜emo、治愈语录...' }
  return t[form.agent] || '输入关键词...'
})
const toggleStyle = (v) => { const i = form.styles.indexOf(v); if (i>=0) { if (form.styles.length>1) form.styles.splice(i,1) } else form.styles.push(v) }
const removeStyle = (v) => { if (form.styles.length>1) form.styles = form.styles.filter(s => s!==v) }
const styleLabel = (v) => (styleOptions.find(o=>o.value===v)||{}).text||v
const formatDuration = (s) => { const m=Math.floor(s/60); const sec=s%60; return m>0?`${m}分${sec||''}秒`:`${sec}秒` }
const onSubmit = () => {
  if (!form.keywords.trim() || props.loading) return
  const { agent,keywords,duration,detail,styles,wordCount,bilingual,filterSensitive } = form
  emit('submit', { agent,keywords:keywords.trim(),duration,detail,styles,wordCount,bilingual,filterSensitive })
}
</script>

<style scoped>
.agent-form { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; }
.form-section { margin-bottom: 16px; }
.section-label { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }

.agent-select { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.agent-chip { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 10px 4px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); cursor: pointer; font-size: 11px; text-align: center; background: var(--bg-input); transition: all 0.2s; }
.agent-chip.active { border-color: var(--accent); background: var(--accent-soft); }
.chip-icon { font-size: 20px; } .chip-name { font-weight: 500; color: var(--text-primary); }

.duration-row { display: flex; align-items: center; gap: 12px; }
.hint { font-size: 13px; color: var(--text-muted); }

.detail-row { display: flex; flex-direction: column; gap: 6px; }
.detail-chip { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); cursor: pointer; background: var(--bg-input); transition: all 0.2s; }
.detail-chip.active { border-color: var(--accent); background: var(--accent-soft); }
.detail-name { font-weight: 600; color: var(--text-primary); font-size: 13px; }
.detail-meta { font-size: 11px; color: var(--text-muted); }

.style-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.style-chip { padding: 7px 4px; text-align: center; border-radius: var(--radius-sm); border: 1px solid var(--border-color); cursor: pointer; font-size: 12px; transition: all 0.2s; background: var(--bg-input); color: var(--text-secondary); }
.style-chip.active { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
.selected-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.tag { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; background: var(--accent-soft); color: var(--accent); font-size: 11px; cursor: pointer; border: 1px solid rgba(212,145,74,0.2); }

.switch-row { display: flex; gap: 16px; }
.switch-item { flex: 1; display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; background: var(--bg-input); border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: 13px; color: var(--text-secondary); }

.progress-box { margin-top: 14px; }
.progress-info { display: flex; justify-content: space-between; margin: 6px 0; font-size: 12px; }
.progress-stage { color: var(--accent); }
.progress-timer { color: var(--text-muted); }
</style>
