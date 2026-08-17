import type { InstitutionalRole, User } from '@/types/auth.types'

export type UserStatus = 'pendiente' | 'activo' | 'rechazado'

export interface UserFilterParams {
  estado?: UserStatus
  rol?: InstitutionalRole | string
}

export interface UpdateUserStatusPayload {
  estado?: UserStatus
  rol?: InstitutionalRole | string
}

export interface UpdateUserResponse {
  mensaje: string
  usuario: User
}
