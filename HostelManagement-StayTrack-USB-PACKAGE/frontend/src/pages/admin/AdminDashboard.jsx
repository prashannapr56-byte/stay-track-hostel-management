import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'

export function AdminDashboard() {
  const [d, setD] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    api('/admin/dashboard')
      .then(setD)
      .catch((e) => setErr(e.message))
  }, [])

  if (err) return <p className="text-red-600">{err}</p>
  if (!d) return <p className="text-slate-600">Loading dashboard…</p>

  const cards = [
    { label: 'Total students', value: d.totalStudents, color: 'bg-teal-600' },
    { label: 'Total rooms', value: d.totalRooms, color: 'bg-slate-700' },
    { label: 'Rooms with space', value: d.availableRooms, color: 'bg-emerald-600' },
    { label: 'Complaints', value: d.totalComplaints, color: 'bg-brand-orange' },
  ]

  const a = d.attendanceOverview || {}

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Live hostel status</h2>
        <p className="text-slate-600 text-sm mt-1">Overview for management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl bg-white shadow-sm border border-slate-200/80 p-5 flex flex-col justify-between min-h-[120px]"
          >
            <p className="text-slate-500 text-sm font-medium">{c.label}</p>
            <p className={`text-3xl font-bold text-white mt-2 inline-flex items-center justify-center rounded-xl ${c.color} py-3`}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-8 rounded-full bg-brand-orange" />
            Attendance overview (today)
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl bg-teal-50 p-4">
              <p className="text-2xl font-bold text-brand-teal">{a.presentToday ?? 0}</p>
              <p className="text-xs text-slate-600 mt-1">Present</p>
            </div>
            <div className="rounded-xl bg-rose-50 p-4">
              <p className="text-2xl font-bold text-rose-600">{a.absentToday ?? 0}</p>
              <p className="text-xs text-slate-600 mt-1">Absent</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-2xl font-bold text-slate-700">{a.notMarkedToday ?? 0}</p>
              <p className="text-xs text-slate-600 mt-1">Not marked</p>
            </div>
          </div>
          <Link
            to="/admin/attendance"
            className="inline-block mt-4 text-sm font-medium text-brand-teal hover:underline"
          >
            Open attendance sheet →
          </Link>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 mb-3">Quick links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link className="text-brand-teal font-medium hover:underline" to="/admin/rooms">
                Room allocation
              </Link>
            </li>
            <li>
              <Link className="text-brand-teal font-medium hover:underline" to="/admin/complaints">
                Compliance & complaints
              </Link>
            </li>
            <li>
              <Link className="text-brand-teal font-medium hover:underline" to="/admin/vacating">
                Vacating records
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
