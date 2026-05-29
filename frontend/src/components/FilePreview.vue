<template>
  <div class="file-preview">
    <div class="state-box" v-if="loading">
      <van-loading size="40" vertical>AI 深度推理中</van-loading>
      <p class="state-sub">预计需要 20-90 秒</p>
    </div>
    <div class="state-box" v-if="!loading && !results">
      <van-empty description="在左侧配置参数后点击生成" />
    </div>
    <div class="preview-grid" v-if="results">
      <div class="preview-panel" v-for="doc in documents" :key="doc.key">
        <header class="panel-hdr">
          <span class="hdr-dot" :class="'dot-' + doc.key"></span>
          <span class="hdr-title">{{ doc.label }}</span>
          <van-button size="mini" plain type="primary" @click="copyText(doc.content)">复制</van-button>
        </header>
        <div class="panel-body"><pre class="panel-content">{{ doc.content || '暂无内容' }}</pre></div>
        <footer class="panel-ft">{{ countChars(doc.content) }} 字</footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { showSuccessToast, showToast } from 'vant'
const props = defineProps({ results: { type: Object, default: null }, loading: { type: Boolean, default: false } })
const documents = computed(() => {
  if (!props.results) return []
  return [
    { key:'script',label:'核心主脚本文案',content:props.results.script },
    { key:'operation',label:'发布运营全流程',content:props.results.operation },
    { key:'readme',label:'README 作品说明',content:props.results.readme },
    { key:'seo',label:'SEO 关键词标签库',content:props.results.seo }
  ]
})
const copyText = (t) => { if(!t) return; navigator.clipboard.writeText(t).then(()=>showSuccessToast('已复制')).catch(()=>showToast('复制失败')) }
const countChars = (t) => t ? t.replace(/\s/g,'').length : 0
</script>

<style scoped>
.file-preview { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px; min-height: 400px; }
.state-box { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 350px; gap: 8px; }
.state-sub { font-size: 12px; color: var(--text-muted); }

.preview-grid { display: grid; grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr); gap: 10px; height: calc(100vh - 200px); }
.preview-panel { border: 1px solid var(--border-color); border-radius: var(--radius-sm); overflow: hidden; display: flex; flex-direction: column; background: var(--bg-input); }
.panel-hdr { display: flex; justify-content: space-between; align-items: center; padding: 8px 14px; background: var(--bg-hover); border-bottom: 1px solid var(--border-color); flex-shrink: 0; }
.hdr-dot { width: 6px; height: 6px; border-radius: 50%; margin-right: 8px; }
.dot-script { background: var(--accent); } .dot-operation { background: var(--sage); } .dot-readme { background: var(--sky); } .dot-seo { background: var(--purple); }
.hdr-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.panel-body { flex: 1; padding: 12px 14px; overflow-y: auto; min-height: 0; }
.panel-content { font-size: 13px; line-height: 1.8; color: var(--text-primary); white-space: pre-wrap; word-break: break-word; margin: 0; }
.panel-ft { padding: 4px 14px; border-top: 1px solid var(--border-color); background: var(--bg-hover); text-align: right; font-size: 11px; color: var(--text-muted); flex-shrink: 0; }
</style>
