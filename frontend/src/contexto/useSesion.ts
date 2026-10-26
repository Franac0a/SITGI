import { useContext } from 'react'
import { ContextoSesion } from './ContextoSesion'

export function useSesion() {
  const sesion = useContext(ContextoSesion)
  if (!sesion) {
    throw new Error('useSesion se tiene que usar dentro de <ProveedorSesion>')
  }
  return sesion
}
