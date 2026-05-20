import { createContext, useContext, useState, type ReactNode } from 'react'
import { verifyPin, setPin } from '../utils/auth'

interface LoggedInUser {
  id: string
  name: string
}

interface AuthContextValue {
  user: LoggedInUser | null
  login: (instructorId: string, instructorName: string, pin: string) => Promise<boolean>
  logout: () => void
  changePin: (instructorId: string, currentPin: string, newPin: string) => Promise<'ok' | 'wrong_pin' | 'error'>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const SESSION_KEY = 'horse-schedule-session'

function loadSession(): LoggedInUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoggedInUser | null>(loadSession)

  async function login(instructorId: string, instructorName: string, pin: string): Promise<boolean> {
    const ok = await verifyPin(instructorId, pin)
    if (ok) {
      const session: LoggedInUser = { id: instructorId, name: instructorName }
      setUser(session)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    }
    return ok
  }

  function logout() {
    setUser(null)
    sessionStorage.removeItem(SESSION_KEY)
  }

  async function changePin(
    instructorId: string,
    currentPin: string,
    newPin: string
  ): Promise<'ok' | 'wrong_pin' | 'error'> {
    try {
      const ok = await verifyPin(instructorId, currentPin)
      if (!ok) return 'wrong_pin'
      await setPin(instructorId, newPin)
      return 'ok'
    } catch {
      return 'error'
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, changePin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
