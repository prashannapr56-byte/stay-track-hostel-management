import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export function StudentAttendance() {
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
      <div className="w-10 h-10 border-4 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin"></div>
    </div>
  )
  if (err && !d) return <p className="text-red-600 bg-red-50 p-4 rounded-xl">{err}</p>

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-in fade-in duration-500">
      <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-8">My Attendance Analytics</h2>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40 p-8 flex flex-col justify-center items-center text-center">
          <h3 className="font-bold text-slate-800 mb-2 w-full text-center text-lg">Overall Score</h3>
          
          <div
            className="relative w-48 h-48 rounded-full flex items-center justify-center text-5xl font-black text-brand-orange my-4 shadow-sm"
            style={{
              background: `conic-gradient(var(--tw-gradient-stops))`,
              backgroundImage: `conic-gradient(#f97316 ${d.attendance.percentPresent * 3.6}deg, #f1f5f9 0)`,
            }}
          >
            <div className="absolute inset-4 rounded-full bg-white flex flex-col items-center justify-center shadow-[inset_0_-2px_10px_rgba(0,0,0,0.05)]">
              <span>{d.attendance.percentPresent}%</span>
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Over {d.attendance.totalDaysMarked} total marked days</p>
        </div>

        <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40 p-8 relative overflow-hidden">
          <h3 className="font-bold text-slate-800 mb-6 text-lg flex items-center gap-3">
             <span className="p-1.5 bg-brand-teal/10 rounded-lg text-brand-teal">↗</span>
             Trending Timeline
          </h3>
          {d.attendance.history && d.attendance.history.length > 0 ? (
            <div className="w-full h-72 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.attendance.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} 
                    dy={10} 
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                  />
                  <YAxis 
                    dataKey="value"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                    domain={[0, 1]}
                    ticks={[0, 1]}
                    tickFormatter={(v) => v === 1 ? 'Present' : 'Absent'}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-800/90 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700">
                            <p className="font-bold text-xs opacity-70 mb-1">{data.date}</p>
                            <p className="font-black tracking-wide" style={{ color: data.value === 1 ? '#2dd4bf' : '#fb7185' }}>{data.status}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#14b8a6" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    activeDot={{ r: 6, fill: '#0f766e', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-56 items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-500 font-medium">No recent marks found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
