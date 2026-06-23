import { useEffect, useState } from 'react'
import { api } from '../../api/client'

export function StudentMenu() {
  const [menu, setMenu] = useState([])
  const [err, setErr] = useState('')

  function load() {
    api('/student/mess-menu/today')
      .then(setMenu)
      .catch((e) => setErr(e.message))
  }

  useEffect(() => {
    load()
  }, [])

  if (err) return <p className="text-red-600 bg-red-50 p-4 rounded-xl">{err}</p>

  const today = new Date().toLocaleDateString(undefined, {weekday: 'long', month: 'long', day: 'numeric'})

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-in fade-in duration-500">
      <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-8">Daily Mess Menu</h2>

      <div className="rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40 p-8">
        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-3 text-2xl">
          <span className="p-2 bg-brand-orange/10 rounded-xl text-brand-orange text-lg">♨</span>
          Today's Curation
        </h3>
        <p className="text-slate-500 font-medium mb-8 uppercase tracking-widest text-sm">{today}</p>
        
        {menu.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {menu.map(m => (
              <div key={m.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-brand-teal/30 hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-brand-orange/5 to-brand-orange/20 rounded-bl-[100px] -z-0 group-hover:scale-110 transition-transform"></div>
                <p className="text-sm uppercase text-brand-orange font-bold tracking-widest mb-1 relative z-10">{m.meal_time}</p>
                <p className="font-black text-slate-800 text-2xl relative z-10">{m.dish}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
            <p className="text-slate-500 font-medium text-lg">No menu has been curated for today.</p>
          </div>
        )}
      </div>
    </div>
  )
}
