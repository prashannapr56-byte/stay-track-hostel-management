// Vercel Serverless Entry Point
// This file wraps the Express app for Vercel's serverless runtime.
// Vercel looks for `api/index.js` in the backend service root.
import app from '../src/app.js'

export default app
