import { describe, expect, it } from 'vitest'
import { fechaDeHoy, formatearFecha } from './fechas'

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

describe('fechaDeHoy', () => {
  it('devuelve el día de hoy en formato AAAA-MM-DD', () => {
    const hoy = new Date()
    expect(fechaDeHoy()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(formatearFecha(fechaDeHoy())).toBe(hoy.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }))
  })
})
