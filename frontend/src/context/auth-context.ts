import { createContext } from 'react'
import type { LoginRequest, User } from '@/types/auth.types'

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const STORAGE_USER_KEY = 'sitgi_user'
