import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api/client'

export function StudentRegister() {
  const nav = useNavigate()
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [devOtp, setDevOtp] = useState('')
  const [otpHint, setOtpHint] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [registerNumber, setRegisterNumber] = useState('')
  const [studentContact, setStudentContact] = useState('')
  const [parentContact, setParentContact] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendOtp(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const res = await api('/auth/student/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, purpose: 'REGISTER' }),
      })
      setOtpSent(true)
      setDevOtp(res.devOtp || '')
      setOtpHint(res.message || '')
      setStudentContact(phone)
    } catch (x) {
      setErr(x.message || 'Could not send OTP')
    } finally {
      setLoading(false)
    }
  }

  async function register(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      await api('/auth/student/register', {
        method: 'POST',
        body: JSON.stringify({
          phone,
          otp,
          name,
          department,
          registerNumber,
          studentContact,
          parentContact,
          password,
        }),
      })
      nav('/student/login', { replace: true, state: { registered: true } })
    } catch (x) {
      setErr(x.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-backdrop flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <p className="text-center text-white text-sm md:text-base font-medium mb-6 drop-shadow">
          Hostel Management System — User Registration
        </p>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-teal-50 border-4 border-emerald-300 flex items-center justify-center text-3xl shadow-inner">
                👤
              </div>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase">
                New user
              </span>
            </div>
          </div>

          {!otpSent ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <p className="text-sm text-slate-600">
                Create an account using your phone number. We will send an OTP to verify it.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Student contact (phone)</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-brand-teal outline-none"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone for OTP"
                />
              </div>
              {err && <p className="text-sm text-red-600">{err}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white font-bold py-3 uppercase text-sm disabled:opacity-60"
              >
                Send OTP
              </button>
            </form>
          ) : (
            <form onSubmit={register} className="space-y-3">
              {otpHint && (
                <p className="text-xs bg-slate-100 text-slate-700 rounded-lg px-3 py-2 border border-slate-200">
                  {otpHint}
                </p>
              )}
              {devOtp && (
                <p className="text-xs bg-amber-50 text-amber-900 rounded-lg px-3 py-2 border border-amber-200">
                  Your code (dev): <strong>{devOtp}</strong>
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">OTP</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-teal"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Register number</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none"
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Student contact</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none"
                  value={studentContact}
                  onChange={(e) => setStudentContact(e.target.value)}
                  placeholder="Must match phone used for OTP"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parent contact</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none"
                  value={parentContact}
                  onChange={(e) => setParentContact(e.target.value)}
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
                className="w-full rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white font-bold py-3 uppercase text-sm disabled:opacity-60"
              >
                Create account
              </button>
            </form>
          )}

          <p className="text-center mt-4 text-sm text-brand-teal">
            <Link to="/student/login" className="font-medium hover:underline">
              Already have an account? Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
