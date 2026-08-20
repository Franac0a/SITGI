import { useState } from 'react'
import { Link } from 'react-router-dom'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { INSTITUTIONAL_ROLES } from '@/constants/roles'
import { authService } from '@/services/auth/auth.service'
import type { InstitutionalRole } from '@/types/auth.types'
import { formatApiError } from '@/utils/errors'
import { registerSchema, type RegisterSchemaType } from '@/utils/validation'

export function RegisterPage() {
  const [apiError, setApiError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      dni: '',
      nombre: '',
      email: '',
      rol: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: RegisterSchemaType) => {
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
        'Su solicitud de registro fue enviada correctamente. Un administrador revisará su cuenta institucional para su posterior habilitación.'
      )
      form.reset()
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
      subtitle="Sistema Integral de Inventario, Stock y Trazabilidad Científica"
      footer={
        <p className="text-gray-600">
          ¿Ya tiene una cuenta?{' '}
          <Link
            to="/login"
            className="font-semibold text-cit-petroleo hover:text-cit-azul-fuerte hover:underline"
          >
            Iniciar sesión
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
              title="No se pudo completar el registro"
              message={apiError}
            />
          )}

          {successMessage && (
            <Alert variant="success" message={successMessage} />
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DNI</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="12345678"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Apellido y nombre"
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
            name="rol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol institucional</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un rol institucional" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INSTITUTIONAL_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Repita la contraseña"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            className="bg-cit-petroleo hover:bg-cit-azul-fuerte text-white font-semibold shadow-md transition-colors"
          >
            Registrarse
          </Button>
        </form>
      </Form>
    </AuthLayout>
  )
}
