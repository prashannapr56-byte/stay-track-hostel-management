import app from './app.js'

const PORT = Number(process.env.PORT) || 8080
const NODE_ENV = process.env.NODE_ENV || 'production'

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`StayTrack API running on port ${PORT}`)
  console.log(`Environment: ${NODE_ENV}`)
})

process.on('SIGINT', () => {
  server.close()
  process.exit(0)
})

process.on('SIGTERM', () => {
  server.close()
  process.exit(0)
})
