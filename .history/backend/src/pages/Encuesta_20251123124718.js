// backend/src/pages/Encuesta.js
const express = require("express");
const Usuario = require("./Usuario");
const { recuerdo } = require("../modelos/ModelosMatematicos");


const router = express.Router();
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      comodidad_area,
      estilo_aprendizaje,
      tiempo_estudio,
      objetivo,
      tiempo_area,
      tasa_olvido
    } = req.body;

    // ============================================
    // 🔥 CÁLCULO DEL NIVEL DE RECORDACIÓN
    // Fórmula: R(t) = e^(-lambda * t)
    // tiempo_area → YA VIENE EN AÑOS desde el frontend
    // tasa_olvido → YA VIENE EN RANGO 0–1
    // ============================================

    const t = tiempo_area;
    const lambda = tasa_olvido;

    // Resultado final entre 0 y 1
    const nivel_recordacion = recuerdo(t, lambda);

    // ============================================
    // 🔥 ACTUALIZAR USUARIO COMPLETO
    // ============================================
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      {
        $set: {
          "encuesta_inicial.comodidad_area": comodidad_area,
          "encuesta_inicial.estilo_aprendizaje": estilo_aprendizaje,
          "encuesta_inicial.tiempo_estudio": tiempo_estudio,
          "encuesta_inicial.objetivo": objetivo,
          "encuesta_inicial.tiempo_area": tiempo_area,
          "encuesta_inicial.tasa_olvido": tasa_olvido,
          "encuesta_inicial.completada": true,

          // ⭐ Nuevo campo calculado matemáticamente
          nivel_recordacion: nivel_recordacion
        }
      },
      { new: true }
    );

    return res.json({
      mensaje: "Encuesta guardada correctamente 🎉",
      usuario: usuarioActualizado
    });

  } catch (error) {
    console.error("❌ Error guardando encuesta:", error);
    return res.status(500).json({
      mensaje: "Error al guardar encuesta"
    });
  }
});

module.exports = router;