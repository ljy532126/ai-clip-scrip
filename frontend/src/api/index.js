import axios from 'axios'

// 打包成 APK 时改为电脑 LAN IP，如：http://10.168.1.101:3013/api
const APK_BASE = import.meta.env.VITE_API_BASE || '/api'

const http = axios.create({
  baseURL: APK_BASE,
  timeout: 120000
})

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const msg = error.response?.data?.message || '请求失败，请稍后重试'
    return Promise.reject(new Error(msg))
  }
)

// 生成相关API
export const generateAPI = {
  // 提交生成任务
  generate: (data) => http.post('/generate', data),
  // 获取生成历史
  getHistory: (params) => http.get('/history', { params }),
  // 获取单条记录
  getRecord: (id) => http.get(`/record/${id}`),
  // 删除记录
  deleteRecord: (id) => http.delete(`/record/${id}`)
}

// 用户相关API
export const userAPI = {
  login: (data) => http.post('/user/login', data),
  register: (data) => http.post('/user/register', data),
  getUserInfo: () => http.get('/user/info'),
  getMyStats: () => http.get('/user/mystats'),
  addFavorite: (recordId) => http.post('/user/favorite', { recordId }),
  removeFavorite: (recordId) => http.post('/user/unfavorite', { recordId }),
  getFavorites: () => http.get('/user/favorites'),
  changePassword: (data) => http.post('/user/password', data),
  updateAvatar: (data) => http.post('/user/avatar', data)
}

// 工具箱API
export const toolboxAPI = {
  subtitle: (data) => http.post('/toolbox/subtitle', data),
  polish: (data) => http.post('/toolbox/polish', data),
  storyboard: (data) => http.post('/toolbox/storyboard', data)
}

// 后台管理API
export const adminAPI = {
  getPrompts: () => http.get('/admin/prompts'),
  updatePrompt: (id, data) => http.put(`/admin/prompt/${id}`, data),
  getStats: () => http.get('/admin/stats'),
  getRankedStats: (params) => http.get('/admin/stats', { params }),
  createAnnouncement: (data) => http.post('/admin/announcement', data),
  deleteAnnouncement: (id) => http.delete(`/admin/announcement/${id}`),
  // LLM 配置
  getLLMConfigs: () => http.get('/admin/llm'),
  createLLMConfig: (data) => http.post('/admin/llm', data),
  updateLLMConfig: (id, data) => http.put(`/admin/llm/${id}`, data),
  deleteLLMConfig: (id) => http.delete(`/admin/llm/${id}`),
  activateLLMConfig: (id) => http.post(`/admin/llm/${id}/activate`),
  testLLM: (data) => http.post('/admin/llm/test', data),
  getUsers: () => http.get('/admin/users'),
  toggleBan: (userId) => http.post('/admin/user/ban', { userId })
}

// 公告API（公开）
export const announceAPI = {
  getList: () => http.get('/announcements')
}

export default http
