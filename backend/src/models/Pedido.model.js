import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Pedido = sequelize.define(
  "Pedido",
  {
    item_nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "El nombre del insumo es obligatorio" },
      },
    },
    cantidad: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    sector: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM("Pendiente", "Aprobado", "Ingresado"),
      allowNull: false,
      defaultValue: "Pendiente",
    },
    responsable: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "El responsable es obligatorio" },
      },
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "pedidos",
  },
);

export default Pedido;
