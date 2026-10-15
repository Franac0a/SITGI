import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Item } from "./Item.model.js";

export const Movimiento = sequelize.define(
  "Movimiento",
  {
    tipo_movimiento: {
      type: DataTypes.ENUM(
        "Ingreso",
        "Egreso",
        "Ajuste",
        "Reparación",
        "Baja",
        "Reposición",
        "Cambio de ubicación",
      ),
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    fecha_movimiento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    sector: {
      type: DataTypes.STRING,
      allowNull: true, // Sector/área donde se origina o consume el movimiento
    },
    origen_destino: {
      type: DataTypes.STRING,
      allowNull: true, // proveedor, institución u otro origen/destino
    },
    costo_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    responsable: {
      type: DataTypes.STRING,
      allowNull: false, // quién realiza la acción
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true, // notas libres
    },
  },
  {
    timestamps: true,
    tableName: "movimientos",
  },
);

// Relaciones
Item.hasMany(Movimiento, {
  foreignKey: "itemId",
  sourceKey: "id",
});

Movimiento.belongsTo(Item, {
  foreignKey: "itemId",
  targetKey: "id",
});
