import { UserModel } from "../models/User.model.js";

// 1. Obtener lista de usuarios (con filtros por query, ej: /api/users?estado=pendiente)
export const obtenerUsuarios = async (req, res) => {
  try {
    const { estado, rol } = req.query;
    const filtro = {};

    if (estado) filtro.estado = estado;
    if (rol) filtro.rol = rol;

    const usuarios = await User.findAll({
      where: filtro,
      attributes: { exclude: ["password"] }, // Nunca enviamos contraseñas al frontend
      order: [["createdAt", "DESC"]],
    });

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener la lista de usuarios.",
      detalle: error.message,
    });
  }
};

// 2. Gestionar estado y rol (Acción exclusiva de la Directora del CIT)
export const gestionarEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, rol } = req.body; // estado puede ser "activo", "rechazado" o "pendiente"

    const usuario = await User.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    // La Directora puede aprobar el estado y, si quiere, corregirle el rol en el mismo paso
    if (estado) usuario.estado = estado;
    if (rol) usuario.rol = rol;

    await usuario.save();

    res.json({
      mensaje: `Usuario actualizado correctamente a estado '${usuario.estado}'.`,
      usuario: {
        id: usuario.id,
        dni: usuario.dni,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        estado: usuario.estado,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al actualizar el estado del usuario.",
      detalle: error.message,
    });
  }
};
