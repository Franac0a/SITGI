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
      unique: true, // T 01, CIT-Fsa 01, o autogenerado
    },
    categoria: {
      type: DataTypes.STRING,
      allowNull: false, // "Herramientas", "Droguero", "Brucelosis", etc.
    },
    marca: {
      type: DataTypes.STRING,
      allowNull: true, // Absorbe las marcas de Brucelosis y Droguero
    },
    stock_actual: {
      type: DataTypes.FLOAT, // Soporta fracciones si en el futuro fraccionan drogas
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    stock_minimo: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 5,
    },
    unidad_medida: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Unidad",
    },
    ubicacion: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Sin asignar",
    },
    detalles_tecnicos: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      // Acá guardamos dinámicamente:
      // - Brucelosis: { "n_inventario": "...", "n_serie": "...", "criticidad": "x" }
      // - Vidrio: { "material": "Borosilicato", "capacidad": "1 Lt" }
      // - Droguero: { "presentacion": "500 GR", "letra": "A" }
    },
  },
  {
    timestamps: true,
    paranoid: true, // Mantiene el historial si alguien borra un registro por error
    tableName: "items",
  },
);

export default Item;
