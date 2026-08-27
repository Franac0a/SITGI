import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { UserModel } from "./User.model.js";

export const Item = sequelize.define(
  "Item",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "El nombre del elemento es obligatorio" },
      },
    },
    tipoElemento: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "reactivo",
    },
    codigo_identificacion: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    numeroCAS: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    marcaFabricante: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    numeroLote: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cantidadInicial: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "La cantidad inicial debe ser mayor o igual a 0",
        },
      },
    },
    stockActual: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "El stock actual no puede ser negativo",
        },
      },
    },
    stock_actual: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    unidadMedida: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "u",
    },
    stockMinimo: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "El stock mínimo no puede ser negativo",
        },
      },
    },
    stock_minimo: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    laboratorioUbicacion: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Laboratorio Central",
    },
    ubicacion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    categoria: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fechaVencimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    fecha_vencimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM(
        "disponible",
        "bajo_stock",
        "agotado",
        "vencido",
        "activo",
      ),
      defaultValue: "disponible",
      allowNull: false,
    },
    creadoPor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "usuarios", key: "id" },
    },
    detalles_tecnicos: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
  },
  {
    timestamps: true,
    paranoid: true,
    tableName: "items",
    hooks: {
      beforeSave: (item) => {
        // Sincronizar campos legacy / alias
        if (item.stockActual !== undefined) {
          item.stock_actual = item.stockActual;
        } else if (item.stock_actual !== undefined) {
          item.stockActual = item.stock_actual;
        }

        if (item.stockMinimo !== undefined) {
          item.stock_minimo = item.stockMinimo;
        } else if (item.stock_minimo !== undefined) {
          item.stockMinimo = item.stock_minimo;
        }

        if (item.laboratorioUbicacion !== undefined) {
          item.ubicacion = item.laboratorioUbicacion;
        } else if (item.ubicacion !== undefined) {
          item.laboratorioUbicacion = item.ubicacion;
        }

        if (item.fechaVencimiento !== undefined) {
          item.fecha_vencimiento = item.fechaVencimiento;
        } else if (item.fecha_vencimiento !== undefined) {
          item.fechaVencimiento = item.fecha_vencimiento;
        }

        if (!item.categoria && item.tipoElemento) {
          item.categoria = item.tipoElemento;
        }
      },
    },
  },
);

Item.belongsTo(UserModel, { foreignKey: "creadoPor", as: "creador" });

export default Item;
