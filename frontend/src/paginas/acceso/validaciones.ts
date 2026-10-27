// Validaciones de los formularios de login, registro y cambio de contraseña.
// Cada función devuelve un objeto con un mensaje por cada campo que tiene un error.

const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PATRON_DNI = /^\d{7,8}$/

export type Errores = Record<string, string>

function validarEmail(email: string): string | undefined {
  if (!email.trim()) return 'El correo electrónico es obligatorio.'
  if (!PATRON_EMAIL.test(email.trim())) return 'Ingrese un correo electrónico válido.'
}

export function validarLogin(datos: { email: string; password: string }): Errores {
  const errores: Errores = {}

  const errorEmail = validarEmail(datos.email)
  if (errorEmail) errores.email = errorEmail

  if (!datos.password) errores.password = 'La contraseña es obligatoria.'

  return errores
}

export interface DatosRegistro {
  dni: string
  nombre: string
  email: string
  password: string
  confirmarPassword: string
}

export function validarRegistro(datos: DatosRegistro): Errores {
  const errores: Errores = {}

  if (!datos.dni.trim()) {
    errores.dni = 'El DNI es obligatorio.'
  } else if (!PATRON_DNI.test(datos.dni.trim())) {
    errores.dni = 'El DNI debe contener entre 7 y 8 dígitos.'
  }

  if (!datos.nombre.trim()) {
    errores.nombre = 'El nombre completo es obligatorio.'
  } else if (datos.nombre.trim().length < 3) {
    errores.nombre = 'El nombre debe tener al menos 3 caracteres.'
  }

  const errorEmail = validarEmail(datos.email)
  if (errorEmail) errores.email = errorEmail

  if (!datos.password) {
    errores.password = 'La contraseña es obligatoria.'
  } else if (datos.password.length < 8) {
    errores.password = 'La contraseña debe tener al menos 8 caracteres.'
  }

  if (!datos.confirmarPassword) {
    errores.confirmarPassword = 'Debe confirmar la contraseña.'
  }

  // Que coincidan se revisa al final, cuando el resto de los campos ya está bien.
  if (Object.keys(errores).length === 0 && datos.password !== datos.confirmarPassword) {
    errores.confirmarPassword = 'Las contraseñas no coinciden.'
  }

  return errores
}

export interface DatosCambioPassword {
  actual: string
  nueva: string
  confirmarNueva: string
}

export function validarCambioPassword(datos: DatosCambioPassword): Errores {
  const errores: Errores = {}

  if (!datos.actual) errores.actual = 'Ingresá tu contraseña actual.'

  if (!datos.nueva) {
    errores.nueva = 'La contraseña nueva es obligatoria.'
  } else if (datos.nueva.length < 8) {
    errores.nueva = 'La contraseña debe tener al menos 8 caracteres.'
  }

  if (!datos.confirmarNueva) errores.confirmarNueva = 'Confirmá la contraseña nueva.'

  // Estas dos se revisan al final, cuando los campos ya están completos.
  if (Object.keys(errores).length === 0) {
    if (datos.nueva !== datos.confirmarNueva) {
      errores.confirmarNueva = 'Las contraseñas no coinciden.'
    } else if (datos.nueva === datos.actual) {
      errores.nueva = 'La contraseña nueva tiene que ser distinta de la actual.'
    }
  }

  return errores
}
