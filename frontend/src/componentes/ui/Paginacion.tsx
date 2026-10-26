import { Boton } from './Boton'

interface PropsPaginacion {
  pagina: number
  totalPaginas: number
  totalElementos: number
  porPagina: number
  alCambiar: (pagina: number) => void
}

// Barra de abajo de una tabla: cuántos elementos se ven y botones para cambiar de página.
export function Paginacion({ pagina, totalPaginas, totalElementos, porPagina, alCambiar }: PropsPaginacion) {
  const desde = (pagina - 1) * porPagina + 1
  const hasta = Math.min(pagina * porPagina, totalElementos)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
      <p>
        Mostrando <span className="font-bold text-gray-900">{desde}</span> a{' '}
        <span className="font-bold text-gray-900">{hasta}</span> de{' '}
        <span className="font-bold text-gray-900">{totalElementos}</span> elementos
      </p>

      <div className="flex items-center gap-3">
        <Boton
          variante="contorno"
          className="h-8 px-3 text-xs"
          onClick={() => alCambiar(pagina - 1)}
          disabled={pagina === 1}
        >
          Anterior
        </Boton>
        <span>
          Página <span className="font-bold text-gray-900">{pagina}</span> de {totalPaginas}
        </span>
        <Boton
          variante="contorno"
          className="h-8 px-3 text-xs"
          onClick={() => alCambiar(pagina + 1)}
          disabled={pagina === totalPaginas}
        >
          Siguiente
        </Boton>
      </div>
    </div>
  )
}
