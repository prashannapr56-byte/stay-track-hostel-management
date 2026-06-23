const base = () => {
  // On production/mobile, use explicit API URL; otherwise use relative path
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE + '/api'
  }
  
  // For development: if accessed from network IP, construct API URL
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Always use HTTPS if available (ngrok, production)
    const protocol = window.location.protocol.includes('https') || window.location.hostname.includes('ngrok') ? 'https' : 'http'
    return `${protocol}://${window.location.hostname}:8080/api`
  }
  
  // For localhost development
  if (typeof window !== 'undefined') {
    // If using ngrok, use HTTPS
    if (window.location.protocol === 'https:') {
      return `https://${window.location.hostname}:8080/api`
    }
  }
  
  return '/api'
}

function getToken() {
  return localStorage.getItem('staytrack_token')
}

export function setSession(token, role, displayName) {
  if (token) localStorage.setItem('staytrack_token', token)
  else localStorage.removeItem('staytrack_token')
  if (role) localStorage.setItem('staytrack_role', role)
  else localStorage.removeItem('staytrack_role')
  if (displayName) localStorage.setItem('staytrack_name', displayName)
  else localStorage.removeItem('staytrack_name')
}

export function clearSession() {
  setSession(null, null, null)
}

export function readSession() {
  return {
    token: localStorage.getItem('staytrack_token'),
    role: localStorage.getItem('staytrack_role'),
    displayName: localStorage.getItem('staytrack_name'),
  }
}

const API_HELP =
  'Start the API on port 8080: cd backend → npm install → npm start (Node.js + SQLite). OTP by SMS only if Twilio env vars are set in backend/.env — see .env.example.'

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000 // 1 second

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function apiFetch(apiUrl, options = {}, retryCount = 0) {
  const headers = { ...(options.headers || {}) }
  if (!headers['Content-Type'] && options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json'
  }
  const t = getToken()
  if (t) headers.Authorization = `Bearer ${t}`
  
  try {
    const res = await fetch(apiUrl, { ...options, headers, timeout: 10000 })
    
    const text = await res.text()
    let data = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = text
      }
    }
    
    if (!res.ok) {
      if (res.status === 502 || res.status === 503) {
        throw new Error(`Bad gateway (${res.status}): Server may be restarting...`)
      }
      if (res.status === 401 && data?.message === 'Invalid token') {
        clearSession()
        throw new Error('Session expired. Please log in again.')
      }
      const msg = data?.message || (typeof data === 'string' ? data : res.statusText)
      throw new Error(msg || 'Request failed')
    }
    return data
  } catch (error) {
    // Retry on network errors or 502/503 errors
    const isNetworkError = !error.message.includes('Session expired') && 
                           !error.message.includes('Invalid token')
    const shouldRetry = isNetworkError && retryCount < MAX_RETRIES
    
    if (shouldRetry) {
      console.warn(`[API Retry ${retryCount + 1}/${MAX_RETRIES}] ${error.message}`)
      await sleep(RETRY_DELAY_MS * (retryCount + 1)) // exponential backoff
      return apiFetch(apiUrl, options, retryCount + 1)
    }
    
    // Final error
    if (!error.message.includes('Session expired')) {
      console.error(`[API Error] ${error.message}`)
    }
    throw error
  }
}

export async function api(path, options = {}) {
  const apiUrl = `${base()}${path}`
  return apiFetch(apiUrl, options)
}
