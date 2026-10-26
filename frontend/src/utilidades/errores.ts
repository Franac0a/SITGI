// Devuelve un texto para mostrarle al usuario a partir de un error.
export function mensajeDeError(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado. Intente nuevamente.'
}
