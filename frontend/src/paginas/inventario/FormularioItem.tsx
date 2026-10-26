import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Boton } from '@/componentes/ui/Boton'
import { CampoTexto } from '@/componentes/ui/CampoTexto'
import { EtiquetaSeccion } from '@/componentes/ui/EncabezadoPagina'
import { Mensaje } from '@/componentes/ui/Mensaje'
import { Selector } from '@/componentes/ui/Selector'
import { obtenerSectores } from '@/servicios/sectores'
import type { DatosItem, Item, Opcion } from '@/tipos'
import { mensajeDeError } from '@/utilidades/errores'

const CATEGORIAS: Opcion[] = [
  { valor: 'Reactivo', texto: 'Reactivo Químico' },
  { valor: 'Insumo', texto: 'Insumo / Consumible' },
  { valor: 'Material', texto: 'Material de Laboratorio' },
  { valor: 'Equipo', texto: 'Equipo / Instrumental' },
]

const UNIDADES: Opcion[] = [
  { valor: 'mg', texto: 'Miligramos (mg)' },
  { valor: 'g', texto: 'Gramos (g)' },
  { valor: 'kg', texto: 'Kilogramos (kg)' },
  { valor: 'mL', texto: 'Mililitros (mL)' },
  { valor: 'L', texto: 'Litros (L)' },
  { valor: 'u', texto: 'Unidades (u)' },
  { valor: 'frasco', texto: 'Frasco' },
  { valor: 'caja', texto: 'Caja' },
  { valor: 'kit', texto: 'Kit' },
]

// Se usan solo si todavía no hay sectores cargados en el sistema.
const UBICACIONES_POR_DEFECTO: Opcion[] = [
  { valor: 'Laboratorio de Biología Molecular', texto: 'Lab 1' },
  { valor: 'Laboratorio de Química Analítica', texto: 'lab 2' },
  { valor: 'Laboratorio de Microbiología', texto: 'lab 3' },
  { valor: 'Área de Instrumental Pesado', texto: 'lab 4' },
  { valor: 'Cámara Fría / Ultrafreezer', texto: 'Cámara Fría / Ultrafreezer' },
  { valor: 'Depósito Central de Reactivos', texto: 'Deposito gnral' },
]

const CONDICIONES: Opcion[] = [
  { valor: 'Ambiente', texto: 'Temperatura ambiente' },
  { valor: 'Refrigerado (2-8°C)', texto: 'Refrigerado (2-8°C)' },
  { valor: 'Congelado (-20°C)', texto: 'Congelado (-20°C)' },
  { valor: 'Ultracongelado (-80°C)', texto: 'Ultracongelado (-80°C)' },
  { valor: 'Fotosensible', texto: 'Fotosensible (proteger de la luz)' },
  { valor: 'Otro', texto: 'Otro / Condiciones especiales' },
]

// Si al editar el ítem tiene un valor que no está en la lista, se agrega
// para que el selector lo muestre igual.
function agregarValorActual(opciones: Opcion[], valor: string): Opcion[] {
  if (!valor || opciones.some((opcion) => opcion.valor === valor)) return opciones
  return [...opciones, { valor, texto: valor }]
}

// Todos los campos del formulario se guardan como texto, igual que en los inputs.
function valoresIniciales(item?: Item) {
  return {
    nombre: item?.nombre ?? '',
    categoria: item?.categoria ?? 'Reactivo',
    cantidad: item ? String(item.stock_actual) : '',
    unidad: item?.unidad_medida ?? '',
    ubicacion: item?.ubicacion ?? '',
    condicion: item?.condicion_almacenamiento ?? '',
    vencimiento: item?.fechaVencimiento ?? '',
    codigoCas: item?.codigoCas ?? '',
    marca: item?.marca ?? '',
    lote: item?.numeroLote ?? '',
    stockMinimo: item ? String(item.stock_minimo) : '',
    observaciones: item?.observaciones ?? '',
  }
}

type Valores = ReturnType<typeof valoresIniciales>
type Errores = Partial<Record<keyof Valores, string>>

function validar(valores: Valores): Errores {
  const errores: Errores = {}

  if (!valores.nombre.trim()) errores.nombre = 'El nombre del elemento es obligatorio.'
  if (!valores.categoria) errores.categoria = 'Debe seleccionar un tipo de elemento.'

  if (valores.cantidad === '' || isNaN(Number(valores.cantidad)) || Number(valores.cantidad) < 0) {
    errores.cantidad = 'Ingrese una cantidad inicial válida mayor o igual a 0.'
  }
  if (!valores.unidad.trim()) errores.unidad = 'Debe seleccionar la unidad de medida.'
  if (!valores.ubicacion.trim()) errores.ubicacion = 'Debe seleccionar el laboratorio o ubicación física.'

  if (valores.stockMinimo !== '' && (isNaN(Number(valores.stockMinimo)) || Number(valores.stockMinimo) < 0)) {
    errores.stockMinimo = 'El stock mínimo no puede ser negativo.'
  }

  // Formato del número CAS, por ejemplo 7647-01-0.
  if (valores.codigoCas.trim() && !/^\d{2,10}-\d{2}-\d$/.test(valores.codigoCas.trim())) {
    errores.codigoCas = 'El formato CAS debe ser válido (ej. 7647-01-0 o 50-00-0).'
  }

  if (valores.vencimiento && isNaN(new Date(valores.vencimiento).getTime())) {
    errores.vencimiento = 'La fecha de vencimiento debe tener un formato válido (AAAA-MM-DD).'
  }

  return errores
}

// Pasa los valores del formulario al formato que espera el backend.
// Los campos opcionales vacíos no se mandan.
function armarDatos(valores: Valores): DatosItem {
  return {
    nombre: valores.nombre.trim(),
    categoria: valores.categoria,
    stock_actual: Number(valores.cantidad),
    unidad_medida: valores.unidad.trim(),
    ubicacion: valores.ubicacion.trim(),
    stock_minimo: valores.stockMinimo !== '' ? Number(valores.stockMinimo) : undefined,
    condicion_almacenamiento: valores.condicion.trim() || undefined,
    fechaVencimiento: valores.vencimiento.trim() || undefined,
    codigoCas: valores.codigoCas.trim() || undefined,
    marca: valores.marca.trim() || undefined,
    numeroLote: valores.lote.trim() || undefined,
    observaciones: valores.observaciones.trim() || undefined,
  }
}

function TituloSeccion({ etiqueta, titulo, descripcion }: { etiqueta: string; titulo: string; descripcion: string }) {
  return (
    <div>
      <EtiquetaSeccion>{etiqueta}</EtiquetaSeccion>
      <h2 className="text-lg font-bold text-gray-900 mt-2">{titulo}</h2>
      <p className="text-xs text-gray-600 mt-0.5">{descripcion}</p>
    </div>
  )
}

interface PropsFormularioItem {
  // Si se pasa un ítem, el formulario arranca con sus datos (modo edición).
  item?: Item
  alGuardar: (datos: DatosItem) => Promise<void>
  alCancelar: () => void
}

export function FormularioItem({ item, alGuardar, alCancelar }: PropsFormularioItem) {
  const [valores, setValores] = useState(() => valoresIniciales(item))
  const [errores, setErrores] = useState<Errores>({})
  const [guardando, setGuardando] = useState(false)
  const [errorServidor, setErrorServidor] = useState('')
  const [ubicaciones, setUbicaciones] = useState(UBICACIONES_POR_DEFECTO)

  // Si hay sectores cargados, las ubicaciones salen de ahí.
  useEffect(() => {
    obtenerSectores()
      .then((sectores) => {
        if (sectores.length > 0) {
          setUbicaciones(sectores.map((s) => ({ valor: s.nombre, texto: `${s.nombre} (${s.tipo})` })))
        }
      })
      .catch(() => {})
  }, [])

  function cambiarCampo(evento: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = evento.target
    setValores({ ...valores, [name]: value })
    // Al corregir un campo se borra su error.
    setErrores({ ...errores, [name]: undefined })
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErrorServidor('')

    const erroresEncontrados = validar(valores)
    setErrores(erroresEncontrados)
    if (Object.keys(erroresEncontrados).length > 0) return

    setGuardando(true)
    try {
      await alGuardar(armarDatos(valores))
    } catch (e) {
      setErrorServidor(mensajeDeError(e))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-6">
      {errorServidor && <Mensaje tipo="error" titulo="Error en el registro" texto={errorServidor} />}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-6">
        <TituloSeccion
          etiqueta="Identificación Principal"
          titulo="Datos Básicos del Elemento"
          descripcion="Especifique el nombre oficial, tipo de material y número de referencia química o institucional."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <CampoTexto
              name="nombre"
              etiqueta="Nombre del Elemento / Reactivo *"
              placeholder="Ej. Ácido Clorhídrico 37%, Puntas de micropipeta 200 µL"
              value={valores.nombre}
              onChange={cambiarCampo}
              error={errores.nombre}
              disabled={guardando}
            />
          </div>

          <Selector
            name="categoria"
            etiqueta="Tipo de Elemento *"
            textoVacio="Seleccionar tipo"
            opciones={agregarValorActual(CATEGORIAS, valores.categoria)}
            value={valores.categoria}
            onChange={cambiarCampo}
            error={errores.categoria}
            disabled={guardando}
          />

          <CampoTexto
            name="codigoCas"
            etiqueta="Número CAS (Opcional)"
            placeholder="Ej. 7647-01-0"
            value={valores.codigoCas}
            onChange={cambiarCampo}
            error={errores.codigoCas}
            disabled={guardando}
          />

          <CampoTexto
            name="marca"
            etiqueta="Marca / Fabricante (Opcional)"
            placeholder="Ej. Merck, Sigma-Aldrich, Eppendorf"
            value={valores.marca}
            onChange={cambiarCampo}
            disabled={guardando}
          />

          <CampoTexto
            name="lote"
            etiqueta="Número de Lote (Opcional)"
            placeholder="Ej. LOT-2026-X88"
            value={valores.lote}
            onChange={cambiarCampo}
            disabled={guardando}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-6">
        <TituloSeccion
          etiqueta="Stock y Ubicación"
          titulo="Existencias Iniciales y Destino"
          descripcion="Defina la cantidad disponible de ingreso, la unidad de medida y el laboratorio asignado."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CampoTexto
            name="cantidad"
            type="number"
            min="0"
            step="any"
            etiqueta="Cantidad Inicial *"
            placeholder="0.00"
            value={valores.cantidad}
            onChange={cambiarCampo}
            error={errores.cantidad}
            disabled={guardando}
          />

          <Selector
            name="unidad"
            etiqueta="Unidad de Medida *"
            textoVacio="Seleccionar unidad"
            opciones={agregarValorActual(UNIDADES, valores.unidad)}
            value={valores.unidad}
            onChange={cambiarCampo}
            error={errores.unidad}
            disabled={guardando}
          />

          <CampoTexto
            name="stockMinimo"
            type="number"
            min="0"
            step="any"
            etiqueta="Stock Mínimo de Alerta"
            placeholder="Ej. 5"
            value={valores.stockMinimo}
            onChange={cambiarCampo}
            error={errores.stockMinimo}
            disabled={guardando}
          />

          <div className="md:col-span-2">
            <Selector
              name="ubicacion"
              etiqueta="Laboratorio / Ubicación Física *"
              textoVacio="Seleccionar laboratorio de destino"
              opciones={agregarValorActual(ubicaciones, valores.ubicacion)}
              value={valores.ubicacion}
              onChange={cambiarCampo}
              error={errores.ubicacion}
              disabled={guardando}
            />
          </div>

          <CampoTexto
            name="vencimiento"
            type="date"
            etiqueta="Fecha de Vencimiento"
            value={valores.vencimiento}
            onChange={cambiarCampo}
            error={errores.vencimiento}
            disabled={guardando}
          />

          <Selector
            name="condicion"
            etiqueta="Condición de Almacenamiento"
            textoVacio="Seleccionar condición"
            opciones={CONDICIONES}
            value={valores.condicion}
            onChange={cambiarCampo}
            disabled={guardando}
          />
        </div>

        <div>
          <label htmlFor="observaciones" className="block text-sm font-medium text-gray-800 mb-1.5">
            Observaciones o Condiciones Especiales (Opcional)
          </label>
          <textarea
            id="observaciones"
            name="observaciones"
            rows={3}
            value={valores.observaciones}
            onChange={cambiarCampo}
            placeholder="Especificar si requiere refrigeración (-20°C / 4°C), si es fotosensible, precauciones de seguridad, etc."
            disabled={guardando}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cit-turquesa focus:border-cit-turquesa transition-all duration-150"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
        <Boton type="button" variante="secundario" onClick={alCancelar} disabled={guardando} className="w-full sm:w-auto">
          Cancelar
        </Boton>
        <Boton type="submit" cargando={guardando} className="w-full sm:w-auto min-w-44">
          Guardar Elemento
        </Boton>
      </div>
    </form>
  )
}
