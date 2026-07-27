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
      allowNull: true, // Puede ser el código alfanumérico del droguero o número de lote
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
        min: 0, // Evitamos stocks negativos por error de tipeo
      },
    },
    stock_minimo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5, // Límite por defecto para disparar alertas de reposición
    },
    ubicacion: {
      type: DataTypes.STRING,
      allowNull: false, // Ej: "Droguero - Estante 3" o "Heladera 1 - Freezer"
    },
    fecha_vencimiento: {
      type: DataTypes.DATEONLY, // Solo fecha (AAAA-MM-DD), sin hora
      allowNull: true, // Puede ser nulo para insumos descartables de vidrio o plástico
    },
    detalles_tecnicos: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}, // JSON flexible: { "temperatura": "-20°C", "toxicidad": "Alta", etc. }
    },
  },
  {
    timestamps: true,
    paranoid: true, // ¡CLAVE PARA TRAZABILIDAD! Habilita el borrado lógico (deletedAt)
    tableName: "items",
  },
);

export default Item;
