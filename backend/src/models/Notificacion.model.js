import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Notificacion = sequelize.define(
  "Notificacion",
  {
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "info",
      // "warning" (stock bajo), "info", "success"
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // true cuando el stock del ítem se repuso y el aviso ya no está vigente.
    // Lo que lee cada usuario se guarda aparte, en NotificacionLeida.
    resuelta: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: "notificaciones",
  },
);

export default Notificacion;
