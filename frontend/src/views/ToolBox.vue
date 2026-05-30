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

    <!-- 工具详情弹窗 -->
    <van-popup v-model:show="showTool" position="bottom" round :style="{ height: '75vh' }">
      <div class="tool-panel">
        <div class="tp-header">
          <span class="tp-title">{{ currentTool?.name }}</span>
          <span class="tp-close" @click="showTool = false">✕</span>
        </div>

        <!-- 文案润色 -->
        <div class="tp-body" v-if="currentTool?.key==='polish'">
          <div class="tp-hint">输入文案，AI自动去掉口水词、优化表达、提升质感</div>
          <van-field v-model="polishInput" type="textarea" rows="5" placeholder="输入需要润色的文案..." />
          <div class="tp-example" @click="fillPolishExample">💡 点我填入示例文案测试</div>
          <van-field v-model="polishStyle" placeholder="润色风格：简洁流畅 / 专业严谨 / 轻松口语" />
          <van-button type="primary" block round :loading="toolLoading" @click="doPolish">开始润色</van-button>
          <div class="tool-result" v-if="polishResult">
            <div class="result-hdr">润色结果</div>
            <pre>{{ polishResult }}</pre>
            <van-button size="small" plain type="primary" @click="copyText(polishResult)">复制</van-button>
          </div>
        </div>

        <!-- 分镜表 -->
        <div class="tp-body" v-if="currentTool?.key==='storyboard'">
          <div class="tp-hint">输入脚本，自动拆解为拍摄分镜表</div>
          <van-field v-model="scriptInput" type="textarea" rows="5" placeholder="输入脚本文案..." />
          <div class="tp-example" @click="fillStoryboardExample">💡 点我填入示例脚本测试</div>
          <van-button type="primary" block round :loading="toolLoading" @click="doStoryboard">生成分镜表</van-button>
          <div class="tool-result" v-if="storyboardResult.length">
            <table class="sb-table"><thead><tr><th>#</th><th>景别</th><th>时长</th><th>内容</th></tr></thead><tbody><tr v-for="r in storyboardResult" :key="r.scene"><td>{{ r.scene }}</td><td>{{ r.shot }}</td><td>{{ r.duration }}</td><td>{{ r.content }}</td></tr></tbody></table>
          </div>
        </div>

        <!-- 字幕处理 -->
        <div class="tp-body" v-if="currentTool?.key==='subtitle'">
          <div class="tp-hint">字幕格式转换 / 时间戳调整 / 批量替换文字</div>
          <van-field v-model="subtitleInput" type="textarea" rows="5" placeholder="输入SRT字幕内容..." />
          <div class="tp-example" @click="fillSubtitleExample">💡 点我填入示例字幕测试</div>
          <van-radio-group v-model="subtitleMode" direction="horizontal" style="margin:10px 0;">
            <van-radio name="toSRT">转SRT</van-radio>
            <van-radio name="adjustTime">调时间戳(+3s)</van-radio>
            <van-radio name="batchReplace">批量替换</van-radio>
          </van-radio-group>
          <template v-if="subtitleMode==='batchReplace'">
            <van-field v-model="findText" placeholder="查找文本" />
            <van-field v-model="replaceText" placeholder="替换为" />
          </template>
          <van-button type="primary" block round @click="doSubtitle">处理</van-button>
          <div class="tool-result" v-if="subtitleResult"><pre>{{ subtitleResult }}</pre></div>
        </div>

        <!-- 爆款钩子库 -->
        <div class="tp-body" v-if="currentTool?.key==='hook'">
          <div class="tp-hint">点击复制可直接用于视频开头的爆款钩子</div>
          <div class="hook-grid"><div class="hook-item" v-for="h in hooks" :key="h" @click="copyAndToast(h)">{{ h }}</div></div>
        </div>
      </div>
    </van-popup>

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

// 示例文本
const EXAMPLE_POLISH = `大家好我是小明，今天呢我来给大家分享一下关于手机摄影的一些小技巧，希望对大家有帮助。首先呢就是说，你要学会怎么样用手机拍出好看的图片。然后呢，就是构图非常重要，你要把那个主体放在正确的位置上。然后呢，就是光线也很重要，你一定要选择在光线好的时候去拍。然后呢，就是后期处理也很重要，要用好的APP来修图。嗯。。。大概就是这样了，希望我的分享能帮到你。`

const EXAMPLE_STORYBOARD = `清晨的阳光透过窗帘洒进房间，女主缓缓睁开眼，伸了个懒腰。她走到窗前推开窗户，外面是繁华的城市天际线。镜头切到她煮咖啡的手部特写，热气升腾。她端着咖啡走到阳台，靠在栏杆上望着远方，嘴角微微上扬。突然手机响起，她看了一眼来电显示，表情从微笑变成严肃。她接通电话走回屋内。镜头留在空荡的阳台和半杯咖啡上。`

const EXAMPLE_SUBTITLE = `大家好，今天我们来聊聊AI
未来十年AI会如何改变我们的生活呢
首先从医疗领域来看
AI已经可以辅助医生进行诊断了
这是一个巨大的突破
其次在教育领域
AI可以给每个学生提供个性化的学习方案
这真的非常厉害
最后我们说说交通
自动驾驶技术已经越来越成熟了
相信不久的将来
我们就能坐上完全无人驾驶的汽车了`
const openTool=(t)=>{ currentTool.value=t;showTool.value=true;polishResult.value='';storyboardResult.value=[];subtitleResult.value='' }
const fillPolishExample=()=>{ polishInput.value=EXAMPLE_POLISH }
const fillStoryboardExample=()=>{ scriptInput.value=EXAMPLE_STORYBOARD }
const fillSubtitleExample=()=>{ subtitleInput.value=EXAMPLE_SUBTITLE }
const copyAndToast=(t)=>{ navigator.clipboard.writeText(t).then(()=>showSuccessToast('已复制')) }
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
.hook-item { padding:8px 14px; background:var(--bg-input); border:1px solid var(--border-color); border-radius:20px; font-size:12px; color:var(--text-primary); cursor:pointer; transition:all 0.2s; }
.hook-item:hover { border-color:var(--accent); color:var(--accent); background:var(--accent-soft); }
.hook-item:active { transform:scale(0.96); }

/* Tool panel */
.tool-panel { display:flex; flex-direction:column; height:100%; background:var(--bg-surface); border-radius:var(--radius-lg) var(--radius-lg) 0 0; }
.tp-header { display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid var(--border-color); flex-shrink:0; }
.tp-title { font-size:17px; font-weight:700; color:var(--text-primary); }
.tp-close { width:32px; height:32px; border-radius:50%; border:1px solid var(--border-color); display:flex; align-items:center; justify-content:center; font-size:16px; color:var(--text-muted); cursor:pointer; }
.tp-body { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }
.tp-hint { font-size:13px; color:var(--text-muted); background:var(--bg-input); padding:10px 12px; border-radius:var(--radius-sm); line-height:1.6; }
.tp-example { font-size:12px; color:var(--accent); cursor:pointer; padding:6px 0; user-select:none; }
.tp-example:hover { text-decoration:underline; }

.tool-result { margin-top:8px; padding:12px; background:var(--bg-input); border-radius:var(--radius-sm); }
.tool-result pre { font-size:13px; line-height:1.7; white-space:pre-wrap; word-break:break-word; margin:0 0 8px; color:var(--text-primary); max-height:200px; overflow-y:auto; }
.result-hdr { font-weight:600; margin-bottom:6px; color:var(--accent); font-size:12px; }
.sb-table { width:100%; border-collapse:collapse; font-size:12px; }
.sb-table th,.sb-table td { padding:6px 8px; border:1px solid var(--border-color); text-align:left; }
.sb-table th { background:var(--bg-hover); color:var(--accent); font-weight:600; }
.sb-table td { color:var(--text-primary); }
</style>
