import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type {
  CreateInventoryItemPayload,
  InventoryItemType,
} from '@/types/scientific.types'
import {
  inventoryItemSchema,
  type InventoryItemSchemaType,
} from '@/utils/validation'

const ITEM_TYPES = [
  { value: 'reactivo', label: 'Reactivo Químico' },
  { value: 'insumo', label: 'Insumo / Consumible' },
  { value: 'material', label: 'Material de Laboratorio' },
  { value: 'equipo', label: 'Equipo / Instrumental' },
] as const

const COMMON_UNITS = [
  { value: 'mg', label: 'Miligramos (mg)' },
  { value: 'g', label: 'Gramos (g)' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'mL', label: 'Mililitros (mL)' },
  { value: 'L', label: 'Litros (L)' },
  { value: 'u', label: 'Unidades (u)' },
  { value: 'frasco', label: 'Frasco' },
  { value: 'caja', label: 'Caja' },
  { value: 'kit', label: 'Kit' },
] as const

const LAB_LOCATIONS = [
  {
    value: 'Laboratorio de Biología Molecular',
    label: 'Laboratorio de Biología Molecular',
  },
  {
    value: 'Laboratorio de Química Analítica',
    label: 'Laboratorio de Química Analítica',
  },
  {
    value: 'Laboratorio de Microbiología',
    label: 'Laboratorio de Microbiología',
  },
  {
    value: 'Área de Instrumental Pesado',
    label: 'Área de Instrumental Pesado',
  },
  {
    value: 'Cámara Fría / Ultrafreezer',
    label: 'Cámara Fría / Ultrafreezer',
  },
  {
    value: 'Depósito Central de Reactivos',
    label: 'Depósito Central de Reactivos',
  },
] as const

interface InventoryItemFormProps {
  onSubmit?: (payload: CreateInventoryItemPayload) => Promise<void>
  onCancel?: () => void
  onSuccess?: () => void
  isLoading?: boolean
  defaultValues?: Partial<CreateInventoryItemPayload>
}

export function InventoryItemForm({
  onSubmit,
  onCancel,
  onSuccess,
  isLoading = false,
  defaultValues,
}: InventoryItemFormProps) {
  const [internalSubmitting, setInternalSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [serverSuccess, setServerSuccess] = useState<string | null>(null)

  const isSubmitting = isLoading || internalSubmitting

  const form = useForm<InventoryItemSchemaType>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      nombre: defaultValues?.nombre ?? '',
      tipo: defaultValues?.tipo ?? 'reactivo',
      codigoCas: defaultValues?.codigoCas ?? '',
      marca: defaultValues?.marca ?? '',
      numeroLote: defaultValues?.numeroLote ?? '',
      cantidadInicial:
        defaultValues?.cantidadInicial !== undefined
          ? String(defaultValues.cantidadInicial)
          : '',
      unidadMedida: defaultValues?.unidadMedida ?? '',
      stockMinimo:
        defaultValues?.stockMinimo !== undefined
          ? String(defaultValues.stockMinimo)
          : '',
      laboratorioUbicacion: defaultValues?.laboratorioUbicacion ?? '',
      fechaVencimiento: defaultValues?.fechaVencimiento ?? '',
      observaciones: defaultValues?.observaciones ?? '',
    },
  })

  const handleSubmit = async (values: InventoryItemSchemaType) => {
    setServerError(null)
    setServerSuccess(null)

    const payload: CreateInventoryItemPayload = {
      nombre: values.nombre.trim(),
      tipo: values.tipo as InventoryItemType,
      cantidadInicial: Number(values.cantidadInicial),
      unidadMedida: values.unidadMedida.trim(),
      laboratorioUbicacion: values.laboratorioUbicacion.trim(),
      codigoCas: values.codigoCas.trim(),
      fechaVencimiento: values.fechaVencimiento?.trim() || undefined,
      marca: values.marca?.trim() || undefined,
      numeroLote: values.numeroLote?.trim() || undefined,
      stockMinimo:
        values.stockMinimo !== undefined && values.stockMinimo !== ''
          ? Number(values.stockMinimo)
          : undefined,
      observaciones: values.observaciones?.trim() || undefined,
    }

    setInternalSubmitting(true)

    try {
      if (onSubmit) {
        await onSubmit(payload)
      }
      setServerSuccess(
        'Elemento registrado correctamente en el inventario científico.'
      )
      form.reset()
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al registrar el elemento.'
      setServerError(message)
    } finally {
      setInternalSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
        noValidate
      >
        {serverError && (
          <Alert
            variant="error"
            title="Error en el registro"
            message={serverError}
          />
        )}

        {serverSuccess && (
          <Alert
            variant="success"
            title="Registro exitoso"
            message={serverSuccess}
          />
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cit-petroleo bg-cit-petroleo/10 px-2.5 py-0.5 rounded-full border border-cit-petroleo/20">
              Identificación Principal
            </span>
            <h2 className="text-lg font-bold text-gray-900 mt-2">
              Datos Básicos del Elemento
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Especifique el nombre oficial, tipo de material y número de
              referencia química o institucional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Elemento / Reactivo *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. Ácido Clorhídrico 37%, Puntas de micropipeta 200 µL"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Elemento *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ITEM_TYPES.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="codigoCas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número CAS * (Solo dígitos)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="Ej. 7647010"
                        disabled={isSubmitting}
                        value={field.value}
                        onChange={(e) => {
                          const numericOnly = e.target.value.replace(/\D/g, '')
                          field.onChange(numericOnly)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca / Fabricante (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. Merck, Sigma-Aldrich, Eppendorf"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="numeroLote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Lote (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. LOT-2026-X88"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cit-petroleo bg-cit-petroleo/10 px-2.5 py-0.5 rounded-full border border-cit-petroleo/20">
              Stock y Ubicación
            </span>
            <h2 className="text-lg font-bold text-gray-900 mt-2">
              Existencias Iniciales y Destino
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Defina la cantidad disponible de ingreso, la unidad de medida y el
              laboratorio asignado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <FormField
                control={form.control}
                name="cantidadInicial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad Inicial *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0.00"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="unidadMedida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad de Medida *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar unidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COMMON_UNITS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="stockMinimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Mínimo de Alerta</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="Ej. 5"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="laboratorioUbicacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Laboratorio / Ubicación Física *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar laboratorio de destino" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LAB_LOCATIONS.map((lab) => (
                          <SelectItem key={lab.value} value={lab.value}>
                            {lab.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="fechaVencimiento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Vencimiento</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div>
            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Observaciones o Condiciones Especiales (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Especificar si requiere refrigeración (-20°C / 4°C), si es fotosensible, precauciones de seguridad, etc."
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
          )}

          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-w-44 bg-cit-petroleo hover:bg-cit-azul-fuerte text-white font-semibold shadow-md transition-colors"
          >
            Guardar Elemento
          </Button>
        </div>
      </form>
    </Form>
  )
}
