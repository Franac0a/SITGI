// Cambia la contraseña de un usuario desde la consola del servidor.
// Sirve cuando nadie puede entrar a la app (por ejemplo, si se perdió la del director).
// Uso: npm run clave -- <email> <contraseña nueva>
import { startDB, sequelize } from "../config/db.js";
import { UserModel } from "../models/User.model.js";
import {
  encriptarContraseña,
  passwordCorta,
  MENSAJE_PASSWORD_CORTA,
} from "../helpers/bcrypt.helper.js";

const [email, nueva] = process.argv.slice(2);

const cambiarClave = async () => {
  if (!email || !nueva) {
    console.error("Uso: npm run clave -- <email> <contraseña nueva>");
    process.exit(1);
  }
  if (passwordCorta(nueva)) {
    console.error(MENSAJE_PASSWORD_CORTA);
    process.exit(1);
  }

  await startDB();
  const usuario = await UserModel.findOne({ where: { email } });
  if (!usuario) {
    console.error(`No existe ningún usuario con el email ${email}.`);
    await sequelize.close();
    process.exit(1);
  }

  usuario.password = await encriptarContraseña(nueva);
  await usuario.save();
  console.log(`Contraseña actualizada para ${usuario.email} (${usuario.rol}).`);
  await sequelize.close();
};

cambiarClave().catch((error) => {
  console.error("Error al cambiar la contraseña:", error);
  process.exit(1);
});
