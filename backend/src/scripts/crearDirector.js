// Crea el usuario Dirección inicial, o lo reactiva si ya existe.
import { startDB, sequelize } from "../config/db.js";
import { asegurarDirector } from "../seed/cargar.js";

const inicializarDirector = async () => {
  try {
    await startDB();
    await sequelize.sync();

    const director = await asegurarDirector();
    if (director.creado) {
      console.log(`Usuario Dirección creado: ${director.email}`);
      if (director.passwordGenerada) {
        console.log(
          `Contraseña generada (anotala, no se vuelve a mostrar): ${director.passwordGenerada}`,
        );
      }
    } else {
      director.usuario.estado = "activo";
      director.usuario.rol = "Dirección";
      await director.usuario.save();
      console.log(`El usuario ${director.email} ya existía: quedó activo y con rol Dirección.`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error al crear el director inicial:", error);
    process.exit(1);
  }
};

inicializarDirector();
