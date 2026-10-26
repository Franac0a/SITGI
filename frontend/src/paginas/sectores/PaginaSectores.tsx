import { useEffect, useState, type FormEvent } from 'react'
import { PlantillaPrincipal } from '@/componentes/plantilla/PlantillaPrincipal'
import { Boton } from '@/componentes/ui/Boton'
import { CampoTexto } from '@/componentes/ui/CampoTexto'
import { EncabezadoPagina } from '@/componentes/ui/EncabezadoPagina'
import { CargandoTabla } from '@/componentes/ui/Esqueleto'
import { EstadoVacio } from '@/componentes/ui/EstadoVacio'
import { EtiquetaCategoria } from '@/componentes/ui/Insignia'
import { Mensaje } from '@/componentes/ui/Mensaje'
import { Selector } from '@/componentes/ui/Selector'
import { useSesion } from '@/contexto/useSesion'
import { crearSector, eliminarSector, obtenerSectores } from '@/servicios/sectores'
import type { Opcion, Sector } from '@/tipos'
import { mensajeDeError } from '@/utilidades/errores'
import { puedeGestionarInventario } from '@/utilidades/permisos'

const TIPOS_SECTOR: Opcion[] = [
  { valor: 'Laboratorio', texto: 'Laboratorio' },
  { valor: 'Heladera', texto: 'Heladera / Freezer' },
  { valor: 'Droguero', texto: 'Droguero' },
  { valor: 'Estante', texto: 'Estante' },
  { valor: 'Depósito', texto: 'Depósito' },
  { valor: 'Otro', texto: 'Otro' },
]

export default function PaginaSectores() {
  const { usuario } = useSesion()
  const puedeGestionar = puedeGestionarInventario(usuario?.rol)

  const [sectores, setSectores] = useState<Sector[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Formulario de nuevo sector
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorFormulario, setErrorFormulario] = useState('')
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState('Laboratorio')
  const [descripcion, setDescripcion] = useState('')

  async function cargarSectores() {
    setCargando(true)
    setError('')
    try {
      setSectores(await obtenerSectores())
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarSectores()
  }, [])

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErrorFormulario('')

    if (!nombre.trim()) {
      setErrorFormulario('El nombre del sector es obligatorio.')
      return
    }

    setGuardando(true)
    try {
      await crearSector({ nombre: nombre.trim(), tipo, descripcion: descripcion.trim() || undefined })
      setNombre('')
      setTipo('Laboratorio')
      setDescripcion('')
      setMostrarFormulario(false)
      await cargarSectores()
    } catch (e) {
      setErrorFormulario(mensajeDeError(e))
    } finally {
      setGuardando(false)
    }
  }

  async function borrar(id: number) {
    setError('')
    try {
      await eliminarSector(id)
      await cargarSectores()
    } catch (e) {
      setError(mensajeDeError(e))
    }
  }

  return (
    <PlantillaPrincipal>
      <div className="space-y-6">
        <EncabezadoPagina
          etiqueta="Ubicación"
          titulo="Ubicación y Sectores"
          descripcion="Laboratorios, heladeras, droguero, estantes y depósitos donde se almacenan los elementos."
        >
          {puedeGestionar && (
            <Boton onClick={() => setMostrarFormulario(!mostrarFormulario)}>
              {mostrarFormulario ? 'Cerrar formulario' : 'Nuevo Sector'}
            </Boton>
          )}
        </EncabezadoPagina>

        {mostrarFormulario && (
          <form onSubmit={enviar} className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5">
            {errorFormulario && <Mensaje tipo="error" titulo="No se pudo guardar" texto={errorFormulario} />}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <CampoTexto
                name="nombre"
                etiqueta="Nombre del sector *"
                placeholder="Ej. Droguero Estante A"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={guardando}
              />
              <Selector
                name="tipo"
                etiqueta="Tipo *"
                opciones={TIPOS_SECTOR}
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                disabled={guardando}
              />
              <CampoTexto
                name="descripcion"
                etiqueta="Descripción (opcional)"
                placeholder="Detalle de la ubicación"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={guardando}
              />
            </div>
            <div className="flex justify-end">
              <Boton type="submit" cargando={guardando}>
                Guardar Sector
              </Boton>
            </div>
          </form>
        )}

        {error && <Mensaje tipo="error" titulo="Error al cargar sectores" texto={error} />}

        {cargando ? (
          <CargandoTabla />
        ) : sectores.length === 0 ? (
          <EstadoVacio
            titulo="No hay sectores registrados"
            descripcion="Cargue los laboratorios, heladeras, droguero y estantes del CIT."
          />
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-5 py-3.5">Nombre</th>
                  <th className="px-5 py-3.5">Tipo</th>
                  <th className="px-5 py-3.5">Descripción</th>
                  {puedeGestionar && <th className="px-5 py-3.5 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {sectores.map((sector) => (
                  <tr key={sector.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4 font-bold">{sector.nombre}</td>
                    <td className="px-5 py-4">
                      <EtiquetaCategoria>{sector.tipo}</EtiquetaCategoria>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{sector.descripcion || '—'}</td>
                    {puedeGestionar && (
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => borrar(sector.id)}
                          className="text-red-600 font-medium hover:text-red-700 hover:underline"
                        >
                          Eliminar
                        </button>
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
