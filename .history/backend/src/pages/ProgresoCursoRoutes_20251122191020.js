const express = require("express");
const ProgresoCurso = require("./ProgresoCurso");
const Usuario = require("./Usuario");
const router = express.Router();

/* ============================================================
   🔹 UTIL: Calcular porcentaje total de progreso MEJORADO
   ============================================================ */
function calcularProgreso(progreso, totalModulos, totalContenidosPorModulo) {
    if (totalModulos === 0) return 0;

    let progresoTotal = 0;
    
    // Progreso por módulos completados
    const modulosCompletados = progreso.modulosCompletados.filter(m => m.completado).length;
    progresoTotal += (modulosCompletados / totalModulos) * 70; // 70% por módulos completados

    // Progreso por contenidos vistos en el módulo actual (si no está completado)
    const moduloActualCompletado = progreso.modulosCompletados.find(m => m.moduloIndex === progreso.moduloActual)?.completado;
    if (!moduloActualCompletado && progreso.moduloActual < totalModulos) {
        const contenidosVistosEnModulo = progreso.contenidosVistos.filter(
            c => c.moduloIndex === progreso.moduloActual && c.visto
        ).length;
        const totalContenidosModuloActual = totalContenidosPorModulo[progreso.moduloActual] || 1;
        const progresoModuloActual = (contenidosVistosEnModulo / totalContenidosModuloActual) * (30 / totalModulos);
        progresoTotal += progresoModuloActual;
    }

    // Si evaluación final completada, 100%
    if (progreso.evaluacionFinalCompletada) {
        progresoTotal = 100;
    }

    return Math.min(100, Math.round(progresoTotal));
}

/* ============================================================
   📌 1. OBTENER PROGRESO DE UN CURSO - MEJORADO
   ============================================================ */
router.get("/curso/:usuarioId/:cursoId", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.params;

        let progreso = await ProgresoCurso.findOne({ usuarioId, cursoId });

        // Si no existe progreso, crear uno nuevo
        if (!progreso) {
            progreso = new ProgresoCurso({
                usuarioId,
                cursoId,
                moduloActual: 0,
                contenidoActual: 0,
                modulosCompletados: [],
                contenidosVistos: [],
                progresoPorcentual: 0,
                estado: "en_progreso"
            });
            await progreso.save();
        }

        res.json({ success: true, progreso });
    } catch (error) {
        console.log("Error obteniendo progreso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ============================================================
   📌 2. GUARDAR PROGRESO DE CONTENIDO VISTO - NUEVO
   ============================================================ */
router.post("/contenido-visto", async (req, res) => {
    try {
        const { usuarioId, cursoId, moduloIndex, contenidoIndex } = req.body;

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
        }

        // Actualizar módulo y contenido actual
        progreso.moduloActual = moduloIndex;
        progreso.contenidoActual = contenidoIndex;

        // Marcar contenido como visto
        const contenidoVistoIndex = progreso.contenidosVistos.findIndex(
            c => c.moduloIndex === moduloIndex && c.contenidoIndex === contenidoIndex
        );

        if (contenidoVistoIndex === -1) {
            progreso.contenidosVistos.push({
                moduloIndex,
                contenidoIndex,
                visto: true,
                fechaVisto: new Date()
            });
        } else {
            progreso.contenidosVistos[contenidoVistoIndex].visto = true;
            progreso.contenidosVistos[contenidoVistoIndex].fechaVisto = new Date();
        }

        progreso.ultimaActualizacion = new Date();
        await progreso.save();

        res.json({ 
            success: true, 
            progreso,
            mensaje: "Progreso guardado correctamente"
        });

    } catch (error) {
        console.log("Error guardando contenido visto:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ============================================================
   📌 3. ACTUALIZAR PROGRESO GENERAL - MEJORADO
   ============================================================ */
router.post("/actualizar-progreso", async (req, res) => {
    try {
        const { usuarioId, cursoId, moduloActual, contenidoActual, totalModulos, totalContenidosPorModulo } = req.body;

        let progreso = await ProgresoCurso.findOne({ usuarioId, cursoId });
        
        if (!progreso) {
            progreso = new ProgresoCurso({ usuarioId, cursoId });
        }

        // Actualizar posición actual
        progreso.moduloActual = moduloActual;
        progreso.contenidoActual = contenidoActual;

        // Calcular progreso porcentual
        progreso.progresoPorcentual = calcularProgreso(progreso, totalModulos, totalContenidosPorModulo);
        
        progreso.ultimaActualizacion = new Date();
        await progreso.save();

        res.json({ success: true, progreso });

    } catch (error) {
        console.log("Error actualizando progreso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ============================================================
   📌 4. COMPLETAR MÓDULO - MEJORADO
   ============================================================ */
router.post("/completar-modulo", async (req, res) => {
    try {
        const { usuarioId, cursoId, moduloIndex, nota } = req.body;

        let progreso = await ProgresoCurso.findOne({ usuarioId, cursoId });
        
        if (!progreso) {
            progreso = new ProgresoCurso({ usuarioId, cursoId });
        }

        // Marcar módulo como completado
        const moduloCompletadoIndex = progreso.modulosCompletados.findIndex(m => m.moduloIndex === moduloIndex);
        
        if (moduloCompletadoIndex === -1) {
            progreso.modulosCompletados.push({
                moduloIndex,
                completado: true,
                fechaCompletado: new Date(),
                notaEvaluacion: nota || 0
            });
        } else {
            progreso.modulosCompletados[moduloCompletadoIndex].completado = true;
            progreso.modulosCompletados[moduloCompletadoIndex].fechaCompletado = new Date();
            progreso.modulosCompletados[moduloCompletadoIndex].notaEvaluacion = nota || 0;
        }

        // Avanzar al siguiente módulo si existe
        const siguienteModulo = moduloIndex + 1;
        progreso.moduloActual = siguienteModulo;
        progreso.contenidoActual = 0;

        progreso.ultimaActualizacion = new Date();
        await progreso.save();

        res.json({ 
            success: true, 
            progreso,
            siguienteModulo,
            mensaje: `Módulo ${moduloIndex + 1} completado. Avanzando al módulo ${siguienteModulo + 1}`
        });

    } catch (error) {
        console.log("Error completando módulo:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ============================================================
   📌 5. REGISTRAR EVALUACIÓN DE MÓDULO - ACTUALIZADO
   ============================================================ */
router.post("/evaluacion", async (req, res) => {
    try {
        const { usuarioId, cursoId, moduloIndex, nota } = req.body;

        // 1. Completar el módulo
        const responseCompletar = await ProgresoCurso.findOneAndUpdate(
            { usuarioId, cursoId },
            {
                $addToSet: { 
                    modulosCompletados: {
                        moduloIndex,
                        completado: true,
                        fechaCompletado: new Date(),
                        notaEvaluacion: nota
                    }
                },
                moduloActual: moduloIndex + 1, // Avanzar al siguiente módulo
                contenidoActual: 0,
                ultimaActualizacion: Date.now()
            },
            { new: true, upsert: true }
        );

        // 2. Actualizar habilidad_nueva en Usuario SIN PROMEDIAR
        const usuario = await Usuario.findById(usuarioId);
        usuario.habilidad_nueva = nota;
        await usuario.save();

        res.json({
            success: true,
            progreso: responseCompletar,
            habilidad_nueva: nota,
            mensaje: `Módulo ${moduloIndex + 1} completado y evaluación guardada`
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ============================================================
   📌 6. VERIFICAR SI PUEDE HACER EVALUACIÓN FINAL - NUEVO
   ============================================================ */
router.get("/puede-evaluacion-final/:usuarioId/:cursoId/:totalModulos", async (req, res) => {
    try {
        const { usuarioId, cursoId, totalModulos } = req.params;

        const progreso = await ProgresoCurso.findOne({ usuarioId, cursoId });
        
        if (!progreso) {
            return res.json({ 
                success: true, 
                puedeHacerEvaluacion: false,
                motivo: "No hay progreso registrado para este curso"
            });
        }

        // Contar módulos completados
        const modulosCompletados = progreso.modulosCompletados.filter(m => m.completado).length;
        const todosModulosCompletados = modulosCompletados >= totalModulos;

        res.json({
            success: true,
            puedeHacerEvaluacion: todosModulosCompletados && !progreso.evaluacionFinalCompletada,
            modulosCompletados,
            totalModulos: parseInt(totalModulos),
            evaluacionFinalCompletada: progreso.evaluacionFinalCompletada
        });

    } catch (error) {
        console.log("Error verificando evaluación final:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ============================================================
   📌 7. REGISTRAR EVALUACIÓN FINAL - MEJORADO
   ============================================================ */
router.post("/evaluacion-final", async (req, res) => {
    try {
        const { usuarioId, cursoId, notaFinal } = req.body;

        // 1. Actualizar progreso del curso
        const progreso = await ProgresoCurso.findOneAndUpdate(
            { usuarioId, cursoId },
            {
                evaluacionFinalCompletada: true,
                progresoPorcentual: 100,
                cursoCompletado: true,
                fechaCompletado: new Date(),
                estado: "completado",
                ultimaActualizacion: Date.now()
            },
            { new: true, upsert: true }
        );

        // 2. Actualizar habilidad_nueva en Usuario
        const usuario = await Usuario.findById(usuarioId);
        usuario.habilidad_nueva = notaFinal;
        await usuario.save();

        res.json({
            success: true,
            progreso,
            habilidad_nueva: notaFinal,
            mensaje: "¡Curso completado exitosamente!"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ============================================================
   📌 8. OBTENER PROGRESO PARA CONTINUAR - NUEVO
   ============================================================ */
router.get("/continuar/:usuarioId/:cursoId", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.params;

        const progreso = await ProgresoCurso.findOne({ usuarioId, cursoId });

        if (!progreso) {
            return res.json({
                success: true,
                moduloActual: 0,
                contenidoActual: 0,
                puedeContinuar: false,
                mensaje: "Iniciar curso desde el principio"
            });
        }

        // Si el curso está completado, no puede continuar
        if (progreso.cursoCompletado) {
            return res.json({
                success: true,
                moduloActual: progreso.moduloActual,
                contenidoActual: progreso.contenidoActual,
                puedeContinuar: false,
                cursoCompletado: true,
                mensaje: "Curso ya completado"
            });
        }

        res.json({
            success: true,
            moduloActual: progreso.moduloActual,
            contenidoActual: progreso.contenidoActual,
            puedeContinuar: true,
            progresoPorcentual: progreso.progresoPorcentual,
            modulosCompletados: progreso.modulosCompletados.filter(m => m.completado).length,
            mensaje: "Continuar desde el progreso guardado"
        });

    } catch (error) {
        console.log("Error obteniendo progreso para continuar:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ============================================================
   📌 9. MARCAR CURSO COMO COMPLETADO
   ============================================================ */
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;

        const progreso = await ProgresoCurso.findOneAndUpdate(
            { usuarioId, cursoId },
            {
                evaluacionFinalCompletada: true,
                progresoPorcentual: 100,
                ultimaActualizacion: Date.now(),
                cursoCompletado: true,
                fechaCompletado: new Date(),
                estado: "completado"
            },
            { new: true }
        );

        res.json({ 
            success: true, 
            progreso,
            mensaje: "Curso marcado como completado"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error });
    }
});

/* ============================================================
   📌 10. REINICIAR PROGRESO DEL CURSO
   ============================================================ */
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
                cursoCompletado: false,
                fechaCompletado: null,
                estado: "en_progreso",
                ultimaActualizacion: Date.now()
            },
            { new: true }
        );

        res.json({ 
            success: true, 
            progreso,
            mensaje: "Progreso reiniciado correctamente"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error });
    }
});

/* ============================================================
   📌 11. OBTENER HABILIDAD DEL USUARIO - NUEVO
   ============================================================ */
router.get("/habilidad/:usuarioId", async (req, res) => {
    try {
        const { usuarioId } = req.params;
        
        const usuario = await Usuario.findById(usuarioId);
        
        if (!usuario) {
            return res.status(404).json({ 
                success: false, 
                error: "Usuario no encontrado" 
            });
        }

        res.json({
            success: true,
            habilidad: usuario.habilidad_nueva || 0
        });

    } catch (error) {
        console.log("Error obteniendo habilidad:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;