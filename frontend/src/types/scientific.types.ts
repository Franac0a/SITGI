export type InventoryItemType = 'Reactivo' | 'Insumo' | 'Material' | 'Equipo' | string

export interface CreateInventoryItemPayload {
  nombre: string
  tipo: InventoryItemType
  tipoElemento?: string
  cantidadInicial: number
  unidadMedida: string
  laboratorioUbicacion: string
  fechaVencimiento?: string
  codigoCas?: string
  numeroCAS?: string
  marca?: string
  marcaFabricante?: string
  numeroLote?: string
  stockMinimo?: number
  observaciones?: string
  condicion_almacenamiento?: string
}

export interface ScientificDocument {
  id: string
  title: string
  category: 'MSDS' | 'SOP' | 'COA' | 'Protocolo' | 'Otro'
  code: string
  description?: string
  fileName: string
  fileSize: string
  fileUrl: string
  uploadedAt: string
}

export interface InventoryItem {
  id: string | number
  codigo_identificacion?: string
  code?: string
  nombre?: string
  name?: string
  numeroCAS?: string
  casNumber?: string
  marcaFabricante?: string
  marca?: string
  brand?: string
  numeroLote?: string
  batchNumber?: string
  tipoElemento?: string
  categoria?: string
  category?: string
  laboratorioUbicacion?: string
  ubicacion?: string
  location?: string
  condicion_almacenamiento?: string | null
  cantidadInicial?: number
  stockActual?: number
  stock_actual?: number
  currentStock?: number
  stockMinimo?: number
  stock_minimo?: number
  minStock?: number
  unidadMedida?: string
  unidad_medida?: string
  unit?: string
  fechaVencimiento?: string
  fecha_vencimiento?: string
  expirationDate?: string
  codigoCas?: string
  observaciones?: string
  detalles_tecnicos?: Record<string, any>
  estado?: 'disponible' | 'bajo_stock' | 'agotado' | 'vencido' | 'activo' | string
  creadoPor?: number | null
  createdAt?: string
  updatedAt?: string
  isRefrigerated?: boolean
  isSensitive?: boolean
}

export type MovementType = 'Ingreso' | 'Egreso' | 'Ajuste' | 'Reparación'

export interface MovimientoItemRef {
  id?: number
  nombre?: string
  codigo_identificacion?: string
  unidad_medida?: string
}

export interface Movimiento {
  id: number
  itemId: number
  tipo_movimiento: MovementType
  cantidad: number
  fecha_movimiento?: string
  origen_destino?: string | null
  costo_unitario?: number | string | null
  responsable: string
  observaciones?: string | null
  createdAt?: string
  updatedAt?: string
  Item?: MovimientoItemRef
}

export interface RegisterMovementPayload {
  itemId: number | string
  tipo_movimiento: MovementType
  cantidad: number
  origen_destino?: string
  costo_unitario?: number
  responsable: string
  observaciones?: string
}

export type SectorTipo =
  | 'Laboratorio'
  | 'Heladera'
  | 'Droguero'
  | 'Estante'
  | 'Depósito'
  | 'Otro'

export interface Sector {
  id: number
  nombre: string
  tipo: SectorTipo
  descripcion?: string | null
  createdAt?: string
  updatedAt?: string
}

export type PedidoEstado = 'Pendiente' | 'Aprobado' | 'Ingresado'

export interface Pedido {
  id: number
  item_nombre: string
  cantidad: number
  sector?: string | null
  estado: PedidoEstado
  responsable: string
  observaciones?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface RegisterPedidoPayload {
  item_nombre: string
  cantidad: number
  sector?: string
  responsable: string
  observaciones?: string
}

export type ResiduoTipo = 'Patológico' | 'Químico' | 'Tóxico' | 'Biológico' | 'Otro'
export type ResiduoEstado = 'Pendiente' | 'Retirado'

export interface Residuo {
  id: number
  tipo: ResiduoTipo
  descripcion: string
  sector?: string | null
  responsable: string
  retiro_programado?: string | null
  estado: ResiduoEstado
  observaciones?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface RegisterResiduoPayload {
  tipo: ResiduoTipo
  descripcion: string
  sector?: string
  responsable: string
  retiro_programado?: string
  observaciones?: string
}

export type AlertaTipo =
  | 'stock_bajo'
  | 'agotado'
  | 'vencido'
  | 'proximo_vencimiento'

export interface ReporteAlerta {
  tipo: AlertaTipo
  item: InventoryItem
}

export type DocumentoCategoria = 'MSDS' | 'SOP' | 'COA' | 'Protocolo' | 'Otro'

export interface Documento {
  id: number
  titulo: string
  categoria: DocumentoCategoria
  codigo?: string | null
  descripcion?: string | null
  nombre_archivo?: string | null
  tamano?: number | null
  createdAt?: string
  updatedAt?: string
}

export interface ResumenReporte {
  totalItems: number
  totalStock: number
  bajoStock: number
  porCategoria: { categoria: string; cantidad: number }[]
  porTipo: { tipo_movimiento: string; cantidad: number }[]
  recientes: Movimiento[]
}

export interface Muestra {
  id: number
  tipo: string
  fecha_ingreso?: string | null
  numero_ingreso?: string | null
  numero_protocolo?: string | null
  propietario?: string | null
  renspa?: string | null
  veterinario?: string | null
  establecimiento?: string | null
  ubicacion?: string | null
  departamento?: string | null
  especie?: string | null
  cantidad_muestras: number
  positivos: number
  sospechosos: number
  negativos: number
  fecha_resultado?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface Notificacion {
  id: number
  titulo: string
  mensaje: string
  tipo: string
  itemId?: number | null
  leida: boolean
  createdAt?: string
}

export type ProyectoEstado = 'En ejecución' | 'Finalizado' | 'Suspendido'

export interface Proyecto {
  id: number
  codigo?: string | null
  titulo: string
  descripcion?: string | null
  director?: string | null
  estado: ProyectoEstado
  fecha_inicio?: string | null
  fecha_fin?: string | null
  createdAt?: string
  updatedAt?: string
}
