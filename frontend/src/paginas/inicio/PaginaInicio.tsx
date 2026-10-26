import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlantillaPrincipal } from '@/componentes/plantilla/PlantillaPrincipal'
import { EncabezadoPagina } from '@/componentes/ui/EncabezadoPagina'
import { Esqueleto } from '@/componentes/ui/Esqueleto'
import { Mensaje } from '@/componentes/ui/Mensaje'
import { useSesion } from '@/contexto/useSesion'
import { obtenerResumen } from '@/servicios/reportes'
import type { Resumen } from '@/tipos'
import { mensajeDeError } from '@/utilidades/errores'

interface PropsTarjeta {
  titulo: string
  valor: number
  color?: string
  // Si se pasa, la tarjeta es un enlace a esa ruta.
  enlace?: string
}

function Tarjeta({ titulo, valor, color = 'text-cit-petroleo', enlace }: PropsTarjeta) {
  const contenido = (
    <>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{titulo}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{valor}</p>
    </>
  )

  if (enlace) {
    return (
      <Link
        to={enlace}
        className="block p-5 rounded-xl border border-gray-200 bg-white shadow-2xs hover:border-cit-petroleo transition-colors"
      >
        {contenido}
      </Link>
    )
  }
  return <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-2xs">{contenido}</div>
}

export default function PaginaInicio() {
  const { usuario } = useSesion()
  const [resumen, setResumen] = useState<Resumen | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    obtenerResumen()
      .then(setResumen)
      .catch((e) => setError(mensajeDeError(e)))
      .finally(() => setCargando(false))
  }, [])

  return (
    <PlantillaPrincipal>
      <div className="space-y-6">
        <EncabezadoPagina
          etiqueta="Panel de control"
          titulo={`Bienvenido/a, ${usuario?.nombre || 'Usuario'}`}
          descripcion={
            <>
              {usuario?.rol || 'Personal Científico'}
              {usuario?.dni ? ` · DNI: ${usuario.dni}` : ''}
            </>
          }
        />

        {error && <Mensaje tipo="error" titulo="Error al cargar el resumen" texto={error} />}

        {cargando && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Esqueleto key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        )}

        {resumen && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Tarjeta titulo="Ítems en inventario" valor={resumen.totalItems} />
              <Tarjeta titulo="Stock total" valor={resumen.totalStock} />
              {/* Lleva al inventario mostrando solo lo que hay que reponer (stock bajo o agotado). */}
              <Tarjeta
                titulo="Con stock bajo"
                valor={resumen.bajoStock}
                color="text-amber-600"
                enlace="/inventario?estado=reponer"
              />
              <Tarjeta titulo="Categorías" valor={resumen.porCategoria.length} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
                <h2 className="text-sm font-bold text-gray-900 mb-3">Ítems por categoría</h2>
                <ul className="space-y-2">
                  {resumen.porCategoria.map((fila) => (
                    <li key={fila.categoria} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{fila.categoria}</span>
                      <span className="font-bold text-cit-petroleo">{fila.cantidad}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
                <h2 className="text-sm font-bold text-gray-900 mb-3">Movimientos recientes</h2>
                {resumen.recientes.length === 0 ? (
                  <p className="text-xs text-gray-500">Sin movimientos registrados.</p>
                ) : (
                  <ul className="space-y-2">
                    {resumen.recientes.map((movimiento) => (
                      <li
                        key={movimiento.id}
                        className="flex items-center justify-between text-xs border-b border-gray-100 pb-2"
                      >
                        <span className="text-gray-900 font-semibold">
                          {movimiento.Item?.nombre || `Ítem #${movimiento.itemId}`}
                        </span>
                        <span className="text-gray-500">
                          {movimiento.tipo_movimiento} x{movimiento.cantidad}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </PlantillaPrincipal>
  )
}
