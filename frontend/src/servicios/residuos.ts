import { pedirApi } from '@/servicios/api'
import type { DatosResiduo, Residuo } from '@/tipos'

export function obtenerResiduos(): Promise<Residuo[]> {
  return pedirApi<Residuo[]>('/residuos')
}

export function crearResiduo(datos: DatosResiduo) {
  return pedirApi('/residuos', 'POST', datos)
}

export function marcarResiduoRetirado(id: number) {
  return pedirApi(`/residuos/${id}`, 'PUT', { estado: 'Retirado' })
}
