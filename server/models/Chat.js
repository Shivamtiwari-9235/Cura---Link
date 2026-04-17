const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'] },
  text: String,
  time: { type: Date, default: Date.now }
})

const chatSchema = new mongoose.Schema({
  disease: String,
  patientName: String,
  location: String,
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Chat', chatSchema)