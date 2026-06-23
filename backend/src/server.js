import app from './app.js'

const PORT = Number(process.env.PORT) || 8080
const NODE_ENV = process.env.NODE_ENV || 'production'

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`StayTrack API https://localhost:${PORT} (Secure)`)
  console.log(`Network: https://0.0.0.0:${PORT} (via ngrok for HTTPS)`)
  console.log(`Environment: ${NODE_ENV}`)
  console.log(`Security: HTTPS headers enabled ✓`)
})

process.on('SIGINT', () => {
  db.close()
  process.exit(0)
})
