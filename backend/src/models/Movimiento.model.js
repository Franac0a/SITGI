import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { UserModel } from "./User.model.js";
import { Item } from "./Item.model.js";

export const MovimientoModel = sequelize.define(
  "Movimiento",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipo: {
      type: DataTypes.ENUM("ingreso", "retiro", "descarte", "devolucion"),
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: "La cantidad del movimiento debe ser al menos 1 unidad.",
        },
      },
    },
    motivo_proyecto: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Consumo general de laboratorio",
    },
    stock_anterior: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stock_posterior: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "usuarios", key: "id" },
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "items", key: "id" },
    },
  },
  {
    timestamps: true,
    tableName: "movimientos",
  },
);

MovimientoModel.belongsTo(UserModel, {
  foreignKey: "usuario_id",
  as: "usuario",
});
MovimientoModel.belongsTo(Item, { foreignKey: "item_id", as: "item" });
