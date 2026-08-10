import { UserModel } from "../models/User.model.js";

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
      detalle: error.message,
    });
    console.log("Error al obtener la lista de usuarios");
  }
};

export const gestionarEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, rol } = req.body;

    const usuario = await UserModel.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado." });
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
      detalle: error.message,
    });
  }
};
