import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Junta clases de Tailwind. Si dos clases chocan (por ejemplo "h-10" y "h-8"),
// queda la última, así un componente puede recibir clases que pisen las suyas.
export function unirClases(...clases: ClassValue[]): string {
  return twMerge(clsx(clases))
}
