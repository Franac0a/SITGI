import { useEffect, useState } from 'react'
import { PlantillaPrincipal } from '@/componentes/plantilla/PlantillaPrincipal'
import { EncabezadoPagina } from '@/componentes/ui/EncabezadoPagina'
import { CargandoTabla } from '@/componentes/ui/Esqueleto'
import { EstadoVacio } from '@/componentes/ui/EstadoVacio'
import { Mensaje } from '@/componentes/ui/Mensaje'
import { Paginacion } from '@/componentes/ui/Paginacion'
import { usePaginacion } from '@/componentes/ui/usePaginacion'
import { obtenerMuestras } from '@/servicios/muestras'
import type { Muestra, Opcion } from '@/tipos'
import { mensajeDeError } from '@/utilidades/errores'

const TIPOS: Opcion[] = [
  { valor: '', texto: 'Todas' },
  { valor: 'Brucelosis', texto: 'Brucelosis' },
  { valor: 'Campilobacteriosis', texto: 'Campilobacteriosis' },
  { valor: 'Anemia Infecciosa Equina', texto: 'Anemia Infecciosa Equina' },
]

export default function PaginaMuestras() {
  const [tipo, setTipo] = useState('')
  const [muestras, setMuestras] = useState<Muestra[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const paginacion = usePaginacion(muestras)

  // Se vuelve a pedir la lista cada vez que se elige otro tipo.
  useEffect(() => {
    setCargando(true)
    setError('')
    obtenerMuestras(tipo)
      .then(setMuestras)
      .catch((e) => setError(mensajeDeError(e)))
      .finally(() => setCargando(false))
  }, [tipo])

  return (
    <PlantillaPrincipal>
      <div className="space-y-6">
        <EncabezadoPagina
          etiqueta="Diagnóstico"
          titulo="Muestras y Diagnóstico"
          descripcion="Ingreso de muestras y resultados de Brucelosis, Campilobacteriosis y Anemia Infecciosa Equina."
        />

        <div className="flex flex-wrap gap-2">
          {TIPOS.map((opcion) => (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => {
                setTipo(opcion.valor)
                paginacion.volverAlInicio()
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                tipo === opcion.valor
                  ? 'bg-cit-petroleo text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {opcion.texto}
            </button>
          ))}
        </div>

        {error && <Mensaje tipo="error" titulo="Error al cargar muestras" texto={error} />}

        {cargando ? (
          <CargandoTabla filas={2} />
        ) : muestras.length === 0 ? (
          <EstadoVacio
            titulo="No hay muestras registradas"
            descripcion="Ejecutá `npm run seed` en el backend para cargar las muestras del CIT."
          />
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-5 py-3.5">Fecha</th>
                  <th className="px-5 py-3.5">Ingreso</th>
                  <th className="px-5 py-3.5">Propietario</th>
                  <th className="px-5 py-3.5">Establecimiento</th>
                  <th className="px-5 py-3.5">Especie</th>
                  <th className="px-5 py-3.5 text-center">Muestras</th>
                  <th className="px-5 py-3.5 text-center">Pos.</th>
                  <th className="px-5 py-3.5 text-center">Sosp.</th>
                  <th className="px-5 py-3.5 text-center">Neg.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {paginacion.elementos.map((muestra) => (
                  <tr key={muestra.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono whitespace-nowrap">{muestra.fecha_ingreso || '—'}</td>
                    <td className="px-5 py-4 font-mono">{muestra.numero_ingreso || '—'}</td>
                    <td className="px-5 py-4 font-bold">{muestra.propietario || '—'}</td>
                    <td className="px-5 py-4 text-gray-700">{muestra.establecimiento || '—'}</td>
                    <td className="px-5 py-4">{muestra.especie || '—'}</td>
                    <td className="px-5 py-4 text-center font-mono">{muestra.cantidad_muestras}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-bold text-red-600">{muestra.positivos}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-bold text-amber-600">{muestra.sospechosos}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-bold text-emerald-700">{muestra.negativos}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Paginacion
              pagina={paginacion.pagina}
              totalPaginas={paginacion.totalPaginas}
              totalElementos={muestras.length}
              porPagina={paginacion.porPagina}
              alCambiar={paginacion.cambiarPagina}
            />
          </div>
        )}
      </div>
    </PlantillaPrincipal>
  )
}
