const mongoose = require('mongoose')

const promptSchema = new mongoose.Schema({
  agentKey: { type: String, required: true, unique: true },
  content: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Prompt', promptSchema)
