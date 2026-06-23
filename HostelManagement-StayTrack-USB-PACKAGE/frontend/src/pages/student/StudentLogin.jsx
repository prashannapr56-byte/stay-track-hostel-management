import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

export function StudentLogin() {
  const nav = useNavigate()
  const { loginStudentPassword, loginStudentOtp, token, isStudent } = useAuth()
  const [mode, setMode] = useState('password')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [otpHint, setOtpHint] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token && isStudent) nav('/student', { replace: true })
  }, [token, isStudent, nav])

  async function sendLoginOtp() {
    setErr('')
    setLoading(true)
    try {
      const res = await api('/auth/student/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, purpose: 'LOGIN' }),
      })
      setDevOtp(res.devOtp || '')
      setOtpHint(res.message || '')
    } catch (x) {
      setErr(x.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  async function submitPassword(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      await loginStudentPassword(username, password)
      nav('/student', { replace: true })
    } catch (x) {
      setErr(x.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function submitOtp(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      await loginStudentOtp(phone, otp)
      nav('/student', { replace: true })
    } catch (x) {
      setErr(x.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-backdrop flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <p className="text-center text-white text-sm font-medium mb-6">Student access</p>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md ${mode === 'password' ? 'bg-white shadow text-brand-teal' : 'text-slate-600'}`}
              onClick={() => setMode('password')}
            >
              Register no. + password
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md ${mode === 'otp' ? 'bg-white shadow text-brand-teal' : 'text-slate-600'}`}
              onClick={() => setMode('otp')}
            >
              Phone + OTP
            </button>
          </div>

          {mode === 'password' ? (
            <form onSubmit={submitPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Register number</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-teal"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. 23CS001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {err && <p className="text-sm text-red-600">{err}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-brand-orange text-white font-bold py-3 uppercase text-sm disabled:opacity-60"
              >
                Login
              </button>
            </form>
          ) : (
            <form onSubmit={submitOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 outline-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={sendLoginOtp}
                    disabled={loading || !phone}
                    className="shrink-0 px-3 rounded-lg bg-brand-teal text-white text-sm font-medium disabled:opacity-50"
                  >
                    Send OTP
                  </button>
                </div>
              </div>
              {otpHint && (
                <p className="text-xs bg-slate-100 text-slate-700 rounded-lg px-3 py-2 border border-slate-200">
                  {otpHint}
                </p>
              )}
              {devOtp && (
                <p className="text-xs bg-amber-50 text-amber-900 rounded-lg px-3 py-2">Your code (dev): {devOtp}</p>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">OTP</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              {err && <p className="text-sm text-red-600">{err}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-brand-orange text-white font-bold py-3 uppercase text-sm disabled:opacity-60"
              >
                Login with OTP
              </button>
            </form>
          )}

          <p className="text-center mt-4 text-sm">
            <Link to="/student/register" className="text-brand-teal font-medium hover:underline">
              Create account
            </Link>
            {' · '}
            <Link to="/" className="text-slate-500 hover:underline">
              Home
            </Link>
          </p>
          <p className="text-center text-xs text-slate-500 mt-2">
            Demo: register <strong>23CS001</strong> / password <strong>student123</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
