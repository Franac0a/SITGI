import { useState, type ReactNode } from 'react'
import { authService } from '@/services/auth/auth.service'
import type { LoginRequest, User } from '@/types/auth.types'
import {
  AuthContext,
  STORAGE_TOKEN_KEY,
  STORAGE_USER_KEY,
} from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_TOKEN_KEY)
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const login = async (credentials: LoginRequest): Promise<User> => {
    setIsLoading(true)
    try {
      const response = await authService.login(credentials)
      const loggedUser = response.usuario
      const receivedToken = response.token || ''

      setUser(loggedUser)
      setToken(receivedToken)

      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(loggedUser))
      if (receivedToken) {
        localStorage.setItem(STORAGE_TOKEN_KEY, receivedToken)
      }

      return loggedUser
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(STORAGE_USER_KEY)
    localStorage.removeItem(STORAGE_TOKEN_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
