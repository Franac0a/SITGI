import { useState, type FormEvent } from 'react'
import { mensajeDeError } from '@/utilidades/errores'

interface PropsRestablecer {
  nombre: string
  alGuardar: (nueva: string) => Promise<void>
}

// Botón "Restablecer contraseña" de la tabla de usuarios. Al tocarlo aparece un campo
// para escribir la contraseña nueva; después hay que pasársela al usuario.
export function RestablecerPassword({ nombre, alGuardar }: PropsRestablecer) {
  const [abierto, setAbierto] = useState(false)
  const [nueva, setNueva] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  function cerrar() {
    setAbierto(false)
    setNueva('')
    setError('')
  }

  async function guardar(evento: FormEvent) {
    evento.preventDefault()
    if (nueva.length < 8) {
      setError('Mínimo 8 caracteres.')
      return
    }
    setGuardando(true)
    try {
      await alGuardar(nueva)
      cerrar()
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setGuardando(false)
    }
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="block ml-auto mt-2 text-[11px] font-semibold text-gray-500 hover:text-cit-petroleo hover:underline"
      >
        Restablecer contraseña
      </button>
    )
  }

  return (
    <form onSubmit={guardar} noValidate className="mt-2 flex flex-col items-end gap-1">
      <input
        type="text"
        autoFocus
        autoComplete="off"
        placeholder="Contraseña nueva"
        aria-label={`Contraseña nueva para ${nombre}`}
        value={nueva}
        onChange={(e) => {
          setNueva(e.target.value)
          setError('')
        }}
        onKeyDown={(e) => e.key === 'Escape' && cerrar()}
        disabled={guardando}
        className="w-44 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-cit-turquesa"
      />
      <div className="flex items-center gap-2 text-[11px] font-semibold">
        <button type="submit" disabled={guardando} className="text-cit-petroleo hover:underline">
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" onClick={cerrar} className="text-gray-500 hover:underline">
          Cancelar
        </button>
      </div>
      {error && <p className="text-[11px] font-medium text-red-600">{error}</p>}
    </form>
  )
}
