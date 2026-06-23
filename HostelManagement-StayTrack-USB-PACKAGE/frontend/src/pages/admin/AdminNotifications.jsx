import { useState } from 'react'
import { api } from '../../api/client'

export function AdminNotifications() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setMsg('')
    try {
      await api('/admin/notifications', {
        method: 'POST',
        body: JSON.stringify({ title, message }),
      })
      setMsg('Notification broadcast to all students.')
      setTitle('')
      setMessage('')
    } catch (x) {
      setErr(x.message)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-2xl font-bold text-slate-800">Send notification</h2>
      <p className="text-sm text-slate-600">Message will appear in every student dashboard and notifications page.</p>
      <form onSubmit={submit} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2 min-h-[120px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        {msg && <p className="text-emerald-600 text-sm">{msg}</p>}
        <button
          type="submit"
          className="rounded-xl bg-brand-orange text-white font-bold px-6 py-3 uppercase text-sm"
        >
          Send to all students
        </button>
      </form>
    </div>
  )
}
