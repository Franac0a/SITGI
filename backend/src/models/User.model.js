import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { encriptarContraseña } from "../helpers/bcrypt.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dni: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "El DNI es obligatorio" },
      },
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "El nombre completo es obligatorio" },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: "Debe ingresar un correo electrónico válido" },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rol: {
      type: DataTypes.ENUM(
        "Administración",
        "Inventario",
        "Investigador",
        "Dirección",
      ),
      defaultValue: "Investigador",
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "activo", "rechazado"),
      defaultValue: "pendiente",
      allowNull: false,
    },
    /* 
  RECORDATORIO: Descomentar y ajustar 'sector' cuando se releven los laboratorios y áreas físicas del CIT.
  sector: {
    type: DataTypes.STRING,
    allowNull: true
  } 
  */
  },
  {
    timestamps: true,
    tableName: "usuarios",
    hooks: {
      beforeSave: async (user) => {
        if (user.changed("password")) {
          user.password = await encriptarContraseña(user.password);
        }
      },
    },
  },
);

export default User;
