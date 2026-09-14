import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Muestra = sequelize.define(
  "Muestra",
  {
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
      // "Brucelosis", "Campilobacteriosis", "Anemia Infecciosa Equina"
    },
    fecha_ingreso: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    numero_ingreso: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    numero_protocolo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    propietario: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    renspa: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    veterinario: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    establecimiento: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ubicacion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    departamento: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    especie: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cantidad_muestras: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    positivos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    sospechosos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    negativos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    fecha_resultado: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "muestras",
  },
);

export default Muestra;
