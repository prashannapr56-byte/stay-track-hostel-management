import { useEffect, useState } from 'react'
import { api } from '../../api/client'

export function StudentNotifications() {
  const [list, setList] = useState([])
  const [err, setErr] = useState('')

  useEffect(() => {
    api('/student/notifications')
      .then(setList)
      .catch((e) => setErr(e.message))
  }, [])

  if (err) return <p className="text-red-600">{err}</p>

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-800">All notifications</h2>
      <ul className="space-y-3">
        {list.map((n) => (
          <li key={n.id} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
            <p className="font-semibold text-slate-800">{n.title}</p>
            <p className="text-slate-600 text-sm mt-1">{n.message}</p>
            <p className="text-xs text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="text-slate-500">No notifications yet.</p>}
    </div>
  )
}
