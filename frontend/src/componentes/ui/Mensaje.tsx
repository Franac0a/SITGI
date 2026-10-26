import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

const ESTILOS = {
  error: 'border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600',
  exito: 'border-emerald-200 bg-emerald-50 text-emerald-900 [&>svg]:text-emerald-600',
  info: 'border-sky-200 bg-sky-50 text-sky-900 [&>svg]:text-cit-petroleo',
}

const ICONOS = {
  error: AlertCircle,
  exito: CheckCircle2,
  info: Info,
}

interface PropsMensaje {
  tipo: keyof typeof ESTILOS
  titulo?: string
  texto: string
}

// Recuadro de color para mostrar un error, una confirmación o una información.
export function Mensaje({ tipo, titulo, texto }: PropsMensaje) {
  const Icono = ICONOS[tipo]

  return (
    <div
      role="alert"
      className={`relative w-full rounded-lg border p-4 text-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 ${ESTILOS[tipo]}`}
    >
      <Icono className="h-4 w-4" />
      <div className="flex flex-col gap-1">
        {titulo && <h5 className="font-semibold leading-none tracking-tight">{titulo}</h5>}
        <div className="text-sm leading-relaxed">{texto}</div>
      </div>
    </div>
  )
}
