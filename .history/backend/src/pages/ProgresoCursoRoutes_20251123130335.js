const express = require("express");
const ProgresoCurso = require("./ProgresoCurso");
const Usuario = require("./Usuario");
const Curso = require("./ModeloCursos");
const router = express.Router();

/* =======================================================
   🔹 FUNCIÓN: Recalcular nivel_recordacion_nuevo
   Regla de tres:
   A → B
   C → X
   X = (C * B) / A
   A = tiempo_area (años)
   B = nivel_recordacion (decimal 0-1)
   C = años desde último curso
======================================================= */
async function recalcularNivelRecordacion(usuarioId, fechaCompletado) {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) return;

    const A = usuario.encuesta_inicial?.tiempo_area;
    const B = usuario.encuesta_inicial?.nivel_recordacion; // ← este es el correcto

    if (!A || !B || !fechaCompletado) return;

    const diffMs = Date.now() - new Date(fechaCompletado).getTime();
    const C = diffMs / (1000 * 60 * 60 * 24 * 365); // años exactos

    let X = (C * B) / A;

    if (X < 0) X = 0;
    if (X > 1) X = 1;

    usuario.nivel_recordacion_nuevo = X;
    await usuario.save();

    return X;
}

/* =======================================================
   🔹 FUNCIÓN: Calcular porcentaje total de progreso
======================================================= */
function calcularProgreso(progreso, curso) {
    if (!curso || !Array.isArray(curso.modulos) || curso.modulos.length === 0) return 0;

    const totalModulos = curso.modulos.length;
    const totalContenidosPorModulo = curso.modulos.map(m => (m.contenido || []).length);
    const totalContenidos = totalContenidosPorModulo.reduce((a, b) => a + b, 0) || 1;

    const modulosCompletados = (progreso?.modulosCompletados || []).filter(m => m.completado).length;
    let progresoTotal = (modulosCompletados / totalModulos) * 70;

    const moduloActual = Math.min(Math.max(0, progreso?.moduloActual || 0), totalModulos - 1);
    const contenidosVistosEnModulo = (progreso?.contenidosVistos || [])
        .filter(c => c.moduloIndex === moduloActual && c.visto).length;

    const totalContenidosModuloActual = totalContenidosPorModulo[moduloActual] || 1;
    const progresoModuloActual = (contenidosVistosEnModulo / totalContenidosModuloActual) * (30 / totalModulos);
    progresoTotal += progresoModuloActual;

    if (progreso?.evaluacionFinalCompletada) return 100;

    return Math.min(100, Math.max(0, Math.round(progresoTotal)));
}

/* =======================================================
   📌 1. Obtener progreso del curso
======================================================= */
router.get("/curso/:usuarioId/:cursoId", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.params;

        const progreso = await ProgresoCurso.findOne({ usuarioId, cursoId });

        if (!progreso) {
            return res.json({
                success: true,
                progreso: null,
                mensaje: "No hay progreso para este curso"
            });
        }

        res.json({ success: true, progreso });

    } catch (error) {
        console.log("Error obteniendo progreso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* =======================================================
   📌 2. Marcar contenido visto
======================================================= */
router.post("/contenido-visto", async (req, res) => {
    try {
        const { usuarioId, cursoId, moduloIndex, contenidoIndex } = req.body;

        if (!usuarioId || !cursoId || moduloIndex == null || contenidoIndex == null) {
            return res.status(400).json({ success: false, error: "Faltan datos" });
        }

        const curso = await Curso.findById(cursoId);
        if (!curso) return res.status(404).json({ success: false, error: "Curso no encontrado" });

        let progreso = await ProgresoCurso.findOne({ usuarioId, cursoId });

        if (!progreso) {
            progreso = new ProgresoCurso({
                usuarioId,
                cursoId,
                moduloActual: moduloIndex,
                contenidoActual: contenidoIndex,
                modulosCompletados: [],
                contenidosVistos: []
            });
        } else {
            progreso.moduloActual = moduloIndex;
            progreso.contenidoActual = contenidoIndex;
        }

        const existe = progreso.contenidosVistos.findIndex(
            c => c.moduloIndex === moduloIndex && c.contenidoIndex === contenidoIndex
        );

        if (existe === -1) {
            progreso.contenidosVistos.push({
                moduloIndex,
                contenidoIndex,
                visto: true,
                fechaVisto: new Date()
            });
        } else {
            progreso.contenidosVistos[existe].visto = true;
            progreso.contenidosVistos[existe].fechaVisto = new Date();
        }

        progreso.progresoPorcentual = calcularProgreso(progreso, curso);
        progreso.ultimaActualizacion = new Date();

        await progreso.save();

        res.json({ success: true, progreso });

    } catch (error) {
        console.log("Error guardando contenido visto:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* =======================================================
   📌 3. Completar Módulo
======================================================= */
router.post("/completar-modulo", async (req, res) => {
    try {
        const { usuarioId, cursoId, moduloIndex, nota } = req.body;

        const curso = await Curso.findById(cursoId);
        if (!curso) return res.status(404).json({ success: false, error: "Curso no encontrado" });

        let progreso = await ProgresoCurso.findOne({ usuarioId, cursoId });
        if (!progreso) progreso = new ProgresoCurso({ usuarioId, cursoId });

        const idx = progreso.modulosCompletados.findIndex(m => m.moduloIndex === moduloIndex);

        if (idx === -1) {
            progreso.modulosCompletados.push({
                moduloIndex,
                completado: true,
                fechaCompletado: new Date(),
                notaEvaluacion: nota || 0
            });
        } else {
            progreso.modulosCompletados[idx].completado = true;
            progreso.modulosCompletados[idx].fechaCompletado = new Date();
            progreso.modulosCompletados[idx].notaEvaluacion = nota || progreso.modulosCompletados[idx].notaEvaluacion;
        }

        progreso.moduloActual = Math.min(moduloIndex + 1, curso.modulos.length - 1);
        progreso.contenidoActual = 0;

        progreso.progresoPorcentual = calcularProgreso(progreso, curso);
        progreso.ultimaActualizacion = new Date();

        await progreso.save();

        await recalcularNivelRecordacion(usuarioId, new Date());

        res.json({
            success: true,
            progreso,
            mensaje: `Módulo ${moduloIndex + 1} completado`
        });

    } catch (error) {
        console.log("Error en completar-modulo:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* =======================================================
   📌 4. Evaluación Final (marca curso completado)
======================================================= */
router.post("/evaluacion-final", async (req, res) => {
    try {
        const { usuarioId, cursoId, notaFinal } = req.body;

        const progreso = await ProgresoCurso.findOneAndUpdate(
            { usuarioId, cursoId },
            {
                evaluacionFinalCompletada: true,
                progresoPorcentual: 100,
                cursoCompletado: true,
                fechaCompletado: new Date(),
                ultimaActualizacion: new Date()
            },
            { new: true, upsert: true }
        );

        const usuario = await Usuario.findById(usuarioId);
        if (usuario) {
            usuario.habilidad_nueva = notaFinal;
            await usuario.save();
        }

        await recalcularNivelRecordacion(usuarioId, progreso.fechaCompletado);

        res.json({
            success: true,
            progreso,
            mensaje: "Curso completado exitosamente"
        });

    } catch (error) {
        console.log("Error evaluacion-final:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* =======================================================
   📌 5. Completar CURSO (ruta única y correcta)
======================================================= */
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;

        const progreso = await ProgresoCurso.findOneAndUpdate(
            { usuarioId, cursoId },
            {
                evaluacionFinalCompletada: true,
                progresoPorcentual: 100,
                cursoCompletado: true,
                fechaCompletado: new Date(),
                ultimaActualizacion: new Date(),
                estado: "completado"
            },
            { new: true, upsert: true }
        );

        await recalcularNivelRecordacion(usuarioId, progreso.fechaCompletado);

        res.json({
            success: true,
            progreso,
            mensaje: "Curso marcado como completado"
        });

    } catch (error) {
        console.log("Error completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* =======================================================
   📌 6. Reiniciar Curso
======================================================= */
router.post("/reiniciar", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;

        const progreso = await ProgresoCurso.findOneAndUpdate(
            { usuarioId, cursoId },
            {
                moduloActual: 0,
                contenidoActual: 0,
                modulosCompletados: [],
                contenidosVistos: [],
                evaluacionFinalCompletada: false,
                progresoPorcentual: 0,
                fechaCompletado: null,
                cursoCompletado: false,
                ultimaActualizacion: new Date()
            },
            { new: true }
        );

        res.json({
            success: true,
            progreso,
            mensaje: "Progreso reiniciado"
        });

    } catch (error) {
        console.log("Error reiniciar:", error);
        res.status(500).json({ success: false, error });
    }
});

module.exports = router;
