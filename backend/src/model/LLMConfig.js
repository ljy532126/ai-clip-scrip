const mongoose = require('mongoose')

const llmConfigSchema = new mongoose.Schema({
  name: { type: String, required: true },
  provider: { type: String, required: true },
  apiUrl: { type: String, required: true },
  apiKey: { type: String, required: true },
  model: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
})

llmConfigSchema.index({ isActive: 1 })

module.exports = mongoose.model('LLMConfig', llmConfigSchema)
