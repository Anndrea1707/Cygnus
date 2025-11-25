const express = require("express");
const router = express.Router();
const ModelosMatematicos = require("../modelos/ModelosMatematicos");

// Obtener todos
router.get("/", async (req, res) => {
  try {
    const modelos = await ModelosMatematicos.find();
    res.json(modelos);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener modelos" });
  }
});

// Crear
router.post("/", async (req, res) => {
  try {
    const nuevoModelo = new ModelosMatematicos(req.body);
    const guardado = await nuevoModelo.save();
    res.json(guardado);
  } catch (err) {
    res.status(500).json({ error: "Error al crear modelo" });
  }
});

// Eliminar
router.delete("/:id", async (req, res) => {
  try {
    await ModelosMatematicos.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Modelo eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar modelo" });
  }
});


// Ruta para selección adaptativa de preguntas
router.post('/seleccionar-preguntas', async (req, res) => {
  try {
    const { preguntas, usuario, tipoEvaluacion, cursoId } = req.body;

    console.log('🎯 ===== INICIANDO SELECCIÓN ADAPTATIVA =====');
    console.log('📊 Datos entrada:', {
      totalPreguntas: preguntas?.length,
      tipoEvaluacion,
      usuario: usuario?.nombre_completo,
      cursoId
    });

    // Validaciones básicas
    if (!preguntas || !Array.isArray(preguntas)) {
      return res.status(400).json({
        success: false,
        message: 'Array de preguntas no válido'
      });
    }

    if (!usuario) {
      return res.status(400).json({
        success: false,
        message: 'Datos de usuario requeridos'
      });
    }

    // Determinar cantidad según tipo de evaluación
    const cantidad = tipoEvaluacion === 'modulo' ? 10 : 15;
    console.log(`🎯 Objetivo: seleccionar ${cantidad} preguntas de ${preguntas.length}`);

    // Analizar distribución de dificultades original
    const dificultadesOriginal = {1:0, 2:0, 3:0, 4:0, 5:0};
    preguntas.forEach(p => {
        if (p.dificultad >= 1 && p.dificultad <= 5) {
            dificultadesOriginal[p.dificultad]++;
        }
    });
    console.log('📊 Distribución original de dificultades:', dificultadesOriginal);

    // Usar las funciones estáticas del modelo
    const preguntasSeleccionadas = require('../modelos/ModelosMatematicos').seleccionarPreguntasAdaptativas(
      preguntas,
      usuario,
      cantidad
    );

    // Analizar distribución de dificultades seleccionadas
    const dificultadesSeleccionadas = {1:0, 2:0, 3:0, 4:0, 5:0};
    preguntasSeleccionadas.forEach(p => {
        if (p.dificultad >= 1 && p.dificultad <= 5) {
            dificultadesSeleccionadas[p.dificultad]++;
        }
    });

    console.log('✅ ===== SELECCIÓN COMPLETADA =====');
    console.log('📈 Resultados:', {
      original: preguntas.length,
      seleccionadas: preguntasSeleccionadas.length,
      distribucionOriginal: dificultadesOriginal,
      distribucionSeleccionada: dificultadesSeleccionadas
    });

    res.json({
      success: true,
      preguntasSeleccionadas: preguntasSeleccionadas,
      totalOriginal: preguntas.length,
      totalSeleccionado: preguntasSeleccionadas.length,
      tipoEvaluacion: tipoEvaluacion,
      distribucionDificultades: dificultadesSeleccionadas
    });

  } catch (error) {
    console.error('❌ Error en selección adaptativa:', error);
    res.status(500).json({
      success: false,
      message: 'Error al seleccionar preguntas adaptativas',
      error: error.message
    });
  }
});

module.exports = router;
