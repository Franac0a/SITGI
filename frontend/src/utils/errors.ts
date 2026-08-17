import { ApiClientError } from '@/services/api/client'

export function formatApiError(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.errors) {
      const fieldMessages = Object.values(error.errors).flat()
      if (fieldMessages.length > 0) {
        return fieldMessages.join(' ')
      }
    }

    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ocurrió un error inesperado. Intente nuevamente.'
}
