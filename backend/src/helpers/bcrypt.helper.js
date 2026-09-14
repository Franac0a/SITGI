import bcrypt from "bcrypt";

export const encriptarContraseña = async (contraseña) => {
  const saltRounds = 10;
  return await bcrypt.hash(contraseña, saltRounds);
};

export const compararContraseña = async (contraseña, hash) => {
  return await bcrypt.compare(contraseña, hash);
};
