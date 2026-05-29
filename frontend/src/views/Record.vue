<template>
  <div class="record-page">
    <van-nav-bar title="历史记录" left-arrow @click-left="$router.back()" />
    <van-empty v-if="!loading && !records.length" description="暂无生成记录"><van-button type="primary" size="small" to="/generate">去生成</van-button></van-empty>
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="record-list" v-if="records.length">
        <div class="record-card" v-for="item in records" :key="item.id" @click="viewRecord(item)">
          <div class="card-hdr">
            <van-tag :type="agentColor(item.agent)" size="medium">{{ agentLabel(item.agent) }}</van-tag>
            <span class="card-time">{{ formatTime(item.time) }}</span>
          </div>
          <div class="card-kw">{{ item.keywords }}</div>
          <div class="card-actions" @click.stop>
            <van-button size="small" plain type="primary" @click="viewRecord(item)">预览</van-button>
            <van-button size="small" plain :type="item.favorited?'warning':''" @click="toggleFavorite(item)">{{ item.favorited ? '★' : '☆' }}</van-button>
            <van-button size="small" plain type="danger" @click="deleteItem(item)">删除</van-button>
          </div>
        </div>
      </div>
    </van-pull-refresh>
    <van-loading v-if="loading" size="40" vertical style="margin-top:100px;">加载中...</van-loading>
    <van-action-sheet v-model:show="showDetail" title="记录详情" :close-on-click-overlay="true" style="height:80vh;">
      <div class="detail-content" v-if="currentRecord">
        <van-tabs v-model:active="detailTab">
          <van-tab title="核心文案"><pre class="detail-text">{{ currentRecord.script||'暂无' }}</pre></van-tab>
          <van-tab title="运营方案"><pre class="detail-text">{{ currentRecord.operation||'暂无' }}</pre></van-tab>
          <van-tab title="作品说明"><pre class="detail-text">{{ currentRecord.readme||'暂无' }}</pre></van-tab>
          <van-tab title="SEO标签"><pre class="detail-text">{{ currentRecord.seo||'暂无' }}</pre></van-tab>
        </van-tabs>
      </div>
    </van-action-sheet>
    <van-tabbar v-model="active" route :fixed="true" :border="true">
      <van-tabbar-item to="/"><template #icon><IconHome size="22"/></template>首页</van-tabbar-item>
      <van-tabbar-item to="/generate"><template #icon><IconMagic size="22"/></template>生成</van-tabbar-item>
      <van-tabbar-item to="/toolbox"><template #icon><IconTool size="22"/></template>工具箱</van-tabbar-item>
      <van-tabbar-item to="/record"><template #icon><IconHistory size="22"/></template>记录</van-tabbar-item>
      <van-tabbar-item to="/user"><template #icon><IconPeople size="22"/></template>我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref,onMounted } from 'vue'; import { generateAPI } from '../api'; import { showToast,showConfirmDialog } from 'vant'
import { Home, Magic, Tool, History, People } from '@icon-park/vue-next'
const IconHome=Home;const IconMagic=Magic;const IconTool=Tool;const IconHistory=History;const IconPeople=People
const active=ref(3),records=ref([]),loading=ref(false),refreshing=ref(false),showDetail=ref(false),currentRecord=ref(null),detailTab=ref(0)
onMounted(()=>loadHistory())
const loadHistory=async()=>{ loading.value=true; try{const d=await generateAPI.getHistory();records.value=(d.list||[]).map(r=>({...r,favorited:false}))}catch(e){}finally{loading.value=false}}
const onRefresh=async()=>{ refreshing.value=true;await loadHistory();refreshing.value=false }
const viewRecord=async(item)=>{ try{const d=await generateAPI.getRecord(item.id);currentRecord.value=d;detailTab.value=0;showDetail.value=true}catch(e){showToast('加载失败')}}
const deleteItem=async(item)=>{ try{await showConfirmDialog({title:'确认删除',message:'删除后无法恢复'});await generateAPI.deleteRecord(item.id);records.value=records.value.filter(r=>r.id!==item.id);showToast('已删除')}catch(e){if(e!=='cancel')showToast('删除失败')}}
const toggleFavorite=(item)=>{ item.favorited=!item.favorited; showToast(item.favorited?'已收藏':'已取消') }
const agentLabel=(k)=>({oral:'口播干货',shop:'电商带货',flow:'信息流广告',drama:'达人剧情',clip:'影视混剪',emotion:'情感文案'}[k]||k)
const agentColor=(k)=>({oral:'primary',shop:'danger',flow:'warning',drama:'',clip:'success',emotion:''}[k]||'')
const formatTime=(iso)=>iso?`${new Date(iso).getMonth()+1}/${new Date(iso).getDate()} ${String(new Date(iso).getHours()).padStart(2,'0')}:${String(new Date(iso).getMinutes()).padStart(2,'0')}`:''
</script>

<style scoped>
.record-page { padding-bottom:60px; min-height:100vh; background:var(--bg-page); }
.record-list { padding:12px; }
.record-card { background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:14px; margin-bottom:10px; cursor:pointer; transition:all 0.2s; }
.record-card:hover { box-shadow:var(--shadow-sm); }
.card-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.card-time { font-size:12px; color:var(--text-muted); }
.card-kw { font-size:14px; color:var(--text-primary); margin-bottom:10px; }
.card-actions { display:flex; gap:6px; }
.detail-content { height:calc(80vh - 44px); }
.detail-text { padding:12px 16px; font-size:13px; line-height:1.7; white-space:pre-wrap; word-break:break-word; color:var(--text-primary); margin:0; }
</style>
