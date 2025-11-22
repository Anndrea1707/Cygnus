const express = require("express");
const ProgresoCurso = require("../modelos/ProgresoCurso");
const router = express.Router();

// ---------------------------------------------
// Crear o devolver progreso inicial
// ---------------------------------------------
router.post("/iniciar", async (req, res) => {
  try {
    const { usuarioId, cursoId } = req.body;

    let progreso = await ProgresoCurso.findOne({ usuario: usuarioId, curso: cursoId });

    if (!progreso) {
      progreso = await ProgresoCurso.create({
        usuario: usuarioId,
        curso: cursoId,
        moduloActual: 0,
        contenidoActual: 0,
        porcentaje: 0
      });
    }

    res.json({ success: true, progreso });
  } catch (error) {
    console.error("Error en /iniciar:", error);
    res.status(500).json({ success: false, error: "Error inicializando progreso" });
  }
});

// ---------------------------------------------
// Actualizar progreso automáticamente
// ---------------------------------------------
router.post("/actualizar", async (req, res) => {
  try {
    const { usuarioId, cursoId, moduloActual, contenidoActual, porcentaje } = req.body;

    const progreso = await ProgresoCurso.findOneAndUpdate(
      { usuario: usuarioId, curso: cursoId },
      {
        moduloActual,
        contenidoActual,
        porcentaje,
        actualizadoEn: new Date()
      },
      { new: true }
    );

    res.json({ success: true, progreso });
  } catch (error) {
    console.error("Error en /actualizar:", error);
    res.status(500).json({ success: false, error: "Error actualizando progreso" });
  }
});

// ---------------------------------------------
// Obtener progreso del curso
// ---------------------------------------------
router.get("/estado/:usuarioId/:cursoId", async (req, res) => {
  try {
    const { usuarioId, cursoId } = req.params;

    const progreso = await ProgresoCurso.findOne({
      usuario: usuarioId,
      curso: cursoId
    });

    res.json({ success: true, progreso });
  } catch (error) {
    console.error("Error en /estado:", error);
    res.status(500).json({ success: false, error: "Error obteniendo estado" });
  }
});

module.exports = router;
