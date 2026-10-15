// Roles y permisos del sistema (fuente única para backend).

export const ROLES = [
  "Administración",
  "Inventario",
  "Investigador",
  "Dirección",
  "Responsable de área",
  "Técnico/Becario",
];

// Pueden gestionar inventario, registrar cualquier tipo de movimiento, residuos, documentos.
export const ROLES_GESTION = ["Administración", "Inventario", "Dirección"];

// Registran "usos permitidos": solo consumos (egresos).
export const ROLES_SOLO_EGRESO = ["Investigador", "Técnico/Becario"];

export const TIPOS_MOVIMIENTO = [
  "Ingreso",
  "Egreso",
  "Ajuste",
  "Reparación",
  "Baja",
  "Reposición",
  "Cambio de ubicación",
];

// Cómo afecta cada tipo al stock.
export const TIPOS_QUE_SUMAN = ["Ingreso", "Reposición"];
export const TIPOS_QUE_RESTAN = ["Egreso", "Reparación", "Baja"];

export const puedeRegistrarTipo = (rol, tipo) =>
  ROLES_GESTION.includes(rol) ||
  (ROLES_SOLO_EGRESO.includes(rol) && tipo === "Egreso");
