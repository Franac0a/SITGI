import type { Color } from '@/componentes/ui/Insignia'
import type { TipoMovimiento } from '@/tipos'

// Texto que se muestra en los selectores.
export const NOMBRE_TIPO: Record<TipoMovimiento, string> = {
  Ingreso: 'Ingreso',
  Egreso: 'Egreso (consumo)',
  Reposición: 'Reposición',
  Baja: 'Baja',
  Ajuste: 'Ajuste (conteo físico)',
  Reparación: 'Reparación',
  'Cambio de ubicación': 'Cambio de ubicación',
}

// Explicación que aparece arriba del formulario según el tipo elegido.
export const AYUDA_TIPO: Record<TipoMovimiento, string> = {
  Ingreso: 'Suma stock (compra, donación, ingreso al inventario).',
  Egreso: 'Descuenta stock por consumo o uso.',
  Reposición: 'Suma stock por reposición de un pedido.',
  Baja: 'Descuenta stock por rotura, vencimiento o descarte.',
  Ajuste: 'Indicá el stock real contado: reemplaza el stock actual.',
  Reparación: 'Descuenta stock mientras el equipo está en reparación.',
  'Cambio de ubicación': 'No cambia el stock: mueve el elemento a otra ubicación.',
}

export const COLOR_TIPO: Record<TipoMovimiento, Color> = {
  Ingreso: 'verde',
  Egreso: 'rojo',
  Ajuste: 'ambar',
  Reparación: 'celeste',
  Reposición: 'turquesa',
  Baja: 'rosa',
  'Cambio de ubicación': 'violeta',
}
