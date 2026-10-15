// En producción no se devuelve al cliente el detalle interno de los errores.
export const detalleError = (error) =>
  process.env.NODE_ENV === "production" ? {} : { error: error.message };
