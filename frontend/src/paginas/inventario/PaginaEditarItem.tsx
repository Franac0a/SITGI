import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PlantillaPrincipal } from '@/componentes/plantilla/PlantillaPrincipal'
import { Esqueleto } from '@/componentes/ui/Esqueleto'
import { Mensaje } from '@/componentes/ui/Mensaje'
import { useAvisos } from '@/contexto/useAvisos'
import { actualizarItem, obtenerItem } from '@/servicios/items'
import type { DatosItem, Item } from '@/tipos'
import { mensajeDeError } from '@/utilidades/errores'
import { FormularioItem } from './FormularioItem'

export default function PaginaEditarItem() {
  // El id viene de la URL: /inventario/editar/:id
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { agregarAviso } = useAvisos()

  const [item, setItem] = useState<Item | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    obtenerItem(id)
      .then(setItem)
      .catch((e) => setError(mensajeDeError(e)))
      .finally(() => setCargando(false))
  }, [id])

  async function guardar(datos: DatosItem) {
    await actualizarItem(id, datos)
    agregarAviso('Elemento actualizado', `Se actualizó "${datos.nombre}" en el inventario.`)
    navigate('/inventario')
  }

  return (
    <PlantillaPrincipal>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div className="border-b border-gray-200 pb-5">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <button
              type="button"
              onClick={() => navigate('/inventario')}
              className="hover:text-cit-petroleo hover:underline transition-colors"
            >
              Inventario Científico
            </button>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Editar Elemento</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Editar Elemento Científico</h1>
          <p className="text-sm text-gray-600 mt-1">Actualice los datos técnicos del elemento seleccionado.</p>
        </div>

        {cargando && (
          <div className="space-y-3">
            <Esqueleto className="h-24 w-full rounded-xl" />
            <Esqueleto className="h-40 w-full rounded-xl" />
          </div>
        )}

        {error && <Mensaje tipo="error" titulo="No se pudo cargar el ítem" texto={error} />}

        {item && <FormularioItem item={item} alGuardar={guardar} alCancelar={() => navigate('/inventario')} />}
      </div>
    </PlantillaPrincipal>
  )
}
