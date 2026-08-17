import { apiClient } from '@/services/api/client'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '@/types/auth.types'

const AUTH_BASE = '/auth'

export const authService = {
  login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiClient<AuthResponse>(`${AUTH_BASE}/login`, {
      method: 'POST',
      body: credentials,
    })
  },

  register(payload: RegisterRequest): Promise<AuthResponse> {
    return apiClient<AuthResponse>(`${AUTH_BASE}/register`, {
      method: 'POST',
      body: payload,
    })
  },
}
