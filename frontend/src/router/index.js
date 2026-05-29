import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store'

const routes = [
  { path: '/', name: 'Index', component: () => import('../views/Index.vue'), meta: { title: '首页' } },
  { path: '/generate', name: 'Generate', component: () => import('../views/Generate.vue'), meta: { title: '脚本生成' } },
  { path: '/toolbox', name: 'ToolBox', component: () => import('../views/ToolBox.vue'), meta: { title: '剪辑工具箱' } },
  { path: '/record', name: 'Record', component: () => import('../views/Record.vue'), meta: { title: '历史记录' } },
  { path: '/user', name: 'User', component: () => import('../views/User.vue'), meta: { title: '个人中心' } },
  { path: '/admin', name: 'Admin', component: () => import('../views/Admin.vue'), meta: { title: '后台管理', requireAdmin: true } },
  { path: '/agreement', name: 'Agreement', component: () => import('../views/Agreement.vue'), meta: { title: '用户协议' } }
]

const router = createRouter({ history: createWebHistory(), routes })

// 路由守卫：admin页面需要管理员权限
router.beforeEach((to, from, next) => {
  if (to.meta.requireAdmin) {
    const userStore = useUserStore()
    if (!userStore.isAdmin) {
      // 非管理员无法访问，回首页
      return next('/')
    }
  }
  next()
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - AI剪辑脚本平台` : 'AI全能剪辑脚本生成平台'
})

export default router
