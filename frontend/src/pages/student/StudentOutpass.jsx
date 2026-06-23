import { useEffect, useState } from 'react'
import { api } from '../../api/client'

export function StudentOutpass() {
  const [outpasses, setOutpasses] = useState([])
  const [reason, setReason] = useState('')
  const [outDate, setOutDate] = useState('')
  const [inDate, setInDate] = useState('')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  function load() {
    api('/student/outpasses')
      .then(setOutpasses)
      .catch((e) => setErr(e.message))
  }

  useEffect(() => {
    load()
  }, [])

  async function requestOutpass(e) {
    e.preventDefault()
    setErr('')
    setMsg('')
    try {
      await api('/student/outpasses', {
        method: 'POST',
        body: JSON.stringify({ reason, outDate, inDate }),
      })
      setReason('')
      setOutDate('')
      setInDate('')
      setMsg('Outpass request submitted successfully! Weekend requests are sent directly to the Parent Portal, while weekday requests go to the Admin first.')
      load()
    } catch (x) {
      setErr(x.message)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Outpass System</h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Request Form */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl bg-brand-teal border border-brand-tealDark shadow-lg shadow-brand-teal/20 p-8 text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <h3 className="font-bold text-teal-50 mb-4 flex items-center gap-3 text-lg opacity-90">
                <span className="p-2 bg-white/10 rounded-xl text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </span>
                Request Outpass
              </h3>
              <p className="text-xs text-teal-100/90 mb-5 bg-white/10 p-3.5 rounded-2xl border border-white/10 relative z-10 leading-relaxed">
                💡 <strong>Notice:</strong> Weekend outpasses (Fri, Sat, Sun) are routed <strong>directly</strong> to your parents. Weekday requests require admin review before parent sending.
              </p>
              <form onSubmit={requestOutpass} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-teal-100/80 mb-1">Reason</label>
                  <textarea
                    className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3 min-h-[100px] text-white placeholder-teal-100/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                    placeholder="Why do you need to go out? (e.g. medical, weekend trip...)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-teal-100/80 mb-1">Out Date & Time</label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm [color-scheme:dark]"
                    value={outDate}
                    onChange={(e) => setOutDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-teal-100/80 mb-1">Return Date & Time</label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm [color-scheme:dark]"
                    value={inDate}
                    onChange={(e) => setInDate(e.target.value)}
                    required
                  />
                </div>
                {err && <p className="text-red-300 text-sm bg-red-900/30 p-2 rounded-lg">{err}</p>}
                {msg && <p className="text-emerald-300 text-sm bg-emerald-900/30 p-2 rounded-lg">{msg}</p>}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand-orange text-white font-bold px-6 py-3 uppercase text-sm shadow-md hover:bg-orange-500 transition-colors"
                >
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Request History */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40 p-8 h-full">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3 text-lg">
              <span className="p-2 bg-brand-orange/10 rounded-xl text-brand-orange">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              Outpass History
            </h3>
            
            <div className="space-y-4">
              {outpasses.map((o) => (
                <div key={o.id} className="relative p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition duration-200">
                  <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      Requested: {new Date(o.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        o.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        o.status === 'AWAITING_PARENT' ? 'bg-blue-100 text-blue-800' :
                        o.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {o.status === 'PENDING' ? 'Awaiting Admin' :
                       o.status === 'AWAITING_PARENT' ? 'Awaiting Parent Approval' :
                       o.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-bold mb-3">{o.reason}</p>
                  
                  <div className="grid sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-600">
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
              ))}
              {outpasses.length === 0 && (
                <div className="p-8 text-center bg-slate-50 border-dashed border-2 border-slate-200 rounded-2xl h-48 flex items-center justify-center">
                  <p className="text-slate-500 font-medium">No outpasses requested yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
