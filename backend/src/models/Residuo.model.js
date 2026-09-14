import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Residuo = sequelize.define(
  "Residuo",
  {
    tipo: {
      type: DataTypes.ENUM(
        "Patológico",
        "Químico",
        "Tóxico",
        "Biológico",
        "Otro",
      ),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "La descripción del residuo es obligatoria" },
      },
    },
    sector: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    responsable: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "El responsable es obligatorio" },
      },
    },
    retiro_programado: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM("Pendiente", "Retirado"),
      allowNull: false,
      defaultValue: "Pendiente",
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "residuos",
  },
);

export default Residuo;
