import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Boton } from '@/componentes/ui/Boton'
import { CampoTexto } from '@/componentes/ui/CampoTexto'
import { cargarResultadoMuestra } from '@/servicios/muestras'
import type { Muestra } from '@/tipos'
import { mensajeDeError } from '@/utilidades/errores'
import { fechaDeHoy, formatearFecha } from '@/utilidades/fechas'

interface PropsFormularioResultado {
  muestra: Muestra
  alGuardar: () => void
  alCancelar: () => void
}

// Carga del resultado de una muestra que ya ingresó. Se muestra debajo de su fila.
export function FormularioResultado({ muestra, alGuardar, alCancelar }: PropsFormularioResultado) {
  const [positivos, setPositivos] = useState('0')
  const [sospechosos, setSospechosos] = useState('0')
  const [negativos, setNegativos] = useState(String(muestra.cantidad_muestras))
  const [fecha, setFecha] = useState(fechaDeHoy())
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  // Cambia un campo y borra el error anterior, que ya puede no valer.
  function cambiar(guardar: (valor: string) => void) {
    return (evento: ChangeEvent<HTMLInputElement>) => {
      guardar(evento.target.value)
      setError('')
    }
  }

  // En el Excel del CIT solo Brucelosis informa sospechosos.
  const conSospechosos = muestra.tipo === 'Brucelosis'

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setError('')

    const numeros = [positivos, conSospechosos ? sospechosos : '0', negativos].map(Number)
    if (numeros.some((n) => !Number.isInteger(n) || n < 0)) {
      setError('Los resultados tienen que ser números enteros (0 o más).')
      return
    }
    const suma = numeros[0] + numeros[1] + numeros[2]
    if (suma > muestra.cantidad_muestras) {
      setError(`La suma (${suma}) no puede superar las ${muestra.cantidad_muestras} muestras.`)
      return
    }
    if (!fecha) {
      setError('Indicá la fecha del resultado.')
      return
    }

    setGuardando(true)
    try {
      await cargarResultadoMuestra(muestra.id, {
        positivos: numeros[0],
        sospechosos: numeros[1],
        negativos: numeros[2],
        fecha_resultado: fecha,
      })
      alGuardar()
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-3">
      <p className="text-xs text-gray-600">
        Resultado de <strong>{muestra.cantidad_muestras} muestras</strong> ingresadas el{' '}
        {formatearFecha(muestra.fecha_ingreso)}
        {muestra.propietario ? ` (${muestra.propietario})` : ''}.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
        <CampoTexto
          name="positivos"
          type="number"
          min="0"
          etiqueta="Positivos"
          value={positivos}
          onChange={cambiar(setPositivos)}
          disabled={guardando}
        />
        {conSospechosos && (
          <CampoTexto
            name="sospechosos"
            type="number"
            min="0"
            etiqueta="Sospechosos"
            value={sospechosos}
            onChange={cambiar(setSospechosos)}
            disabled={guardando}
          />
        )}
        <CampoTexto
          name="negativos"
          type="number"
          min="0"
          etiqueta="Negativos"
          value={negativos}
          onChange={cambiar(setNegativos)}
          disabled={guardando}
        />
        <CampoTexto
          name="fecha_resultado"
          type="date"
          etiqueta="Fecha del resultado"
          value={fecha}
          onChange={cambiar(setFecha)}
          disabled={guardando}
        />
        <div className="flex gap-2">
          <Boton type="submit" cargando={guardando} className="h-10">
            Guardar
          </Boton>
          <Boton type="button" variante="secundario" onClick={alCancelar} disabled={guardando}>
            Cancelar
          </Boton>
        </div>
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </form>
  )
}
