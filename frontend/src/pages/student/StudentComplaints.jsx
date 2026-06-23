import { useEffect, useState } from 'react'
import { api } from '../../api/client'

export function StudentComplaints() {
  const [complaints, setComplaints] = useState([])
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  function load() {
    api('/student/dashboard')
      .then((d) => setComplaints(d.complaints))
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
      setMsg('Complaint submitted successfully.')
      load()
    } catch (x) {
      setErr(x.message)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Complaints Hub</h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Raise Complaint Section */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl bg-brand-teal border border-brand-tealDark shadow-lg shadow-brand-teal/20 p-8 text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <h3 className="font-bold text-teal-50 mb-6 flex items-center gap-3 text-lg opacity-90">
                <span className="p-2 bg-white/10 rounded-xl text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </span>
                Raise a Complaint
              </h3>
              <form onSubmit={raise} className="space-y-4">
                <textarea
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3 min-h-[140px] text-white placeholder-teal-100/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                  placeholder="Describe your issue, repair requirement, or concern..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
                {err && <p className="text-red-300 text-sm bg-red-900/30 p-2 rounded-lg">{err}</p>}
                {msg && <p className="text-emerald-300 text-sm bg-emerald-900/30 p-2 rounded-lg">{msg}</p>}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand-orange text-white font-bold px-6 py-3 uppercase text-sm shadow-md hover:bg-orange-500 transition-colors"
                >
                  Submit Complaint
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40 p-8 h-full">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3 text-lg">
              <span className="p-2 bg-brand-orange/10 rounded-xl text-brand-orange">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              </span>
              Complaint History
            </h3>
            
            <div className="space-y-4">
              {complaints.map((c) => (
                <div key={c.id} className="relative p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition duration-200">
                  <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      {new Date(c.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        c.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-brand-teal/10 text-brand-tealDark'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">{c.description}</p>
                  
                  {c.adminProof && c.status === 'SOLVED' && (
                    <div className="mt-4 text-sm bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 flex gap-3 items-start">
                      <span className="text-brand-orange shrink-0">↳</span>
                      <div>
                        <strong className="text-brand-tealDark block mb-1">Resolution update:</strong>
                        <span className="text-slate-600">{c.adminProof}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {complaints.length === 0 && (
                <div className="p-8 text-center bg-slate-50 border-dashed border-2 border-slate-200 rounded-2xl h-48 flex items-center justify-center">
                  <p className="text-slate-500 font-medium">No complaints raised yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
