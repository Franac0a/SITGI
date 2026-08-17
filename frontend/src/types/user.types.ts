import type { InstitutionalRole, User } from '@/types/auth.types'

export type UserStatus = 'pendiente' | 'activo' | 'rechazado'

export interface UserFilterParams {
  estado?: UserStatus
  rol?: InstitutionalRole
}

export interface UpdateUserStatusPayload {
  estado?: UserStatus
  rol?: InstitutionalRole
}

export interface UpdateUserResponse {
  mensaje: string
  usuario: User
}
