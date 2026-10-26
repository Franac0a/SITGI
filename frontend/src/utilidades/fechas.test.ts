import { describe, expect, it } from 'vitest'
import { formatearFecha } from './fechas'

describe('formatearFecha', () => {
  it('pasa AAAA-MM-DD a DD/MM/AAAA', () => {
    expect(formatearFecha('2026-10-25')).toBe('25/10/2026')
  })

  it('no corre el día por la zona horaria', () => {
    // Con new Date('2026-01-01') en Argentina se vería 31/12/2025.
    expect(formatearFecha('2026-01-01')).toBe('01/01/2026')
  })

  it('sin fecha muestra un guion', () => {
    expect(formatearFecha(null)).toBe('—')
    expect(formatearFecha(undefined)).toBe('—')
    expect(formatearFecha('')).toBe('—')
  })

  it('un texto con otro formato se muestra tal cual', () => {
    expect(formatearFecha('marzo 2026')).toBe('marzo 2026')
  })
})
