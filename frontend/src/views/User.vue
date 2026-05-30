<template>
  <div class="user-page">
    <van-nav-bar title="个人中心" />

    <div class="user-header">
      <van-image round width="64" height="64" :src="userStore.userInfo?.avatar || defaultAvatar" />
      <template v-if="userStore.isLogin">
        <div class="user-name">{{ userStore.userInfo?.nickname || '用户' }}</div>
        <div class="user-id" @click="copyId">
          ID: {{ userStore.userId }}
          <span class="uid-copy"><CopyIcon size="14" fill="#9e9689"/></span>
        </div>
        <div class="user-role">
          <van-tag :type="userStore.isAdmin ? 'danger' : ''" size="small"> {{ userStore.isAdmin ? '管理员' : '普通用户' }} </van-tag>
        </div>
        <van-button size="small" plain type="danger" @click="userStore.logout()">退出登录</van-button>
      </template>
      <template v-else>
        <van-button type="primary" size="small" round @click="showLogin = true">登录 / 注册</van-button>
      </template>
    </div>

    <!-- 用户统计数据 -->
    <div class="user-stats" v-if="userStore.isLogin">
      <div class="ustat">
        <div class="ustat-val">{{ userStats.total }}</div>
        <div class="ustat-lbl">总生成</div>
      </div>
      <div class="ustat">
        <div class="ustat-val">{{ userStats.today }}</div>
        <div class="ustat-lbl">今日</div>
      </div>
      <div class="ustat">
        <div class="ustat-val">{{ formatNum(userStats.totalWords) }}</div>
        <div class="ustat-lbl">累计字数</div>
      </div>
      <div class="ustat">
        <div class="ustat-val">{{ formatNum(userStats.totalTokens) }}</div>
        <div class="ustat-lbl">累计Token</div>
      </div>
    </div>

    <van-cell-group inset style="margin-top:12px;">
      <van-cell title="主题切换" center @click.stop>
        <template #icon><ConfigIcon size="22" fill="#6b6255" style="margin-right:14px;"/></template>
        <template #right-icon>
          <van-switch :model-value="themeStore.isDark" @update:model-value="themeStore.toggle()" size="24" @click.stop />
        </template>
      </van-cell>
      <van-cell title="我的收藏" is-link to="/record?tab=favorites">
        <template #icon><StarIcon size="22" fill="#6b6255" style="margin-right:14px;"/></template>
      </van-cell>
      <van-cell v-if="userStore.isAdmin" title="后台管理" is-link to="/admin">
        <template #icon><SettingIcon size="22" fill="#6b6255" style="margin-right:14px;"/></template>
      </van-cell>
      <van-cell title="用户协议" is-link to="/agreement">
        <template #icon><DocDetailIcon size="22" fill="#6b6255" style="margin-right:14px;"/></template>
      </van-cell>
      <van-cell title="GitHub" is-link url="https://github.com">
        <template #icon><GithubIcon size="22" fill="#6b6255" style="margin-right:14px;"/></template>
      </van-cell>
      <van-cell title="关于平台" value="v1.0.0">
        <template #icon><InfoIcon size="22" fill="#6b6255" style="margin-right:14px;"/></template>
      </van-cell>
    </van-cell-group>

    <!-- 登录/注册弹窗 — 底部弹出 -->
    <van-popup v-model:show="showLogin" position="bottom" round :style="{ height: 'auto', maxHeight: '70vh' }" :close-on-click-overlay="true" @click-overlay="resetForm">
      <div class="auth-panel">
        <!-- 标题栏 -->
        <div class="auth-header">
          <div class="auth-tabs">
            <div class="auth-tab" :class="{ active: loginMode === 'login' }" @click="loginMode = 'login'">登录</div>
            <div class="auth-tab" :class="{ active: loginMode === 'register' }" @click="loginMode = 'register'">注册</div>
          </div>
          <div class="auth-close" @click="showLogin = false">✕</div>
        </div>

        <!-- 表单 -->
        <div class="auth-body">
          <div class="auth-field">
            <UserIcon size="18" fill="#9e9689"/>
            <input ref="usernameInput" v-model="loginForm.username" class="auth-input" placeholder="请输入用户名" autocomplete="off" name="random-user" />
          </div>
          <div class="auth-field">
            <LockIcon size="18" fill="#9e9689"/>
            <input v-model="loginForm.password" class="auth-input" type="password" placeholder="请输入密码" autocomplete="new-password" name="random-pass" />
          </div>

          <button class="auth-btn" @click="loginMode === 'login' ? onLogin() : onRegister()">
            {{ loginMode === 'login' ? '登 录' : '注 册' }}
          </button>

          <p class="auth-hint" v-if="loginMode === 'register'">输入用户名和密码即可创建账号，每人拥有唯一ID</p>
        </div>
      </div>
    </van-popup>

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
import { ref, reactive, onMounted } from 'vue'
import { useUserStore, useThemeStore } from '../store'
import { userAPI } from '../api'
import { Home, Magic, Tool, History, People, User as UserIcon, Lock as LockIcon, Copy as CopyIcon, Config as ConfigIcon, Star as StarIcon, SettingConfig as SettingIcon, DocDetail as DocDetailIcon, Github as GithubIcon, Info as InfoIcon } from '@icon-park/vue-next'
const IconHome=Home;const IconMagic=Magic;const IconTool=Tool;const IconHistory=History;const IconPeople=People
import { showToast, showSuccessToast, showFailToast } from 'vant'
const userStore = useUserStore(); const themeStore = useThemeStore()
const active = ref(4); const showLogin = ref(false); const loginMode = ref('login'); const usernameInput = ref(null)
const defaultAvatar = 'https://img.yzcdn.cn/vant/cat.jpeg'
const loginForm = reactive({ username: '', password: '' })
const userStats = reactive({ total: 0, today: 0, totalWords: 0, totalTokens: 0 })

onMounted(async () => {
  if (userStore.isLogin) {
    try { Object.assign(userStats, await userAPI.getMyStats()) } catch {}
  }
})

const onLogin = async () => {
  if (!loginForm.username.trim() || !loginForm.password.trim()) { showToast('请输入用户名和密码'); return }
  try {
    const d = await userAPI.login({ username: loginForm.username.trim(), password: loginForm.password })
    userStore.login(d.token, d.userInfo)
    showSuccessToast('登录成功'); resetForm(); showLogin.value = false
    try { Object.assign(userStats, await userAPI.getMyStats()) } catch {}
  } catch (err) { showFailToast(err.message) }
}

const onRegister = async () => {
  if (!loginForm.username.trim() || !loginForm.password.trim()) { showToast('请输入用户名和密码'); return }
  if (loginForm.password.length < 3) { showToast('密码至少3位'); return }
  try {
    const d = await userAPI.register({ username: loginForm.username.trim(), password: loginForm.password })
    userStore.login(d.token, d.userInfo)
    showSuccessToast('注册成功'); resetForm(); showLogin.value = false
    try { Object.assign(userStats, await userAPI.getMyStats()) } catch {}
  } catch (err) { showFailToast(err.message) }
}

const resetForm = () => { loginForm.username = ''; loginForm.password = ''; loginMode.value = 'login' }
const formatNum = n => n >= 10000 ? (n / 10000).toFixed(1) + '万' : n.toLocaleString()
const copyId = () => {
  if (!userStore.userId) return
  navigator.clipboard.writeText(userStore.userId).then(() => showSuccessToast('ID已复制')).catch(() => showToast('复制失败'))
}
</script>

<style scoped>
.user-page { padding-bottom: 60px; min-height: 100vh; background: var(--bg-page); }
.user-header { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 30px 20px; background: var(--bg-card); border-bottom: 1px solid var(--border-color); }
.user-name { font-size: 18px; font-weight: 600; color: var(--text-primary); }
.user-id { font-size: 12px; color: var(--text-muted); font-family: monospace; cursor: pointer; user-select: all; display: flex; align-items: center; gap: 6px; }
.user-id:hover { color: var(--accent); }
.uid-copy { font-size: 14px; opacity: 0.5; }
.user-id:hover .uid-copy { opacity: 1; }
.user-role { margin-bottom: 4px; }

.user-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: var(--border-color); }
.ustat { background: var(--bg-card); padding: 16px 8px; text-align: center; }
.ustat-val { font-size: 20px; font-weight: 700; color: var(--accent); }
.ustat-lbl { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

/* 底部登录面板 */
.auth-panel {
  background: var(--bg-surface);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  overflow: hidden;
}
.auth-header {
  display: flex; align-items: center; padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
}
.auth-tabs { display: flex; flex: 1; }
.auth-tab {
  flex: 1; text-align: center; padding: 16px 0; font-size: 16px; font-weight: 600;
  color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s;
}
.auth-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
.auth-close {
  width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--border-color);
  display: flex; align-items: center; justify-content: center; font-size: 16px;
  color: var(--text-muted); cursor: pointer; flex-shrink: 0;
}

.auth-body { padding: 24px 20px 30px; display: flex; flex-direction: column; gap: 14px; }
.auth-field {
  display: flex; align-items: center; gap: 10px;
  padding: 0 14px; background: var(--bg-input); border: 1px solid var(--border-color);
  border-radius: var(--radius-sm); transition: border-color 0.2s;
}
.auth-field:focus-within { border-color: var(--accent); }
.auth-input {
  flex: 1; padding: 13px 0; border: none; outline: none; background: transparent;
  color: var(--text-primary); font-size: 15px;
}
.auth-input::placeholder { color: var(--text-muted); }

.auth-btn {
  width: 100%; padding: 14px; border: none; border-radius: 50px;
  background: linear-gradient(135deg, #d4914a, #c97b6b);
  color: #fff; font-size: 16px; font-weight: 700;
  cursor: pointer; margin-top: 6px; letter-spacing: 4px;
}
.auth-btn:active { opacity: 0.9; transform: scale(0.98); }

.auth-hint {
  font-size: 12px; color: var(--text-muted); text-align: center; line-height: 1.5;
}
</style>
