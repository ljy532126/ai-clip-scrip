<template>
  <div class="index-page">
    <header class="hero">
      <h1 class="hero-title">AI 全能剪辑脚本引擎</h1>
      <p class="hero-desc">六行业独立 AI Agent · 一键输出全套运营素材包</p>
      <div class="hero-stats">
        <div class="stat"><span class="stat-num">6</span><span class="stat-label">独立Agent</span></div>
        <span class="stat-split">·</span>
        <div class="stat"><span class="stat-num">4</span><span class="stat-label">标准文档</span></div>
        <span class="stat-split">·</span>
        <div class="stat"><span class="stat-num">10</span><span class="stat-label">文案风格</span></div>
      </div>
    </header>

    <section class="agent-section">
      <h2 class="section-title">选择行业 Agent</h2>
      <div class="agent-grid">
        <article v-for="agent in agents" :key="agent.key" class="agent-card" @click="goGenerate(agent.key)">
          <component :is="agent.icon" class="card-svg" size="36" :fill="colors[agent.key]" />
          <h3 class="card-name">{{ agent.name }}</h3>
          <p class="card-desc">{{ agent.desc }}</p>
        </article>
      </div>
    </section>

    <van-tabbar v-model="active" route :fixed="true" :border="true">
      <van-tabbar-item to="/"><template #icon><IconHome size="22" /></template>首页</van-tabbar-item>
      <van-tabbar-item to="/generate"><template #icon><IconMagic size="22" /></template>生成</van-tabbar-item>
      <van-tabbar-item to="/toolbox"><template #icon><IconTool size="22" /></template>工具箱</van-tabbar-item>
      <van-tabbar-item to="/record"><template #icon><IconHistory size="22" /></template>记录</van-tabbar-item>
      <van-tabbar-item to="/user"><template #icon><IconPeople size="22" /></template>我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGenerateStore } from '../store'
import { Home, Magic, Tool, History, People, VolumeNotice, ShoppingMall, AdProduct, Movie, Clue, EmotionHappy } from '@icon-park/vue-next'

const router = useRouter()
const generateStore = useGenerateStore()
const active = ref(0)

const IconHome = Home; const IconMagic = Magic; const IconTool = Tool
const IconHistory = History; const IconPeople = People

const agents = [
  { key: 'oral', name: '口播干货', icon: VolumeNotice, desc: '知识科普 · 教学讲解 · 经验分享' },
  { key: 'shop', name: '电商带货', icon: ShoppingMall, desc: '产品种草 · 卖点拆解 · 高转化' },
  { key: 'flow', name: '信息流广告', icon: AdProduct, desc: '投流专用 · 强营销 · 高节奏' },
  { key: 'drama', name: '达人剧情', icon: Movie, desc: '小剧场 · 反转剧情 · 人设' },
  { key: 'clip', name: '影视混剪', icon: Clue, desc: '旁白文案 · 氛围解说 · 混剪' },
  { key: 'emotion', name: '情感文案', icon: EmotionHappy, desc: '治愈 · 感悟 · 情绪向' }
]

const colors = {
  oral: '#d4914a', shop: '#c97b6b', flow: '#e0a84c',
  drama: '#8b7aaa', clip: '#7a9e7e', emotion: '#6b8da8'
}

const goGenerate = (agentKey) => { generateStore.setAgent(agentKey); router.push('/generate') }
</script>

<style scoped>
.index-page { padding-bottom: 60px; background: var(--bg-page); min-height: 100vh; }
.hero { text-align: center; padding: 48px 24px 32px; }
.hero-title { font-size: 28px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; letter-spacing: 1px; }
.hero-desc { font-size: 14px; color: var(--text-secondary); }
.hero-stats { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 24px; }
.stat { display: flex; flex-direction: column; align-items: center; }
.stat-num { font-size: 28px; font-weight: 700; color: var(--accent); }
.stat-label { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.stat-split { color: var(--border-color); font-size: 20px; }
.section-title { font-size: 16px; font-weight: 600; color: var(--text-primary); padding: 0 18px 12px; }
.agent-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 0 14px; }
@media (min-width: 768px) { .agent-grid { grid-template-columns: repeat(3, 1fr); max-width: 860px; margin: 0 auto; gap: 14px; } }
.agent-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 22px 16px; cursor: pointer; transition: all 0.2s; text-align: center; }
.agent-card:hover { border-color: var(--accent-light); box-shadow: var(--shadow-md); transform: translateY(-1px); }
.agent-card:active { transform: scale(0.97); }
.card-svg { margin-bottom: 8px; }
.card-name { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 4px 0; }
.card-desc { font-size: 12px; color: var(--text-muted); line-height: 1.5; }
</style>
