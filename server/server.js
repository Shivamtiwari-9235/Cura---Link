const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config()

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}))

app.options('*', cors())
app.use(express.json({ limit: '10mb' }))

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err))

app.get('/', (req, res) => {
  res.json({ message: 'Curalink API running', status: 'ok' })
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    groq: !!process.env.GROQ_API_KEY,
    mongo: mongoose.connection.readyState === 1
  })
})

const chatRoutes = require('./routes/chatRoutes')
app.use('/api/chat', chatRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
  console.log('Groq API Key exists:', !!process.env.GROQ_API_KEY)
})