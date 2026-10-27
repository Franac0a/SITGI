import { describe, expect, it } from 'vitest'
import {
  puedeGestionarInventario,
  puedeGestionarProyectos,
  puedeGestionarUsuarios,
  puedeRegistrarMovimientos,
  puedeRegistrarMuestras,
  rutaInicial,
  tiposDeMovimientoPermitidos,
  TIPOS_MOVIMIENTO,
} from './permisos'

describe('permisos por rol', () => {
  it('Dirección, Administración e Inventario gestionan el inventario', () => {
    expect(puedeGestionarInventario('Dirección')).toBe(true)
    expect(puedeGestionarInventario('Administración')).toBe(true)
    expect(puedeGestionarInventario('Inventario')).toBe(true)
    expect(puedeGestionarInventario('Investigador')).toBe(false)
    expect(puedeGestionarInventario(undefined)).toBe(false)
  })

  it('gestión registra todos los tipos de movimiento', () => {
    expect(tiposDeMovimientoPermitidos('Inventario')).toEqual(TIPOS_MOVIMIENTO)
  })

  it('Investigador y Técnico/Becario solo registran egresos', () => {
    expect(tiposDeMovimientoPermitidos('Investigador')).toEqual(['Egreso'])
    expect(tiposDeMovimientoPermitidos('Técnico/Becario')).toEqual(['Egreso'])
  })

  it('Responsable de área no registra movimientos', () => {
    expect(tiposDeMovimientoPermitidos('Responsable de área')).toEqual([])
    expect(puedeRegistrarMovimientos('Responsable de área')).toBe(false)
  })

  it('solo Dirección gestiona usuarios; proyectos también Administración', () => {
    expect(puedeGestionarUsuarios('Dirección')).toBe(true)
    expect(puedeGestionarUsuarios('Administración')).toBe(false)
    expect(puedeGestionarProyectos('Administración')).toBe(true)
    expect(puedeGestionarProyectos('Inventario')).toBe(false)
  })

  it('registran muestras gestión, investigadores y técnicos; Responsable de área no', () => {
    expect(puedeRegistrarMuestras('Inventario')).toBe(true)
    expect(puedeRegistrarMuestras('Técnico/Becario')).toBe(true)
    expect(puedeRegistrarMuestras('Investigador')).toBe(true)
    expect(puedeRegistrarMuestras('Responsable de área')).toBe(false)
  })

  it('después del login Dirección va a usuarios y el resto al dashboard', () => {
    expect(rutaInicial('Dirección')).toBe('/admin/usuarios')
    expect(rutaInicial('Investigador')).toBe('/dashboard')
  })
})
