import dotenv from "dotenv";
import { startDB, sequelize } from "../config/db.js";
import { UserModel } from "../models/User.model.js";
import { encriptarContraseña } from "../helpers/bcrypt.helper.js";

dotenv.config();

const inicializarDirector = async () => {
  try {
    await startDB();
    await sequelize.sync();

    const emailDirector = "director@citformosa.gob.ar";
    const existe = await UserModel.findOne({ where: { email: emailDirector } });

    if (existe) {
      existe.estado = "activo";
      existe.rol = "Dirección";
      await existe.save();
      console.log(`✅ El usuario ${emailDirector} ya existe y fue actualizado a estado 'activo' y rol 'Dirección'.`);
    } else {
      const passwordHash = await encriptarContraseña("Admin123!");
      await UserModel.create({
        dni: "11223344",
        nombre: "Director CIT Formosa",
        email: emailDirector,
        password: passwordHash,
        rol: "Dirección",
        estado: "activo",
      });
      console.log("✅ Usuario Director inicial creado con éxito.");
      console.log("-----------------------------------------");
      console.log("📧 Email: director@citformosa.gob.ar");
      console.log("🔑 Password: Admin123!");
      console.log("-----------------------------------------");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error al crear el director inicial:", error);
    process.exit(1);
  }
};

inicializarDirector();
