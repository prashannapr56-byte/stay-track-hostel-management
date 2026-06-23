import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function StudentLayout() {
  const { displayName, logout } = useAuth()
  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="hidden md:flex w-52 flex-col bg-brand-tealDark text-white shrink-0">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-bold text-brand-orange">
              H
            </span>
            <div>
              <p className="text-xs uppercase text-teal-100/90">StayTrack</p>
              <p className="font-semibold text-sm">Student</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          <NavLink
            to="/student"
            end
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2.5 text-sm font-medium ${
                isActive ? 'bg-white text-brand-tealDark' : 'text-teal-100 hover:bg-white/10'
              }`
            }
          >
            Overview
          </NavLink>
          <NavLink
            to="/student/notifications"
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2.5 text-sm font-medium ${
                isActive ? 'bg-white text-brand-tealDark' : 'text-teal-100 hover:bg-white/10'
              }`
            }
          >
            Notifications
          </NavLink>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-brand-teal text-white flex items-center justify-between px-4 shadow-md">
          <span className="text-sm font-semibold uppercase tracking-wide">Hostel Management</span>
          <div className="flex items-center gap-2">
            <span className="text-sm hidden sm:inline opacity-90">{displayName}</span>
            <button
              type="button"
              onClick={logout}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"
            >
              Log out
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-brand-tealDark text-white flex justify-around py-3 z-20 text-sm border-t border-white/10">
        <NavLink to="/student" end className={({ isActive }) => (isActive ? 'text-brand-orange font-semibold' : '')}>
          Home
        </NavLink>
        <NavLink
          to="/student/notifications"
          className={({ isActive }) => (isActive ? 'text-brand-orange font-semibold' : '')}
        >
          Alerts
        </NavLink>
      </nav>
    </div>
  )
}
