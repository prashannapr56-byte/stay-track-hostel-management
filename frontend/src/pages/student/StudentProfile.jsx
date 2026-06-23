import { useEffect, useState } from 'react'
import { api } from '../../api/client'

export function StudentProfile() {
  const [d, setD] = useState(null)
  const [err, setErr] = useState('')

  function load() {
    api('/student/dashboard')
      .then(setD)
      .catch((e) => setErr(e.message))
  }

  useEffect(() => {
    load()
  }, [])

  if (!d && !err) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin"></div>
    </div>
  )
  if (err && !d) return <p className="text-red-600 bg-red-50 p-4 rounded-xl">{err}</p>

  const p = d.profile
  const room = d.room

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-in fade-in duration-500">
      <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-8">My Profile</h2>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50 border border-slate-200/60 shadow-lg shadow-slate-200/40 p-8">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl"></div>
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3 text-lg">
          <span className="p-2 bg-brand-orange/10 rounded-xl text-brand-orange">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          </span>
          Profile Details
        </h3>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm relative z-10">
          <div className="bg-white/60 p-3 rounded-xl border border-slate-100">
            <dt className="text-slate-400 font-semibold mb-1 uppercase text-xs">Name</dt>
            <dd className="font-bold text-slate-800">{p.name}</dd>
          </div>
          <div className="bg-white/60 p-3 rounded-xl border border-slate-100">
            <dt className="text-slate-400 font-semibold mb-1 uppercase text-xs">Register No.</dt>
            <dd className="font-bold text-slate-800">{p.registerNumber}</dd>
          </div>
          <div className="bg-white/60 p-3 rounded-xl border border-slate-100">
            <dt className="text-slate-400 font-semibold mb-1 uppercase text-xs">Department</dt>
            <dd className="font-bold text-slate-800">{p.department}</dd>
          </div>
          <div className="bg-white/60 p-3 rounded-xl border border-slate-100">
            <dt className="text-slate-400 font-semibold mb-1 uppercase text-xs">Student Phone</dt>
            <dd className="font-bold text-slate-800">{p.studentContact}</dd>
          </div>
          <div className="bg-white/60 p-3 rounded-xl border border-slate-100">
            <dt className="text-slate-400 font-semibold mb-1 uppercase text-xs">Parent Phone</dt>
            <dd className="font-bold text-slate-800">{p.parentContact}</dd>
          </div>
          <div className="bg-white/60 p-3 rounded-xl border border-slate-100">
            <dt className="text-slate-400 font-semibold mb-1 uppercase text-xs">Gender</dt>
            <dd className="font-bold text-slate-800 capitalize">{p.gender || '-'}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-3xl bg-brand-teal border border-brand-tealDark shadow-lg shadow-brand-teal/20 p-8 text-white relative flex flex-col justify-between overflow-hidden">
        <div className="absolute -right-4 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div>
          <h3 className="font-bold text-teal-50 mb-6 flex items-center gap-3 text-lg opacity-90">
          <span className="p-2 bg-white/10 rounded-xl text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </span>
            Room Assignment
          </h3>
          {room ? (
            <div className="space-y-4 relative z-10">
              <div>
                <p className="text-brand-tealDark font-bold uppercase tracking-wider text-sm bg-white/20 inline-block px-3 py-1 rounded-full mb-2">Block & Room</p>
                <p className="text-4xl font-black">{room.blockCode} — {room.roomNumber}</p>
              </div>
              <div className="mt-4 opacity-80">
                <span className="text-sm">Checked in since: </span> 
                <span className="font-medium">{room.checkInDate}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm relative z-10">
              <p className="text-teal-50 text-center font-medium">No room assigned yet.</p>
              <p className="text-teal-100/70 text-xs text-center mt-2">Please contact administration.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
