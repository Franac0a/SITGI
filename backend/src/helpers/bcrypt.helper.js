import bcrypt from "bcrypt";

// Misma regla para registrarse, cambiar la contraseña o restablecerla.
export const MENSAJE_PASSWORD_CORTA = "La contraseña debe tener al menos 8 caracteres.";
export const passwordCorta = (password) => String(password ?? "").length < 8;

export const encriptarContraseña = async (contraseña) => {
  const saltRounds = 10;
  return await bcrypt.hash(contraseña, saltRounds);
};

export const compararContraseña = async (contraseña, hash) => {
  return await bcrypt.compare(contraseña, hash);
};
