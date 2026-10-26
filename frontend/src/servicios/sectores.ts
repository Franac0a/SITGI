import { pedirApi } from '@/servicios/api'
import type { Sector } from '@/tipos'

export function obtenerSectores(): Promise<Sector[]> {
  return pedirApi<Sector[]>('/sectores')
}

export function crearSector(datos: { nombre: string; tipo: string; descripcion?: string }) {
  return pedirApi('/sectores', 'POST', datos)
}

export function eliminarSector(id: number) {
  return pedirApi(`/sectores/${id}`, 'DELETE')
}
