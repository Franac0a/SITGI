import { useEffect, useState, type ReactNode } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { EtiquetaSeccion } from '@/componentes/ui/EncabezadoPagina'
import { obtenerHistorial } from '@/servicios/movimientos'
import type { Item, Movimiento } from '@/tipos'
import { codigoDe } from './datosItem'

function Dato({ titulo, children, mono = false }: { titulo: string; children: ReactNode; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-bold text-gray-500 uppercase">{titulo}</dt>
      <dd className={`text-gray-900 ${mono ? 'font-mono' : ''}`}>{children}</dd>
    </div>
  )
}

interface PropsDetalleItem {
  item: Item
  alCerrar: () => void
}

// Ventana con los datos del ítem, su código QR y el historial de movimientos.
export function DetalleItem({ item, alCerrar }: PropsDetalleItem) {
  const [historial, setHistorial] = useState<Movimiento[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    obtenerHistorial(item.id)
      .then(setHistorial)
      .catch(() => setHistorial([]))
      .finally(() => setCargando(false))
  }, [item.id])

  const codigo = codigoDe(item)

  return (
    // Tocar el fondo oscuro cierra la ventana; tocar adentro no.
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={alCerrar}>
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-200 pb-4 mb-4">
          <div>
            <EtiquetaSeccion>Detalle del Elemento</EtiquetaSeccion>
            <h2 className="text-xl font-bold text-gray-900 mt-2">{item.nombre}</h2>
            <p className="text-xs font-mono text-gray-500 mt-1">{codigo}</p>
          </div>
          <button type="button" onClick={alCerrar} className="text-gray-400 hover:text-gray-700" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <QRCodeSVG value={codigo} size={84} level="M" />
          <div className="text-xs text-gray-600">
            <p className="font-bold text-gray-900 font-mono">{codigo}</p>
            <p>Escaneá el código para identificar el elemento.</p>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Dato titulo="Tipo / Categoría">{item.categoria}</Dato>
          <Dato titulo="Ubicación">{item.ubicacion || '—'}</Dato>
          <Dato titulo="Stock actual">
            {item.stock_actual} {item.unidad_medida}
          </Dato>
          <Dato titulo="Stock mínimo">{item.stock_minimo}</Dato>
          <Dato titulo="Número CAS" mono>
            {item.codigoCas || '—'}
          </Dato>
          <Dato titulo="Marca / Fabricante">{item.marca || '—'}</Dato>
          <Dato titulo="Número de Lote">{item.numeroLote || '—'}</Dato>
          <Dato titulo="Vencimiento">{item.fechaVencimiento || '—'}</Dato>
        </dl>

        {item.observaciones && (
          <p className="text-xs text-gray-600 mt-4">
            <strong>Observaciones:</strong> {item.observaciones}
          </p>
        )}

        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Historial de movimientos</h3>
          {cargando ? (
            <p className="text-xs text-gray-500">Cargando historial...</p>
          ) : historial.length === 0 ? (
            <p className="text-xs text-gray-500">Este ítem no tiene movimientos registrados.</p>
          ) : (
            <ul className="space-y-2">
              {historial.map((movimiento) => (
                <li
                  key={movimiento.id}
                  className="flex items-center justify-between text-xs border-b border-gray-100 pb-2"
                >
                  <span>
                    <span className="font-bold text-gray-900">{movimiento.tipo_movimiento}</span>{' '}
                    <span className="text-gray-600">
                      x{movimiento.cantidad} — {movimiento.responsable}
                    </span>
                  </span>
                  <span className="font-mono text-gray-400">{movimiento.fecha_movimiento}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
