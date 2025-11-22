const express = require("express");
const ProgresoCurso = require("./ProgresoCurso");
const router = express.Router();

// Obtener progreso de un usuario en un curso
router.get("/:usuarioId/:cursoId", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.params;

        const progreso = await ProgresoCurso.findOne({ usuarioId, cursoId });

        res.json({ success: true, progreso });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
});

// Crear o actualizar progreso
router.post("/guardar", async (req, res) => {
    try {
        const data = req.body;

        const progreso = await ProgresoCurso.findOneAndUpdate(
            { usuarioId: data.usuarioId, cursoId: data.cursoId },
            { ...data, ultimaActualizacion: Date.now() },
            { upsert: true, new: true }
        );

        res.json({ success: true, progreso });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
});

module.exports = router;
