// src/pages/ProgresoCursoRoutes.js
const express = require("express");
const ProgresoCurso = require("./ProgresoCurso");
const Usuario = require("./Usuario");
const router = express.Router();

/* ============================================================
   🔹 UTIL: Calcular porcentaje total de progreso
   ============================================================ */
function calcularProgreso(moduloActual, contenidoActual, totalModulos, totalContenidosModulo) {
    const porcentajeModulo = (moduloActual / totalModulos) * 100;
    const porcentajeContenido = (contenidoActual / totalContenidosModulo) * (100 / totalModulos);

    return Math.min(100, porcentajeModulo + porcentajeContenido);
}

/* ============================================================
   📌 1. OBTENER PROGRESO DE UN CURSO
   ============================================================ */
router.get("/curso/:usuarioId/:cursoId", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.params;

        const progreso = await ProgresoCurso.findOne({ usuarioId, cursoId });

        res.json({ success: true, progreso });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error });
    }
});

/* ============================================================
   📌 2. GUARDAR/ACTUALIZAR PROGRESO GENERAL
   ============================================================ */
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
        console.log(error);
        res.status(500).json({ success: false, error });
    }
});

/* ============================================================
   📌 3. REGISTRAR AVANCE POR CONTENIDO
   ============================================================ */
router.post("/contenido", async (req, res) => {
    try {
        const { usuarioId, cursoId, moduloActual, contenidoActual, totalModulos, totalContenidosModulo } = req.body;

        console.log("📥 Recibiendo progreso:", {
            usuarioId, 
            cursoId, // ✅ Verificar que llegue el cursoId
            moduloActual, 
            contenidoActual
        });

        // Validar que cursoId no sea null
        if (!cursoId) {
            return res.status(400).json({ 
                success: false, 
                error: "cursoId es requerido" 
            });
        }

        const progresoPorcentual = calcularProgreso(
            moduloActual,
            contenidoActual,
            totalModulos,
            totalContenidosModulo
        );

        console.log("📊 Progreso calculado:", progresoPorcentual);

        const progreso = await ProgresoCurso.findOneAndUpdate(
            { usuarioId, cursoId }, // ✅ Buscar por usuarioId Y cursoId
            {
                moduloActual,
                contenidoActual,
                progresoPorcentual,
                ultimaActualizacion: Date.now()
            },
            { new: true, upsert: true }
        );

        console.log("✅ Progreso guardado en BD:", progreso);

        res.json({ success: true, progreso });
    } catch (error) {
        console.log("❌ Error guardando progreso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ============================================================
   📌 4. REGISTRAR EVALUACIÓN DE MÓDULO
   ============================================================ */
router.post("/evaluacion", async (req, res) => {
    try {
        const { usuarioId, cursoId, moduloIndex, nota } = req.body;

        const progreso = await ProgresoCurso.findOneAndUpdate(
            { usuarioId, cursoId },
            {
                habilidadNueva: nota,
                $addToSet: { modulosCompletados: moduloIndex },
                ultimaActualizacion: Date.now()
            },
            { new: true, upsert: true }
        );

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

/* ============================================================
   📌 5. REGISTRAR EVALUACIÓN FINAL
   ============================================================ */
router.post("/evaluacion-final", async (req, res) => {
    try {
        const { usuarioId, cursoId, notaFinal } = req.body;

        const progreso = await ProgresoCurso.findOneAndUpdate(
            { usuarioId, cursoId },
            {
                evaluacionFinalCompletada: true,
                habilidadNueva: notaFinal,
                progresoPorcentual: 100,
                ultimaActualizacion: Date.now()
            },
            { new: true, upsert: true }
        );

        const usuario = await Usuario.findById(usuarioId);
        const habilidadVieja = usuario.prueba_conocimiento?.habilidad || 0;

        const nuevaHabilidadPromedio = (habilidadVieja + notaFinal) / 2;
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

/* ============================================================
   📌 6. OBTENER HABILIDAD ACTUAL DEL USUARIO
   ============================================================ */
router.get("/habilidad/:usuarioId", async (req, res) => {
    try {
        const { usuarioId } = req.params;

        const usuario = await Usuario.findById(usuarioId);

        res.json({
            success: true,
            habilidad: usuario?.prueba_conocimiento?.habilidad || 0
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error });
    }
});

module.exports = router;
