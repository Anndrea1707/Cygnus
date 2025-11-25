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

    // Determinar cantidad según tipo de evaluación
    const cantidad = tipoEvaluacion === 'modulo' ? 10 : 15;

    // Seleccionar preguntas adaptativas
    const preguntasSeleccionadas = ModelosMatematicos.seleccionarPreguntasAdaptativas(
      preguntas,
      usuario,
      cantidad
    );

    res.json({
      success: true,
      preguntasSeleccionadas: preguntasSeleccionadas,
      totalOriginal: preguntas.length,
      totalSeleccionado: preguntasSeleccionadas.length,
      tipoEvaluacion: tipoEvaluacion
    });

  } catch (error) {
    console.error('Error en selección adaptativa:', error);
    res.status(500).json({
      success: false,
      message: 'Error al seleccionar preguntas adaptativas'
    });
  }
});

module.exports = router;
