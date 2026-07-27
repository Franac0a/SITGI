import { UserModel } from "../models/User.model.js"; // Asegúrate de que el export en tu modelo sea: export const UserModel
import { generarToken } from "../helpers/jwt.helper.js";
import {
  encriptarContraseña,
  compararContraseña,
} from "../helpers/bcrypt.helper.js";

export const registrarUsuario = async (req, res) => {
  try {
    const { dni, nombre, email, password, rol } = req.body;

    // Validaciones de existencia en la base de datos del CIT
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

    // Encriptamos la contraseña directamente acá
    const hash = await encriptarContraseña(password);

    // Creamos el usuario (nace con estado 'pendiente' según el modelo)
    const nuevoUsuario = await UserModel.create({
      dni,
      nombre,
      email,
      password: hash,
      rol: rol || "Investigador",
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
      error: error.message,
    });
  }
};

export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await UserModel.findOne({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado." });
    }

    const passwordValido = await compararContraseña(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta." });
    }

    // Filtro institucional: verificamos si la Directora ya aprobó la cuenta
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

    // Si está 'activo', generamos token y cookie
    const token = generarToken({ id: usuario.id, rol: usuario.rol });
    res.cookie("token", token, { httpOnly: true });

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
      error: error.message,
    });
  }
};

export const logoutUsuario = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ mensaje: "Sesión cerrada correctamente." });
};
