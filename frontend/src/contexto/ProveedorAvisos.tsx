import { useEffect, useState, type ReactNode } from 'react'
import { ContextoAvisos, type Aviso } from './ContextoAvisos'

const CLAVE_AVISOS = 'sitgi_avisos'

function leerAvisosGuardados(): Aviso[] {
  try {
    const guardados = localStorage.getItem(CLAVE_AVISOS)
    return guardados ? JSON.parse(guardados) : []
  } catch {
    return []
  }
}

// Devuelve la hora actual como "Hoy 14:05".
function horaActual(): string {
  const ahora = new Date()
  const horas = String(ahora.getHours()).padStart(2, '0')
  const minutos = String(ahora.getMinutes()).padStart(2, '0')
  return `Hoy ${horas}:${minutos}`
}

export function ProveedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>(leerAvisosGuardados)

  // Cada vez que cambian los avisos se vuelven a guardar.
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_AVISOS, JSON.stringify(avisos))
    } catch {
      // Si el navegador no deja guardar, los avisos duran hasta recargar la página.
    }
  }, [avisos])

  function agregarAviso(titulo: string, descripcion: string, tipo: Aviso['tipo'] = 'exito') {
    const nuevo: Aviso = {
      id: `aviso-${Date.now()}`,
      titulo,
      descripcion,
      hora: horaActual(),
      tipo,
      leido: false,
    }
    setAvisos((anteriores) => [nuevo, ...anteriores])
  }

  function marcarAvisosLeidos() {
    setAvisos((anteriores) => anteriores.map((aviso) => ({ ...aviso, leido: true })))
  }

  const sinLeer = avisos.filter((aviso) => !aviso.leido).length

  return (
    <ContextoAvisos.Provider value={{ avisos, sinLeer, agregarAviso, marcarAvisosLeidos }}>
      {children}
    </ContextoAvisos.Provider>
  )
}
