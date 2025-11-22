const express = require("express");
const router = express.Router();
const SesionUsuario = require("../modelos/SesionUsuario");
const Usuario = require("./Usuario");

// 📌 Registrar inicio de sesión
router.post("/inicio", async (req, res) => {
  try {
    const { usuarioId } = req.body;

    if (!usuarioId) {
      return res.status(400).json({ success: false, message: "Falta usuarioId" });
    }

    const inicio = new Date();

    // Guardar en el usuario
    await Usuario.findByIdAndUpdate(usuarioId, {
      ultima_sesion_inicio: inicio,
    });

    // Crear registro de sesión
    await SesionUsuario.create({
      usuarioId,
      inicio_sesion: inicio,
      fecha: inicio.toISOString().split("T")[0], // solo fecha
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error en inicio de sesión:", error);
    res.status(500).json({ success: false, error });
  }
});

// 📌 Registrar cierre de sesión
router.post("/cierre", async (req, res) => {
  try {
    const { usuarioId } = req.body;

    if (!usuarioId) {
      return res.status(400).json({ success: false, message: "Falta usuarioId" });
    }

    const fin = new Date();

    // Buscar la última sesión del usuario que no tenga fin registrado
    const sesion = await SesionUsuario.findOne({
      usuarioId,
      fin_sesion: null,
    }).sort({ inicio_sesion: -1 });

    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: "No hay sesión abierta para cerrar",
      });
    }

    // Calcular duración en horas
    const duracion =
      (fin.getTime() - new Date(sesion.inicio_sesion).getTime()) /
      (1000 * 60 * 60);

    sesion.fin_sesion = fin;
    sesion.duracion_horas = Number(duracion.toFixed(2));

    await sesion.save();

    // Actualizar usuario
    await Usuario.findByIdAndUpdate(usuarioId, {
      ultima_sesion_cierre: fin,
    });

    res.json({ success: true, sesion });
  } catch (error) {
    console.error("Error en cierre de sesión:", error);
    res.status(500).json({ success: false, error });
  }
});

// 📌 Obtener sesiones de los últimos 7 días
router.get("/semana/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const hoy = new Date();
    const hace7 = new Date();
    hace7.setDate(hoy.getDate() - 6);

    const fechaInicio = hace7.toISOString().split("T")[0];

    const sesiones = await SesionUsuario.find({
      usuarioId,
      fecha: { $gte: fechaInicio },
    });

    res.json({ success: true, sesiones });
  } catch (error) {
    console.error("Error al obtener sesiones:", error);
    res.status(500).json({ success: false, error });
  }
});

module.exports = router;
