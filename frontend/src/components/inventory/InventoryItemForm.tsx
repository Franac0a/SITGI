import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import type {
  CreateInventoryItemPayload,
  InventoryItemType,
} from "@/types/scientific.types";

const ITEM_TYPES = [
  { value: "reactivo", label: "Reactivo Químico" },
  { value: "insumo", label: "Insumo / Consumible" },
  { value: "material", label: "Material de Laboratorio" },
  { value: "equipo", label: "Equipo / Instrumental" },
] as const;

const COMMON_UNITS = [
  { value: "mg", label: "Miligramos (mg)" },
  { value: "g", label: "Gramos (g)" },
  { value: "kg", label: "Kilogramos (kg)" },
  { value: "mL", label: "Mililitros (mL)" },
  { value: "L", label: "Litros (L)" },
  { value: "u", label: "Unidades (u)" },
  { value: "frasco", label: "Frasco" },
  { value: "caja", label: "Caja" },
  { value: "kit", label: "Kit" },
] as const;

const LAB_LOCATIONS = [
  { value: "Laboratorio de Biología Molecular", label: "Lab 1" },
  {
    value: "Laboratorio de Química Analítica",
    label: "lab 2",
  },
  {
    value: "Laboratorio de Microbiología",
    label: "lab 3",
  },
  {
    value: "Área de Instrumental Pesado",
    label: "lab 4",
  },
  { value: "Cámara Fría / Ultrafreezer", label: "Cámara Fría / Ultrafreezer" },
  {
    value: "Depósito Central de Reactivos",
    label: "Deposito gnral",
  },
] as const;

interface FormState {
  nombre: string;
  tipo: InventoryItemType | "";
  cantidadInicial: string;
  unidadMedida: string;
  laboratorioUbicacion: string;
  fechaVencimiento: string;
  codigoCas: string;
  marca: string;
  numeroLote: string;
  stockMinimo: string;
  observaciones: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

interface InventoryItemFormProps {
  onSubmit?: (payload: CreateInventoryItemPayload) => Promise<void>;
  onCancel?: () => void;
  onSuccess?: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<CreateInventoryItemPayload>;
}

export function InventoryItemForm({
  onSubmit,
  onCancel,
  onSuccess,
  isLoading = false,
  defaultValues,
}: InventoryItemFormProps) {
  const [formData, setFormData] = useState<FormState>({
    nombre: defaultValues?.nombre ?? "",
    tipo: defaultValues?.tipo ?? "reactivo",
    cantidadInicial:
      defaultValues?.cantidadInicial !== undefined
        ? String(defaultValues.cantidadInicial)
        : "",
    unidadMedida: defaultValues?.unidadMedida ?? "",
    laboratorioUbicacion: defaultValues?.laboratorioUbicacion ?? "",
    fechaVencimiento: defaultValues?.fechaVencimiento ?? "",
    codigoCas: defaultValues?.codigoCas ?? "",
    marca: defaultValues?.marca ?? "",
    numeroLote: defaultValues?.numeroLote ?? "",
    stockMinimo:
      defaultValues?.stockMinimo !== undefined
        ? String(defaultValues.stockMinimo)
        : "",
    observaciones: defaultValues?.observaciones ?? "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const isSubmitting = isLoading || internalSubmitting;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!formData.nombre.trim()) {
      nextErrors.nombre = "El nombre del elemento es requerido.";
    }

    if (!formData.tipo) {
      nextErrors.tipo = "Debe seleccionar un tipo de elemento.";
    }

    if (
      formData.cantidadInicial === "" ||
      Number(formData.cantidadInicial) < 0
    ) {
      nextErrors.cantidadInicial =
        "Ingrese una cantidad válida mayor o igual a 0.";
    }

    if (!formData.unidadMedida.trim()) {
      nextErrors.unidadMedida = "Debe especificar la unidad de medida.";
    }

    if (!formData.laboratorioUbicacion.trim()) {
      nextErrors.laboratorioUbicacion =
        "Debe especificar el laboratorio o ubicación física.";
    }

    if (formData.stockMinimo !== "" && Number(formData.stockMinimo) < 0) {
      nextErrors.stockMinimo = "El stock mínimo no puede ser negativo.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    if (!validate()) return;

    const payload: CreateInventoryItemPayload = {
      nombre: formData.nombre.trim(),
      tipo: formData.tipo as InventoryItemType,
      cantidadInicial: Number(formData.cantidadInicial),
      unidadMedida: formData.unidadMedida.trim(),
      laboratorioUbicacion: formData.laboratorioUbicacion.trim(),
      fechaVencimiento: formData.fechaVencimiento.trim() || undefined,
      codigoCas: formData.codigoCas.trim() || undefined,
      marca: formData.marca.trim() || undefined,
      numeroLote: formData.numeroLote.trim() || undefined,
      stockMinimo:
        formData.stockMinimo !== "" ? Number(formData.stockMinimo) : undefined,
      observaciones: formData.observaciones.trim() || undefined,
    };

    setInternalSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        console.log("Payload CreateInventoryItemPayload:", payload);
      }
      setServerSuccess(
        "Elemento registrado correctamente en el inventario científico.",
      );
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al registrar el elemento.";
      setServerError(message);
    } finally {
      setInternalSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          <span className="text-[11px] font-bold uppercase tracking-wider text-bordo-700 bg-bordo-50 px-2 py-0.5 rounded border border-bordo-200">
            Identificación Principal
          </span>
          <h2 className="text-lg font-bold text-black mt-2">
            Datos Básicos del Elemento
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Especifique el nombre oficial, tipo de material y número de
            referencia química o institucional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <Input
              id="nombre"
              name="nombre"
              label="Nombre del Elemento / Reactivo *"
              placeholder="Ej. Ácido Clorhídrico 37%, Puntas de micropipeta 200 µL"
              value={formData.nombre}
              onChange={handleChange}
              error={errors.nombre}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Select
              id="tipo"
              name="tipo"
              label="Tipo de Elemento *"
              placeholder="Seleccionar tipo"
              options={ITEM_TYPES}
              value={formData.tipo}
              onChange={handleChange}
              error={errors.tipo}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Input
              id="codigoCas"
              name="codigoCas"
              label="Número CAS (Opcional)"
              placeholder="Ej. 7647-01-0"
              value={formData.codigoCas}
              onChange={handleChange}
              error={errors.codigoCas}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Input
              id="marca"
              name="marca"
              label="Marca / Fabricante (Opcional)"
              placeholder="Ej. Merck, Sigma-Aldrich, Eppendorf"
              value={formData.marca}
              onChange={handleChange}
              error={errors.marca}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Input
              id="numeroLote"
              name="numeroLote"
              label="Número de Lote (Opcional)"
              placeholder="Ej. LOT-2026-X88"
              value={formData.numeroLote}
              onChange={handleChange}
              error={errors.numeroLote}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-bordo-700 bg-bordo-50 px-2 py-0.5 rounded border border-bordo-200">
            Stock y Ubicación
          </span>
          <h2 className="text-lg font-bold text-black mt-2">
            Existencias Iniciales y Destino
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Defina la cantidad disponible de ingreso, la unidad de medida y el
            laboratorio asignado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <Input
              id="cantidadInicial"
              name="cantidadInicial"
              type="number"
              min="0"
              step="any"
              label="Cantidad Inicial *"
              placeholder="0.00"
              value={formData.cantidadInicial}
              onChange={handleChange}
              error={errors.cantidadInicial}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Select
              id="unidadMedida"
              name="unidadMedida"
              label="Unidad de Medida *"
              placeholder="Seleccionar unidad"
              options={COMMON_UNITS}
              value={formData.unidadMedida}
              onChange={handleChange}
              error={errors.unidadMedida}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Input
              id="stockMinimo"
              name="stockMinimo"
              type="number"
              min="0"
              step="any"
              label="Stock Mínimo de Alerta"
              placeholder="Ej. 5"
              value={formData.stockMinimo}
              onChange={handleChange}
              error={errors.stockMinimo}
              disabled={isSubmitting}
            />
          </div>

          <div className="md:col-span-2">
            <Select
              id="laboratorioUbicacion"
              name="laboratorioUbicacion"
              label="Laboratorio / Ubicación Física *"
              placeholder="Seleccionar laboratorio de destino"
              options={LAB_LOCATIONS}
              value={formData.laboratorioUbicacion}
              onChange={handleChange}
              error={errors.laboratorioUbicacion}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Input
              id="fechaVencimiento"
              name="fechaVencimiento"
              type="date"
              label="Fecha de Vencimiento"
              value={formData.fechaVencimiento}
              onChange={handleChange}
              error={errors.fechaVencimiento}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="observaciones"
            className="block text-sm font-medium text-black mb-1.5"
          >
            Observaciones o Condiciones Especiales (Opcional)
          </label>
          <textarea
            id="observaciones"
            name="observaciones"
            rows={3}
            value={formData.observaciones}
            onChange={handleChange}
            placeholder="Especificar si requiere refrigeración (-20°C / 4°C), si es fotosensible, precauciones de seguridad, etc."
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-bordo-500 focus:border-bordo-500 transition-colors"
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
          variant="primary"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="w-full sm:w-auto min-w-44"
        >
          Guardar Elemento
        </Button>
      </div>
    </form>
  );
}
