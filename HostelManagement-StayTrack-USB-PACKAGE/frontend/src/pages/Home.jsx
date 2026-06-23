import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="min-h-screen auth-backdrop flex flex-col items-center justify-center p-6">
      <div className="text-center text-white mb-10">
        <h1 className="text-3xl md:text-4xl font-bold drop-shadow-sm">StayTrack</h1>
        <p className="mt-2 text-teal-50 text-lg">Hostel Management System</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 w-full max-w-lg">
        <Link
          to="/admin/login"
          className="rounded-2xl bg-white/95 p-6 shadow-xl hover:shadow-2xl transition text-center border border-white/40"
        >
          <p className="text-brand-teal font-semibold text-lg">Admin Portal</p>
          <p className="text-slate-600 text-sm mt-1">Management dashboard</p>
        </Link>
        <Link
          to="/student/login"
          className="rounded-2xl bg-white/95 p-6 shadow-xl hover:shadow-2xl transition text-center border border-white/40"
        >
          <p className="text-brand-orange font-semibold text-lg">Student</p>
          <p className="text-slate-600 text-sm mt-1">Login or register</p>
        </Link>
      </div>
    </div>
  )
}
