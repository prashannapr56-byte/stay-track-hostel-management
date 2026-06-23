import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'

export function ParentDashboard() {
  const nav = useNavigate()
  const { logout } = useAuth()
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  async function load() {
    try {
      const res = await api('/parent/dashboard')
      setData(res)
    } catch (e) {
      setErr(e.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAction(id, action) {
    setErr('')
    setMsg('')
    try {
      await api(`/parent/outpasses/${id}/${action}`, {
        method: 'POST',
      })
      setMsg(`Outpass request has been ${action}d successfully.`)
      load()
    } catch (e) {
      setErr(e.message)
    }
  }

  if (!data && !err) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-10 h-10 border-4 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin"></div>
      </div>
    )
  }

  if (err && !data) {
    return (
      <div className="min-h-screen p-6 bg-slate-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-lg border border-slate-200 text-center">
          <p className="text-red-600 font-semibold mb-4">{err}</p>
          <button
            onClick={logout}
            className="px-6 py-2 bg-brand-orange text-white rounded-xl font-bold uppercase tracking-wider text-sm shadow hover:bg-orange-500 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const outpasses = data.outpasses || []

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-brand-blueDark text-white flex items-center justify-between px-6 shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-bold text-brand-orange">
            H
          </span>
          <div>
            <p className="text-xs uppercase text-teal-100/90 font-bold">StayTrack</p>
            <p className="font-semibold text-sm">Parent Portal</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-xs px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 font-bold transition"
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-8">
        
        {err && <p className="text-red-600 bg-red-50 p-4 rounded-xl border border-red-200 text-sm">{err}</p>}
        {msg && <p className="text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-sm font-semibold">{msg}</p>}

        {/* Student Profile Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50 border border-slate-200/60 shadow-lg shadow-slate-200/40 p-8">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-teal/10 rounded-full blur-3xl"></div>
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3 text-lg">
            <span className="p-2 bg-brand-teal/10 rounded-xl text-brand-teal">
              👤
            </span>
            Connected Student Profile
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            <div className="bg-white/60 p-4 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest block mb-1">Student Name</span>
              <span className="font-bold text-slate-800 text-sm md:text-base">{data.studentName}</span>
            </div>
            <div className="bg-white/60 p-4 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest block mb-1">Register Number</span>
              <span className="font-bold text-slate-800 text-sm md:text-base">{data.registerNumber}</span>
            </div>
            <div className="bg-white/60 p-4 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest block mb-1">Department</span>
              <span className="font-bold text-slate-800 text-sm md:text-base">{data.department || '-'}</span>
            </div>
            <div className="bg-white/60 p-4 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest block mb-1">Room Assignment</span>
              <span className="font-bold text-slate-800 text-sm md:text-base">{data.roomLabel || '-'}</span>
            </div>
            <div className="bg-white/60 p-4 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest block mb-1">Gender</span>
              <span className="font-bold text-slate-800 text-sm md:text-base">{data.gender || '-'}</span>
            </div>
            <div className="bg-white/60 p-4 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest block mb-1">Student Contact</span>
              <span className="font-bold text-slate-800 text-sm md:text-base">{data.studentPhone || '-'}</span>
            </div>
            <div className="bg-white/60 p-4 rounded-2xl border border-slate-100 shadow-sm col-span-2">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest block mb-1">Parent Contact (Connected)</span>
              <span className="font-bold text-slate-850 text-sm md:text-base text-brand-orange">{data.parentPhone}</span>
            </div>
          </div>
        </div>

        {/* Outpass Approvals Card */}
        <div className="rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40 p-8">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3 text-lg">
            <span className="p-2 bg-brand-orange/10 rounded-xl text-brand-orange">
              🔑
            </span>
            Outpass Approval Requests
          </h3>

          <div className="space-y-6">
            {outpasses.map((o) => (
              <div key={o.id} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      Requested on {new Date(o.created_at).toLocaleDateString()}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        o.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        o.status === 'AWAITING_PARENT' ? 'bg-blue-100 text-blue-800 font-bold' :
                        o.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {o.status === 'PENDING' ? 'Pending Admin Review' :
                       o.status === 'AWAITING_PARENT' ? 'Needs Your Approval' :
                       o.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                    </span>
                  </div>

                  <p className="text-slate-800 font-bold text-base leading-relaxed">{o.reason}</p>

                  <div className="grid sm:grid-cols-2 gap-4 max-w-md text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-600">
                    <div>
                      <span className="font-semibold block text-slate-400">OUT DATE</span>
                      <span>{new Date(o.out_date).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-slate-400">RETURN DATE</span>
                      <span>{new Date(o.in_date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2 shrink-0 justify-end">
                  {o.status === 'AWAITING_PARENT' ? (
                    <>
                      <button
                        onClick={() => handleAction(o.id, 'approve')}
                        className="flex-1 md:flex-initial px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl uppercase tracking-wider shadow-md transition"
                      >
                        Approve Outpass
                      </button>
                      <button
                        onClick={() => handleAction(o.id, 'reject')}
                        className="flex-1 md:flex-initial px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl uppercase tracking-wider shadow-md transition"
                      >
                        Reject Outpass
                      </button>
                    </>
                  ) : o.status === 'PENDING' ? (
                    <span className="text-slate-400 text-xs italic">Awaiting hostel admin to review first</span>
                  ) : (
                    <span className={`text-xs font-bold uppercase tracking-wider ${o.status === 'APPROVED' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      Completed: {o.status}
                    </span>
                  )}
                </div>

              </div>
            ))}

            {outpasses.length === 0 && (
              <div className="p-12 text-center bg-slate-50 border-dashed border-2 border-slate-200 rounded-3xl">
                <p className="text-slate-500 font-medium">No outpass requests found for your child.</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
