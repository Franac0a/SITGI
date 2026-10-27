import { armarConsulta, pedirApi } from '@/servicios/api'
import type { DatosMuestra, Muestra, ResultadoMuestra } from '@/tipos'

// Sin tipo trae todas las muestras.
export function obtenerMuestras(tipo: string): Promise<Muestra[]> {
  return pedirApi<Muestra[]>(`/muestras${armarConsulta({ tipo })}`)
}

// Paso 1: la muestra ingresa al laboratorio.
export function registrarMuestra(datos: DatosMuestra) {
  return pedirApi<{ mensaje: string }>('/muestras', 'POST', datos)
}

// Paso 2: se carga el resultado del diagnóstico.
export function cargarResultadoMuestra(id: number, resultado: ResultadoMuestra) {
  return pedirApi<{ mensaje: string }>(`/muestras/${id}/resultado`, 'PUT', resultado)
}
