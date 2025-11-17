// backend/src/pages/Encuesta.js
const express = require("express");
const Usuario = require("./Usuario");

const router = express.Router();

// 👉 Guardar encuesta inicial
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      encuesta_inicial: {
        completada: true,
        area_interes: req.body.area_interes,
        comodidad_area: req.body.comodidad_area,
        estilo_aprendizaje: req.body.estilo_aprendizaje,
        tiempo_estudio: req.body.tiempo_estudio,
        objetivo: req.body.objetivo
      }
    };

    await Usuario.findByIdAndUpdate(id, updateData);

    res.json({ mensaje: "Encuesta guardada correctamente 🎉" });
  } catch (error) {
    console.error("❌ Error guardando encuesta:", error);
    res.status(500).json({ mensaje: "Error al guardar encuesta" });
  }
});

module.exports = router;
