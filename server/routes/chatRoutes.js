const express = require('express')
const router = express.Router()
const chatController = require('../controllers/chatController')

router.post('/query', chatController.handleQuery)
router.post('/followup', chatController.handleFollowUp)
router.get('/history/:id', async (req, res) => {
  try {
    const Chat = require('../models/Chat')
    const chat = await Chat.findById(req.params.id)
    if (!chat) return res.status(404).json({ error: 'Chat not found' })
    res.json(chat)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router