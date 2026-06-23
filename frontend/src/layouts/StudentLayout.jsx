import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function StudentLayout() {
  const { displayName, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 768)
  const location = useLocation()

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false)
    }
  }, [location.pathname])

  return (
    <div className="min-h-[100dvh] flex bg-slate-100 relative">
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside 
        className={`
          flex flex-col bg-brand-blueDark text-white shrink-0 h-[100dvh] overflow-y-auto
          fixed top-0 md:sticky z-50 transition-transform duration-300 ease-in-out
          w-64 md:w-52
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'}
        `}
      >
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-bold text-brand-orange">
              H
            </span>
            <div>
              <p className="text-xs uppercase text-blue-100/90">StayTrack</p>
              <p className="font-semibold text-sm">Student</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavLink
            to="/student"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-white text-brand-blueDark shadow-sm' : 'text-teal-100 hover:bg-white/10'
              }`
            }
          >
            <span className="opacity-80 w-5 text-center">◉</span>
            Overview
          </NavLink>
          <NavLink
            to="/student/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-white text-brand-blueDark shadow-sm' : 'text-teal-100 hover:bg-white/10'
              }`
            }
          >
            <span className="opacity-80 w-5 text-center">👤</span>
            Profile View
          </NavLink>
          <NavLink
            to="/student/attendance"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-white text-brand-blueDark shadow-sm' : 'text-teal-100 hover:bg-white/10'
              }`
            }
          >
            <span className="opacity-80 w-5 text-center">✓</span>
            Attendance
          </NavLink>
          <NavLink
            to="/student/menu"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-white text-brand-blueDark shadow-sm' : 'text-teal-100 hover:bg-white/10'
              }`
            }
          >
            <span className="opacity-80 w-5 text-center">♨</span>
            Mess Menu
          </NavLink>
          <NavLink
            to="/student/notifications"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-white text-brand-blueDark shadow-sm' : 'text-teal-100 hover:bg-white/10'
              }`
            }
          >
            <span className="opacity-80 w-5 text-center">✉</span>
            Notifications
          </NavLink>
          <NavLink
            to="/student/complaints"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-white text-brand-blueDark shadow-sm' : 'text-teal-100 hover:bg-white/10'
              }`
            }
          >
            <span className="opacity-80 w-5 text-center">!</span>
            Complaints
          </NavLink>
          <NavLink
            to="/student/outpass"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-white text-brand-blueDark shadow-sm' : 'text-teal-100 hover:bg-white/10'
              }`
            }
          >
            <span className="opacity-80 w-5 text-center">➜</span>
            Outpass Request
          </NavLink>
        </nav>
        <div className="p-3 border-t border-white/10 text-xs text-blue-100/80">
          Signed in as <span className="text-white font-medium">{displayName}</span>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-brand-blue text-white flex items-center justify-between px-4 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-white hover:text-brand-orange text-xl leading-none font-bold"
            >
              ☰
            </button>
            <span className="text-sm font-semibold uppercase tracking-wide">Hostel Management</span>
          </div>
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

    </div>
  )
}
