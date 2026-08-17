import type { LoginFormValues, RegisterFormValues } from '@/types/auth.types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DNI_PATTERN = /^\d{7,8}$/

export function validateLoginForm(values: LoginFormValues) {
  const errors: Partial<Record<keyof LoginFormValues, string>> = {}

  if (!values.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio.'
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Ingrese un correo electrónico válido.'
  }

  if (!values.password) {
    errors.password = 'La contraseña es obligatoria.'
  }

  return errors
}

export function validateRegisterForm(values: RegisterFormValues) {
  const errors: Partial<Record<keyof RegisterFormValues, string>> = {}

  if (!values.dni.trim()) {
    errors.dni = 'El DNI es obligatorio.'
  } else if (!DNI_PATTERN.test(values.dni.trim())) {
    errors.dni = 'El DNI debe contener entre 7 y 8 dígitos.'
  }

  if (!values.nombre.trim()) {
    errors.nombre = 'El nombre completo es obligatorio.'
  } else if (values.nombre.trim().length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres.'
  }

  if (!values.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio.'
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Ingrese un correo electrónico válido.'
  }

  if (!values.password) {
    errors.password = 'La contraseña es obligatoria.'
  } else if (values.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Debe confirmar la contraseña.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden.'
  }

  if (!values.rol) {
    errors.rol = 'Debe seleccionar un rol institucional.'
  }

  return errors
}

export function hasValidationErrors<T extends object>(errors: Partial<T>) {
  return Object.keys(errors).length > 0
}
