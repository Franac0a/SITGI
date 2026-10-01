import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Sector = sequelize.define(
  "Sector",
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "El nombre del sector es obligatorio" },
      },
    },
    tipo: {
      type: DataTypes.ENUM(
        "Laboratorio",
        "Heladera",
        "Droguero",
        "Estante",
        "Depósito",
        "Otro",
      ),
      allowNull: false,
      defaultValue: "Otro",
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "sectores",
  },
);

export default Sector;
