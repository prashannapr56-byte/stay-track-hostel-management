import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({ role, children }) {
  const { token, role: r } = useAuth()
  const loc = useLocation()
  if (!token) {
    return <Navigate to={role === 'ADMIN' ? '/admin/login' : '/student/login'} replace state={{ from: loc }} />
  }
  if (role && r !== role) {
    return <Navigate to="/" replace />
  }
  return children
}
