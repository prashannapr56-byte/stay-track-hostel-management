import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const nav = [
  { to: '/admin', end: true, label: 'Overview', icon: '◉' },
  { to: '/admin/rooms', label: 'Rooms', icon: '▦' },
  { to: '/admin/attendance', label: 'Attendance', icon: '✓' },
  { to: '/admin/complaints', label: 'Complaints', icon: '!' },
  { to: '/admin/notifications', label: 'Notifications', icon: '✉' },
  { to: '/admin/vacating', label: 'Vacating', icon: '→' },
]

export function AdminLayout() {
  const { displayName, logout } = useAuth()
  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="hidden md:flex w-56 flex-col bg-brand-tealDark text-white shrink-0">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-bold text-brand-orange">
              H
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-teal-100/90">StayTrack</p>
              <p className="font-semibold text-sm">Admin Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-white text-brand-tealDark shadow-sm' : 'text-teal-100 hover:bg-white/10'
                }`
              }
            >
              <span className="opacity-80 w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 text-xs text-teal-100/80">
          Signed in as <span className="text-white font-medium">{displayName}</span>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-brand-teal text-white flex items-center justify-between px-4 md:px-6 shadow-md shrink-0">
          <h1 className="text-sm md:text-base font-semibold tracking-wide uppercase">
            Hostel Management System
          </h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={logout}
              className="text-xs md:text-sm px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"
            >
              Log out
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-brand-tealDark text-white flex justify-around py-2 border-t border-white/10 z-20 text-xs">
        {nav.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `px-2 py-1 rounded ${isActive ? 'text-brand-orange font-semibold' : 'text-teal-100'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
