import { createContext } from 'react'
import type { Usuario } from '@/tipos'

export interface DatosSesion {
  usuario: Usuario | null
  estaLogueado: boolean
  ingresar: (email: string, password: string) => Promise<Usuario>
  salir: () => void
}

export const ContextoSesion = createContext<DatosSesion | null>(null)
