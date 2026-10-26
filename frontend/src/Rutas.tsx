import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { RequierePermiso } from '@/componentes/plantilla/RequierePermiso'
import { RutaProtegida } from '@/componentes/plantilla/RutaProtegida'
import { useSesion } from '@/contexto/useSesion'
import PaginaLogin from '@/paginas/acceso/PaginaLogin'
import PaginaRegistro from '@/paginas/acceso/PaginaRegistro'
import { puedeGestionarInventario, puedeGestionarUsuarios, rutaInicial } from '@/utilidades/permisos'

// Con lazy() cada página se descarga recién cuando alguien entra a ella,
// así la app tarda menos en abrir. El login y el registro se cargan siempre.
const PaginaInicio = lazy(() => import('@/paginas/inicio/PaginaInicio'))
const PaginaInventario = lazy(() => import('@/paginas/inventario/PaginaInventario'))
const PaginaNuevoItem = lazy(() => import('@/paginas/inventario/PaginaNuevoItem'))
const PaginaEditarItem = lazy(() => import('@/paginas/inventario/PaginaEditarItem'))
const PaginaMovimientos = lazy(() => import('@/paginas/movimientos/PaginaMovimientos'))
const PaginaPedidos = lazy(() => import('@/paginas/pedidos/PaginaPedidos'))
const PaginaSectores = lazy(() => import('@/paginas/sectores/PaginaSectores'))
const PaginaResiduos = lazy(() => import('@/paginas/residuos/PaginaResiduos'))
const PaginaMuestras = lazy(() => import('@/paginas/muestras/PaginaMuestras'))
const PaginaProyectos = lazy(() => import('@/paginas/proyectos/PaginaProyectos'))
const PaginaDocumentos = lazy(() => import('@/paginas/documentos/PaginaDocumentos'))
const PaginaReportes = lazy(() => import('@/paginas/reportes/PaginaReportes'))
const PaginaUsuarios = lazy(() => import('@/paginas/usuarios/PaginaUsuarios'))

function Cargando() {
  return <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Cargando...</div>
}

export function Rutas() {
  const { usuario, estaLogueado } = useSesion()
  const inicio = estaLogueado ? rutaInicial(usuario?.rol) : '/login'

  return (
    <Suspense fallback={<Cargando />}>
      <Routes>
        {/* Si ya hay sesión, el login y el registro mandan a la página de inicio */}
        <Route path="/login" element={estaLogueado ? <Navigate to={inicio} replace /> : <PaginaLogin />} />
        <Route path="/registro" element={estaLogueado ? <Navigate to={inicio} replace /> : <PaginaRegistro />} />

        {/* Páginas que necesitan sesión */}
        <Route element={<RutaProtegida />}>
          <Route path="/dashboard" element={<PaginaInicio />} />
          <Route path="/inventario" element={<PaginaInventario />} />
          <Route
            path="/inventario/nuevo"
            element={
              <RequierePermiso permiso={puedeGestionarInventario}>
                <PaginaNuevoItem />
              </RequierePermiso>
            }
          />
          <Route
            path="/inventario/editar/:id"
            element={
              <RequierePermiso permiso={puedeGestionarInventario}>
                <PaginaEditarItem />
              </RequierePermiso>
            }
          />
          <Route path="/movimientos" element={<PaginaMovimientos />} />
          <Route path="/pedidos" element={<PaginaPedidos />} />
          <Route path="/sectores" element={<PaginaSectores />} />
          <Route path="/residuos" element={<PaginaResiduos />} />
          <Route path="/muestras" element={<PaginaMuestras />} />
          <Route path="/proyectos" element={<PaginaProyectos />} />
          <Route path="/documentos" element={<PaginaDocumentos />} />
          <Route path="/reportes" element={<PaginaReportes />} />
        </Route>

        {/* Solo la Dirección; al resto lo manda al dashboard */}
        <Route
          path="/admin/usuarios"
          element={
            <RequierePermiso permiso={puedeGestionarUsuarios} redirigirA="/dashboard">
              <PaginaUsuarios />
            </RequierePermiso>
          }
        />

        {/* Cualquier otra dirección */}
        <Route path="*" element={<Navigate to={inicio} replace />} />
      </Routes>
    </Suspense>
  )
}
