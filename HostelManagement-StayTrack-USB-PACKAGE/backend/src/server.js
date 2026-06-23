import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { db } from './db.js'
import { runSeed } from './seed.js'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import studentRoutes from './routes/student.js'

runSeed()

const app = express()
const PORT = Number(process.env.PORT) || 8080

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
)
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ ok: true, db: 'sqlite' })
})

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/student', studentRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: err.message || 'Server error' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`StayTrack API http://localhost:${PORT}`)
})

process.on('SIGINT', () => {
  db.close()
  process.exit(0)
})
