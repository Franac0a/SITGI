import { armarConsulta, pedirApi } from '@/servicios/api'
import type { Muestra } from '@/tipos'

// Sin tipo trae todas las muestras.
export function obtenerMuestras(tipo: string): Promise<Muestra[]> {
  return pedirApi<Muestra[]>(`/muestras${armarConsulta({ tipo })}`)
}
