import { useEffect, useState } from 'react'
import { api } from '../../api/client'

export function StudentDashboard() {
  const [d, setD] = useState(null)
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  function load() {
    api('/student/dashboard')
      .then(setD)
      .catch((e) => setErr(e.message))
  }

  useEffect(() => {
    load()
  }, [])

  async function raise(e) {
    e.preventDefault()
    setErr('')
    setMsg('')
    try {
      await api('/student/complaints', {
        method: 'POST',
        body: JSON.stringify({ description: text }),
      })
      setText('')
      setMsg('Complaint submitted.')
      load()
    } catch (x) {
      setErr(x.message)
    }
  }

  if (!d && !err) return <p className="text-slate-600">Loading…</p>
  if (err && !d) return <p className="text-red-600">{err}</p>

  const p = d.profile
  const room = d.room

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800">Overview</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="h-8 w-1 rounded-full bg-brand-orange" />
            My profile
          </h3>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium">{p.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Register no.</dt>
              <dd>{p.registerNumber}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Department</dt>
              <dd>{p.department}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Phone</dt>
              <dd>{p.studentContact}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Parent contact</dt>
              <dd>{p.parentContact}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center text-center">
          <h3 className="font-semibold text-slate-800 mb-4 w-full text-left flex items-center gap-2">
            <span className="h-8 w-1 rounded-full bg-brand-teal" />
            My attendance
          </h3>
          <div
            className="relative w-36 h-36 rounded-full flex items-center justify-center text-3xl font-bold text-brand-teal"
            style={{
              background: `conic-gradient(var(--tw-gradient-stops))`,
              backgroundImage: `conic-gradient(#0f766e ${d.attendance.percentPresent * 3.6}deg, #e2e8f0 0)`,
            }}
          >
            <div className="absolute inset-3 rounded-full bg-white flex items-center justify-center shadow-inner">
              <span>{d.attendance.percentPresent}%</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 mt-3">
            Based on {d.attendance.totalDaysMarked} marked day(s)
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 mb-3">Room details</h3>
          {room ? (
            <ul className="text-sm space-y-2">
              <li>
                <span className="text-slate-500">Block & room:</span>{' '}
                <strong>
                  {room.blockCode} — {room.roomNumber}
                </strong>
              </li>
              <li>
                <span className="text-slate-500">Check-in:</span> {room.checkInDate}
              </li>
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">No room assigned yet. Contact admin.</p>
          )}
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 mb-3">Notifications</h3>
          <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
            {d.notifications.slice(0, 5).map((n) => (
              <li key={n.id} className="border-b border-slate-100 pb-2">
                <p className="font-medium text-slate-800">{n.title}</p>
                <p className="text-slate-600">{n.message}</p>
              </li>
            ))}
            {d.notifications.length === 0 && <li className="text-slate-500">No notifications.</li>}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="font-semibold text-slate-800">Raise complaint</h3>
        </div>
        <form onSubmit={raise} className="space-y-3">
          <textarea
            className="w-full rounded-xl border border-slate-200 px-3 py-2 min-h-[100px]"
            placeholder="Describe issue or compliance concern"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          {err && <p className="text-red-600 text-sm">{err}</p>}
          {msg && <p className="text-emerald-600 text-sm">{msg}</p>}
          <button
            type="submit"
            className="rounded-xl bg-brand-orange text-white font-bold px-6 py-2.5 uppercase text-sm"
          >
            Raise complaint
          </button>
        </form>
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Your requests</h4>
          <ul className="space-y-2 text-sm">
            {d.complaints.map((c) => (
              <li key={c.id} className="flex flex-wrap gap-2 items-center">
                <span className="text-slate-800">
                  {c.description.length > 90 ? `${c.description.slice(0, 90)}…` : c.description}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    c.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {c.status}
                </span>
              </li>
            ))}
            {d.complaints.length === 0 && <li className="text-slate-500">No complaints yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}
