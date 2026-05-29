<template>
  <div class="agreement-page">
    <van-nav-bar title="用户协议" left-arrow @click-left="$router.back()" />

    <div class="agreement-content">
      <section class="agr-section">
        <h2>一、服务条款</h2>
        <p>欢迎使用 AI 全能剪辑脚本生成平台（以下简称"本平台"）。使用本平台即表示您同意以下条款。如不同意，请停止使用。</p>
      </section>

      <section class="agr-section">
        <h2>二、账号管理</h2>
        <p>1. 用户注册时需提供真实信息，每位用户将获得唯一用户ID。</p>
        <p>2. 用户应妥善保管账号密码，因账号泄露导致的损失由用户自行承担。</p>
        <p>3. 本平台保留对违规账号进行封禁的权利。</p>
      </section>

      <section class="agr-section">
        <h2>三、内容生成</h2>
        <p>1. 本平台通过 AI 模型生成短视频脚本文案，仅供用户参考使用。</p>
        <p>2. AI 生成内容的版权归生成者所有，但用户需自行判断内容合规性。</p>
        <p>3. 禁止利用本平台生成违法、违规、侵权内容。</p>
      </section>

      <section class="agr-section">
        <h2>四、隐私政策</h2>
        <p>1. 本平台收集的信息仅用于提供服务，不会出售或共享给第三方。</p>
        <p>2. 用户的生成记录存储在平台服务器上，用户可随时删除。</p>
        <p>3. 本平台使用 Cookie 和本地存储来保存用户的偏好设置和登录状态。</p>
      </section>

      <section class="agr-section">
        <h2>五、免责声明</h2>
        <p>1. AI 生成内容可能存在不准确之处，本平台不对内容的准确性做任何保证。</p>
        <p>2. 用户因使用生成内容而产生的任何后果，由用户自行承担。</p>
        <p>3. 本平台保留修改服务条款的权利，修改后的条款将在平台上公布。</p>
      </section>

      <section class="agr-section">
        <h2>六、联系方式</h2>
        <p>如有任何问题或建议，请通过平台反馈功能联系我们。</p>
        <p>版本更新日期：2026年5月30日</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.agreement-page { min-height: 100vh; background: var(--bg-page); padding-bottom: 40px; }
.agreement-content { padding: 20px 16px; max-width: 800px; margin: 0 auto; }
.agr-section { margin-bottom: 24px; }
.agr-section h2 { font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; }
.agr-section p { font-size: 14px; line-height: 1.8; color: var(--text-secondary); margin: 0 0 6px; }
</style>
