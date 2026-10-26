import type { ChangeEvent } from 'react'
import { CampoTexto } from '@/componentes/ui/CampoTexto'
import { Selector } from '@/componentes/ui/Selector'
import type { FiltrosMovimientos as Filtros, Sector } from '@/tipos'
import { NOMBRE_TIPO } from './tiposMovimiento'

interface PropsFiltros {
  filtros: Filtros
  sectores: Sector[]
  alCambiar: (filtros: Filtros) => void
}

export function FiltrosMovimientos({ filtros, sectores, alCambiar }: PropsFiltros) {
  function cambiarFiltro(evento: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    alCambiar({ ...filtros, [evento.target.name]: evento.target.value })
  }

  const hayFiltros = Object.values(filtros).some(Boolean)

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <Selector
          id="filtro-sector"
          name="sector"
          etiqueta="Sector"
          textoVacio="Todos"
          opciones={sectores.map((s) => ({ valor: s.nombre, texto: s.nombre }))}
          value={filtros.sector ?? ''}
          onChange={cambiarFiltro}
        />
        <Selector
          id="filtro-tipo"
          name="tipo"
          etiqueta="Tipo"
          textoVacio="Todos"
          opciones={Object.entries(NOMBRE_TIPO).map(([valor, texto]) => ({ valor, texto }))}
          value={filtros.tipo ?? ''}
          onChange={cambiarFiltro}
        />
        <CampoTexto
          id="filtro-responsable"
          name="responsable"
          etiqueta="Usuario"
          placeholder="Nombre"
          value={filtros.responsable ?? ''}
          onChange={cambiarFiltro}
        />
        <CampoTexto
          id="filtro-desde"
          name="desde"
          type="date"
          etiqueta="Desde"
          value={filtros.desde ?? ''}
          onChange={cambiarFiltro}
        />
        <CampoTexto
          id="filtro-hasta"
          name="hasta"
          type="date"
          etiqueta="Hasta"
          value={filtros.hasta ?? ''}
          onChange={cambiarFiltro}
        />
      </div>
      {hayFiltros && (
        <button
          type="button"
          onClick={() => alCambiar({})}
          className="mt-3 text-xs font-semibold text-cit-petroleo hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
