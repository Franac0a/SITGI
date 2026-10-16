import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Item } from "./Item.model.js";

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

// Ítem del inventario al que se repone; se completa al pedirlo o al ingresarlo.
Item.hasMany(Pedido, { foreignKey: "itemId", sourceKey: "id" });
Pedido.belongsTo(Item, {
  foreignKey: "itemId",
  targetKey: "id",
  as: "item",
  onDelete: "SET NULL",
});

export default Pedido;
