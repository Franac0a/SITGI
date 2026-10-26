import { useNavigate } from 'react-router-dom'
import { PlantillaPrincipal } from '@/componentes/plantilla/PlantillaPrincipal'
import { EtiquetaSeccion } from '@/componentes/ui/EncabezadoPagina'
import { useAvisos } from '@/contexto/useAvisos'
import { crearItem } from '@/servicios/items'
import type { DatosItem } from '@/tipos'
import { FormularioItem } from './FormularioItem'

export default function PaginaNuevoItem() {
  const navigate = useNavigate()
  const { agregarAviso } = useAvisos()

  async function guardar(datos: DatosItem) {
    await crearItem(datos)

    const stockBajo = datos.stock_minimo !== undefined && datos.stock_actual <= datos.stock_minimo
    if (stockBajo) {
      agregarAviso(
        'Elemento registrado (Stock Bajo)',
        `Se agregó correctamente ${datos.nombre} al inventario científico. Aviso: La cantidad ingresada está en o por debajo del stock mínimo de alerta.`,
        'alerta',
      )
    } else {
      agregarAviso('Elemento registrado', `Se agregó correctamente ${datos.nombre} al inventario científico.`)
    }

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
            <span className="text-gray-900 font-semibold">Alta de Elemento</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <EtiquetaSeccion>Módulo de Inventario</EtiquetaSeccion>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Alta de Elemento Científico</h1>
              <p className="text-sm text-gray-600 mt-1">
                Complete los datos técnicos para registrar un nuevo reactivo, insumo, material o equipo en el CIT Formosa.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/inventario')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-cit-petroleo hover:border-cit-petroleo transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al listado
            </button>
          </div>
        </div>

        <FormularioItem alGuardar={guardar} alCancelar={() => navigate('/inventario')} />
      </div>
    </PlantillaPrincipal>
  )
}
