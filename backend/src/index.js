import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

app.get('/api', (req, res) => {
  res.json({ message: 'API is running' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`)
})
