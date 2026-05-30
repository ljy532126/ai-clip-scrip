const mongoose = require('mongoose')

const recordSchema = new mongoose.Schema({
  agent: { type: String, required: true },
  keywords: { type: String, required: true },
  detail: { type: String, default: 'standard' },
  styles: [String],
  duration: { type: Number, default: 60 },
  wordCount: { type: Number, default: 500 },
  documents: {
    script: String,
    operation: String,
    readme: String,
    seo: String
  },
  tokensUsed: { type: Number, default: 0 },
  userId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
})

recordSchema.index({ createdAt: -1 })
recordSchema.index({ agent: 1, createdAt: -1 })

module.exports = mongoose.model('Record', recordSchema)
