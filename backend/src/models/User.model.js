import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js"; // Verifica que la ruta a tu db.js sea correcta

// Usamos 'export const UserModel' para que coincida con tus importaciones entre llaves
export const UserModel = sequelize.define(
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
  },
  {
    timestamps: true,
    tableName: "usuarios",
  },
);
