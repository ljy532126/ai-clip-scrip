const mongoose = require('mongoose')
const config = require('../config')

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri)
    console.log('MongoDB连接成功')
  } catch (err) {
    console.warn('MongoDB连接失败，使用内存存储降级:', err.message)
  }
}

module.exports = { connectDB, mongoose }
