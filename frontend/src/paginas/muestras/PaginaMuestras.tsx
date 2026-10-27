import { Fragment, useEffect, useState } from 'react'
import { PlantillaPrincipal } from '@/componentes/plantilla/PlantillaPrincipal'
import { Boton } from '@/componentes/ui/Boton'
import { EncabezadoPagina } from '@/componentes/ui/EncabezadoPagina'
import { CargandoTabla } from '@/componentes/ui/Esqueleto'
import { EstadoVacio } from '@/componentes/ui/EstadoVacio'
import { Insignia } from '@/componentes/ui/Insignia'
import { Mensaje } from '@/componentes/ui/Mensaje'
import { Paginacion } from '@/componentes/ui/Paginacion'
import { usePaginacion } from '@/componentes/ui/usePaginacion'
import { useSesion } from '@/contexto/useSesion'
import { obtenerMuestras } from '@/servicios/muestras'
import type { Muestra } from '@/tipos'
import { mensajeDeError } from '@/utilidades/errores'
import { formatearFecha } from '@/utilidades/fechas'
import { puedeRegistrarMuestras } from '@/utilidades/permisos'
import { FormularioMuestra } from './FormularioMuestra'
import { FormularioResultado } from './FormularioResultado'
import { TIPOS_MUESTRA } from './tiposMuestra'

const PESTANAS = [{ valor: '', texto: 'Todas' }, ...TIPOS_MUESTRA]

// Guion gris para los conteos de una muestra que todavía no tiene resultado.
function SinDato() {
  return <span className="text-gray-400">—</span>
}

export default function PaginaMuestras() {
  const { usuario } = useSesion()
  const puedeRegistrar = puedeRegistrarMuestras(usuario?.rol)

  const [tipo, setTipo] = useState('')
  const [muestras, setMuestras] = useState<Muestra[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [soloPendientes, setSoloPendientes] = useState(false)
  // Muestra a la que se le está cargando el resultado (null = ninguna).
  const [muestraAbierta, setMuestraAbierta] = useState<number | null>(null)
  // Se suma 1 después de guardar algo, para volver a pedir la lista.
  const [recargas, setRecargas] = useState(0)

  // Se pide la lista al entrar, al elegir otro tipo y después de guardar.
  useEffect(() => {
    setCargando(true)
    setError('')
    obtenerMuestras(tipo)
      .then(setMuestras)
      .catch((e) => setError(mensajeDeError(e)))
      .finally(() => setCargando(false))
  }, [tipo, recargas])

  const pendientes = muestras.filter((muestra) => !muestra.fecha_resultado)
  const muestrasVisibles = soloPendientes ? pendientes : muestras
  const paginacion = usePaginacion(muestrasVisibles)
  const columnas = puedeRegistrar ? 11 : 10

  function resultadoGuardado() {
    setMuestraAbierta(null)
    setAviso('Resultado cargado con éxito.')
    setRecargas(recargas + 1)
  }

  return (
    <PlantillaPrincipal>
      <div className="space-y-6">
        <EncabezadoPagina
          etiqueta="Diagnóstico"
          titulo="Muestras y Diagnóstico"
          descripcion="Ingreso de muestras y resultados de Brucelosis, Campilobacteriosis y Anemia Infecciosa Equina."
        >
          {puedeRegistrar && (
            <Boton onClick={() => setMostrarFormulario(!mostrarFormulario)}>
              {mostrarFormulario ? 'Cerrar formulario' : 'Registrar Muestra'}
            </Boton>
          )}
        </EncabezadoPagina>

        {puedeRegistrar && mostrarFormulario && (
          <FormularioMuestra tipoInicial={tipo} alGuardar={() => setRecargas(recargas + 1)} />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {PESTANAS.map((opcion) => (
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
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={soloPendientes}
              onChange={(e) => {
                setSoloPendientes(e.target.checked)
                paginacion.volverAlInicio()
              }}
              className="h-4 w-4 accent-cit-petroleo"
            />
            Solo pendientes de resultado ({pendientes.length})
          </label>
        </div>

        {aviso && <Mensaje tipo="exito" texto={aviso} />}
        {error && <Mensaje tipo="error" titulo="Error al cargar muestras" texto={error} />}

        {cargando ? (
          <CargandoTabla filas={2} />
        ) : muestrasVisibles.length === 0 ? (
          <EstadoVacio
            titulo={soloPendientes ? 'No hay muestras pendientes de resultado' : 'No hay muestras registradas'}
            descripcion={
              soloPendientes
                ? 'Todas las muestras de esta lista ya tienen su resultado cargado.'
                : 'Ejecutá `npm run seed` en el backend para cargar las muestras del CIT.'
            }
          />
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
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
                    <th className="px-5 py-3.5 text-center">Resultado</th>
                    {puedeRegistrar && <th className="px-5 py-3.5 text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {paginacion.elementos.map((muestra) => {
                    const pendiente = !muestra.fecha_resultado
                    return (
                      <Fragment key={muestra.id}>
                        <tr className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-5 py-4 font-mono whitespace-nowrap">
                            {formatearFecha(muestra.fecha_ingreso)}
                          </td>
                          <td className="px-5 py-4 font-mono">{muestra.numero_ingreso || '—'}</td>
                          <td className="px-5 py-4 font-bold">{muestra.propietario || '—'}</td>
                          <td className="px-5 py-4 text-gray-700">{muestra.establecimiento || '—'}</td>
                          <td className="px-5 py-4">{muestra.especie || '—'}</td>
                          <td className="px-5 py-4 text-center font-mono">{muestra.cantidad_muestras}</td>
                          {/* Si el resultado está pendiente, los conteos todavía no significan nada. */}
                          <td className="px-5 py-4 text-center">
                            {pendiente ? <SinDato /> : <span className="font-bold text-red-600">{muestra.positivos}</span>}
                          </td>
                          <td className="px-5 py-4 text-center">
                            {pendiente ? <SinDato /> : <span className="font-bold text-amber-600">{muestra.sospechosos}</span>}
                          </td>
                          <td className="px-5 py-4 text-center">
                            {pendiente ? <SinDato /> : <span className="font-bold text-emerald-700">{muestra.negativos}</span>}
                          </td>
                          <td className="px-5 py-4 text-center font-mono whitespace-nowrap">
                            {pendiente ? (
                              <Insignia color="ambar">Pendiente</Insignia>
                            ) : (
                              formatearFecha(muestra.fecha_resultado)
                            )}
                          </td>
                          {puedeRegistrar && (
                            <td className="px-5 py-4 text-right whitespace-nowrap">
                              {pendiente && muestraAbierta !== muestra.id && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAviso('')
                                    setMuestraAbierta(muestra.id)
                                  }}
                                  className="text-cit-petroleo font-bold hover:text-cit-azul-fuerte hover:underline"
                                >
                                  Cargar resultado
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                        {muestraAbierta === muestra.id && (
                          <tr>
                            <td colSpan={columnas} className="bg-gray-50 px-5 py-4">
                              <FormularioResultado
                                muestra={muestra}
                                alGuardar={resultadoGuardado}
                                alCancelar={() => setMuestraAbierta(null)}
                              />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Paginacion
              pagina={paginacion.pagina}
              totalPaginas={paginacion.totalPaginas}
              totalElementos={muestrasVisibles.length}
              porPagina={paginacion.porPagina}
              alCambiar={paginacion.cambiarPagina}
            />
          </div>
        )}
      </div>
    </PlantillaPrincipal>
  )
}
