import { useEffect, useState, type FormEvent } from 'react'
import { PlantillaPrincipal } from '@/componentes/plantilla/PlantillaPrincipal'
import { Boton } from '@/componentes/ui/Boton'
import { CampoTexto } from '@/componentes/ui/CampoTexto'
import { EncabezadoPagina } from '@/componentes/ui/EncabezadoPagina'
import { CargandoTabla } from '@/componentes/ui/Esqueleto'
import { EstadoVacio } from '@/componentes/ui/EstadoVacio'
import { EtiquetaCategoria, Insignia } from '@/componentes/ui/Insignia'
import { Mensaje } from '@/componentes/ui/Mensaje'
import { Selector } from '@/componentes/ui/Selector'
import { useSesion } from '@/contexto/useSesion'
import { crearResiduo, marcarResiduoRetirado, obtenerResiduos } from '@/servicios/residuos'
import type { Opcion, Residuo, TipoResiduo } from '@/tipos'
import { mensajeDeError } from '@/utilidades/errores'
import { puedeGestionarInventario } from '@/utilidades/permisos'

const TIPOS_RESIDUO: Opcion[] = [
  { valor: 'Patológico', texto: 'Patológico' },
  { valor: 'Químico', texto: 'Químico' },
  { valor: 'Tóxico', texto: 'Tóxico' },
  { valor: 'Biológico', texto: 'Biológico' },
  { valor: 'Otro', texto: 'Otro' },
]

export default function PaginaResiduos() {
  const { usuario } = useSesion()
  const puedeGestionar = puedeGestionarInventario(usuario?.rol)

  const [residuos, setResiduos] = useState<Residuo[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Formulario de nuevo residuo
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorFormulario, setErrorFormulario] = useState('')
  const [tipo, setTipo] = useState<TipoResiduo>('Químico')
  const [descripcion, setDescripcion] = useState('')
  const [sector, setSector] = useState('')
  const [retiroProgramado, setRetiroProgramado] = useState('')
  const [observaciones, setObservaciones] = useState('')

  async function cargarResiduos() {
    setCargando(true)
    setError('')
    try {
      setResiduos(await obtenerResiduos())
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarResiduos()
  }, [])

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErrorFormulario('')

    if (!descripcion.trim()) {
      setErrorFormulario('La descripción del residuo es obligatoria.')
      return
    }

    setGuardando(true)
    try {
      await crearResiduo({
        tipo,
        descripcion: descripcion.trim(),
        sector: sector.trim() || undefined,
        retiro_programado: retiroProgramado || undefined,
        observaciones: observaciones.trim() || undefined,
      })
      setDescripcion('')
      setSector('')
      setRetiroProgramado('')
      setObservaciones('')
      setMostrarFormulario(false)
      await cargarResiduos()
    } catch (e) {
      setErrorFormulario(mensajeDeError(e))
    } finally {
      setGuardando(false)
    }
  }

  async function marcarRetirado(id: number) {
    setError('')
    try {
      await marcarResiduoRetirado(id)
      await cargarResiduos()
    } catch (e) {
      setError(mensajeDeError(e))
    }
  }

  return (
    <PlantillaPrincipal>
      <div className="space-y-6">
        <EncabezadoPagina
          etiqueta="Descarte diferenciado"
          titulo="Residuos Especiales"
          descripcion="Registro de residuos patológicos, químicos, tóxicos y biológicos con retiro programado."
        >
          {puedeGestionar && (
            <Boton onClick={() => setMostrarFormulario(!mostrarFormulario)}>
              {mostrarFormulario ? 'Cerrar formulario' : 'Registrar Residuo'}
            </Boton>
          )}
        </EncabezadoPagina>

        {mostrarFormulario && (
          <form onSubmit={enviar} className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5">
            {errorFormulario && <Mensaje tipo="error" titulo="No se pudo registrar" texto={errorFormulario} />}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Selector
                name="tipo"
                etiqueta="Tipo de residuo *"
                opciones={TIPOS_RESIDUO}
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoResiduo)}
                disabled={guardando}
              />
              <div className="lg:col-span-2">
                <CampoTexto
                  name="descripcion"
                  etiqueta="Descripción *"
                  placeholder="Ej. Bolsas rojas con material patológico"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  disabled={guardando}
                />
              </div>
              <CampoTexto
                name="sector"
                etiqueta="Sector (opcional)"
                placeholder="Ej. Biología Molecular"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                disabled={guardando}
              />
              <CampoTexto
                name="responsable"
                etiqueta="Responsable (usuario actual)"
                value={usuario?.nombre ?? ''}
                readOnly
                disabled
              />
              <CampoTexto
                name="retiroProgramado"
                type="date"
                etiqueta="Retiro programado (opcional)"
                value={retiroProgramado}
                onChange={(e) => setRetiroProgramado(e.target.value)}
                disabled={guardando}
              />
            </div>
            <CampoTexto
              name="observaciones"
              etiqueta="Observaciones (opcional)"
              placeholder="Condiciones de congelamiento, recipiente, etc."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              disabled={guardando}
            />
            <div className="flex justify-end">
              <Boton type="submit" cargando={guardando}>
                Guardar Residuo
              </Boton>
            </div>
          </form>
        )}

        {error && <Mensaje tipo="error" titulo="Error al cargar residuos" texto={error} />}

        {cargando ? (
          <CargandoTabla />
        ) : residuos.length === 0 ? (
          <EstadoVacio
            titulo="No hay residuos registrados"
            descripcion="Aún no se han registrado residuos especiales con descarte diferenciado."
          />
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-5 py-3.5">Tipo</th>
                  <th className="px-5 py-3.5">Descripción</th>
                  <th className="px-5 py-3.5">Sector</th>
                  <th className="px-5 py-3.5">Responsable</th>
                  <th className="px-5 py-3.5">Retiro programado</th>
                  <th className="px-5 py-3.5 text-center">Estado</th>
                  {puedeGestionar && <th className="px-5 py-3.5 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {residuos.map((residuo) => (
                  <tr key={residuo.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <EtiquetaCategoria>{residuo.tipo}</EtiquetaCategoria>
                    </td>
                    <td className="px-5 py-4 font-bold">
                      {residuo.descripcion}
                      {residuo.observaciones && (
                        <span className="block text-[11px] text-gray-500 font-normal">{residuo.observaciones}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{residuo.sector || '—'}</td>
                    <td className="px-5 py-4">{residuo.responsable}</td>
                    <td className="px-5 py-4 font-mono text-gray-700">{residuo.retiro_programado || '—'}</td>
                    <td className="px-5 py-4 text-center">
                      <Insignia color={residuo.estado === 'Retirado' ? 'verde' : 'ambar'}>{residuo.estado}</Insignia>
                    </td>
                    {puedeGestionar && (
                      <td className="px-5 py-4 text-right">
                        {residuo.estado === 'Pendiente' && (
                          <button
                            type="button"
                            onClick={() => marcarRetirado(residuo.id)}
                            className="text-emerald-700 font-bold hover:text-emerald-900 hover:underline"
                          >
                            Marcar Retirado
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PlantillaPrincipal>
  )
}
