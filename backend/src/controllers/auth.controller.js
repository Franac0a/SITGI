import { UserModel } from "../models/User.model.js";
import { generarToken } from "../helpers/jwt.helper.js";
import {
  encriptarContraseña,
  compararContraseña,
} from "../helpers/bcrypt.helper.js";

import { detalleError } from "../helpers/error.helper.js";
export const registrarUsuario = async (req, res) => {
  try {
    const { dni, nombre, email, password } = req.body;

    if (!dni || !nombre || !email || !password) {
      return res.status(400).json({
        mensaje: "DNI, nombre, email y contraseña son obligatorios.",
      });
    }
    if (String(password).length < 8) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener al menos 8 caracteres.",
      });
    }

    const existeEmail = await UserModel.findOne({ where: { email } });
    if (existeEmail) {
      return res
        .status(400)
        .json({ mensaje: "El correo electrónico ya está registrado." });
    }

    const existeDni = await UserModel.findOne({ where: { dni } });
    if (existeDni) {
      return res
        .status(400)
        .json({ mensaje: "El DNI ingresado ya está asociado a otra cuenta." });
    }

    const hash = await encriptarContraseña(password);

    const nuevoUsuario = await UserModel.create({
      dni,
      nombre,
      email,
      password: hash,
      rol: "Investigador",
    });

    res.status(201).json({
      mensaje:
        "Solicitud de registro enviada con éxito. Su cuenta está pendiente de aprobación por la Dirección del CIT.",
      usuario: {
        id: nuevoUsuario.id,
        dni: nuevoUsuario.dni,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
        estado: nuevoUsuario.estado,
      },
    });
  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({
      mensaje: "Error interno en el servidor al registrar.",
      ...detalleError(error),
    });
  }
};

export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ mensaje: "Email y contraseña son obligatorios." });
    }

    const usuario = await UserModel.findOne({ where: { email } });
    // Mismo mensaje si el usuario no existe o la contraseña es incorrecta,
    // para no revelar qué correos están registrados.
    const passwordValido = usuario
      ? await compararContraseña(password, usuario.password)
      : false;
    if (!usuario || !passwordValido) {
      return res.status(401).json({ mensaje: "Credenciales inválidas." });
    }

    if (usuario.estado === "pendiente") {
      return res.status(403).json({
        mensaje:
          "Tu cuenta aún está siendo revisada y pendiente de aprobación por la Dirección del CIT.",
      });
    }

    if (usuario.estado === "rechazado") {
      return res.status(403).json({
        mensaje: "Su solicitud de acceso ha sido rechazada por la institución.",
      });
    }

    const token = generarToken({ id: usuario.id, rol: usuario.rol });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      mensaje: "Inicio de sesión exitoso.",
      usuario: {
        id: usuario.id,
        dni: usuario.dni,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        estado: usuario.estado,
      },
      token,
    });
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({
      mensaje: "Error interno en el servidor al iniciar sesión.",
      ...detalleError(error),
    });
  }
};

export const logoutUsuario = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ mensaje: "Sesión cerrada correctamente." });
};
