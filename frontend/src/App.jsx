import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './layouts/AdminLayout'
import { StudentLayout } from './layouts/StudentLayout'
import { Home } from './pages/Home'
import { AdminLogin } from './pages/admin/AdminLogin'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminRooms } from './pages/admin/AdminRooms'
import { AdminStudents } from './pages/admin/AdminStudents'
import { AdminAttendance } from './pages/admin/AdminAttendance'
import { AdminComplaints } from './pages/admin/AdminComplaints'
import { AdminOutpasses } from './pages/admin/AdminOutpasses'
import { AdminNotifications } from './pages/admin/AdminNotifications'
import { AdminVacating } from './pages/admin/AdminVacating'
import { AdminMenu } from './pages/admin/AdminMenu'
import { StudentLogin } from './pages/student/StudentLogin'
import { StudentRegister } from './pages/student/StudentRegister'
import { StudentDashboard } from './pages/student/StudentDashboard'
import { StudentProfile } from './pages/student/StudentProfile'
import { StudentAttendance } from './pages/student/StudentAttendance'
import { StudentMenu } from './pages/student/StudentMenu'
import { StudentNotifications } from './pages/student/StudentNotifications'
import { StudentComplaints } from './pages/student/StudentComplaints'
import { StudentOutpass } from './pages/student/StudentOutpass'
import { ParentLogin } from './pages/parent/ParentLogin'
import { ParentDashboard } from './pages/parent/ParentDashboard'
import { useAuth } from './hooks/useAuth'

function RoleHome() {
  const { token, role } = useAuth()
  if (!token) return <Home />
  if (role === 'ADMIN') return <Navigate to="/admin" replace />
  if (role === 'STUDENT') return <Navigate to="/student" replace />
  if (role === 'PARENT') return <Navigate to="/parent" replace />
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
          <Route path="/parent/login" element={<ParentLogin />} />

          <Route
            path="/parent"
            element={
              <ProtectedRoute role="PARENT">
                <ParentDashboard />
              </ProtectedRoute>
            }
          />

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
            <Route path="students" element={<AdminStudents />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="outpasses" element={<AdminOutpasses />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="vacating" element={<AdminVacating />} />
            <Route path="menu" element={<AdminMenu />} />
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
            <Route path="profile" element={<StudentProfile />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="menu" element={<StudentMenu />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="complaints" element={<StudentComplaints />} />
            <Route path="outpass" element={<StudentOutpass />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
