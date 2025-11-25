// En pages/Encuesta.js - MODIFICAR:

const express = require("express");
const Usuario = require("./Usuario");
const { recuerdo, mesesAnios } = require("../modelos/ModelosMatematicos");

const router = express.Router();

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      comodidad_area,
      estilo_aprendizaje,
      tiempo_estudio,
      objetivo,
      tiempo_area,  // ⚠️ Esto viene en MESES desde el frontend
      tasa_olvido   // ⚠️ Esto viene en porcentaje (0-1)
    } = req.body;

    // ============================================
    // 🔥 NUEVA LÓGICA CORRECTA
    // ============================================

    // 1. Guardar los valores ORIGINALES de la encuesta
    const tiempo_meses = Number(tiempo_area);  // Ya viene en meses
    const lambda_original = Number(tasa_olvido);

    // 2. Calcular nivel_recordacion INICIAL con fórmula de curva de olvido
    // Convertir meses a años para la fórmula
    const tiempo_anios = mesesAnios(tiempo_meses);
    const nivel_recordacion = recuerdo(tiempo_anios, lambda_original);

    // 3. Inicializar los valores "nuevos" con los originales
    const lambda_nueva = lambda_original;
    const tiempo_nuevo_meses = tiempo_meses;
    const nivel_recordacion_nuevo = nivel_recordacion;

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
          "encuesta_inicial.tiempo_area": tiempo_meses,  // ⭐ Guardar en MESES
          "encuesta_inicial.tasa_olvido": lambda_original,
          "encuesta_inicial.completada": true,

          // ⭐ Campos matemáticos CORREGIDOS
          nivel_recordacion: nivel_recordacion,
          
          // ⭐ Nuevos campos para recálculos
          lambda_original: lambda_original,
          tiempo_original_meses: tiempo_meses,
          lambda_nueva: lambda_nueva,
          tiempo_nuevo_meses: tiempo_nuevo_meses,
          nivel_recordacion_nuevo: nivel_recordacion_nuevo,
          
          ultima_actualizacion_recordacion: new Date()
        }
      },
      { new: true }
    );

    console.log('✅ Encuesta guardada con nueva lógica:', {
      tiempo_meses,
      lambda_original,
      nivel_recordacion: (nivel_recordacion * 100).toFixed(1) + '%',
      tiempo_nuevo_meses,
      lambda_nueva,
      nivel_recordacion_nuevo: (nivel_recordacion_nuevo * 100).toFixed(1) + '%'
    });

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