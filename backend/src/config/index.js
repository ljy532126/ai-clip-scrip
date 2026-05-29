// 环境配置
module.exports = {
  // 服务端口
  port: process.env.PORT || 3000,

  // MiMo AI API配置
  mimo: {
    apiKey: process.env.MIMO_API_KEY || '',
    apiUrl: process.env.MIMO_API_URL || 'https://api.mimo.ai/v1',
    model: process.env.MIMO_MODEL || 'mimo-chat'
  },

  // MongoDB
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clip-script-platform',

  // 文件输出目录
  outputDir: process.env.OUTPUT_DIR || './output',

  // JWT密钥
  jwtSecret: process.env.JWT_SECRET || 'clip-script-platform-secret-key'
}
