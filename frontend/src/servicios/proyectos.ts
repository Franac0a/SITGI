import { pedirApi } from '@/servicios/api'
import type { DatosProyecto, EstadoProyecto, Proyecto } from '@/tipos'

export function obtenerProyectos(): Promise<Proyecto[]> {
  return pedirApi<Proyecto[]>('/proyectos')
}

export function crearProyecto(datos: DatosProyecto) {
  return pedirApi('/proyectos', 'POST', datos)
}

export function cambiarEstadoProyecto(id: number, estado: EstadoProyecto) {
  return pedirApi(`/proyectos/${id}`, 'PUT', { estado })
}

export function eliminarProyecto(id: number) {
  return pedirApi(`/proyectos/${id}`, 'DELETE')
}
