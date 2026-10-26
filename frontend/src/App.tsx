import { BrowserRouter } from 'react-router-dom'
import { ProveedorAvisos } from '@/contexto/ProveedorAvisos'
import { ProveedorSesion } from '@/contexto/ProveedorSesion'
import { Rutas } from '@/Rutas'

export default function App() {
  return (
    <BrowserRouter>
      <ProveedorSesion>
        <ProveedorAvisos>
          <Rutas />
        </ProveedorAvisos>
      </ProveedorSesion>
    </BrowserRouter>
  )
}
