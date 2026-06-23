import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function AdminLogin() {
  const nav = useNavigate()
  const { loginAdmin, token, isAdmin } = useAuth()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token && isAdmin) nav('/admin', { replace: true })
  }, [token, isAdmin, nav])

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      await loginAdmin(username, password)
      nav('/admin', { replace: true })
    } catch (x) {
      setErr(x.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-backdrop flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <p className="text-center text-white text-sm md:text-base font-medium mb-6 drop-shadow">
          Hostel Management System — Admin Portal
        </p>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-teal-50 border-4 border-orange-200 flex items-center justify-center shadow-lg ring-4 ring-orange-100/50">
              <span className="text-2xl font-bold text-brand-teal">H</span>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-brand-teal focus:border-brand-teal outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-brand-teal outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
              />
            </div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white font-bold py-3 uppercase tracking-wide text-sm shadow-md disabled:opacity-60"
            >
              Admin Login
            </button>
          </form>
          <p className="text-center mt-4 text-sm">
            <Link to="/" className="text-brand-teal font-medium hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
