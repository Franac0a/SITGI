import { apiClient } from '@/services/api/client'
import type { User } from '@/types/auth.types'
import type {
  UpdateUserResponse,
  UpdateUserStatusPayload,
  UserFilterParams,
} from '@/types/user.types'

const USERS_BASE = '/users'

export const usersService = {
  getUsers(params: UserFilterParams = {}): Promise<User[]> {
    const searchParams = new URLSearchParams()
    if (params.estado) searchParams.append('estado', params.estado)
    if (params.rol) searchParams.append('rol', params.rol)

    const query = searchParams.toString()
    const endpoint = query ? `${USERS_BASE}?${query}` : USERS_BASE

    return apiClient<User[]>(endpoint)
  },

  updateUserStatus(
    id: number,
    payload: UpdateUserStatusPayload,
  ): Promise<UpdateUserResponse> {
    return apiClient<UpdateUserResponse>(`${USERS_BASE}/${id}/estado`, {
      method: 'PUT',
      body: payload,
    })
  },
}
