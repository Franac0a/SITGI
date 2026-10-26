import { useState } from 'react'

// Calcula qué parte de la lista corresponde a una página.
// Si la página pedida ya no existe (por ejemplo, después de filtrar o borrar), usa la última.
export function paginar<T>(lista: T[], pagina: number, porPagina: number) {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / porPagina))
  const paginaActual = Math.min(pagina, totalPaginas)
  const inicio = (paginaActual - 1) * porPagina
  return {
    pagina: paginaActual,
    totalPaginas,
    elementos: lista.slice(inicio, inicio + porPagina),
  }
}

// Divide una lista en páginas. Se usa junto con el componente <Paginacion />.
export function usePaginacion<T>(lista: T[], porPagina = 20) {
  const [pagina, setPagina] = useState(1)

  return {
    ...paginar(lista, pagina, porPagina),
    porPagina,
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
