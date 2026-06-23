import { useEffect, useState } from 'react'
import { api } from '../../api/client'

export function AdminOutpasses() {
  const [list, setList] = useState([])
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  async function load() {
    try {
      setList(await api('/admin/outpasses'))
    } catch (e) {
      setErr(e.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function action(id, act) {
    setErr('')
    setMsg('')
    try {
      await api(`/admin/outpasses/${id}/${act}`, {
        method: 'POST',
      })
      setMsg(`Outpass request updated successfully.`)
      load()
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Student Outpasses</h2>
      </div>

      {err && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{err}</p>}
      {msg && <p className="text-emerald-600 text-sm bg-emerald-50 p-3 rounded-xl">{msg}</p>}

      <div className="overflow-x-auto rounded-2xl bg-white border border-slate-200 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500 uppercase tracking-wider text-xs font-semibold">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Register Number</th>
              <th className="p-4">Parent Phone</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Out Date</th>
              <th className="p-4">Return Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50/55 transition-colors">
                <td className="p-4 font-semibold text-slate-800">{o.studentName}</td>
                <td className="p-4 text-slate-500 font-mono">{o.registerNumber}</td>
                <td className="p-4 text-slate-500 font-mono">{o.parentPhone || '-'}</td>
                <td className="p-4 max-w-xs truncate" title={o.reason}>{o.reason}</td>
                <td className="p-4 text-slate-600">{new Date(o.outDate).toLocaleString()}</td>
                <td className="p-4 text-slate-600">{new Date(o.inDate).toLocaleString()}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      o.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                      o.status === 'AWAITING_PARENT' ? 'bg-blue-100 text-blue-800' :
                      o.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {o.status === 'PENDING' ? 'Pending Admin' :
                     o.status === 'AWAITING_PARENT' ? 'Awaiting Parent' :
                     o.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  {o.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => action(o.id, 'ask-parent')}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                      >
                        Ask Parent
                      </button>
                      <button
                        onClick={() => action(o.id, 'approve')}
                        className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => action(o.id, 'reject')}
                        className="text-xs px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 font-semibold"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {o.status === 'AWAITING_PARENT' && (
                    <>
                      <button
                        onClick={() => action(o.id, 'approve')}
                        className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
                      >
                        Force Approve
                      </button>
                      <button
                        onClick={() => action(o.id, 'reject')}
                        className="text-xs px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 font-semibold"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {(o.status === 'APPROVED' || o.status === 'REJECTED') && (
                    <span className="text-slate-400 text-xs">No actions available</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-slate-500 text-center font-medium">No outpass requests yet.</p>}
      </div>
    </div>
  )
}
