const base = () => (import.meta.env.VITE_API_BASE || '') + '/api'

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

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  if (!headers['Content-Type'] && options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json'
  }
  const t = getToken()
  if (t) headers.Authorization = `Bearer ${t}`
  let res
  try {
    res = await fetch(`${base()}${path}`, { ...options, headers })
  } catch {
    throw new Error(`Cannot reach server. ${API_HELP}`)
  }
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
      throw new Error(`Bad gateway (${res.status}): API not running on port 8080 (npm start in backend). ${API_HELP}`)
    }
    const msg = data?.message || (typeof data === 'string' ? data : res.statusText)
    throw new Error(msg || 'Request failed')
  }
  return data
}
