import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@vant/touch-emulator'
import 'vant/lib/index.css'
import './styles/theme.css'
import './styles/global.css'

// IconPark：全局按需注册
import { IconProvider, DEFAULT_ICON_CONFIGS } from '@icon-park/vue-next'
DEFAULT_ICON_CONFIGS.prefix = 'icon'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.component('IconProvider', IconProvider)
app.mount('#app')

// PWA: 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
