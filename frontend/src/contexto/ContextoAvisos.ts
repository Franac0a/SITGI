import { createContext } from 'react'

// Avisos que se muestran en la campana de la barra superior
// (por ejemplo "Elemento registrado"). Se guardan solo en este navegador.
export interface Aviso {
  id: string
  titulo: string
  descripcion: string
  hora: string
  tipo: 'exito' | 'alerta'
  leido: boolean
}

export interface DatosAvisos {
  avisos: Aviso[]
  sinLeer: number
  agregarAviso: (titulo: string, descripcion: string, tipo?: Aviso['tipo']) => void
  marcarAvisosLeidos: () => void
}

export const ContextoAvisos = createContext<DatosAvisos | null>(null)
