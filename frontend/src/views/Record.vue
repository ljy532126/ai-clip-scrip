<template>
  <div class="record-page">
    <van-nav-bar title="历史记录" left-arrow @click-left="$router.back()" />

    <!-- 筛选Tab -->
    <div class="filter-tabs">
      <span class="ftab" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">全部</span>
      <span class="ftab" :class="{ active: activeTab === 'favorites' }" @click="activeTab = 'favorites'">已收藏</span>
    </div>

    <van-empty v-if="!loading && !records.length" :description="activeTab==='favorites'?'暂无收藏记录':'暂无生成记录'">
      <van-button type="primary" size="small" to="/generate">去生成</van-button>
    </van-empty>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="record-list" v-if="records.length">
        <div class="record-card" v-for="item in records" :key="item.id" @click="viewRecord(item)">
          <div class="card-hdr">
            <span class="card-tag" :style="{ color: agentColor(item.agent) }">{{ agentLabel(item.agent) }}</span>
            <span class="card-time">{{ formatTime(item.time) }}</span>
          </div>
          <div class="card-kw">{{ item.keywords }}</div>
          <div class="card-actions" @click.stop>
            <van-button size="small" plain type="primary" @click="viewRecord(item)">预览</van-button>
            <van-button size="small" plain :class="item.favorited?'btn-fav-active':''" @click="toggleFavorite(item)">
              <template #icon><Like size="14" :theme="item.favorited?'filled':''" :fill="item.favorited?'#c97b6b':''"/></template>
              {{ item.favorited ? '已收藏' : '收藏' }}
            </van-button>
            <van-button size="small" plain @click="downloadItem(item)">下载</van-button>
            <van-button size="small" plain type="danger" @click="deleteItem(item)">删除</van-button>
          </div>
        </div>
      </div>
    </van-pull-refresh>

    <van-loading v-if="loading" size="40" vertical style="margin-top:100px;">加载中...</van-loading>

    <van-action-sheet v-model:show="showDetail" title="记录详情" :close-on-click-overlay="true" style="height:85vh;">
      <div class="detail-content" v-if="currentRecord">
        <van-tabs v-model:active="detailTab">
          <van-tab title="核心文案"><pre class="detail-text">{{ currentRecord.script||'暂无' }}</pre></van-tab>
          <van-tab title="运营方案"><pre class="detail-text">{{ currentRecord.operation||'暂无' }}</pre></van-tab>
          <van-tab title="作品说明"><pre class="detail-text">{{ currentRecord.readme||'暂无' }}</pre></van-tab>
          <van-tab title="SEO标签"><pre class="detail-text">{{ currentRecord.seo||'暂无' }}</pre></van-tab>
        </van-tabs>
        <div class="detail-dl-bar">
          <van-button size="small" type="primary" block round @click="downloadDetailZip">一键打包下载 ZIP</van-button>
        </div>
      </div>
    </van-action-sheet>

    <van-tabbar v-model="active" route fixed :border="true">
      <van-tabbar-item to="/"><template #icon><IconHome size="22"/></template>首页</van-tabbar-item>
      <van-tabbar-item to="/generate"><template #icon><IconMagic size="22"/></template>生成</van-tabbar-item>
      <van-tabbar-item to="/toolbox"><template #icon><IconTool size="22"/></template>工具箱</van-tabbar-item>
      <van-tabbar-item to="/record"><template #icon><IconHistory size="22"/></template>记录</van-tabbar-item>
      <van-tabbar-item to="/user"><template #icon><IconPeople size="22"/></template>我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'; import { useRoute } from 'vue-router'
import { generateAPI, userAPI } from '../api'; import { showToast, showConfirmDialog, showSuccessToast } from 'vant'
import { Home, Magic, Tool, History, People, Like } from '@icon-park/vue-next'
import { downloadFile, downloadZipPackage } from '../utils/download'
const IconHome=Home;const IconMagic=Magic;const IconTool=Tool;const IconHistory=History;const IconPeople=People
const route = useRoute()
const active=ref(3), activeTab=ref('all'), records=ref([]), loading=ref(false), refreshing=ref(false)
const showDetail=ref(false), currentRecord=ref(null), detailTab=ref(0)

onMounted(() => {
  if (route.query.tab === 'favorites') activeTab.value = 'favorites'
  loadData()
})

watch(activeTab, () => loadData())

const loadData = async () => {
  loading.value = true
  try {
    if (activeTab.value === 'favorites') {
      const d = await userAPI.getFavorites()
      records.value = (d.list || []).map(r => ({ ...r, favorited: true }))
    } else {
      const d = await generateAPI.getHistory()
      records.value = (d.list || []).map(r => ({ ...r, favorited: false }))
    }
  } catch {} finally { loading.value = false }
}

const onRefresh = async () => { refreshing.value = true; await loadData(); refreshing.value = false }

const viewRecord = async (item) => {
  try { const d = await generateAPI.getRecord(item.id); currentRecord.value = d; detailTab.value = 0; showDetail.value = true } catch { showToast('加载失败') }
}

const deleteItem = async (item) => {
  try { await showConfirmDialog({ title:'确认删除', message:'删除后无法恢复' }); await generateAPI.deleteRecord(item.id); records.value = records.value.filter(r => r.id !== item.id); showToast('已删除') } catch(e){ if(e!=='cancel') showToast('删除失败') }
}

const toggleFavorite = async (item) => {
  try {
    if (item.favorited) { await userAPI.removeFavorite(item.id); item.favorited = false; showToast('已取消收藏') }
    else { await userAPI.addFavorite(item.id); item.favorited = true; showSuccessToast('已收藏') }
    if (activeTab.value === 'favorites' && !item.favorited) records.value = records.value.filter(r => r.id !== item.id)
  } catch(e) { showToast(e.message || '操作失败') }
}

const downloadItem = (item) => {
  if (!item.keywords) return
  const nam = `${agentLabel(item.agent)}_${item.keywords}_${new Date(item.time).toLocaleDateString()}.txt`
  downloadFile(nam, `Agent: ${agentLabel(item.agent)}\n关键词: ${item.keywords}\n时间: ${item.time}\n\n请点击预览查看完整内容`)
  showSuccessToast('下载中（完整内容请使用预览-打包下载）')
}

const downloadDetailZip = () => {
  if (!currentRecord.value) return
  const list = [
    { filename: '核心主脚本文案.txt', content: currentRecord.value.script },
    { filename: '发布运营全流程方案.txt', content: currentRecord.value.operation },
    { filename: 'README作品说明.txt', content: currentRecord.value.readme },
    { filename: 'SEO关键词标签库.txt', content: currentRecord.value.seo }
  ].filter(f => f.content)
  if (!list.length) { showToast('暂无内容'); return }
  downloadZipPackage(list); showSuccessToast('已打包下载')
}

const agentLabel=(k)=>({oral:'口播干货',shop:'电商带货',flow:'信息流广告',drama:'达人剧情',clip:'影视混剪',emotion:'情感文案'}[k]||k)
const agentColor=(k)=>({oral:'#d4914a',shop:'#c97b6b',flow:'#e0a84c',drama:'#8b7aaa',clip:'#7a9e7e',emotion:'#6b8da8'}[k]||'#6b6255')
const formatTime=(iso)=>iso?`${new Date(iso).getMonth()+1}/${new Date(iso).getDate()} ${String(new Date(iso).getHours()).padStart(2,'0')}:${String(new Date(iso).getMinutes()).padStart(2,'0')}`:''
</script>

<style scoped>
.record-page { padding-bottom:60px; min-height:100vh; background:var(--bg-page); }
.filter-tabs { display:flex; gap:0; border-bottom:1px solid var(--border-color); background:var(--bg-card); }
.ftab { flex:1; text-align:center; padding:12px 0; font-size:14px; font-weight:600; color:var(--text-muted); cursor:pointer; position:relative; }
.ftab.active { color:var(--accent); }
.ftab.active::after { content:''; position:absolute; bottom:0; left:50%; transform:translateX(-50%); width:28px; height:3px; border-radius:2px; background:var(--accent); }
.record-list { padding:12px; }
.record-card { background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:14px; margin-bottom:10px; cursor:pointer; transition:all 0.2s; }
.record-card:hover { box-shadow:var(--shadow-sm); }
.card-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.card-tag { font-weight:700; font-size:13px; }
.card-time { font-size:12px; color:var(--text-muted); }
.card-kw { font-size:14px; color:var(--text-primary); margin-bottom:10px; }
.card-actions { display:flex; gap:6px; flex-wrap:wrap; }
.btn-fav-active { color:#c97b6b !important; border-color:#c97b6b !important; }
.detail-content { height:calc(85vh - 44px); display:flex; flex-direction:column; }
.detail-text { padding:12px 16px; font-size:13px; line-height:1.7; white-space:pre-wrap; word-break:break-word; color:var(--text-primary); margin:0; flex:1; overflow-y:auto; }
.detail-dl-bar { padding:10px 16px; border-top:1px solid var(--border-color); flex-shrink:0; }
</style>
