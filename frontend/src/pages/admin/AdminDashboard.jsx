import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

function buildBlockStats(rooms) {
  const blocks = {}
  for (const room of rooms) {
    const code = room.blockCode || 'Unknown'
    if (!blocks[code]) {
      blocks[code] = {
        blockCode: code,
        totalRooms: 0,
        occupiedCount: 0,
        availableRooms: 0,
        totalCapacity: 0,
      }
    }
    const block = blocks[code]
    block.totalRooms += 1
    block.totalCapacity += room.capacity
    if (room.roomStatus !== 'MAINTENANCE') {
      block.occupiedCount += room.occupiedCount
      if (room.occupiedCount < room.capacity) block.availableRooms += 1
    }
  }
  return Object.values(blocks).map((block) => ({
    ...block,
    occupancyPercent: block.totalCapacity
      ? Math.round((block.occupiedCount / block.totalCapacity) * 100)
      : 0,
  }))
}

export function AdminDashboard() {
  const { logout } = useAuth()
  const [d, setD] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [err, setErr] = useState('')

  useEffect(() => {
    Promise.all([api('/admin/dashboard'), api('/admin/rooms')])
      .then(([dashboard, rooms]) => {
        setD(dashboard)
        setBlocks(buildBlockStats(rooms))
      })
      .catch((e) => {
        setErr(e.message)
        if (e.message.includes('expired') || e.message.includes('Invalid token')) {
          logout()
        }
      })
  }, [logout])

  if (!d && !err) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin"></div>
    </div>
  )
  if (err && !d) return <p className="text-red-600 bg-red-50 p-4 rounded-xl">{err}</p>

  const a = d.attendanceOverview || {}

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Overview</h2>
      </div>

      {/* === SECTION 1: ROOM ALLOCATION OVERVIEW === */}
      <div className="grid lg:grid-cols-3 gap-6">
        {blocks.slice(0, 2).map((block) => (
          <div key={block.blockCode} className="rounded-3xl bg-brand-blue border border-brand-blueDark shadow-lg shadow-brand-blue/20 p-6 text-white relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-36 h-36 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-100/80">Block {block.blockCode} - Blue View</p>
              <h3 className="mt-4 text-3xl font-extrabold">{block.totalRooms} Rooms</h3>
              <div className="mt-4 rounded-3xl bg-white/10 px-4 py-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-100">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20">%</span>
                {block.occupancyPercent}% occupied
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-100/70">Occupied</p>
                  <p className="mt-2 text-3xl font-bold">{block.occupiedCount}</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-100/70">Available</p>
                  <p className="mt-2 text-3xl font-bold">{block.availableRooms}</p>
                </div>
              </div>
              <button
                type="button"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-blueDark shadow-sm hover:bg-slate-100"
              >
                View Details
              </button>
            </div>
          </div>
        ))}

        <div className="rounded-3xl border border-dashed border-brand-blueDark bg-white/10 p-6 text-brand-blueDark shadow-lg shadow-brand-blue/10 hover:border-brand-blue hover:bg-brand-blue/10 transition-colors duration-200 flex flex-col items-center justify-center gap-4 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue text-white text-3xl">+</div>
          <div>
            <p className="text-lg font-semibold">Add New Block</p>
            <p className="text-sm text-blue-100/80">Set up a new allocation block quickly.</p>
          </div>
        </div>
      </div>

      {/* === SECTION 2: ROOM ALLOCATION SUMMARY === */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40 p-6">
          <h3 className="font-bold text-slate-800 mb-4">Room Allocation by Block</h3>
          <div className="space-y-4">
            {blocks.map((block) => (
              <div key={block.blockCode} className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Block {block.blockCode}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-800">{block.totalRooms} rooms</p>
                  </div>
                  <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-brand-blueDark">
                    {block.occupancyPercent}%</div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <div className="rounded-2xl bg-white p-3 border border-slate-100">
                    <p className="font-semibold text-slate-800">Occupied</p>
                    <p>{block.occupiedCount}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-3 border border-slate-100">
                    <p className="font-semibold text-slate-800">Available</p>
                    <p>{block.availableRooms}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40 p-6">
          <h3 className="font-bold text-slate-800 mb-4">Quick Access</h3>
          <div className="grid gap-4">
            <Link
              to="/admin/rooms"
              className="rounded-3xl border border-brand-blue/20 bg-brand-blue/10 px-4 py-4 text-sm font-semibold text-brand-blueDark hover:bg-brand-blue/15"
            >
              View room details
            </Link>
            <Link
              to="/admin/attendance"
              className="rounded-3xl border border-brand-blue/20 bg-brand-blue/10 px-4 py-4 text-sm font-semibold text-brand-blueDark hover:bg-brand-blue/15"
            >
              Manage attendance
            </Link>
            <Link
              to="/admin/complaints"
              className="rounded-3xl border border-brand-blue/20 bg-brand-blue/10 px-4 py-4 text-sm font-semibold text-brand-blueDark hover:bg-brand-blue/15"
            >
              Review complaints
            </Link>
          </div>
        </div>
      </div>

      {/* === SECTION 3: ATTENDANCE TRENDING GRAPH === */}
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40 p-8 flex flex-col justify-center items-center text-center">
          <h3 className="font-bold text-slate-800 mb-2 w-full text-center text-lg">Attendance Rate</h3>

          <div
            className="relative w-32 h-32 rounded-full flex items-center justify-center text-3xl font-black text-brand-orange my-4 shadow-sm"
            style={{
              background: `conic-gradient(var(--tw-gradient-stops))`,
              backgroundImage: `conic-gradient(#f97316 ${d.attendanceRate || 0 * 3.6}deg, #f1f5f9 0)`,
            }}
          >
            <div className="absolute inset-2 rounded-full bg-white flex flex-col items-center justify-center shadow-[inset_0_-2px_10px_rgba(0,0,0,0.05)]">
              <span className="text-2xl">{d.attendanceRate || 0}%</span>
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Overall attendance</p>
        </div>

        <div className="lg:col-span-3 rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40 p-8 relative overflow-hidden">
          <h3 className="font-bold text-slate-800 mb-6 text-lg flex items-center gap-3">
            <span className="p-1.5 bg-brand-blue/10 rounded-lg text-brand-blue">↗</span>
            Attendance Trends
          </h3>
          {d.attendanceHistory && d.attendanceHistory.length > 0 ? (
            <div className="w-full h-64 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.attendanceHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminAttendance" x1="0" y1="0" x2="0" y2="1">
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
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                    domain={[0, 'dataMax']}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-800/90 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700">
                            <p className="font-bold text-xs opacity-70 mb-1">{data.date}</p>
                            <p className="font-black tracking-wide text-brand-blue">{data.present} / {data.total} Present</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="present"
                    stroke="#14b8a6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#adminAttendance)"
                    activeDot={{ r: 6, fill: '#0f766e', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-56 items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-500 font-medium">No attendance data available.</p>
            </div>
          )}
        </div>
      </div>

      {/* === SECTION 3: QUICK ACTIONS & NOTIFICATIONS === */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40 p-8">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3 text-lg">
            <span className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </span>
            Quick Actions
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/admin/rooms" className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-brand-blue/30 hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-brand-blue/5 to-brand-blue/20 rounded-bl-[100px] -z-0 group-hover:scale-110 transition-transform"></div>
              <p className="text-xs uppercase text-brand-blue font-bold tracking-widest mb-2 relative z-10">🏠</p>
              <p className="font-bold text-slate-800 text-base relative z-10">Room Allocation</p>
            </Link>
            <Link to="/admin/complaints" className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-brand-orange/30 hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-brand-orange/5 to-brand-orange/20 rounded-bl-[100px] -z-0 group-hover:scale-110 transition-transform"></div>
              <p className="text-xs uppercase text-brand-orange font-bold tracking-widest mb-2 relative z-10">⚠️</p>
              <p className="font-bold text-slate-800 text-base relative z-10">Complaints</p>
            </Link>
            <Link to="/admin/vacating" className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-slate-700/30 hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-slate-700/5 to-slate-700/20 rounded-bl-[100px] -z-0 group-hover:scale-110 transition-transform"></div>
              <p className="text-xs uppercase text-slate-700 font-bold tracking-widest mb-2 relative z-10">📋</p>
              <p className="font-bold text-slate-800 text-base relative z-10">Vacating Records</p>
            </Link>
            <Link to="/admin/notifications" className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-600/30 hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-emerald-600/5 to-emerald-600/20 rounded-bl-[100px] -z-0 group-hover:scale-110 transition-transform"></div>
              <p className="text-xs uppercase text-emerald-600 font-bold tracking-widest mb-2 relative z-10">🔔</p>
              <p className="font-bold text-slate-800 text-base relative z-10">Notifications</p>
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40 p-8">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3 text-lg">
            <span className="p-2 bg-brand-orange/10 rounded-xl text-brand-orange">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </span>
            Recent Activity
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {d.recentActivity && d.recentActivity.map((activity, index) => (
              <div key={index} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md transition duration-200 flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full mt-2 bg-brand-orange shrink-0"></div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">{activity.title}</h4>
                  <p className="text-slate-600 text-sm">{activity.description}</p>
                  <p className="text-slate-400 text-xs mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
            {(!d.recentActivity || d.recentActivity.length === 0) && (
              <div className="p-6 text-center bg-slate-50 border-dashed border-2 border-slate-200 rounded-2xl">
                <p className="text-slate-500 font-medium text-sm">No recent activity.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
