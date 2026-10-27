// Tipos de los datos que devuelve el backend.
// Los nombres de los campos son los mismos que usa la API.

// ---------- Usuarios ----------

export type Rol =
  | 'Administración'
  | 'Inventario'
  | 'Investigador'
  | 'Dirección'
  | 'Responsable de área'
  | 'Técnico/Becario'

export type EstadoUsuario = 'pendiente' | 'activo' | 'rechazado'

export interface Usuario {
  id: number
  dni: string
  nombre: string
  email: string
  rol: Rol
  estado: EstadoUsuario
}

// ---------- Inventario ----------

// Datos que cambian según el tipo de ítem. Los que vienen del Excel del CIT pueden
// traer otros, como la letra del droguero o el número de serie de un equipo.
export interface DetallesTecnicos {
  codigoCas?: string
  fechaVencimiento?: string
  numeroLote?: string
  observaciones?: string
  [clave: string]: string | undefined
}

export interface Item {
  id: number
  nombre: string
  codigo_identificacion: string | null
  categoria: string
  marca: string | null
  stock_actual: number
  stock_minimo: number
  unidad_medida: string
  ubicacion: string | null
  condicion_almacenamiento: string | null
  detalles_tecnicos: DetallesTecnicos
  // El backend copia estos datos de detalles_tecnicos al listar o buscar un ítem.
  codigoCas?: string
  fechaVencimiento?: string
  numeroLote?: string
  observaciones?: string
}

// Lo que se manda al crear o editar un ítem.
export interface DatosItem {
  nombre: string
  categoria: string
  // Solo al crear. Después el stock cambia únicamente con movimientos.
  stock_actual?: number
  unidad_medida: string
  ubicacion: string
  stock_minimo?: number
  marca?: string
  condicion_almacenamiento?: string
  codigoCas?: string
  fechaVencimiento?: string
  numeroLote?: string
  observaciones?: string
}

// ---------- Movimientos ----------

export type TipoMovimiento =
  | 'Ingreso'
  | 'Egreso'
  | 'Ajuste'
  | 'Reparación'
  | 'Baja'
  | 'Reposición'
  | 'Cambio de ubicación'

export interface Movimiento {
  id: number
  itemId: number
  tipo_movimiento: TipoMovimiento
  cantidad: number
  fecha_movimiento: string
  sector: string | null
  origen_destino: string | null
  responsable: string
  observaciones: string | null
  createdAt: string
  Item?: {
    nombre: string
    codigo_identificacion: string | null
    unidad_medida: string
  }
}

export interface DatosMovimiento {
  itemId: string
  tipo_movimiento: TipoMovimiento
  cantidad?: number
  sector?: string
  nueva_ubicacion?: string
  origen_destino?: string
  costo_unitario?: number
  observaciones?: string
}

export interface FiltrosMovimientos {
  itemId?: string
  sector?: string
  tipo?: string
  responsable?: string
  desde?: string
  hasta?: string
}

// ---------- Sectores ----------

export interface Sector {
  id: number
  nombre: string
  tipo: string
  descripcion: string | null
}

// ---------- Pedidos ----------

export type EstadoPedido = 'Pendiente' | 'Aprobado' | 'Ingresado'

export interface Pedido {
  id: number
  item_nombre: string
  itemId: number | null
  item: {
    nombre: string
    codigo_identificacion: string | null
    stock_actual: number
  } | null
  cantidad: number
  sector: string | null
  estado: EstadoPedido
  responsable: string
  observaciones: string | null
}

export interface DatosPedido {
  item_nombre: string
  itemId?: number
  cantidad: number
  sector?: string
  observaciones?: string
}

// ---------- Residuos ----------

export type TipoResiduo = 'Patológico' | 'Químico' | 'Tóxico' | 'Biológico' | 'Otro'
export type EstadoResiduo = 'Pendiente' | 'Retirado'

export interface Residuo {
  id: number
  tipo: TipoResiduo
  descripcion: string
  sector: string | null
  responsable: string
  retiro_programado: string | null
  estado: EstadoResiduo
  observaciones: string | null
}

export interface DatosResiduo {
  tipo: TipoResiduo
  descripcion: string
  sector?: string
  retiro_programado?: string
  observaciones?: string
}

// ---------- Muestras ----------

export interface Muestra {
  id: number
  tipo: string
  fecha_ingreso: string | null
  numero_ingreso: string | null
  propietario: string | null
  establecimiento: string | null
  especie: string | null
  cantidad_muestras: number
  positivos: number
  sospechosos: number
  negativos: number
  // Mientras no tenga fecha de resultado, el diagnóstico está pendiente.
  fecha_resultado: string | null
}

// Lo que se manda al registrar el ingreso de una muestra.
export interface DatosMuestra {
  tipo: string
  fecha_ingreso: string
  cantidad_muestras: number
  numero_ingreso?: string
  numero_protocolo?: string
  propietario?: string
  renspa?: string
  veterinario?: string
  establecimiento?: string
  ubicacion?: string
  departamento?: string
  especie?: string
}

export interface ResultadoMuestra {
  positivos: number
  sospechosos: number
  negativos: number
  fecha_resultado: string
}

// ---------- Proyectos ----------

export type EstadoProyecto = 'En ejecución' | 'Finalizado' | 'Suspendido'

export interface Proyecto {
  id: number
  codigo: string | null
  titulo: string
  descripcion: string | null
  director: string | null
  estado: EstadoProyecto
}

export interface DatosProyecto {
  titulo: string
  codigo?: string
  descripcion?: string
  director?: string
  estado: EstadoProyecto
  fecha_inicio?: string
}

// ---------- Documentos ----------

export type CategoriaDocumento = 'MSDS' | 'SOP' | 'COA' | 'Protocolo' | 'Otro'

export interface Documento {
  id: number
  titulo: string
  categoria: CategoriaDocumento
  codigo: string | null
  descripcion: string | null
  nombre_archivo: string | null
  tamano: number | null
}

export interface DatosDocumento {
  titulo: string
  categoria: CategoriaDocumento
  codigo?: string
  descripcion?: string
  archivo?: File
}

// ---------- Reportes ----------

export type TipoAlerta = 'stock_bajo' | 'agotado' | 'vencido' | 'proximo_vencimiento'

export interface Alerta {
  tipo: TipoAlerta
  item: Item
}

export interface Resumen {
  totalItems: number
  totalStock: number
  bajoStock: number
  porCategoria: { categoria: string; cantidad: number }[]
  recientes: Movimiento[]
}

export interface FilaRotacion {
  itemId: number
  nombre: string
  codigo_identificacion: string | null
  unidad_medida: string | null
  consumo: number
  movimientos: number
  stock_actual: number
  dias_cobertura: number | null
}

// Consumos (egresos, bajas y reparaciones) de un sector en el período.
// sector es null para los consumos que se registraron sin sector.
export interface ConsumoSector {
  sector: string | null
  consumos: number
  elementos: number
}

export interface FiltrosReporte {
  // El ítem solo se usa en el CSV de movimientos.
  itemId?: string
  categoria?: string
  sector?: string
  desde?: string
  hasta?: string
}

// ---------- Notificaciones ----------

// Avisos que crea el backend (por ejemplo, stock bajo).
export interface Notificacion {
  id: number
  titulo: string
  mensaje: string
  leida: boolean
}

// ---------- Formularios ----------

// Opción de un <select>.
export interface Opcion {
  valor: string
  texto: string
}
