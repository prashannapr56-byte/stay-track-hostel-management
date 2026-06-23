import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { api, clearSession, readSession, setSession } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setState] = useState(() => readSession())

  const loginAdmin = useCallback(async (username, password) => {
    const data = await api('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    setSession(data.token, data.role, data.displayName)
    setState(readSession())
    return data
  }, [])

  const loginStudentPassword = useCallback(async (username, password) => {
    const data = await api('/auth/student/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    setSession(data.token, data.role, data.displayName)
    setState(readSession())
    return data
  }, [])

  const loginStudentOtp = useCallback(async (phone, otp) => {
    const data = await api('/auth/student/login-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    })
    setSession(data.token, data.role, data.displayName)
    setState(readSession())
    return data
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setState(readSession())
  }, [])

  const value = useMemo(
    () => ({
      ...session,
      isAdmin: session.role === 'ADMIN',
      isStudent: session.role === 'STUDENT',
      loginAdmin,
      loginStudentPassword,
      loginStudentOtp,
      logout,
    }),
    [session, loginAdmin, loginStudentPassword, loginStudentOtp, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
