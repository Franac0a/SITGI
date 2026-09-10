export type InventoryItemType = 'reactivo' | 'insumo' | 'material' | 'equipo' | string

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

export interface MovementRecord {
  id: string
  code: string
  timestamp: string
  type: 'ingreso' | 'retiro' | 'descarte' | 'ajuste'
  itemCode: string
  itemName: string
  quantity: number
  previousStock: number
  newStock: number
  unit: string
  userId: number
  userName: string
  userRole: string
  projectId?: string
  projectName?: string
  reason?: string
}

export interface ResearchProject {
  id: string
  code: string
  title: string
  description?: string
  director: string
  status: 'en_ejecucion' | 'finalizado' | 'suspendido'
  startDate?: string
  endDate?: string
  reagentsCount: number
}

export interface ReservationRequest {
  id: string
  code: string
  equipmentOrItemName: string
  equipmentOrItemCode: string
  researcherName: string
  date: string
  shift: string
  laboratory: string
  status: 'aprobada' | 'pendiente' | 'rechazada' | 'cancelada'
}

export interface SystemAlert {
  id: string
  type: 'critica' | 'advertencia' | 'informativa'
  title: string
  description: string
  timestamp: string
  read: boolean
  linkPath?: string
}
