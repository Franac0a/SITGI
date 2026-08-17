import type { ApiError, ApiResponse, RequestOptions } from '@/types/api.types'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export class ApiClientError extends Error {
  statusCode: number
  errors?: Record<string, string[]>

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
  errors?: Record<string, string[]>
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')
  const payload = contentType?.includes('application/json')
    ? await response.json()
    : null

  if (!response.ok) {
    const errorPayload = payload as RawBackendError | null
    const errorMessage =
      errorPayload?.mensaje ||
      errorPayload?.message ||
      errorPayload?.error ||
      errorPayload?.detalle ||
      'Ocurrió un error inesperado.'

    throw new ApiClientError({
      message: errorMessage,
      statusCode: response.status,
      errors: errorPayload?.errors,
    })
  }

  return payload as T
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: HeadersInit = {
    Accept: 'application/json',
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const authToken = token || localStorage.getItem('sitgi_token')
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
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
