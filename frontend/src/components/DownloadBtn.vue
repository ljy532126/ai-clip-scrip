<template>
  <div class="download-bar-inner">
    <div class="dl-singles">
      <van-button v-for="doc in documents" :key="doc.key" size="small" :type="doc.type" plain @click="downloadSingle(doc)">{{ doc.shortLabel }}</van-button>
    </div>
    <van-button type="danger" block round size="large" @click="downloadZip">一键打包下载 ZIP</van-button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import { downloadFile, downloadZipPackage } from '../utils/download'
const props = defineProps({ files: { type: Object, required: true } })
const documents = computed(() => [
  { key:'script',shortLabel:'核心文案',type:'primary',filename:'1-核心主脚本文案.txt',content:props.files.script },
  { key:'operation',shortLabel:'运营方案',type:'success',filename:'2-发布运营全流程方案.txt',content:props.files.operation },
  { key:'readme',shortLabel:'作品说明',type:'',filename:'3-README作品说明.txt',content:props.files.readme },
  { key:'seo',shortLabel:'SEO标签',type:'warning',filename:'4-SEO关键词标签库.txt',content:props.files.seo }
])
const downloadSingle = (d) => { if(!d.content){showToast('暂无内容');return}; downloadFile(d.filename,d.content); showSuccessToast(`${d.shortLabel} 已下载`) }
const downloadZip = () => { const l=documents.value.filter(d=>d.content); if(!l.length){showToast('暂无内容');return}; downloadZipPackage(l); showSuccessToast('全套素材包已下载') }
</script>

<style scoped>
.download-bar-inner { display: flex; flex-direction: column; gap: 10px; }
.dl-singles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
</style>
