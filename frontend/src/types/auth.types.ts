import type { INSTITUTIONAL_ROLES } from '@/constants/roles'

export type InstitutionalRole = (typeof INSTITUTIONAL_ROLES)[number]['value']

export interface User {
  id: number
  dni: string
  nombre: string
  email: string
  rol: InstitutionalRole | string
  estado: 'pendiente' | 'activo' | 'rechazado'
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  dni: string
  nombre: string
  email: string
  password: string
  rol: InstitutionalRole
}

export interface AuthResponse {
  token?: string
  mensaje?: string
  usuario: User
}

export interface LoginFormValues {
  email: string
  password: string
}

export interface RegisterFormValues {
  dni: string
  nombre: string
  email: string
  password: string
  confirmPassword: string
  rol: InstitutionalRole | ''
}

export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>
export type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>
