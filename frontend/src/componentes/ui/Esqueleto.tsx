import { unirClases } from '@/utilidades/clases'

// Bloque gris que parpadea mientras se cargan los datos.
export function Esqueleto({ className }: { className?: string }) {
  return <div className={unirClases('animate-pulse rounded-md bg-gray-200', className)} />
}

// Lo que se muestra mientras carga una tabla: la cabecera y algunas filas.
export function CargandoTabla({ filas = 1 }: { filas?: number }) {
  return (
    <div className="space-y-3">
      <Esqueleto className="h-10 w-full" />
      {Array.from({ length: filas }, (_, i) => (
        <Esqueleto key={i} className="h-14 w-full" />
      ))}
    </div>
  )
}
