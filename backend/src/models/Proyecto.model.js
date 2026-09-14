import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Proyecto = sequelize.define(
  "Proyecto",
  {
    codigo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "El título es obligatorio" },
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    director: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM("En ejecución", "Finalizado", "Suspendido"),
      allowNull: false,
      defaultValue: "En ejecución",
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "proyectos",
  },
);

export default Proyecto;
