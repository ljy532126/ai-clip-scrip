const mongoose = require('mongoose')

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  showOnce: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Announcement', announcementSchema)
