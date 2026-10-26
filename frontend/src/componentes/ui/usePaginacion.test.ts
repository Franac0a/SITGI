import { describe, expect, it } from 'vitest'
import { paginar } from './usePaginacion'

// Lista de prueba: [1, 2, 3, ..., 45]
const numeros = Array.from({ length: 45 }, (_, i) => i + 1)

describe('paginar', () => {
  it('la primera página trae los primeros elementos', () => {
    const resultado = paginar(numeros, 1, 20)
    expect(resultado.elementos).toHaveLength(20)
    expect(resultado.elementos[0]).toBe(1)
    expect(resultado.totalPaginas).toBe(3)
  })

  it('la última página trae los que sobran', () => {
    expect(paginar(numeros, 3, 20).elementos).toEqual([41, 42, 43, 44, 45])
  })

  it('si la página ya no existe usa la última', () => {
    const resultado = paginar(numeros, 9, 20)
    expect(resultado.pagina).toBe(3)
    expect(resultado.elementos[0]).toBe(41)
  })

  it('una lista vacía tiene una sola página sin elementos', () => {
    expect(paginar([], 1, 20)).toEqual({ pagina: 1, totalPaginas: 1, elementos: [] })
  })
})
