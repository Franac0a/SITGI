import { useEffect, useState, type ReactNode } from 'react'
import { authService } from '@/services/auth/auth.service'
import { ApiClientError } from '@/services/api/client'
import type { LoginRequest, User } from '@/types/auth.types'
import { AuthContext, STORAGE_USER_KEY } from './auth-context'

// La sesión vive en una cookie httpOnly; acá solo se guarda el perfil para mostrarlo.
// Versiones anteriores guardaban el token en localStorage: se borra si quedó.
localStorage.removeItem('sitgi_token')

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const guardarUsuario = (nuevo: User | null) => {
    setUser(nuevo)
    if (nuevo) localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nuevo))
    else localStorage.removeItem(STORAGE_USER_KEY)
  }

  // Confirma con el backend que la cookie sigue vigente y actualiza el rol.
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_USER_KEY)) return
    authService
      .me()
      .then((res) => guardarUsuario(res.usuario))
      .catch((error) => {
        if (error instanceof ApiClientError && [401, 403].includes(error.statusCode)) {
          guardarUsuario(null)
        }
      })
  }, [])

  const login = async (credentials: LoginRequest): Promise<User> => {
    setIsLoading(true)
    try {
      const response = await authService.login(credentials)
      guardarUsuario(response.usuario)
      return response.usuario
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    guardarUsuario(null)
    authService.logout().catch(() => {})
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
