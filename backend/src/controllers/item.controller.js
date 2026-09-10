import { Item } from "../models/Item.model.js";
import { Op, Sequelize } from "sequelize";

export const obtenerItems = async (req, res) => {
  try {
    const { categoria, stock_bajo, ubicacion, busqueda } = req.query;
    const filtro = {};

    if (categoria) filtro.categoria = categoria;
    if (ubicacion) filtro.ubicacion = { [Op.like]: `%${ubicacion}%` };
    if (stock_bajo === "true") {
      filtro.stock_actual = { [Op.lte]: Sequelize.col("stock_minimo") };
    }
    if (busqueda) {
      filtro[Op.or] = [
        { nombre: { [Op.like]: `%${busqueda}%` } },
        { codigo_identificacion: { [Op.like]: `%${busqueda}%` } },
      ];
    }

    const items = await Item.findAll({
      where: filtro,
      order: [["nombre", "ASC"]],
    });

    const itemsFormateados = items.map((it) => {
      const plain = it.toJSON();
      const detalles = plain.detalles_tecnicos || {};
      return {
        ...plain,
        codigoCas: detalles.codigoCas || plain.codigoCas,
        numeroCAS: detalles.codigoCas || plain.numeroCAS,
        fechaVencimiento: detalles.fechaVencimiento || plain.fechaVencimiento,
        numeroLote: detalles.numeroLote || plain.numeroLote,
        observaciones: detalles.observaciones || plain.observaciones,
      };
    });

    res.status(200).json({ total: itemsFormateados.length, items: itemsFormateados });
  } catch (error) {
    console.error("Error al obtener ítems:", error.message);
    res.status(500).json({
      mensaje: "Error interno al listar el inventario.",
      error: error.message,
    });
  }
};

export const obtenerItemPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByPk(id);

    if (!item) {
      return res
        .status(404)
        .json({ mensaje: "El ítem solicitado no existe en el inventario." });
    }

    const plain = item.toJSON();
    const detalles = plain.detalles_tecnicos || {};
    const itemFormateado = {
      ...plain,
      codigoCas: detalles.codigoCas || plain.codigoCas,
      numeroCAS: detalles.codigoCas || plain.numeroCAS,
      fechaVencimiento: detalles.fechaVencimiento || plain.fechaVencimiento,
      numeroLote: detalles.numeroLote || plain.numeroLote,
      observaciones: detalles.observaciones || plain.observaciones,
    };

    res.status(200).json(itemFormateado);
  } catch (error) {
    console.error("Error al obtener ítem por ID:", error.message);
    res
      .status(500)
      .json({ mensaje: "Error al buscar el ítem.", error: error.message });
  }
};

export const crearItem = async (req, res) => {
  try {
    const {
      nombre,
      tipo,
      categoria,
      marca,
      cantidadInicial,
      stock_actual,
      stockMinimo,
      stock_minimo,
      unidadMedida,
      unidad_medida,
      laboratorioUbicacion,
      ubicacion,
      codigoCas,
      numeroCAS,
      fechaVencimiento,
      numeroLote,
      observaciones,
      detalles_tecnicos,
    } = req.body;

    const categoriaFinal = categoria || tipo;
    if (!categoriaFinal) {
      return res.status(400).json({
        mensaje: "El campo categoría (o tipo) es obligatorio.",
      });
    }

    let codigo = req.body.codigo_identificacion;
    if (!codigo || codigo.trim() === "") {
      const prefijo = categoriaFinal.substring(0, 3).toUpperCase();
      const timestamp = Date.now().toString().slice(-4);
      const randomNum = Math.floor(100 + Math.random() * 900);
      codigo = `CIT-${prefijo}-${timestamp}${randomNum}`;
    }

    const stockActualFinal =
      stock_actual !== undefined
        ? Number(stock_actual)
        : cantidadInicial !== undefined
        ? Number(cantidadInicial)
        : 0;

    const stockMinimoFinal =
      stock_minimo !== undefined
        ? Number(stock_minimo)
        : stockMinimo !== undefined
        ? Number(stockMinimo)
        : 5;

    const unidadMedidaFinal = unidad_medida || unidadMedida || "Unidad";
    const ubicacionFinal = ubicacion || laboratorioUbicacion || "Sin asignar";

    const detallesFinales = {
      ...(detalles_tecnicos || {}),
      ...(codigoCas || numeroCAS ? { codigoCas: codigoCas || numeroCAS } : {}),
      ...(fechaVencimiento ? { fechaVencimiento } : {}),
      ...(numeroLote ? { numeroLote } : {}),
      ...(observaciones ? { observaciones } : {}),
    };

    const itemData = {
      nombre,
      codigo_identificacion: codigo,
      categoria: categoriaFinal,
      marca: marca || null,
      stock_actual: stockActualFinal,
      stock_minimo: stockMinimoFinal,
      unidad_medida: unidadMedidaFinal,
      ubicacion: ubicacionFinal,
      detalles_tecnicos: detallesFinales,
    };

    const nuevoItem = await Item.create(itemData);
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

export const actualizarItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({ mensaje: "Ítem no encontrado." });
    }

    const {
      nombre,
      tipo,
      categoria,
      marca,
      cantidadInicial,
      stock_actual,
      stockMinimo,
      stock_minimo,
      unidadMedida,
      unidad_medida,
      laboratorioUbicacion,
      ubicacion,
      codigoCas,
      numeroCAS,
      fechaVencimiento,
      numeroLote,
      observaciones,
      detalles_tecnicos,
    } = req.body;

    const dataToUpdate = {};
    if (nombre !== undefined) dataToUpdate.nombre = nombre;
    if (categoria !== undefined || tipo !== undefined) {
      dataToUpdate.categoria = categoria || tipo;
    }
    if (marca !== undefined) dataToUpdate.marca = marca;
    if (stock_actual !== undefined) {
      dataToUpdate.stock_actual = Number(stock_actual);
    } else if (cantidadInicial !== undefined) {
      dataToUpdate.stock_actual = Number(cantidadInicial);
    }
    if (stock_minimo !== undefined) {
      dataToUpdate.stock_minimo = Number(stock_minimo);
    } else if (stockMinimo !== undefined) {
      dataToUpdate.stock_minimo = Number(stockMinimo);
    }
    if (unidad_medida !== undefined || unidadMedida !== undefined) {
      dataToUpdate.unidad_medida = unidad_medida || unidadMedida;
    }
    if (ubicacion !== undefined || laboratorioUbicacion !== undefined) {
      dataToUpdate.ubicacion = ubicacion || laboratorioUbicacion;
    }

    const tieneDetalles =
      detalles_tecnicos !== undefined ||
      codigoCas !== undefined ||
      numeroCAS !== undefined ||
      fechaVencimiento !== undefined ||
      numeroLote !== undefined ||
      observaciones !== undefined;

    if (tieneDetalles) {
      dataToUpdate.detalles_tecnicos = {
        ...(item.detalles_tecnicos || {}),
        ...(detalles_tecnicos || {}),
        ...(codigoCas !== undefined || numeroCAS !== undefined
          ? { codigoCas: codigoCas || numeroCAS }
          : {}),
        ...(fechaVencimiento !== undefined ? { fechaVencimiento } : {}),
        ...(numeroLote !== undefined ? { numeroLote } : {}),
        ...(observaciones !== undefined ? { observaciones } : {}),
      };
    }

    await item.update(dataToUpdate);
    res.status(200).json({ mensaje: "Ítem actualizado correctamente.", item });
  } catch (error) {
    console.error("Error al actualizar ítem:", error.message);
    res
      .status(500)
      .json({ mensaje: "Error al actualizar el ítem.", error: error.message });
  }
};

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
// SECCIÓN DE TRAZABILIDAD
// =========================================================================

export const obtenerItemsEliminados = async (req, res) => {
  try {
    const itemsBorrados = await Item.findAll({
      where: {
        deletedAt: { [Op.ne]: null },
      },
      paranoid: false,
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

    await item.restore();

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
