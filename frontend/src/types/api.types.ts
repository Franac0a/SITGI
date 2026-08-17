export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string
}
