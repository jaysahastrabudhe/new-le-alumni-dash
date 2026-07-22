export type StoredAuthUser = {
  id: string
  name: string
  email: string
  role: 'student' | 'alumni' | 'admin'
  avatarUrl?: string | null
}

export type StoredSession = {
  token: string
  user: StoredAuthUser
}

export const TOKEN_KEY = 'le_token'
export const USER_KEY = 'le_user'

function hasValidExpiry(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false

    const encodedPayload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=')
    const payload = JSON.parse(atob(paddedPayload)) as {
      sub?: unknown
      exp?: unknown
    }

    return (
      typeof payload.sub === 'string' &&
      typeof payload.exp === 'number' &&
      payload.exp * 1000 > Date.now()
    )
  } catch {
    return false
  }
}

function isStoredUser(value: unknown): value is StoredAuthUser {
  if (!value || typeof value !== 'object') return false
  const user = value as Partial<StoredAuthUser>
  return (
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    (user.role === 'student' || user.role === 'alumni' || user.role === 'admin')
  )
}

export function clearStoredSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function readStoredSession(): StoredSession | null {
  if (typeof window === 'undefined') return null

  const token = localStorage.getItem(TOKEN_KEY)
  const storedUser = localStorage.getItem(USER_KEY)
  if (!token || !storedUser || !hasValidExpiry(token)) {
    clearStoredSession()
    return null
  }

  try {
    const user: unknown = JSON.parse(storedUser)
    if (!isStoredUser(user)) throw new Error('Invalid stored user')
    return { token, user }
  } catch {
    clearStoredSession()
    return null
  }
}

export function writeStoredSession(session: StoredSession) {
  localStorage.setItem(TOKEN_KEY, session.token)
  localStorage.setItem(USER_KEY, JSON.stringify(session.user))
}
