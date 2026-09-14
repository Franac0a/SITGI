import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Documento = sequelize.define(
  "Documento",
  {
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "El título es obligatorio" },
      },
    },
    categoria: {
      type: DataTypes.ENUM("MSDS", "SOP", "COA", "Protocolo", "Otro"),
      allowNull: false,
      defaultValue: "Otro",
    },
    codigo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    nombre_archivo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ruta_archivo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tamano: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "documentos",
  },
);

export default Documento;
