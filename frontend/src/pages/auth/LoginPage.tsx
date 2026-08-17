import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/context'
import type { LoginFormErrors, LoginFormValues } from '@/types/auth.types'
import { formatApiError } from '@/utils/errors'
import { hasValidationErrors, validateLoginForm } from '@/utils/validation'

const initialValues: LoginFormValues = {
  email: '',
  password: '',
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [values, setValues] = useState<LoginFormValues>(initialValues)
  const [fieldErrors, setFieldErrors] = useState<LoginFormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field: keyof LoginFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setApiError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationErrors = validateLoginForm(values)
    setFieldErrors(validationErrors)

    if (hasValidationErrors(validationErrors)) {
      return
    }

    setIsLoading(true)
    setApiError(null)

    try {
      const user = await login({
        email: values.email.trim(),
        password: values.password,
      })

      if (user.rol === 'Dirección') {
        navigate('/admin/usuarios')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      setApiError(formatApiError(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Acceda al sistema de inventario, stock y trazabilidad científica."
      footer={
        <p className="text-gray-600">
          ¿No tiene una cuenta?{' '}
          <Link
            to="/registro"
            className="font-semibold text-bordo-600 hover:text-bordo-700"
          >
            Registrarse
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {apiError && (
          <Alert
            variant="error"
            title="No se pudo iniciar sesión"
            message={apiError}
          />
        )}

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

        <Input
          name="password"
          type="password"
          label="Contraseña"
          placeholder="Ingrese su contraseña"
          autoComplete="current-password"
          value={values.password}
          onChange={(event) => handleChange('password', event.target.value)}
          error={fieldErrors.password}
        />

        <Button type="submit" fullWidth isLoading={isLoading}>
          Ingresar
        </Button>
      </form>
    </AuthLayout>
  )
}
