import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { db } from './db.js'
import { runSeed } from './seed.js'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import studentRoutes from './routes/student.js'
import parentRoutes from './routes/parent.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

runSeed()

const app = express()
const PORT = Number(process.env.PORT) || 8080

// ====== SECURITY HEADERS MIDDLEWARE ======
// This makes your app secure like YouTube, Instagram
app.use((req, res, next) => {
  // Force HTTPS redirect (will work with ngrok/reverse proxy)
  if (process.env.NODE_ENV === 'production') {
    // Check if forwarded proto is http (ngrok/reverse proxy header)
    if (req.headers['x-forwarded-proto'] === 'http') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`)
    }
  }
  
  // Security Headers (like YouTube, Instagram)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains') // Force HTTPS for 1 year
  res.setHeader('X-Content-Type-Options', 'nosniff') // Prevent MIME sniffing
  res.setHeader('X-Frame-Options', 'DENY') // Prevent clickjacking
  res.setHeader('X-XSS-Protection', '1; mode=block') // XSS protection
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin') // Privacy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()') // Restrict features
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:") // Prevent XSS attacks
  
  next()
})

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost, 127.0.0.1, development ports, and ngrok domains
      if (!origin || 
          origin.includes('localhost') || 
          origin.includes('127.0.0.1') || 
          origin.includes('5173') ||
          origin.includes('5174') ||
          origin.includes('8080') ||
          origin.includes('ngrok') || 
          origin.includes('.ngrok.app') ||
          origin.includes('.ngrok.io')) {
        callback(null, true)
      } else {
        callback(null, true) // Allow all for development
      }
    },
    credentials: true,
  }),
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint (used for monitoring)
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    db: 'sqlite',
    secure: req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https',
    timestamp: new Date().toISOString() 
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/parent', parentRoutes)

// Serve static frontend files (if built)
const frontendDistPath = path.join(__dirname, '../../frontend/dist')
app.use(express.static(frontendDistPath))

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  // Don't redirect API requests
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API endpoint not found' })
  }
  // Serve index.html for all other routes (SPA)
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(500).json({ message: 'Error serving application' })
    }
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[ERROR]', err)
  res.status(500).json({ message: err.message || 'Server error' })
})

export default app
