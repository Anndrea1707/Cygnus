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

// Registrar resultado de evaluación
router.post("/evaluacion", async (req, res) => {
    try {
        const { usuarioId, cursoId, moduloIndex, nota } = req.body;

        // 1. Actualizar progreso del curso
        const progreso = await ProgresoCurso.findOneAndUpdate(
            { usuarioId, cursoId },
            {
                habilidadNueva: nota,
                $addToSet: { modulosCompletados: moduloIndex },
                ultimaActualizacion: Date.now()
            },
            { new: true, upsert: true }
        );

        // 2. Actualizar habilidad del usuario
        const Usuario = require("../modelos/Usuario");
        const usuario = await Usuario.findById(usuarioId);

        const habilidadVieja = usuario.prueba_conocimiento?.habilidad || 0;

        const nuevaHabilidadPromedio = (habilidadVieja + nota) / 2;

        usuario.prueba_conocimiento.habilidad = nuevaHabilidadPromedio;
        await usuario.save();

        res.json({
            success: true,
            progreso,
            habilidadNueva: nuevaHabilidadPromedio
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error });
    }
});

module.exports = router;
