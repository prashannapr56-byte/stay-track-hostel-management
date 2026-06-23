import { useEffect, useState } from 'react'
import { api } from '../../api/client'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function AdminAttendance() {
  const [rooms, setRooms] = useState([])
  const [roomId, setRoomId] = useState('')
  const [students, setStudents] = useState([])
  const [date, setDate] = useState(todayISO())
  const [rows, setRows] = useState({})
  const [history, setHistory] = useState([])
  const [filterStudent, setFilterStudent] = useState('')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api('/admin/rooms').then(setRooms).catch((e) => setErr(e.message))
  }, [])

  useEffect(() => {
    if (!roomId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStudents([])
      return
    }
    api(`/admin/rooms/${roomId}/students`)
      .then((list) => {
        setStudents(list)
        setRows(
          Object.fromEntries(
            list.map((s) => [s.id, { status: 'PRESENT', remarks: '' }]),
          ),
        )
      })
      .catch((e) => setErr(e.message))
  }, [roomId])

  useEffect(() => {
    const q = new URLSearchParams()
    if (date) q.set('date', date)
    if (filterStudent) q.set('studentId', filterStudent)
    api(`/admin/attendance?${q.toString()}`)
      .then(setHistory)
      .catch(() => setHistory([]))
  }, [date, filterStudent])

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setMsg('')
    if (!roomId || students.length === 0) {
      setErr('Select a room with students.')
      return
    }
    const entries = students.map((s) => ({
      studentId: s.id,
      status: rows[s.id]?.status || 'PRESENT',
      remarks: rows[s.id]?.remarks || '',
    }))
    try {
      await api('/admin/attendance', {
        method: 'POST',
        body: JSON.stringify({ date, entries }),
      })
      setMsg('Attendance saved.')
      const q = new URLSearchParams({ date })
      if (filterStudent) q.set('studentId', filterStudent)
      setHistory(await api(`/admin/attendance?${q.toString()}`))
    } catch (x) {
      setErr(x.message)
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Attendance</h2>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
        <p className="text-sm text-slate-600">
          Pick a room to list occupants, then mark everyone for the selected date.
        </p>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Room</label>
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 min-w-[200px]"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            >
              <option value="">Select room…</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.blockCode}-{r.roomNumber}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Date</label>
            <input
              type="date"
              className="rounded-lg border border-slate-200 px-3 py-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {students.length > 0 && (
          <form onSubmit={submit} className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    <th className="p-3 font-semibold text-slate-600">Room</th>
                    <th className="p-3 font-semibold text-slate-600">Student</th>
                    <th className="p-3 font-semibold text-slate-600">Status</th>
                    <th className="p-3 font-semibold text-slate-600">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const rid = rooms.find((x) => String(x.id) === String(roomId))
                    const roomLabel = rid ? `${rid.blockCode}-${rid.roomNumber}` : '-'
                    return (
                      <tr key={s.id} className="border-t border-slate-100">
                        <td className="p-3 text-slate-500">{roomLabel}</td>
                        <td className="p-3 font-medium text-slate-800">{s.name}</td>
                        <td className="p-3">
                          <select
                            className="rounded-lg border border-slate-200 px-2 py-1"
                            value={rows[s.id]?.status || 'PRESENT'}
                            onChange={(e) =>
                              setRows((prev) => ({
                                ...prev,
                                [s.id]: { ...prev[s.id], status: e.target.value },
                              }))
                            }
                          >
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <input
                            className="w-full rounded-lg border border-slate-200 px-2 py-1"
                            value={rows[s.id]?.remarks || ''}
                            onChange={(e) =>
                              setRows((prev) => ({
                                ...prev,
                                [s.id]: { ...prev[s.id], remarks: e.target.value },
                              }))
                            }
                            placeholder="Optional"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <button
              type="submit"
              className="rounded-xl bg-brand-teal text-white font-semibold px-6 py-2.5 text-sm shadow"
            >
              Submit attendance
            </button>
          </form>
        )}
        {msg && <p className="text-emerald-600 text-sm">{msg}</p>}
        {err && <p className="text-red-600 text-sm">{err}</p>}
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-800 mb-4">View records</h3>
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="date"
            className="rounded-lg border border-slate-200 px-3 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Filter by student id (optional)"
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Room</th>
                <th className="p-2">Student</th>
                <th className="p-2">Register</th>
                <th className="p-2">Status</th>
                <th className="p-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-t border-slate-100">
                  <td className="p-2 whitespace-nowrap">{h.date}</td>
                  <td className="p-2">{h.roomLabel}</td>
                  <td className="p-2">{h.studentName}</td>
                  <td className="p-2">{h.registerNumber}</td>
                  <td className="p-2">{h.status}</td>
                  <td className="p-2">{h.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && <p className="p-4 text-slate-500 text-sm">No rows for this filter.</p>}
        </div>
      </div>
    </div>
  )
}
