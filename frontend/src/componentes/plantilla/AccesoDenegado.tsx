import { useNavigate } from 'react-router-dom'
import { Boton } from '@/componentes/ui/Boton'
import { EtiquetaSeccion } from '@/componentes/ui/EncabezadoPagina'

export function AccesoDenegado() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl p-8 shadow-xs text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-cit-petroleo/10 border border-cit-petroleo/20 flex items-center justify-center text-cit-petroleo mb-4">
          {/* Ícono de candado */}
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <EtiquetaSeccion>Control de Acceso</EtiquetaSeccion>

        <h2 className="text-xl font-bold text-gray-900 mt-3 mb-2">Acceso Denegado</h2>

        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Su perfil de usuario no cuenta con los permisos necesarios para acceder a esta sección o registrar
          nuevos elementos en el inventario.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Boton onClick={() => navigate('/inventario')} className="w-full sm:w-auto">
            Volver al Inventario
          </Boton>
          <Boton variante="secundario" onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
            Ir al Dashboard
          </Boton>
        </div>
      </div>
    </div>
  )
}
