import { Item } from "../models/Item.model.js";
import { Op, Sequelize } from "sequelize";

// 1. GET: Obtener todos los ítems activos (Soporta filtros por categoría y por stock bajo)
export const obtenerItems = async (req, res) => {
  try {
    const { categoria, stock_bajo, ubicacion } = req.query;
    const filtro = {};

    if (categoria) filtro.categoria = categoria;
    if (ubicacion) filtro.ubicacion = { [Op.like]: `%${ubicacion}%` };
    if (stock_bajo === "true") {
      filtro.stock_actual = { [Op.lte]: Sequelize.col("stock_minimo") };
    }

    const items = await Item.findAll({
      where: filtro,
      order: [["nombre", "ASC"]],
    });

    res.status(200).json({ total: items.length, items });
  } catch (error) {
    console.error("Error al obtener ítems:", error.message);
    res.status(500).json({
      mensaje: "Error interno al listar el inventario.",
      error: error.message,
    });
  }
};

// 2. GET por ID: Obtener el detalle individual de un producto
export const obtenerItemPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByPk(id);

    if (!item) {
      return res
        .status(404)
        .json({ mensaje: "El ítem solicitado no existe en el inventario." });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error("Error al obtener ítem por ID:", error.message);
    res
      .status(500)
      .json({ mensaje: "Error al buscar el ítem.", error: error.message });
  }
};

// 3. POST: Crear un nuevo reactivo o insumo
export const crearItem = async (req, res) => {
  try {
    const nuevoItem = await Item.create(req.body);
    res.status(201).json({
      mensaje: "Ítem agregado al inventario con éxito.",
      item: nuevoItem,
    });
  } catch (error) {
    console.error("Error al crear ítem:", error.message);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        mensaje:
          "El código de identificación ingresado ya existe en el sistema.",
      });
    }
    res
      .status(500)
      .json({ mensaje: "Error al guardar el ítem.", error: error.message });
  }
};

// 4. PUT: Modificar stock, ubicación o detalles técnicos
export const actualizarItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({ mensaje: "Ítem no encontrado." });
    }

    await item.update(req.body);
    res.status(200).json({ mensaje: "Ítem actualizado correctamente.", item });
  } catch (error) {
    console.error("Error al actualizar ítem:", error.message);
    res
      .status(500)
      .json({ mensaje: "Error al actualizar el ítem.", error: error.message });
  }
};

// 5. DELETE: Borrado lógico para mantener la trazabilidad científica
export const eliminarItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({ mensaje: "Ítem no encontrado." });
    }

    await item.destroy();
    res.status(200).json({
      mensaje:
        "Ítem dado de baja del inventario correctamente (Trazabilidad archivada).",
    });
  } catch (error) {
    console.error("Error al eliminar ítem:", error.message);
    res
      .status(500)
      .json({ mensaje: "Error al eliminar el ítem.", error: error.message });
  }
};

// =========================================================================
// SECCIÓN DE TRAZABILIDAD (NUEVAS FUNCIONES)
// =========================================================================

// 6. GET: Obtener SÓLO los ítems eliminados para la vista de Trazabilidad
export const obtenerItemsEliminados = async (req, res) => {
  try {
    const itemsBorrados = await Item.findAll({
      where: {
        deletedAt: { [Op.ne]: null },
      },
      paranoid: false, // Obliga a Sequelize a buscar también entre los eliminados
      order: [["deletedAt", "DESC"]],
    });

    res.status(200).json({ total: itemsBorrados.length, items: itemsBorrados });
  } catch (error) {
    console.error("Error al obtener ítems en trazabilidad:", error.message);
    res.status(500).json({
      mensaje: "Error al cargar el archivo de trazabilidad.",
      error: error.message,
    });
  }
};

// 7. PUT: Restaurar un ítem eliminado por error (Revivirlo al inventario activo)
export const restaurarItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByPk(id, { paranoid: false });

    if (!item) {
      return res
        .status(404)
        .json({ mensaje: "El ítem no existe en el registro histórico." });
    }

    if (!item.deletedAt) {
      return res.status(400).json({
        mensaje: "Este ítem ya se encuentra activo en el inventario.",
      });
    }

    await item.restore(); // Sequelize borra la fecha de deletedAt y el ítem vuelve al catálogo

    res.status(200).json({
      mensaje:
        "Ítem restaurado con éxito. Ya está visible en el inventario principal.",
      item,
    });
  } catch (error) {
    console.error("Error al restaurar ítem:", error.message);
    res.status(500).json({
      mensaje: "Error al intentar restaurar el ítem.",
      error: error.message,
    });
  }
};
