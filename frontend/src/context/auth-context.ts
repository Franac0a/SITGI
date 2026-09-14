import { createContext } from 'react'
import type { LoginRequest, User } from '@/types/auth.types'

export interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const STORAGE_TOKEN_KEY = 'sitgi_token'
export const STORAGE_USER_KEY = 'sitgi_user'
