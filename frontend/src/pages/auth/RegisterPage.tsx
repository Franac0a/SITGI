import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { INSTITUTIONAL_ROLES } from '@/constants/roles'
import { authService } from '@/services/auth/auth.service'
import type {
  InstitutionalRole,
  RegisterFormErrors,
  RegisterFormValues,
} from '@/types/auth.types'
import { formatApiError } from '@/utils/errors'
import { hasValidationErrors, validateRegisterForm } from '@/utils/validation'

const initialValues: RegisterFormValues = {
  dni: '',
  nombre: '',
  email: '',
  password: '',
  confirmPassword: '',
  rol: '',
}

export function RegisterPage() {
  const [values, setValues] = useState<RegisterFormValues>(initialValues)
  const [fieldErrors, setFieldErrors] = useState<RegisterFormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = <K extends keyof RegisterFormValues>(
    field: K,
    value: RegisterFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setApiError(null)
    setSuccessMessage(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationErrors = validateRegisterForm(values)
    setFieldErrors(validationErrors)

    if (hasValidationErrors(validationErrors)) {
      return
    }

    setIsLoading(true)
    setApiError(null)
    setSuccessMessage(null)

    try {
      await authService.register({
        dni: values.dni.trim(),
        nombre: values.nombre.trim(),
        email: values.email.trim(),
        password: values.password,
        rol: values.rol as InstitutionalRole,
      })

      setSuccessMessage(
        'Su solicitud de registro fue enviada correctamente. Un administrador revisará su cuenta.',
      )
      setValues(initialValues)
    } catch (error) {
      setApiError(formatApiError(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      wide
      title="Registro de usuario"
      subtitle="Complete el formulario para solicitar acceso al sistema institucional."
      footer={
        <p className="text-gray-600">
          ¿Ya tiene una cuenta?{' '}
          <Link
            to="/login"
            className="font-semibold text-bordo-600 hover:text-bordo-700"
          >
            Iniciar sesión
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {apiError && (
          <Alert
            variant="error"
            title="No se pudo completar el registro"
            message={apiError}
          />
        )}

        {successMessage && (
          <Alert variant="success" message={successMessage} />
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            name="dni"
            type="text"
            inputMode="numeric"
            label="DNI"
            placeholder="12345678"
            autoComplete="off"
            value={values.dni}
            onChange={(event) => handleChange('dni', event.target.value)}
            error={fieldErrors.dni}
          />

          <Input
            name="nombre"
            type="text"
            label="Nombre completo"
            placeholder="Apellido y nombre"
            autoComplete="name"
            value={values.nombre}
            onChange={(event) => handleChange('nombre', event.target.value)}
            error={fieldErrors.nombre}
          />
        </div>

        <Input
          name="email"
          type="email"
          label="Correo electrónico"
          placeholder="usuario@citformosa.gob.ar"
          autoComplete="email"
          value={values.email}
          onChange={(event) => handleChange('email', event.target.value)}
          error={fieldErrors.email}
        />

        <Select
          name="rol"
          label="Rol institucional"
          placeholder="Seleccione un rol"
          options={INSTITUTIONAL_ROLES}
          value={values.rol}
          onChange={(event) =>
            handleChange('rol', event.target.value as RegisterFormValues['rol'])
          }
          error={fieldErrors.rol}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            name="password"
            type="password"
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => handleChange('password', event.target.value)}
            error={fieldErrors.password}
          />

          <Input
            name="confirmPassword"
            type="password"
            label="Confirmar contraseña"
            placeholder="Repita la contraseña"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(event) =>
              handleChange('confirmPassword', event.target.value)
            }
            error={fieldErrors.confirmPassword}
          />
        </div>

        <Button type="submit" fullWidth isLoading={isLoading}>
          Solicitar acceso
        </Button>
      </form>
    </AuthLayout>
  )
}
