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

    console.log('📊 Iniciando selección adaptativa:', {
      totalPreguntas: preguntas?.length,
      tipoEvaluacion,
      usuario: usuario?.nombre_completo
    });

    // ✅ VERIFICAR ESTRUCTURA DE LAS PREGUNTAS
    if (preguntas && preguntas.length > 0) {
      console.log('🔍 Estructura primera pregunta:', {
        tieneOpcionCorrecta: preguntas[0].opcionCorrecta !== undefined,
        tieneOpciones: preguntas[0].opciones !== undefined,
        tieneDificultad: preguntas[0].dificultad !== undefined,
        preguntaEjemplo: {
          interrogante: preguntas[0].interrogante?.substring(0, 50) + '...',
          opcionCorrecta: preguntas[0].opcionCorrecta,
          dificultad: preguntas[0].dificultad
        }
      });
    }

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

    // Usar las funciones estáticas del modelo
    const preguntasSeleccionadas = require('../modelos/ModelosMatematicos').seleccionarPreguntasAdaptativas(
      preguntas,
      usuario,
      cantidad
    );

    console.log('✅ Selección adaptativa completada:', {
      original: preguntas.length,
      seleccionadas: preguntasSeleccionadas.length
    });

    res.json({
      success: true,
      preguntasSeleccionadas: preguntasSeleccionadas,
      totalOriginal: preguntas.length,
      totalSeleccionado: preguntasSeleccionadas.length,
      tipoEvaluacion: tipoEvaluacion
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
