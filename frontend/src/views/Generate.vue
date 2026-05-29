<template>
  <div class="generate-page">
    <van-nav-bar title="脚本生成" left-arrow @click-left="$router.back()" />

    <div class="generate-layout">
      <div class="config-panel">
        <AgentForm :loading="generateStore.generating" @submit="handleGenerate" />
      </div>
      <div class="preview-panel">
        <div class="preview-desktop">
          <FilePreview :results="generateStore.results" :loading="generateStore.generating" />
        </div>
        <div class="preview-mobile">
          <van-tabs v-model:active="activeTab" v-if="generateStore.results">
            <van-tab title="核心文案"><div class="tab-content"><pre class="panel-text">{{ generateStore.results.script || '暂无内容' }}</pre></div></van-tab>
            <van-tab title="运营方案"><div class="tab-content"><pre class="panel-text">{{ generateStore.results.operation || '暂无内容' }}</pre></div></van-tab>
            <van-tab title="作品说明"><div class="tab-content"><pre class="panel-text">{{ generateStore.results.readme || '暂无内容' }}</pre></div></van-tab>
            <van-tab title="SEO标签"><div class="tab-content"><pre class="panel-text">{{ generateStore.results.seo || '暂无内容' }}</pre></div></van-tab>
          </van-tabs>
          <div class="mobile-status" v-else>
            <van-loading v-if="generateStore.generating" size="40" vertical>AI正在生成脚本...</van-loading>
            <van-empty v-else description="输入关键词，开始生成脚本" />
          </div>
        </div>
      </div>
    </div>

    <div class="download-bar" v-if="generateStore.results">
      <DownloadBtn :files="generateStore.results" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGenerateStore } from '../store'
import { generateAPI } from '../api'
import { showToast, showFailToast } from 'vant'
import AgentForm from '../components/AgentForm.vue'
import FilePreview from '../components/FilePreview.vue'
import DownloadBtn from '../components/DownloadBtn.vue'
const generateStore = useGenerateStore()
const activeTab = ref(0)
const handleGenerate = async (params) => {
  generateStore.setGenerating(true); activeTab.value = 0
  try {
    const data = await generateAPI.generate({
      agent: params.agent || generateStore.currentAgent, keywords: params.keywords,
      duration: params.duration, detail: params.detail || 'standard',
      styles: params.styles, style: params.styles?.[0] || 'professional',
      wordCount: params.wordCount, bilingual: params.bilingual, filterSensitive: params.filterSensitive
    })
    generateStore.setResults(data); showToast('生成成功')
  } catch (err) { generateStore.setError(err.message); showFailToast(err.message) }
}
</script>

<style scoped>
.generate-page { min-height: 100vh; background: var(--bg-page); padding-bottom: 60px; }
.generate-layout { display: flex; flex-direction: column; padding: 12px; gap: 12px; }
@media (min-width: 768px) {
  .generate-layout { flex-direction: row; max-width: 1500px; margin: 0 auto; }
  .config-panel { width: 380px; flex-shrink: 0; }
  .preview-panel { flex: 1; min-width: 0; }
  .preview-desktop { display: block; } .preview-mobile { display: none; }
}
.preview-desktop { display: none; } .preview-mobile { display: block; }
.tab-content { padding: 12px; max-height: calc(100vh - 250px); overflow-y: auto; }
.panel-text { font-size: 14px; line-height: 1.8; color: var(--text-primary); white-space: pre-wrap; word-break: break-word; margin: 0; }
.mobile-status { display: flex; justify-content: center; align-items: center; min-height: 300px; }
.download-bar {
  position: fixed; bottom: 0; left: 0; right: 0; background: var(--bg-surface);
  border-top: 1px solid var(--border-color); padding: 10px 16px; z-index: 99;
}
@media (min-width: 768px) { .download-bar { position: static; border: none; max-width: 1500px; margin: 12px auto 0; } }
</style>
