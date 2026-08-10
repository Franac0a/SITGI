import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Item = sequelize.define(
  "Item",
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "El nombre del elemento es obligatorio" },
      },
    },
    codigo_identificacion: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    categoria: {
      type: DataTypes.ENUM(
        "Reactivos y drogas",
        "Insumos de uso diario",
        "Material refrigerado",
        "Muestras biológicas",
        "Elementos sensibles",
      ),
      allowNull: false,
    },
    stock_actual: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    stock_minimo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    ubicacion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fecha_vencimiento: {
      type: DataTypes.DATEONLY, // (AAAA-MM-DD)
      allowNull: true,
    },
    detalles_tecnicos: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    timestamps: true,
    paranoid: true,
    tableName: "items",
  },
);

export default Item;
