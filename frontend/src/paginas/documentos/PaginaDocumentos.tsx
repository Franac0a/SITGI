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
import { eliminarDocumento, obtenerDocumentos, subirDocumento, urlDeDescarga } from '@/servicios/documentos'
import type { CategoriaDocumento, Documento, Opcion } from '@/tipos'
import { mensajeDeError } from '@/utilidades/errores'
import { puedeGestionarInventario } from '@/utilidades/permisos'

const CATEGORIAS: Opcion[] = [
  { valor: 'MSDS', texto: 'MSDS (Hoja de seguridad)' },
  { valor: 'SOP', texto: 'SOP (Protocolo operativo)' },
  { valor: 'COA', texto: 'COA (Certificado de análisis)' },
  { valor: 'Protocolo', texto: 'Protocolo' },
  { valor: 'Otro', texto: 'Otro' },
]

// Pasa un tamaño en bytes a un texto como "1.5 MB".
function formatearTamano(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function PaginaDocumentos() {
  const { usuario } = useSesion()
  const puedeGestionar = puedeGestionarInventario(usuario?.rol)

  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Formulario para subir un documento
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorFormulario, setErrorFormulario] = useState('')
  const [exitoFormulario, setExitoFormulario] = useState('')
  const [titulo, setTitulo] = useState('')
  const [categoria, setCategoria] = useState<CategoriaDocumento>('MSDS')
  const [codigo, setCodigo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)

  async function cargarDocumentos() {
    setCargando(true)
    setError('')
    try {
      setDocumentos(await obtenerDocumentos())
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDocumentos()
  }, [])

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErrorFormulario('')
    setExitoFormulario('')

    if (!titulo.trim()) {
      setErrorFormulario('El título es obligatorio.')
      return
    }

    setGuardando(true)
    try {
      await subirDocumento({
        titulo: titulo.trim(),
        categoria,
        codigo: codigo.trim() || undefined,
        descripcion: descripcion.trim() || undefined,
        archivo: archivo ?? undefined,
      })
      setExitoFormulario('Documento cargado con éxito.')
      setTitulo('')
      setCodigo('')
      setDescripcion('')
      setArchivo(null)
      setMostrarFormulario(false)
      await cargarDocumentos()
    } catch (e) {
      setErrorFormulario(mensajeDeError(e))
    } finally {
      setGuardando(false)
    }
  }

  async function borrar(id: number) {
    if (!window.confirm('¿Eliminar este documento?')) return
    setError('')
    try {
      await eliminarDocumento(id)
      await cargarDocumentos()
    } catch (e) {
      setError(mensajeDeError(e))
    }
  }

  return (
    <PlantillaPrincipal>
      <div className="space-y-6">
        <EncabezadoPagina
          etiqueta="Control Documental"
          titulo="Documentos Asociados"
          descripcion="Repositorio de hojas de seguridad (MSDS), protocolos (SOP), certificados (COA) y remitos."
        >
          {puedeGestionar && (
            <Boton onClick={() => setMostrarFormulario(!mostrarFormulario)}>
              {mostrarFormulario ? 'Cerrar formulario' : 'Subir Documento'}
            </Boton>
          )}
        </EncabezadoPagina>

        {puedeGestionar && mostrarFormulario && (
          <form onSubmit={enviar} className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5">
            {errorFormulario && <Mensaje tipo="error" titulo="No se pudo cargar" texto={errorFormulario} />}
            {exitoFormulario && <Mensaje tipo="exito" texto={exitoFormulario} />}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <CampoTexto
                  name="titulo"
                  etiqueta="Título *"
                  placeholder="Ej. Hoja de seguridad Ácido Clorhídrico"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  disabled={guardando}
                />
              </div>
              <Selector
                name="categoria"
                etiqueta="Categoría *"
                opciones={CATEGORIAS}
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaDocumento)}
                disabled={guardando}
              />
              <CampoTexto
                name="codigo"
                etiqueta="Código (opcional)"
                placeholder="Ej. MSDS-001"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                disabled={guardando}
              />
              <CampoTexto
                name="descripcion"
                etiqueta="Descripción (opcional)"
                placeholder="Detalle del documento"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={guardando}
              />
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">Archivo (opcional)</label>
                <input
                  type="file"
                  onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                  disabled={guardando}
                  className="w-full text-sm text-gray-700 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-cit-petroleo/10 file:text-cit-petroleo file:font-semibold hover:file:bg-cit-petroleo/20"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Boton type="submit" cargando={guardando}>
                Cargar Documento
              </Boton>
            </div>
          </form>
        )}

        {error && <Mensaje tipo="error" titulo="Error al cargar documentos" texto={error} />}

        {cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Esqueleto className="h-40 rounded-xl" />
            <Esqueleto className="h-40 rounded-xl" />
            <Esqueleto className="h-40 rounded-xl" />
          </div>
        ) : documentos.length === 0 ? (
          <EstadoVacio
            titulo="No hay documentos"
            descripcion="El repositorio documental está vacío. Cargue hojas de seguridad, protocolos o certificados."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentos.map((documento) => (
              <div
                key={documento.id}
                className="p-5 rounded-xl border border-gray-200 bg-white flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cit-petroleo/10 text-cit-petroleo border border-cit-petroleo/20 uppercase">
                    {documento.categoria}
                  </span>
                  <h3 className="font-bold text-gray-900 text-base mt-2">{documento.titulo}</h3>
                  {documento.codigo && <p className="text-xs font-mono text-gray-400 mt-0.5">{documento.codigo}</p>}
                  {documento.descripcion && <p className="text-xs text-gray-600 mt-1">{documento.descripcion}</p>}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                  <span className="font-mono text-gray-500">
                    {documento.nombre_archivo ? formatearTamano(documento.tamano) : 'Sin archivo'}
                  </span>
                  <div className="flex items-center gap-3">
                    {documento.nombre_archivo && (
                      <a
                        href={urlDeDescarga(documento.id)}
                        className="text-cit-petroleo font-bold hover:text-cit-azul-fuerte hover:underline"
                      >
                        Descargar
                      </a>
                    )}
                    {puedeGestionar && (
                      <button
                        type="button"
                        onClick={() => borrar(documento.id)}
                        className="text-red-600 font-medium hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PlantillaPrincipal>
  )
}
