import { describe, expect, it } from 'vitest'
import { validarCambioPassword, validarLogin, validarRegistro, type DatosRegistro } from './validaciones'

describe('validarLogin', () => {
  it('pide email y contraseña', () => {
    expect(validarLogin({ email: '', password: '' })).toEqual({
      email: 'El correo electrónico es obligatorio.',
      password: 'La contraseña es obligatoria.',
    })
  })

  it('rechaza un email mal escrito', () => {
    expect(validarLogin({ email: 'usuario@cit', password: 'x' }).email).toBe('Ingrese un correo electrónico válido.')
  })

  it('sin errores devuelve un objeto vacío', () => {
    expect(validarLogin({ email: ' usuario@cit.gob.ar ', password: 'x' })).toEqual({})
  })
})

describe('validarRegistro', () => {
  const valido: DatosRegistro = {
    dni: '30111222',
    nombre: 'Ana Pérez',
    email: 'ana@cit.gob.ar',
    password: 'Clave1234',
    confirmarPassword: 'Clave1234',
  }

  it('con todos los datos bien no hay errores', () => {
    expect(validarRegistro(valido)).toEqual({})
  })

  it('el DNI tiene que tener 7 u 8 dígitos', () => {
    expect(validarRegistro({ ...valido, dni: '123' }).dni).toBe('El DNI debe contener entre 7 y 8 dígitos.')
    expect(validarRegistro({ ...valido, dni: '1234567' }).dni).toBeUndefined()
  })

  it('el nombre necesita al menos 3 letras y la contraseña 8 caracteres', () => {
    const errores = validarRegistro({ ...valido, nombre: 'Al', password: 'corta', confirmarPassword: 'corta' })
    expect(errores.nombre).toBe('El nombre debe tener al menos 3 caracteres.')
    expect(errores.password).toBe('La contraseña debe tener al menos 8 caracteres.')
  })

  it('avisa si las contraseñas no coinciden', () => {
    expect(validarRegistro({ ...valido, confirmarPassword: 'Otra1234' }).confirmarPassword).toBe(
      'Las contraseñas no coinciden.',
    )
  })

  it('no compara las contraseñas mientras haya otros errores', () => {
    const errores = validarRegistro({ ...valido, dni: '', confirmarPassword: 'Otra1234' })
    expect(errores.dni).toBe('El DNI es obligatorio.')
    expect(errores.confirmarPassword).toBeUndefined()
  })
})

describe('validarCambioPassword', () => {
  const valido = { actual: 'Vieja1234', nueva: 'Nueva1234', confirmarNueva: 'Nueva1234' }

  it('con todo bien no hay errores', () => {
    expect(validarCambioPassword(valido)).toEqual({})
  })

  it('pide los tres campos y una nueva de 8 caracteres o más', () => {
    expect(validarCambioPassword({ actual: '', nueva: 'corta', confirmarNueva: '' })).toEqual({
      actual: 'Ingresá tu contraseña actual.',
      nueva: 'La contraseña debe tener al menos 8 caracteres.',
      confirmarNueva: 'Confirmá la contraseña nueva.',
    })
  })

  it('avisa si la confirmación no coincide', () => {
    expect(validarCambioPassword({ ...valido, confirmarNueva: 'Otra12345' }).confirmarNueva).toBe(
      'Las contraseñas no coinciden.',
    )
  })

  it('no deja poner la misma contraseña que ya tenía', () => {
    expect(validarCambioPassword({ actual: 'Igual1234', nueva: 'Igual1234', confirmarNueva: 'Igual1234' }).nueva).toBe(
      'La contraseña nueva tiene que ser distinta de la actual.',
    )
  })
})
