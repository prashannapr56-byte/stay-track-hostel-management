import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './layouts/AdminLayout'
import { StudentLayout } from './layouts/StudentLayout'
import { Home } from './pages/Home'
import { AdminLogin } from './pages/admin/AdminLogin'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminRooms } from './pages/admin/AdminRooms'
import { AdminAttendance } from './pages/admin/AdminAttendance'
import { AdminComplaints } from './pages/admin/AdminComplaints'
import { AdminNotifications } from './pages/admin/AdminNotifications'
import { AdminVacating } from './pages/admin/AdminVacating'
import { StudentLogin } from './pages/student/StudentLogin'
import { StudentRegister } from './pages/student/StudentRegister'
import { StudentDashboard } from './pages/student/StudentDashboard'
import { StudentNotifications } from './pages/student/StudentNotifications'
import { useAuth } from './context/AuthContext'

function RoleHome() {
  const { token, role } = useAuth()
  if (!token) return <Home />
  if (role === 'ADMIN') return <Navigate to="/admin" replace />
  if (role === 'STUDENT') return <Navigate to="/student" replace />
  return <Home />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RoleHome />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/register" element={<StudentRegister />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="vacating" element={<AdminVacating />} />
          </Route>

          <Route
            path="/student"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="notifications" element={<StudentNotifications />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
