<template>
  <div class="app-root">
    <router-view />

    <Teleport to="body">
      <Transition name="notice-fade">
        <div class="notice-overlay" v-if="showNotify" @click.self="closeNotice">
          <div class="notice-card">
            <div class="notice-accent"></div>
            <button class="notice-close" @click="closeNotice">✕</button>
            <div class="notice-icon">
              <NoticeIcon size="28" fill="#d4914a"/>
            </div>
            <h2 class="notice-title">{{ notice?.title }}</h2>
            <div class="notice-body">
              <p class="notice-text">{{ notice?.content }}</p>
            </div>
            <div class="notice-actions">
              <button class="notice-btn secondary" @click="hideToday">
                <Mute size="16"/>今天不再显示
              </button>
              <button class="notice-btn primary" @click="closeNotice">
                <Correct size="16"/>我知道了
              </button>
            </div>
            <p class="notice-footnote">可在个人中心查看平台协议</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore, useThemeStore } from './store'
import { announceAPI } from './api'
import { VolumeNotice, Mute, Correct } from '@icon-park/vue-next'

const NoticeIcon = VolumeNotice
const route = useRoute()
const userStore = useUserStore()
const themeStore = useThemeStore()
const showNotify = ref(false)
const notice = ref(null)
const dismissed = JSON.parse(localStorage.getItem('dismissed_notices') || '[]')
const todayKey = 'notice_hide_' + new Date().toDateString()
let announced = false

const loadAnnouncements = async () => {
  if (announced) return
  // 只在首页弹窗
  if (route.path !== '/') return
  try {
    if (localStorage.getItem(todayKey)) return
    const d = await announceAPI.getList()
    const list = (d.list || []).filter(a => a.active !== false)
    if (!list.length) return
    const toShow = list.find(a => {
      if (a.showOnce && dismissed.includes(a.id)) return false
      return true
    })
    if (toShow) { notice.value = toShow; showNotify.value = true; announced = true; document.body.style.overflow = 'hidden' }
  } catch {}
}

const closeNotice = () => {
  if (notice.value) {
    dismissed.push(notice.value.id)
    localStorage.setItem('dismissed_notices', JSON.stringify(dismissed))
  }
  showNotify.value = false; document.body.style.overflow = ''
}

const hideToday = () => {
  localStorage.setItem(todayKey, '1')
  showNotify.value = false; document.body.style.overflow = ''
}

onMounted(async () => {
  themeStore.init()
  await userStore.fetchUserInfo()
  if (route.path === '/') loadAnnouncements()
})
watch(() => route.path, (p) => { if (p === '/' && !announced) loadAnnouncements() })
</script>

<style>
.notice-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.55); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 24px; animation: overlayIn 0.25s ease; }
@keyframes overlayIn { from { opacity:0 } to { opacity:1 } }
.notice-fade-enter-active { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
.notice-fade-leave-active { transition: all 0.2s ease; }
.notice-fade-enter-from { opacity:0; transform: scale(0.92) translateY(20px); }
.notice-fade-leave-to { opacity:0; transform: scale(0.96); }
.notice-card { position: relative; width: 100%; max-width: 400px; background: #fff; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.04); overflow: hidden; padding: 32px 28px 24px; animation: cardEnter 0.4s cubic-bezier(0.4,0,0.2,1); }
@keyframes cardEnter { from { opacity:0; transform: scale(0.9) translateY(30px); } to { opacity:1; transform: scale(1) translateY(0); } }
.notice-accent { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #d4914a, #e0a84c, #c97b6b); }
.notice-close { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; border-radius: 50%; border: 1px solid #e8e2d5; background: #fff; color: #9e9689; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; line-height: 1; }
.notice-close:hover { background: #f5f0e8; color: #2c2416; border-color: #d4914a; }
.notice-icon { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #fdf2e9, #f5e6d8); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.notice-title { font-size: 20px; font-weight: 700; color: #2c2416; margin-bottom: 10px; line-height: 1.3; }
.notice-body { margin-bottom: 24px; }
.notice-text { font-size: 14px; line-height: 1.8; color: #6b6255; white-space: pre-wrap; margin: 0; }
.notice-actions { display: flex; gap: 10px; }
.notice-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px 16px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; font-family: inherit; }
.notice-btn.primary { background: linear-gradient(135deg, #d4914a, #c97b6b); color: #fff; box-shadow: 0 4px 14px rgba(212,145,74,0.3); }
.notice-btn.primary:hover { box-shadow: 0 6px 20px rgba(212,145,74,0.45); transform: translateY(-1px); }
.notice-btn.primary:active { transform: scale(0.97); }
.notice-btn.secondary { background: #f5f0e8; color: #6b6255; }
.notice-btn.secondary:hover { background: #ebe4d8; color: #2c2416; }
.notice-footnote { text-align: center; margin-top: 16px; font-size: 11px; color: #c4bbb0; }
[data-theme='dark'] .notice-overlay { background: rgba(0,0,0,0.7); }
[data-theme='dark'] .notice-card { background: #25221c; box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06); }
[data-theme='dark'] .notice-close { background: #25221c; border-color: #38342c; color: #6b6255; }
[data-theme='dark'] .notice-close:hover { background: #2e2a23; color: #e8e0d5; border-color: #d4914a; }
[data-theme='dark'] .notice-icon { background: linear-gradient(135deg, #2e2a23, #38342c); }
[data-theme='dark'] .notice-title { color: #e8e0d5; }
[data-theme='dark'] .notice-text { color: #9e9689; }
[data-theme='dark'] .notice-btn.secondary { background: #2e2a23; color: #6b6255; }
[data-theme='dark'] .notice-btn.secondary:hover { background: #38342c; color: #e8e0d5; }
[data-theme='dark'] .notice-footnote { color: #6b6255; }
</style>
