import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export function StudentDashboard() {
  const { logout } = useAuth()
  const [d, setD] = useState(null)
  const [err, setErr] = useState('')
  const [menu, setMenu] = useState([])

  function load() {
    api('/student/dashboard')
      .then(setD)
      .catch((e) => {
        setErr(e.message)
        if (e.message.includes('expired') || e.message.includes('Invalid token')) {
          logout()
        }
      })

    api('/student/mess-menu/today')
      .then(setMenu)
      .catch(console.error)
  }

  useEffect(() => {
    load()
  }, [logout])

  if (!d && !err) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin"></div>
    </div>
  )
  if (err && !d) return <p className="text-red-600 bg-red-50 p-4 rounded-xl">{err}</p>

  const p = d.profile
  const room = d.room

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Overview</h2>
      </div>

      {/* === SECTION 1: PROFILE & ROOM === */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Card */}
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
              <dt className="text-slate-400 font-semibold mb-1 uppercase text-xs">Phone</dt>
              <dd className="font-bold text-slate-800">{p.studentContact}</dd>
            </div>
          </dl>
        </div>

        {/* Room Details Card */}
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
              <div className="space-y-4">
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
              <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm">
                <p className="text-teal-50 text-center font-medium">No room assigned yet.</p>
                <p className="text-teal-100/70 text-xs text-center mt-2">Please contact administration.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === SECTION 2: ATTENDANCE TRENDING GRAPH === */}
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40 p-8 flex flex-col justify-center items-center text-center">
          <h3 className="font-bold text-slate-800 mb-2 w-full text-center text-lg">My Attendance</h3>

          <div
            className="relative w-40 h-40 rounded-full flex items-center justify-center text-4xl font-black text-brand-orange my-4 shadow-sm"
            style={{
              background: `conic-gradient(var(--tw-gradient-stops))`,
              backgroundImage: `conic-gradient(#f97316 ${d.attendance.percentPresent * 3.6}deg, #f1f5f9 0)`,
            }}
          >
            <div className="absolute inset-3 rounded-full bg-white flex flex-col items-center justify-center shadow-[inset_0_-2px_10px_rgba(0,0,0,0.05)]">
              <span>{d.attendance.percentPresent}%</span>
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Score over {d.attendance.totalDaysMarked} days</p>
        </div>

        <div className="lg:col-span-3 rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40 p-8 relative overflow-hidden">
          <h3 className="font-bold text-slate-800 mb-6 text-lg flex items-center gap-3">
            <span className="p-1.5 bg-brand-teal/10 rounded-lg text-brand-teal">↗</span>
            Attendance Trending
          </h3>
          {d.attendance.history && d.attendance.history.length > 0 ? (
            <div className="w-full h-64 -ml-4">
              <ResponsiveContainer width="99%" height={240}>
                <AreaChart data={d.attendance.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                    dy={10}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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

      {/* === SECTION 3: MESS MENU & NOTIFICATIONS === */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40 p-8">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3 text-lg">
            <span className="p-1.5 bg-brand-orange/10 rounded-lg text-brand-orange">♨</span>
            Today's Mess Menu
          </h3>
          {menu.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {menu.map(m => (
                <div key={m.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-brand-teal/30 hover:shadow-md transition-all">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-brand-orange/5 to-brand-orange/20 rounded-bl-[100px] -z-0 group-hover:scale-110 transition-transform"></div>
                  <p className="text-xs uppercase text-brand-orange font-bold tracking-widest mb-1 relative z-10">{m.meal_time}</p>
                  <p className="font-bold text-slate-800 text-lg relative z-10">{m.dish}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 bg-slate-50 p-6 text-center rounded-2xl border border-dashed border-slate-200">No menu has been curated for today.</p>
          )}
        </div>

        <div className="rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40 p-8">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3 text-lg">
            <span className="p-2 bg-brand-teal/10 rounded-xl text-brand-teal">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </span>
            Campus Alerts
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {d.notifications.map((n) => (
              <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md transition duration-200 flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full mt-2 bg-brand-orange shrink-0"></div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">{n.title}</h4>
                  <p className="text-slate-600 text-sm">{n.message}</p>
                </div>
              </div>
            ))}
            {d.notifications.length === 0 && (
              <div className="p-6 text-center bg-slate-50 border-dashed border-2 border-slate-200 rounded-2xl">
                <p className="text-slate-500 font-medium text-sm">No fresh notifications.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
