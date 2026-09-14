import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Item } from "./Item.model.js";

export const Movimiento = sequelize.define(
  "Movimiento",
  {
    tipo_movimiento: {
      type: DataTypes.ENUM("Ingreso", "Egreso", "Ajuste", "Reparación"),
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    fecha_movimiento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    origen_destino: {
      type: DataTypes.STRING,
      allowNull: true, // Para casos como "INTA Mercedes" o proveedores específicos
    },
    costo_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, // Para el área de Bovinos Insumos y Adquisiciones
    },
    responsable: {
      type: DataTypes.STRING,
      allowNull: false, // Para registrar quién realiza la acción (ej: Laura)
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true, // Para anotar tratamientos, pacientes (Manchita) o fallas
    },
  },
  {
    timestamps: true,
    tableName: "movimientos",
  },
);

// Definición de las relaciones de base de datos
Item.hasMany(Movimiento, {
  foreignKey: "itemId",
  sourceKey: "id",
});

Movimiento.belongsTo(Item, {
  foreignKey: "itemId",
  targetKey: "id",
});
