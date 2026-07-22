import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import {
  clearStoredSession,
  readStoredSession,
  writeStoredSession,
  type StoredAuthUser,
  type StoredSession,
} from '@/lib/auth-storage'

export type AuthUser = StoredAuthUser

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(readStoredSession)

  const login = useCallback((newToken: string, newUser: AuthUser) => {
    const nextSession = { token: newToken, user: newUser }
    writeStoredSession(nextSession)
    setSession(nextSession)
  }, [])

  const logout = useCallback(() => {
    clearStoredSession()
    setSession(null)
  }, [])

  useEffect(() => {
    const syncSession = () => setSession(readStoredSession())
    window.addEventListener('storage', syncSession)
    return () => window.removeEventListener('storage', syncSession)
  }, [])

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, token: session?.token ?? null, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
