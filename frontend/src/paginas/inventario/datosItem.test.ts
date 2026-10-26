import { describe, expect, it } from 'vitest'
import type { Item } from '@/tipos'
import { codigoDe, estadoDeStock } from './datosItem'

// Ítem de prueba con valores comunes; cada test cambia solo lo que necesita.
function crearItem(datos: Partial<Item> = {}): Item {
  return {
    id: 7,
    nombre: 'Etanol 96%',
    codigo_identificacion: 'CIT-DRO-0007',
    categoria: 'Droguero',
    marca: null,
    stock_actual: 10,
    stock_minimo: 2,
    unidad_medida: 'L',
    ubicacion: 'Droguero',
    condicion_almacenamiento: null,
    detalles_tecnicos: {},
    ...datos,
  }
}

describe('estadoDeStock', () => {
  it('sin stock está agotado', () => {
    expect(estadoDeStock(crearItem({ stock_actual: 0 }))).toBe('agotado')
  })

  it('en el mínimo o por debajo está bajo', () => {
    expect(estadoDeStock(crearItem({ stock_actual: 2 }))).toBe('bajo')
    expect(estadoDeStock(crearItem({ stock_actual: 1 }))).toBe('bajo')
  })

  it('por encima del mínimo está disponible', () => {
    expect(estadoDeStock(crearItem({ stock_actual: 3 }))).toBe('disponible')
  })

  it('sin mínimo cargado nunca está bajo, solo agotado o disponible', () => {
    expect(estadoDeStock(crearItem({ stock_actual: 1, stock_minimo: 0 }))).toBe('disponible')
  })
})

describe('codigoDe', () => {
  it('usa el código cargado o arma uno con el id', () => {
    expect(codigoDe(crearItem())).toBe('CIT-DRO-0007')
    expect(codigoDe(crearItem({ codigo_identificacion: null }))).toBe('CIT-7')
  })
})
