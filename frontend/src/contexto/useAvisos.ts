import { useContext } from 'react'
import { ContextoAvisos } from './ContextoAvisos'

export function useAvisos() {
  const avisos = useContext(ContextoAvisos)
  if (!avisos) {
    throw new Error('useAvisos se tiene que usar dentro de <ProveedorAvisos>')
  }
  return avisos
}
