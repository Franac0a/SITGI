import { useState, type FormEvent } from 'react'
import type { Item } from '@/tipos'
import { mensajeDeError } from '@/utilidades/errores'

interface PropsEditorMinimo {
  item: Item
  // Solo quien gestiona el inventario puede cambiar el mínimo.
  puedeEditar: boolean
  alGuardar: (minimo: number) => Promise<void>
}

// Celda de stock de la tabla: muestra "stock / Mín" y permite cambiar el mínimo ahí mismo.
export function EditorMinimo({ item, puedeEditar, alGuardar }: PropsEditorMinimo) {
  const [editando, setEditando] = useState(false)
  const [valor, setValor] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  function empezar() {
    setValor(String(item.stock_minimo))
    setError('')
    setEditando(true)
  }

  async function guardar(evento: FormEvent) {
    evento.preventDefault()
    const minimo = Number(valor)
    if (valor === '' || isNaN(minimo) || minimo < 0) {
      setError('Ingresá un número mayor o igual a 0.')
      return
    }

    setGuardando(true)
    try {
      await alGuardar(minimo)
      setEditando(false)
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setGuardando(false)
    }
  }

  if (editando) {
    return (
      // noValidate: el error lo muestra guardar() y no el cartel del navegador.
      <form onSubmit={guardar} noValidate className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-500">Mín</span>
          <input
            type="number"
            min="0"
            step="any"
            autoFocus
            aria-label={`Stock mínimo de ${item.nombre}`}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            // Esc cancela sin guardar.
            onKeyDown={(e) => e.key === 'Escape' && setEditando(false)}
            disabled={guardando}
            className="w-20 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-cit-turquesa"
          />
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <button type="submit" disabled={guardando} className="text-cit-petroleo hover:underline">
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" onClick={() => setEditando(false)} className="text-gray-500 hover:underline">
            Cancelar
          </button>
        </div>
        {error && <p className="text-[11px] font-medium text-red-600">{error}</p>}
      </form>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
        {item.stock_actual} / Mín {item.stock_minimo} {item.unidad_medida}
      </span>
      {puedeEditar && (
        <button type="button" onClick={empezar} className="text-[11px] font-semibold text-cit-petroleo hover:underline">
          cambiar mínimo
        </button>
      )}
    </div>
  )
}
