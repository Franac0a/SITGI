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
  id: string
  code: string
  name: string
  casNumber?: string
  brand?: string
  batchNumber?: string
  category: string
  location: string
  currentStock: number
  minStock: number
  unit: string
  expirationDate?: string
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
