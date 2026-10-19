import type { ApiError, ApiResponse, RequestOptions } from '@/types/api.types'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export class ApiClientError extends Error {
  statusCode: number
  errors?: Record<string, string | string[]>

  constructor(error: ApiError) {
    super(error.message)
    this.name = 'ApiClientError'
    this.statusCode = error.statusCode
    this.errors = error.errors
  }
}

interface RawBackendError {
  mensaje?: string
  message?: string
  error?: string
  detalle?: string
  errors?: Record<string, string | string[]>
  errores?: Record<string, string | string[]>
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')
  const payload = contentType?.includes('application/json')
    ? await response.json()
    : null

  if (!response.ok) {
    const errorPayload = payload as RawBackendError | null

    // Sesión vencida o token inválido: se limpia la sesión local y se vuelve al login.
    // (El login y el registro devuelven 401/403 por credenciales o aprobación; no se tocan.)
    const esAuthPublica = /\/auth\/(login|register)$/.test(response.url)
    if (
      !esAuthPublica &&
      (response.status === 401 ||
        (response.status === 403 &&
          /token/i.test(errorPayload?.mensaje ?? '')))
    ) {
      localStorage.removeItem('sitgi_user')
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    const errorMessage =
      errorPayload?.mensaje ||
      errorPayload?.message ||
      errorPayload?.error ||
      errorPayload?.detalle ||
      'Ocurrió un error inesperado al procesar la solicitud.'

    throw new ApiClientError({
      message: errorMessage,
      statusCode: response.status,
      errors: errorPayload?.errors || errorPayload?.errores,
    })
  }

  return payload as T
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body } = options

  const headers: HeadersInit = {
    Accept: 'application/json',
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  return parseResponse<T>(response)
}

export type { ApiResponse }
