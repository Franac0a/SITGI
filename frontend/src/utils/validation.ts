import { z } from 'zod'
import type { LoginFormValues, RegisterFormValues } from '@/types/auth.types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DNI_PATTERN = /^\d{7,8}$/

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'El correo electrónico es obligatorio.' })
    .regex(EMAIL_PATTERN, { message: 'Ingrese un correo electrónico válido.' }),
  password: z
    .string()
    .min(1, { message: 'La contraseña es obligatoria.' }),
})

export type LoginSchemaType = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    dni: z
      .string()
      .trim()
      .min(1, { message: 'El DNI es obligatorio.' })
      .regex(DNI_PATTERN, { message: 'El DNI debe contener entre 7 y 8 dígitos.' }),
    nombre: z
      .string()
      .trim()
      .min(1, { message: 'El nombre completo es obligatorio.' })
      .min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
    email: z
      .string()
      .trim()
      .min(1, { message: 'El correo electrónico es obligatorio.' })
      .regex(EMAIL_PATTERN, { message: 'Ingrese un correo electrónico válido.' }),
    rol: z
      .string()
      .min(1, { message: 'Debe seleccionar un rol institucional.' }),
    password: z
      .string()
      .min(1, { message: 'La contraseña es obligatoria.' })
      .min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Debe confirmar la contraseña.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

export type RegisterSchemaType = z.infer<typeof registerSchema>

export const inventoryItemSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, { message: 'El nombre del elemento es requerido.' }),
  tipo: z
    .enum(['reactivo', 'insumo', 'material', 'equipo'], {
      message: 'Debe seleccionar un tipo de elemento.',
    }),
  codigoCas: z
    .string()
    .trim()
    .min(1, { message: 'El número CAS es obligatorio.' })
    .regex(/^\d+$/, { message: 'El número CAS solo debe contener números.' }),
  marca: z.string().optional(),
  numeroLote: z.string().optional(),
  cantidadInicial: z
    .string()
    .trim()
    .min(1, { message: 'La cantidad inicial es requerida.' })
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Ingrese una cantidad válida mayor o igual a 0.',
    }),
  unidadMedida: z
    .string()
    .trim()
    .min(1, { message: 'Debe especificar la unidad de medida.' }),
  stockMinimo: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: 'El stock mínimo no puede ser negativo.',
    }),
  laboratorioUbicacion: z
    .string()
    .trim()
    .min(1, { message: 'Debe especificar el laboratorio o ubicación física.' }),
  fechaVencimiento: z.string().optional(),
  observaciones: z.string().optional(),
})

export type InventoryItemSchemaType = z.infer<typeof inventoryItemSchema>

export function validateLoginForm(values: LoginFormValues) {
  const result = loginSchema.safeParse(values)
  if (result.success) return {}
  const errors: Partial<Record<keyof LoginFormValues, string>> = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof LoginFormValues
    if (field && !errors[field]) {
      errors[field] = issue.message
    }
  }
  return errors
}

export function validateRegisterForm(values: RegisterFormValues) {
  const result = registerSchema.safeParse(values)
  if (result.success) return {}
  const errors: Partial<Record<keyof RegisterFormValues, string>> = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof RegisterFormValues
    if (field && !errors[field]) {
      errors[field] = issue.message
    }
  }
  return errors
}

export function hasValidationErrors<T extends object>(errors: Partial<T>) {
  return Object.keys(errors).length > 0
}
