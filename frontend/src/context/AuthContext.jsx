import { createContext, useCallback, useMemo, useState } from 'react'
import { api, clearSession, readSession, setSession } from '../api/client'

const AuthContext = createContext(null)

export { AuthContext }

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

  const loginParent = useCallback(async (registerNumber, parentPhone) => {
    const data = await api('/auth/parent/login', {
      method: 'POST',
      body: JSON.stringify({ registerNumber, parentPhone }),
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
      isParent: session.role === 'PARENT',
      loginAdmin,
      loginStudentPassword,
      loginStudentOtp,
      loginParent,
      logout,
    }),
    [session, loginAdmin, loginStudentPassword, loginStudentOtp, loginParent, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
