import { useEffect, useState } from 'react'
import { api } from '../../api/client'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function AdminVacating() {
  const [list, setList] = useState([])
  const [students, setStudents] = useState([])
  const [studentId, setStudentId] = useState('')
  const [vacateDate, setVacateDate] = useState(todayISO())
  const [academicYear, setAcademicYear] = useState('2025-26')
  const [notes, setNotes] = useState('')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  async function load() {
    try {
      setList(await api('/admin/vacating'))
    } catch (e) {
      setErr(e.message)
    }
  }

  useEffect(() => {
    load()
    api('/admin/students').then(setStudents).catch(() => {})
  }, [])

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setMsg('')
    try {
      await api('/admin/vacating', {
        method: 'POST',
        body: JSON.stringify({
          studentId: Number(studentId),
          vacateDate,
          academicYear,
          notes,
        }),
      })
      setMsg('Vacating recorded and room released.')
      setStudentId('')
      setNotes('')
      load()
    } catch (x) {
      setErr(x.message)
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Vacating records</h2>
      <p className="text-sm text-slate-600 max-w-2xl">
        Students who have vacated the hostel (past out). Recording an entry will end their active room allocation.
      </p>

      <form
        onSubmit={submit}
        className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 grid sm:grid-cols-2 gap-4 max-w-3xl"
      >
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700 block mb-1">Student</label>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          >
            <option value="">Select…</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.registerNumber}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Vacate date</label>
          <input
            type="date"
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={vacateDate}
            onChange={(e) => setVacateDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Academic year</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700 block mb-1">Notes</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
          />
        </div>
        {err && <p className="sm:col-span-2 text-red-600 text-sm">{err}</p>}
        {msg && <p className="sm:col-span-2 text-emerald-600 text-sm">{msg}</p>}
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-xl bg-brand-teal text-white font-semibold px-6 py-2.5"
          >
            Save vacating record
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white border border-slate-200 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Student</th>
              <th className="p-3">Register</th>
              <th className="p-3">Vacate date</th>
              <th className="p-3">Academic year</th>
              <th className="p-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {list.map((v) => (
              <tr key={v.id} className="border-t border-slate-100">
                <td className="p-3 font-medium">{v.studentName}</td>
                <td className="p-3 text-slate-500">{v.registerNumber}</td>
                <td className="p-3 whitespace-nowrap">{v.vacateDate}</td>
                <td className="p-3">{v.academicYear}</td>
                <td className="p-3 text-slate-600">{v.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-slate-500">No vacating records yet.</p>}
      </div>
    </div>
  )
}
