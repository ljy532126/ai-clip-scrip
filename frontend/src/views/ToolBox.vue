<template>
  <div class="toolbox-page">
    <van-nav-bar title="剪辑工具箱" left-arrow @click-left="$router.back()" />
    <div class="tool-grid">
      <div class="tool-card" v-for="tool in tools" :key="tool.key" @click="openTool(tool)">
        <div class="tool-icon"><component :is="tool.icon" size="36" :fill="tool.fill"/></div>
        <div class="tool-name">{{ tool.name }}</div>
        <div class="tool-desc">{{ tool.desc }}</div>
      </div>
    </div>
    <van-action-sheet v-model:show="showTool" :title="currentTool?.name" style="height:60vh;">
      <div class="tool-content">
        <template v-if="currentTool?.key==='polish'">
          <van-field v-model="polishInput" type="textarea" rows="4" placeholder="输入需要润色的文案..." />
          <van-field v-model="polishStyle" placeholder="润色风格：简洁流畅" style="margin-top:8px;" />
          <van-button type="primary" block round :loading="toolLoading" @click="doPolish" style="margin-top:12px;">开始润色</van-button>
          <div class="tool-result" v-if="polishResult"><div class="result-hdr">润色结果</div><pre>{{ polishResult }}</pre><van-button size="small" plain type="primary" @click="copyText(polishResult)">复制</van-button></div>
        </template>
        <template v-if="currentTool?.key==='storyboard'">
          <van-field v-model="scriptInput" type="textarea" rows="4" placeholder="输入脚本文案..." />
          <van-button type="primary" block round :loading="toolLoading" @click="doStoryboard" style="margin-top:12px;">生成分镜表</van-button>
          <div class="tool-result" v-if="storyboardResult.length">
            <table class="sb-table"><thead><tr><th>#</th><th>景别</th><th>时长</th><th>内容</th></tr></thead><tbody><tr v-for="r in storyboardResult" :key="r.scene"><td>{{ r.scene }}</td><td>{{ r.shot }}</td><td>{{ r.duration }}</td><td>{{ r.content }}</td></tr></tbody></table>
          </div>
        </template>
        <template v-if="currentTool?.key==='subtitle'">
          <van-field v-model="subtitleInput" type="textarea" rows="4" placeholder="输入SRT字幕内容..." />
          <div class="mode-select" style="margin-top:8px;">
            <van-radio-group v-model="subtitleMode" direction="horizontal"><van-radio name="toSRT">转SRT</van-radio><van-radio name="adjustTime">调时间戳</van-radio><van-radio name="batchReplace">批量替换</van-radio></van-radio-group>
          </div>
          <template v-if="subtitleMode==='batchReplace'"><van-field v-model="findText" placeholder="查找文本" style="margin-top:6px;" /><van-field v-model="replaceText" placeholder="替换为" style="margin-top:6px;" /></template>
          <van-button type="primary" block round @click="doSubtitle" style="margin-top:12px;">处理</van-button>
          <div class="tool-result" v-if="subtitleResult"><pre>{{ subtitleResult }}</pre></div>
        </template>
        <template v-if="currentTool?.key==='hook'">
          <div class="hook-grid"><div class="hook-item" v-for="h in hooks" :key="h">{{ h }}</div></div>
        </template>
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
import { ref } from 'vue'; import { toolboxAPI } from '../api'; import { showToast,showSuccessToast } from 'vant'
import { EditTwo, Copy, PlayTwo, Like, Home, Magic, Tool, History, People } from '@icon-park/vue-next'
const IconHome=Home;const IconMagic=Magic;const IconTool=Tool;const IconHistory=History;const IconPeople=People
const active=ref(2),showTool=ref(false),currentTool=ref(null),toolLoading=ref(false)
const tools=[{key:'subtitle',name:'字幕批量处理',icon:EditTwo,fill:'#d4914a',desc:'格式转换·时间戳·批量改字'},{key:'polish',name:'AI文案润色',icon:Copy,fill:'#7a9e7e',desc:'去口水词·优化表达·提质感'},{key:'storyboard',name:'分镜表生成',icon:PlayTwo,fill:'#6b8da8',desc:'脚本自动拆解拍摄分镜'},{key:'hook',name:'爆款钩子库',icon:Like,fill:'#c97b6b',desc:'高转化开头标题素材'}]
const subtitleInput=ref(''),subtitleMode=ref('toSRT'),subtitleResult=ref(''),findText=ref(''),replaceText=ref('')
const polishInput=ref(''),polishStyle=ref('简洁流畅'),polishResult=ref('')
const scriptInput=ref(''),storyboardResult=ref([])
const hooks=['90%的人不知道...','你还在...？其实...','这个方法一定要看！','以前我也...直到...','这东西颠覆了我的认知','只说三句话，改变你的...','别再...了！试试这个','花3分钟看完，少走3年弯路','为什么别人...而你...','今天终于可以说了...']
const openTool=(t)=>{ currentTool.value=t;showTool.value=true;polishResult.value='';storyboardResult.value=[];subtitleResult.value='' }
const doPolish=async()=>{ if(!polishInput.value.trim())return;toolLoading.value=true;try{const d=await toolboxAPI.polish({content:polishInput.value,style:polishStyle.value});polishResult.value=d.result}catch(e){showToast(e.message)}finally{toolLoading.value=false}}
const doStoryboard=async()=>{ if(!scriptInput.value.trim())return;toolLoading.value=true;try{const d=await toolboxAPI.storyboard({script:scriptInput.value});storyboardResult.value=d.storyboard||[]}catch(e){showToast(e.message)}finally{toolLoading.value=false}}
const doSubtitle=async()=>{ if(!subtitleInput.value.trim())return;try{const p={content:subtitleInput.value,mode:subtitleMode.value};if(subtitleMode.value==='batchReplace'){p.findText=findText.value;p.replaceText=replaceText.value};const d=await toolboxAPI.subtitle(p);subtitleResult.value=d.result}catch(e){showToast(e.message)}}
const copyText=(t)=>navigator.clipboard.writeText(t).then(()=>showSuccessToast('已复制'))
</script>

<style scoped>
.toolbox-page { padding-bottom:60px; min-height:100vh; background:var(--bg-page); }
.tool-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; padding:16px; }
.tool-card { background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:20px 16px; cursor:pointer; transition:all 0.2s; }
.tool-card:hover { box-shadow:var(--shadow-sm); transform:translateY(-1px); }
.tool-icon { font-size:36px; margin-bottom:10px; }
.tool-name { font-size:15px; font-weight:600; color:var(--text-primary); margin-bottom:4px; }
.tool-desc { font-size:12px; color:var(--text-muted); }
.tool-content { padding:16px; max-height:50vh; overflow-y:auto; }
.tool-result { margin-top:12px; padding:12px; background:var(--bg-input); border-radius:var(--radius-sm); }
.tool-result pre { font-size:13px; line-height:1.7; white-space:pre-wrap; word-break:break-word; margin:0 0 8px; color:var(--text-primary); max-height:200px; overflow-y:auto; }
.result-hdr { font-weight:600; margin-bottom:6px; color:var(--accent); font-size:12px; }
.sb-table { width:100%; border-collapse:collapse; font-size:12px; }
.sb-table th,.sb-table td { padding:6px 8px; border:1px solid var(--border-color); text-align:left; }
.sb-table th { background:var(--bg-hover); color:var(--accent); font-weight:600; }
.sb-table td { color:var(--text-primary); }
.hook-grid { display:flex; flex-wrap:wrap; gap:8px; }
.hook-item { padding:8px 14px; background:var(--bg-input); border:1px solid var(--border-color); border-radius:20px; font-size:12px; color:var(--text-primary); }
</style>
