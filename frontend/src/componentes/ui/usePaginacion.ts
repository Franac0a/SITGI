import { useState } from 'react'

// Divide una lista en páginas. Se usa junto con el componente <Paginacion />.
export function usePaginacion<T>(lista: T[], porPagina = 20) {
  const [pagina, setPagina] = useState(1)

  const totalPaginas = Math.max(1, Math.ceil(lista.length / porPagina))
  // Si la lista se achica (por un filtro o un borrado) y la página ya no existe, se usa la última.
  const paginaActual = Math.min(pagina, totalPaginas)
  const inicio = (paginaActual - 1) * porPagina

  return {
    pagina: paginaActual,
    totalPaginas,
    porPagina,
    // Solo los elementos de la página actual.
    elementos: lista.slice(inicio, inicio + porPagina),
    cambiarPagina(numero: number) {
      setPagina(numero)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    // Se llama cuando cambia una búsqueda o un filtro.
    volverAlInicio() {
      setPagina(1)
    },
  }
}
