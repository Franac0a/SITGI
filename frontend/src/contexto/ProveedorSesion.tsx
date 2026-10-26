import { useEffect, useState, type ReactNode } from 'react'
import { CLAVE_USUARIO, ErrorApi } from '@/servicios/api'
import { cerrarSesion, iniciarSesion, obtenerUsuarioActual } from '@/servicios/sesion'
import type { Usuario } from '@/tipos'
import { ContextoSesion } from './ContextoSesion'

// La sesión real es una cookie que maneja el backend.
// En localStorage solo se guardan los datos del usuario para mostrarlos.
function leerUsuarioGuardado(): Usuario | null {
  try {
    const guardado = localStorage.getItem(CLAVE_USUARIO)
    return guardado ? JSON.parse(guardado) : null
  } catch {
    return null
  }
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(leerUsuarioGuardado)

  function guardarUsuario(nuevo: Usuario | null) {
    setUsuario(nuevo)
    if (nuevo) {
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(nuevo))
    } else {
      localStorage.removeItem(CLAVE_USUARIO)
    }
  }

  // Al abrir la app se confirma con el backend que la cookie sigue valiendo
  // y se actualizan los datos (por ejemplo, si la Dirección le cambió el rol).
  useEffect(() => {
    if (!localStorage.getItem(CLAVE_USUARIO)) return
    obtenerUsuarioActual()
      .then(guardarUsuario)
      .catch((error) => {
        if (error instanceof ErrorApi && (error.estado === 401 || error.estado === 403)) {
          guardarUsuario(null)
        }
      })
  }, [])

  async function ingresar(email: string, password: string) {
    const nuevo = await iniciarSesion(email, password)
    guardarUsuario(nuevo)
    return nuevo
  }

  function salir() {
    guardarUsuario(null)
    cerrarSesion().catch(() => {})
  }

  return (
    <ContextoSesion.Provider value={{ usuario, estaLogueado: usuario !== null, ingresar, salir }}>
      {children}
    </ContextoSesion.Provider>
  )
}
