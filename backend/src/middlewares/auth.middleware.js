import jwt from "jsonwebtoken";
import { UserModel } from "../models/User.model.js";

export const verificarAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ mensaje: "No hay token, acceso denegado." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await UserModel.findByPk(decoded.id);
    if (!usuario) {
      return res
        .status(401)
        .json({ mensaje: "Usuario no válido en la base de datos." });
    }

    if (usuario.estado !== "activo") {
      return res.status(403).json({
        mensaje:
          "Su cuenta no se encuentra activa en el sistema o está pendiente de aprobación.",
      });
    }

    req.usuario = {
      id: usuario.id,
      rol: usuario.rol,
      email: usuario.email,
      estado: usuario.estado,
    };

    next();
  } catch (error) {
    console.error("Error en el middleware verificarAuth:", error.message);
    return res.status(403).json({ mensaje: "Token inválido o expirado." });
  }
};

export const verificarUsuario = verificarAuth;

export const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(500).json({
        mensaje: "Se intentó verificar el rol sin autenticar primero.",
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        mensaje: `Acceso restringido. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(", ")}.`,
      });
    }

    next();
  };
};

export const soloDireccion = (req, res, next) => {
  if (req.usuario.rol !== "Dirección") {
    return res.status(403).json({
      mensaje:
        "Acceso restringido: acción exclusiva para la Dirección del CIT.",
    });
  }
  next();
};
