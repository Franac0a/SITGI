import { Item } from "../models/Item.model.js";
import { Op, Sequelize } from "sequelize";

export const obtenerItems = async (req, res) => {
  try {
    const { categoria, tipoElemento, stock_bajo, ubicacion, busqueda } =
      req.query;
    const filtro = {};

    if (categoria) {
      filtro[Op.or] = [{ categoria }, { tipoElemento: categoria }];
    } else if (tipoElemento) {
      filtro.tipoElemento = tipoElemento;
    }

    if (ubicacion) {
      filtro[Op.or] = [
        { laboratorioUbicacion: { [Op.like]: `%${ubicacion}%` } },
        { ubicacion: { [Op.like]: `%${ubicacion}%` } },
      ];
    }

    if (stock_bajo === "true") {
      filtro[Op.or] = [
        { stockActual: { [Op.lte]: Sequelize.col("stockMinimo") } },
        { stock_actual: { [Op.lte]: Sequelize.col("stock_minimo") } },
      ];
    }

    if (busqueda) {
      filtro[Op.or] = [
        { nombre: { [Op.like]: `%${busqueda}%` } },
        { codigo_identificacion: { [Op.like]: `%${busqueda}%` } },
        { numeroCAS: { [Op.like]: `%${busqueda}%` } },
      ];
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

export const crearItem = async (req, res) => {
  try {
    const {
      nombre,
      tipo,
      tipoElemento,
      codigoCas,
      numeroCAS,
      marca,
      marcaFabricante,
      numeroLote,
      cantidadInicial,
      unidadMedida,
      stockMinimo,
      laboratorioUbicacion,
      ubicacion,
      fechaVencimiento,
      observaciones,
      codigo_identificacion,
    } = req.body;

    const errores = {};

    // 1. Validaciones de campos obligatorios
    const finalNombre = (nombre || "").trim();
    if (!finalNombre) {
      errores.nombre = "El nombre del elemento es obligatorio.";
    }

    const finalTipo = (tipoElemento || tipo || "").trim();
    if (!finalTipo) {
      errores.tipo = "Debe seleccionar un tipo de elemento.";
    }

    if (
      cantidadInicial === undefined ||
      cantidadInicial === null ||
      cantidadInicial === "" ||
      isNaN(Number(cantidadInicial)) ||
      Number(cantidadInicial) < 0
    ) {
      errores.cantidadInicial =
        "La cantidad inicial debe ser un número válido mayor o igual a 0.";
    }

    const finalUnidad = (unidadMedida || "").trim();
    if (!finalUnidad) {
      errores.unidadMedida = "Debe seleccionar la unidad de medida.";
    }

    const finalUbicacion = (laboratorioUbicacion || ubicacion || "").trim();
    if (!finalUbicacion) {
      errores.laboratorioUbicacion =
        "Debe seleccionar el laboratorio o ubicación física.";
    }

    // 2. Validaciones de campos opcionales
    let finalStockMinimo = 0;
    if (
      stockMinimo !== undefined &&
      stockMinimo !== null &&
      stockMinimo !== ""
    ) {
      if (isNaN(Number(stockMinimo)) || Number(stockMinimo) < 0) {
        errores.stockMinimo = "El stock mínimo no puede ser negativo.";
      } else {
        finalStockMinimo = Number(stockMinimo);
      }
    }

    let finalFechaVencimiento = null;
    if (fechaVencimiento && String(fechaVencimiento).trim() !== "") {
      const parsedDate = new Date(fechaVencimiento);
      if (isNaN(parsedDate.getTime())) {
        errores.fechaVencimiento =
          "La fecha de vencimiento debe tener un formato válido (AAAA-MM-DD).";
      } else {
        finalFechaVencimiento = String(fechaVencimiento).trim();
      }
    }

    if (Object.keys(errores).length > 0) {
      return res.status(400).json({
        mensaje: "Existen errores de validación en el formulario.",
        errores,
      });
    }

    const finalCantidadInicial = Number(cantidadInicial);
    const finalStockActual = finalCantidadInicial; // Regla de negocio: stockActual inicia con cantidadInicial

    // Determinar estado según stock (stockMinimo > cantidadInicial es válido y genera alerta de stock bajo)
    let estado = "disponible";
    let alertaStockBajo = false;
    if (finalStockActual === 0) {
      estado = "agotado";
      alertaStockBajo = true;
    } else if (finalStockMinimo > 0 && finalStockActual <= finalStockMinimo) {
      estado = "bajo_stock";
      alertaStockBajo = true;
    }

    // Generar código de identificación único si no se proporciona
    let codigo = (codigo_identificacion || "").trim();
    if (!codigo) {
      const prefijoTipo = finalTipo.slice(0, 3).toUpperCase();
      const sufijoRandom = Math.floor(1000 + Math.random() * 9000);
      codigo = `CIT-${prefijoTipo}-${sufijoRandom}`;
    }

    const nuevoItem = await Item.create({
      nombre: finalNombre,
      tipoElemento: finalTipo,
      categoria: finalTipo,
      codigo_identificacion: codigo,
      numeroCAS: (numeroCAS || codigoCas || "").trim() || null,
      marcaFabricante: (marcaFabricante || marca || "").trim() || null,
      numeroLote: (numeroLote || "").trim() || null,
      cantidadInicial: finalCantidadInicial,
      stockActual: finalStockActual,
      stock_actual: finalStockActual,
      unidadMedida: finalUnidad,
      stockMinimo: finalStockMinimo,
      stock_minimo: finalStockMinimo,
      laboratorioUbicacion: finalUbicacion,
      ubicacion: finalUbicacion,
      fechaVencimiento: finalFechaVencimiento,
      fecha_vencimiento: finalFechaVencimiento,
      observaciones: (observaciones || "").trim() || null,
      estado,
      creadoPor: req.usuario?.id || null,
    });

    res.status(201).json({
      mensaje: `Elemento científico "${nuevoItem.nombre}" registrado con éxito.`,
      item: nuevoItem,
      alertaStockBajo,
    });
  } catch (error) {
    console.error("Error al crear ítem:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        mensaje:
          "El código de identificación ingresado ya existe en el sistema.",
        error: error.message,
      });
    }
    if (error.name === "SequelizeValidationError") {
      const errores = {};
      if (Array.isArray(error.errors)) {
        error.errors.forEach((err) => {
          errores[err.path] = err.message;
        });
      }
      return res.status(400).json({
        mensaje: "Error de validación al guardar el elemento.",
        errores,
        error: error.message,
      });
    }
    res.status(500).json({
      mensaje: error.message || "Error al guardar el ítem.",
      error: error.message,
    });
  }
};

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
