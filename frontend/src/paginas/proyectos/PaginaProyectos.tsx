import { useEffect, useState, type FormEvent } from 'react'
import { PlantillaPrincipal } from '@/componentes/plantilla/PlantillaPrincipal'
import { Boton } from '@/componentes/ui/Boton'
import { CampoTexto } from '@/componentes/ui/CampoTexto'
import { EncabezadoPagina } from '@/componentes/ui/EncabezadoPagina'
import { Esqueleto } from '@/componentes/ui/Esqueleto'
import { EstadoVacio } from '@/componentes/ui/EstadoVacio'
import { Mensaje } from '@/componentes/ui/Mensaje'
import { Selector } from '@/componentes/ui/Selector'
import { useSesion } from '@/contexto/useSesion'
import { cambiarEstadoProyecto, crearProyecto, eliminarProyecto, obtenerProyectos } from '@/servicios/proyectos'
import type { EstadoProyecto, Opcion, Proyecto } from '@/tipos'
import { mensajeDeError } from '@/utilidades/errores'
import { puedeGestionarProyectos } from '@/utilidades/permisos'

const ESTADOS: Opcion[] = [
  { valor: 'En ejecución', texto: 'En ejecución' },
  { valor: 'Finalizado', texto: 'Finalizado' },
  { valor: 'Suspendido', texto: 'Suspendido' },
]

const COLOR_ESTADO: Record<EstadoProyecto, string> = {
  'En ejecución': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Finalizado: 'bg-gray-200 text-gray-700 border-gray-300',
  Suspendido: 'bg-amber-100 text-amber-800 border-amber-200',
}

export default function PaginaProyectos() {
  const { usuario } = useSesion()
  const puedeGestionar = puedeGestionarProyectos(usuario?.rol)

  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Formulario de nuevo proyecto
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorFormulario, setErrorFormulario] = useState('')
  const [titulo, setTitulo] = useState('')
  const [codigo, setCodigo] = useState('')
  const [director, setDirector] = useState('')
  const [estado, setEstado] = useState<EstadoProyecto>('En ejecución')
  const [fechaInicio, setFechaInicio] = useState('')
  const [descripcion, setDescripcion] = useState('')

  async function cargarProyectos() {
    setCargando(true)
    setError('')
    try {
      setProyectos(await obtenerProyectos())
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarProyectos()
  }, [])

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErrorFormulario('')

    if (!titulo.trim()) {
      setErrorFormulario('El título del proyecto es obligatorio.')
      return
    }

    setGuardando(true)
    try {
      await crearProyecto({
        titulo: titulo.trim(),
        codigo: codigo.trim() || undefined,
        director: director.trim() || undefined,
        estado,
        fecha_inicio: fechaInicio || undefined,
        descripcion: descripcion.trim() || undefined,
      })
      setTitulo('')
      setCodigo('')
      setDirector('')
      setFechaInicio('')
      setDescripcion('')
      setMostrarFormulario(false)
      await cargarProyectos()
    } catch (e) {
      setErrorFormulario(mensajeDeError(e))
    } finally {
      setGuardando(false)
    }
  }

  async function finalizar(id: number) {
    setError('')
    try {
      await cambiarEstadoProyecto(id, 'Finalizado')
      await cargarProyectos()
    } catch (e) {
      setError(mensajeDeError(e))
    }
  }

  async function borrar(id: number) {
    if (!window.confirm('¿Eliminar este proyecto?')) return
    setError('')
    try {
      await eliminarProyecto(id)
      await cargarProyectos()
    } catch (e) {
      setError(mensajeDeError(e))
    }
  }

  return (
    <PlantillaPrincipal>
      <div className="space-y-6">
        <EncabezadoPagina
          etiqueta="Líneas de investigación"
          titulo="Proyectos de Investigación"
          descripcion="Administración de proyectos científicos y seguimiento de consumo de insumos."
        >
          {puedeGestionar && (
            <Boton onClick={() => setMostrarFormulario(!mostrarFormulario)}>
              {mostrarFormulario ? 'Cerrar formulario' : 'Nuevo Proyecto'}
            </Boton>
          )}
        </EncabezadoPagina>

        {mostrarFormulario && (
          <form onSubmit={enviar} className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5">
            {errorFormulario && <Mensaje tipo="error" titulo="No se pudo guardar" texto={errorFormulario} />}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <CampoTexto
                name="titulo"
                etiqueta="Título *"
                placeholder="Ej. Brucelosis bovina"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={guardando}
              />
              <CampoTexto
                name="codigo"
                etiqueta="Código (opcional)"
                placeholder="Ej. PROY-001"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                disabled={guardando}
              />
              <CampoTexto
                name="director"
                etiqueta="Director (opcional)"
                placeholder="Nombre del director"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                disabled={guardando}
              />
              <Selector
                name="estado"
                etiqueta="Estado"
                opciones={ESTADOS}
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoProyecto)}
                disabled={guardando}
              />
              <CampoTexto
                name="fechaInicio"
                type="date"
                etiqueta="Fecha de inicio (opcional)"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                disabled={guardando}
              />
              <CampoTexto
                name="descripcion"
                etiqueta="Descripción (opcional)"
                placeholder="Objetivo del proyecto"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={guardando}
              />
            </div>
            <div className="flex justify-end">
              <Boton type="submit" cargando={guardando}>
                Guardar Proyecto
              </Boton>
            </div>
          </form>
        )}

        {error && <Mensaje tipo="error" titulo="Error al cargar proyectos" texto={error} />}

        {cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Esqueleto className="h-44 rounded-xl" />
            <Esqueleto className="h-44 rounded-xl" />
          </div>
        ) : proyectos.length === 0 ? (
          <EstadoVacio
            titulo="No hay proyectos registrados"
            descripcion="No se han cargado líneas de investigación activas."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {proyectos.map((proyecto) => (
              <div key={proyecto.id} className="p-5 rounded-xl border border-gray-200 bg-white shadow-2xs">
                <div className="flex items-start justify-between">
                  <div>
                    {proyecto.codigo && (
                      <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-cit-petroleo/10 text-cit-petroleo border border-cit-petroleo/20">
                        {proyecto.codigo}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-gray-900 mt-2">{proyecto.titulo}</h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${COLOR_ESTADO[proyecto.estado]}`}
                  >
                    {proyecto.estado}
                  </span>
                </div>

                {proyecto.descripcion && (
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">{proyecto.descripcion}</p>
                )}

                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {proyecto.director ? (
                      <>
                        Director: <strong className="text-gray-900">{proyecto.director}</strong>
                      </>
                    ) : (
                      'Sin director asignado'
                    )}
                  </span>
                  {puedeGestionar && (
                    <span className="flex items-center gap-3">
                      {proyecto.estado !== 'Finalizado' && (
                        <button
                          type="button"
                          onClick={() => finalizar(proyecto.id)}
                          className="text-cit-petroleo font-bold hover:underline"
                        >
                          Finalizar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => borrar(proyecto.id)}
                        className="text-red-600 font-medium hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PlantillaPrincipal>
  )
}
