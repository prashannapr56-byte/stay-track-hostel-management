import { useEffect, useState } from 'react'
import { api } from '../../api/client'

export function AdminComplaints() {
  const [list, setList] = useState([])
  const [err, setErr] = useState('')
  const [proofInputs, setProofInputs] = useState({})

  async function load() {
    try {
      setList(await api('/admin/complaints'))
    } catch (e) {
      setErr(e.message)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  async function updateStatus(id, status) {
    setErr('')
    try {
      const body = { status }
      if (status === 'SOLVED') {
        const p = proofInputs[id]
        if (p) body.adminProof = p
      }
      await api(`/admin/complaints/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      load()
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Complaints</h2>
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <div className="overflow-x-auto rounded-2xl bg-white border border-slate-200 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Student</th>
              <th className="p-3">Register</th>
              <th className="p-3">Department</th>
              <th className="p-3">Description</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="p-3 font-medium">{c.studentName}</td>
                <td className="p-3 text-slate-500">{c.registerNumber}</td>
                <td className="p-3 text-slate-500">{c.studentDepartment}</td>
                <td className="p-3 max-w-md">
                  <p>{c.description}</p>
                  {c.adminProof && c.status === 'SOLVED' && (
                    <div className="mt-2 text-xs bg-slate-100 p-2 rounded text-slate-700">
                      <strong>Proof:</strong> {c.adminProof}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                      c.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="p-3 space-y-2">
                  <select
                    className="rounded-lg border border-slate-200 px-2 py-1 w-full"
                    value={c.status}
                    onChange={(e) => updateStatus(c.id, e.target.value)}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="SOLVED">Solved</option>
                  </select>
                  {c.status === 'PENDING' && (
                    <div className="flex gap-2 isolate mt-1">
                      <input
                        type="text"
                        placeholder="Optional proof"
                        className="rounded-lg border border-slate-200 px-2 py-1 w-full text-xs"
                        value={proofInputs[c.id] || ''}
                        onChange={(e) => setProofInputs({ ...proofInputs, [c.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') updateStatus(c.id, 'SOLVED')
                        }}
                      />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-slate-500">No complaints yet.</p>}
      </div>
    </div>
  )
}
