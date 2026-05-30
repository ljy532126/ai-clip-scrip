const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, default: () => uuidv4().slice(0, 8) },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, default: '' },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  banned: { type: Boolean, default: false },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Record' }],
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('User', userSchema)
