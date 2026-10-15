import { UserModel } from "../models/User.model.js";

import { detalleError } from "../helpers/error.helper.js";
const ESTADOS_USUARIO = ["pendiente", "activo", "rechazado"];
const ROLES_USUARIO = ["Administración", "Inventario", "Investigador", "Dirección"];

export const obtenerUsuarios = async (req, res) => {
  try {
    const { estado, rol } = req.query;
    const filtro = {};

    if (estado) filtro.estado = estado;
    if (rol) filtro.rol = rol;

    const usuarios = await UserModel.findAll({
      where: filtro,
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener la lista de usuarios.",
      ...detalleError(error),
    });
    console.log("Error al obtener la lista de usuarios");
  }
};

export const gestionarEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, rol } = req.body;

    if (estado !== undefined && !ESTADOS_USUARIO.includes(estado)) {
      return res.status(400).json({ error: "Estado de usuario inválido." });
    }
    if (rol !== undefined && !ROLES_USUARIO.includes(rol)) {
      return res.status(400).json({ error: "Rol de usuario inválido." });
    }

    const usuario = await UserModel.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    // Evita que la Dirección se quite el acceso a sí misma por error.
    if (usuario.id === req.usuario.id) {
      return res.status(400).json({
        error: "No podés modificar tu propio estado o rol.",
      });
    }

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
      ...detalleError(error),
    });
  }
};
