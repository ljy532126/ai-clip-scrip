import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 主题状态
export const useThemeStore = defineStore('theme', () => {
  const saved = localStorage.getItem('theme')
  const isDark = ref(saved === 'dark')

  const toggle = () => {
    isDark.value = !isDark.value
    const val = isDark.value ? 'dark' : 'light'
    localStorage.setItem('theme', val)
    document.documentElement.setAttribute('data-theme', val)
  }

  const init = () => {
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }

  return { isDark, toggle, init }
})

// 用户状态
export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')

  // 从 localStorage 恢复用户信息（刷新不丢失）
  let savedInfo = null
  try { savedInfo = JSON.parse(localStorage.getItem('userInfo') || 'null') } catch {}
  const userInfo = ref(savedInfo)

  const isLogin = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.role === 'admin')
  const userId = computed(() => userInfo.value?.userId || '')

  const login = (t, info) => {
    token.value = t
    userInfo.value = info
    localStorage.setItem('token', t)
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  const setUserInfo = (info) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  // 有 token 但没 userInfo 时，从后端拉取
  const fetchUserInfo = async () => {
    if (!token.value) return
    try {
      const { userAPI } = await import('../api')
      const d = await userAPI.getUserInfo()
      if (d && d.role && d.role !== 'guest') {
        setUserInfo(d)
      }
    } catch {}
  }

  return { token, userInfo, isLogin, isAdmin, userId, login, logout, setUserInfo, fetchUserInfo }
})

// 生成状态
export const useGenerateStore = defineStore('generate', () => {
  const currentAgent = ref('oral')
  const generating = ref(false)
  const results = ref(null)
  const error = ref('')

  const setAgent = (a) => { currentAgent.value = a; results.value = null; error.value = '' }
  const setGenerating = (v) => { generating.value = v; if (v) error.value = '' }
  const setResults = (d) => { results.value = d; generating.value = false }
  const setError = (m) => { error.value = m; generating.value = false }

  return { currentAgent, generating, results, error, setAgent, setGenerating, setResults, setError }
})
