import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Notificacion } from "./Notificacion.model.js";

// Qué notificaciones leyó cada usuario. Así, si un usuario marca los avisos
// como leídos, al resto le siguen apareciendo sin leer.
export const NotificacionLeida = sequelize.define(
  "NotificacionLeida",
  {
    notificacionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    updatedAt: false,
    tableName: "notificaciones_leidas",
    // Un usuario lee cada notificación una sola vez.
    indexes: [{ unique: true, fields: ["notificacionId", "usuarioId"] }],
  },
);

Notificacion.hasMany(NotificacionLeida, { foreignKey: "notificacionId", as: "lecturas" });

export default NotificacionLeida;
