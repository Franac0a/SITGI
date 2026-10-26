import type { ChangeEvent } from 'react'
import { Boton } from '@/componentes/ui/Boton'
import { CampoTexto } from '@/componentes/ui/CampoTexto'
import { Selector } from '@/componentes/ui/Selector'
import type { FiltrosMovimientos as Filtros, Item, Sector } from '@/tipos'
import { NOMBRE_TIPO } from './tiposMovimiento'

interface PropsFiltros {
  filtros: Filtros
  items: Item[]
  sectores: Sector[]
  alCambiar: (filtros: Filtros) => void
  // Descarga en CSV los movimientos que coinciden con los filtros.
  alExportar: () => void
  exportando: boolean
}

export function FiltrosMovimientos({ filtros, items, sectores, alCambiar, alExportar, exportando }: PropsFiltros) {
  function cambiarFiltro(evento: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    alCambiar({ ...filtros, [evento.target.name]: evento.target.value })
  }

  const hayFiltros = Object.values(filtros).some(Boolean)

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
      <Selector
        id="filtro-item"
        name="itemId"
        etiqueta="Ítem / Reactivo"
        textoVacio="Todos los ítems"
        opciones={items.map((item) => ({
          valor: String(item.id),
          texto: item.codigo_identificacion ? `${item.nombre} (${item.codigo_identificacion})` : item.nombre,
        }))}
        value={filtros.itemId ?? ''}
        onChange={cambiarFiltro}
      />

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

      <div className="flex items-center justify-between gap-3">
        {hayFiltros ? (
          <button
            type="button"
            onClick={() => alCambiar({})}
            className="text-xs font-semibold text-cit-petroleo hover:underline"
          >
            Limpiar filtros
          </button>
        ) : (
          <span />
        )}
        <Boton variante="contorno" className="h-8 px-3 text-xs" onClick={alExportar} cargando={exportando}>
          Exportar CSV
        </Boton>
      </div>
    </div>
  )
}
