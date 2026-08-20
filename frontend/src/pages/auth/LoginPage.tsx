import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context'
import { formatApiError } from '@/utils/errors'
import { loginSchema, type LoginSchemaType } from '@/utils/validation'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginSchemaType) => {
    setIsLoading(true)
    setApiError(null)

    try {
      const user = await login({
        email: values.email.trim(),
        password: values.password,
      })

      const role = user.rol.toLowerCase()
      if (
        role === 'dirección' ||
        role === 'direccion' ||
        role === 'administración' ||
        role === 'administracion' ||
        role === 'administrador general' ||
        role === 'admin'
      ) {
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
      subtitle="Sistema Integral de Inventario, Stock y Trazabilidad Científica"
      footer={
        <p className="text-gray-600">
          ¿No tiene una cuenta?{' '}
          <Link
            to="/registro"
            className="font-semibold text-cit-petroleo hover:text-cit-azul-fuerte hover:underline"
          >
            Registrarse
          </Link>
        </p>
      }
    >
      <Form {...form}>
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          {apiError && (
            <Alert
              variant="error"
              title="No se pudo iniciar sesión"
              message={apiError}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico institucional</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="usuario@citformosa.gob.ar"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Ingrese su contraseña"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            className="bg-cit-petroleo hover:bg-cit-azul-fuerte text-white font-semibold shadow-md transition-colors"
          >
            Ingresar
          </Button>
        </form>
      </Form>
    </AuthLayout>
  )
}
