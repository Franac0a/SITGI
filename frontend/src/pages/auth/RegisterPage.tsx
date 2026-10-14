import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  IdCard,
  Lock,
  Mail,
  User,
} from 'lucide-react'
import { AuthLayout } from '@/components/layout/AuthLayout'
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
import { authService } from '@/services/auth/auth.service'
import { formatApiError } from '@/utils/errors'
import { registerSchema, type RegisterSchemaType } from '@/utils/validation'

export function RegisterPage() {
  const [apiError, setApiError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      dni: '',
      nombre: '',
      email: '',
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
      variant="glass"
      wide
      title="Registro de usuario"
      subtitle="Sistema Integral de Inventario, Stock y Trazabilidad Científica"
      footer={
        <p className="text-white/75 text-xs sm:text-sm">
          ¿Ya tiene una cuenta?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#4fc3c7] hover:text-white transition-colors underline-offset-4 hover:underline ml-1"
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
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-950/60 p-3.5 text-sm text-red-200 backdrop-blur-sm shadow-md"
            >
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-red-300 text-xs sm:text-sm">
                  No se pudo completar el registro
                </span>
                <span className="text-xs sm:text-sm text-red-200/90 leading-relaxed">
                  {apiError}
                </span>
              </div>
            </div>
          )}

          {successMessage && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-950/60 p-3.5 text-sm text-emerald-200 backdrop-blur-sm shadow-md"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-emerald-300 text-xs sm:text-sm">
                  Solicitud enviada con éxito
                </span>
                <span className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
                  {successMessage}
                </span>
              </div>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/90 text-sm font-medium">
                    DNI
                  </FormLabel>
                  <div className="relative">
                    <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2bb8c2] pointer-events-none z-10" />
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="12345678"
                        autoComplete="off"
                        className="login-input h-11 w-full pl-10 pr-4 py-2 text-sm"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-red-300 font-medium text-xs mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/90 text-sm font-medium">
                    Nombre completo
                  </FormLabel>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2bb8c2] pointer-events-none z-10" />
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Apellido y nombre"
                        autoComplete="name"
                        className="login-input h-11 w-full pl-10 pr-4 py-2 text-sm"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-red-300 font-medium text-xs mt-1" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/90 text-sm font-medium">
                  Correo electrónico institucional
                </FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2bb8c2] pointer-events-none z-10" />
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="usuario@citformosa.gob.ar"
                      autoComplete="email"
                      className="login-input h-11 w-full pl-10 pr-4 py-2 text-sm"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-red-300 font-medium text-xs mt-1" />
              </FormItem>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/90 text-sm font-medium">
                    Contraseña
                  </FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2bb8c2] pointer-events-none z-10" />
                    <FormControl>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                        className="login-input h-11 w-full pl-10 pr-11 py-2 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2bb8c2] hover:text-[#4fc3c7] transition-colors p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2bb8c2] cursor-pointer"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <FormMessage className="text-red-300 font-medium text-xs mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/90 text-sm font-medium">
                    Confirmar contraseña
                  </FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2bb8c2] pointer-events-none z-10" />
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repita la contraseña"
                        autoComplete="new-password"
                        className="login-input h-11 w-full pl-10 pr-11 py-2 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2bb8c2] hover:text-[#4fc3c7] transition-colors p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2bb8c2] cursor-pointer"
                      aria-label={
                        showConfirmPassword
                          ? 'Ocultar contraseña'
                          : 'Ver contraseña'
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <FormMessage className="text-red-300 font-medium text-xs mt-1" />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            className="h-11 sm:h-12 rounded-xl bg-[#2bb8c2] hover:bg-[#239da6] active:bg-[#1b8189] text-white font-semibold text-sm sm:text-base shadow-lg shadow-[#2bb8c2]/25 hover:shadow-[#2bb8c2]/40 transition-all duration-200 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? 'Enviando solicitud...' : 'Registrarse'}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  )
}

