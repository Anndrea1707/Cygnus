// backend/src/pages/Encuesta.js
const express = require("express");
const Usuario = require("./Usuario");

const router = express.Router();

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      encuesta_inicial: {
        completada: true,
        comodidad_area: req.body.comodidad_area,
        estilo_aprendizaje: req.body.estilo_aprendizaje,
        tiempo_estudio: req.body.tiempo_estudio,
        objetivo: req.body.objetivo,

        // ⭐ Datos matemáticos
        tiempo_area: req.body.tiempo_area,
        tasa_olvido: req.body.tasa_olvido,
      }
    };

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.json({
      mensaje: "Encuesta guardada correctamente 🎉",
      usuario: usuarioActualizado
    });

  } catch (error) {
    console.error("❌ Error guardando encuesta:", error);
    res.status(500).json({ mensaje: "Error al guardar encuesta" });
  }
});

module.exports = router;
