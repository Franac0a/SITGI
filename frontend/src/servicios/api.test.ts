import { describe, expect, it } from 'vitest'
import { armarConsulta } from './api'

describe('armarConsulta', () => {
  it('arma la consulta con los filtros que tienen valor', () => {
    expect(armarConsulta({ tipo: 'Egreso', sector: 'Lab 2' })).toBe('?tipo=Egreso&sector=Lab+2')
  })

  it('saltea los filtros vacíos', () => {
    expect(armarConsulta({ tipo: '', sector: undefined, desde: '2026-10-01' })).toBe('?desde=2026-10-01')
  })

  it('sin filtros devuelve un texto vacío', () => {
    expect(armarConsulta({})).toBe('')
  })
})
