import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function ParentLogin() {
  const nav = useNavigate()
  const { loginParent, token, isParent } = useAuth()
  const [registerNumber, setRegisterNumber] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token && isParent) nav('/parent', { replace: true })
  }, [token, isParent, nav])

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      await loginParent(registerNumber, parentPhone)
      nav('/parent', { replace: true })
    } catch (x) {
      setErr(x.message || 'Login failed. Please verify the register number and parent contact number.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-backdrop flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <p className="text-center text-white text-sm md:text-base font-medium mb-6 drop-shadow">
          Hostel Management System — Parent Portal
        </p>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-teal-50 border-4 border-orange-200 flex items-center justify-center shadow-lg ring-4 ring-orange-100/50">
              <span className="text-2xl font-bold text-brand-teal">H</span>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Student Register Number</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-brand-teal focus:border-brand-teal outline-none"
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                placeholder="e.g. 211501"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Parent Phone Number</label>
              <input
                type="tel"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-brand-teal outline-none"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="Parent registered phone number"
                required
              />
            </div>
            {err && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{err}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white font-bold py-3 uppercase tracking-wide text-sm shadow-md disabled:opacity-60 transition"
            >
              Verify & Enter Portal
            </button>
          </form>
          <p className="text-center mt-6 text-sm">
            <Link to="/" className="text-brand-orange font-medium hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
