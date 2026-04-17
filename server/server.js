const path = require('path')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const mongoose = require('mongoose')

const envPath = path.resolve(__dirname, '.env')
dotenv.config({ path: envPath })

const app = express()

const allowedOrigins = (process.env.CORS_ORIGINS || 'https://cura-link-69v1.vercel.app,http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

app.set('trust proxy', 1)
app.use(helmet())
app.use(compression())
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('CORS policy: Access denied'))
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}))

app.options('*', cors())

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
})

app.use('/api', apiLimiter)

mongoose.set('strictQuery', true)

if (!process.env.MONGO_URI) {
  console.error('Missing MONGO_URI in environment configuration.')
  process.exit(1)
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() })
})

app.get('/', (req, res) => {
  res.send('Medical AI API Server is running')
})

const chatRoutes = require('./routes/chatRoutes')
app.use('/api/chat', chatRoutes)

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err)
  const status = err.status || 500
  res.status(status).json({ error: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})