const express = require("express");
const ProgresoCurso = require("./ProgresoCurso");
const Usuario = require("./Usuario");
const Curso = require("./ModeloCursos");
const router = express.Router();

// ============================================
// FUNCION: Calcular nivel_recordacion_nuevo
// ============================================
async function recalcularNivelRecordacion(usuarioId, fechaCompletado) {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) return;

    const A = usuario.encuesta_inicial.tiempo_area;          // años originales
    const B = usuario.encuesta_inicial.tasa_olvido;          // tasa original (%)

    if (!A || !B || !fechaCompletado) return;

    // C = tiempo transcurrido desde el último curso completado (en AÑOS)
    const diffMs = Date.now() - new Date(fechaCompletado).getTime();
    const C = diffMs / (1000 * 60 * 60 * 24 * 365); // años exactos

    // Regla de tres:
    //  A -----> B
    //  C -----> X
    //  X = (C * B) / A
    let X = (C * B) / A;

    // Limitar entre 0 y 1
    if (X < 0) X = 0;
    if (X > 1) X = 1;

    usuario.nivel_recordacion_nuevo = X;
    await usuario.save();

    return X;
}

/* ============================================================
   🔹 UTIL: Calcular porcentaje total de progreso MEJORADO
   ============================================================ */
function calcularProgreso(progreso, curso) {
    if (!curso || !Array.isArray(curso.modulos) || curso.modulos.length === 0) return 0;

    const totalModulos = curso.modulos.length;
    const totalContenidosPorModulo = curso.modulos.map(m => (m.contenido || []).length);
    const totalContenidos = totalContenidosPorModulo.reduce((a, b) => a + b, 0) || 1;

    // 1) Progreso por módulos completados (70% del total)
    const modulosCompletados = (progreso?.modulosCompletados || []).filter(m => m.completado).length;
    let progresoTotal = (modulosCompletados / totalModulos) * 70;

    // 2) Progreso dentro del módulo actual (30% total repartido equitativamente)
    const moduloActual = Math.min(Math.max(0, progreso?.moduloActual || 0), totalModulos - 1);
    const contenidosVistosEnModulo = (progreso?.contenidosVistos || []).filter(
        c => c.moduloIndex === moduloActual && c.visto
    ).length;
    const totalContenidosModuloActual = totalContenidosPorModulo[moduloActual] || 1;
    const progresoModuloActual = (contenidosVistosEnModulo / totalContenidosModuloActual) * (30 / totalModulos);
    progresoTotal += progresoModuloActual;

    // 3) Si evaluación final completada => 100
    if (progreso?.evaluacionFinalCompletada) {
        return 100;
    }

    // redondear y proteger rango
    const porcentaje = Math.min(100, Math.max(0, Math.round(progresoTotal)));
    return porcentaje;
}

/* ============================================================
   📌 1. OBTENER PROGRESO DE UN CURSO - MEJORADO
   ============================================================ */
router.get("/curso/:usuarioId/:cursoId", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.params;

        // ✅ SOLO buscar progreso existente, NO crear uno nuevo automáticamente
        const progreso = await ProgresoCurso.findOne({ usuarioId, cursoId });

        // Si no existe progreso, devolver null en lugar de crear uno
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

/* ============================================================
   GUARDAR/REGISTRAR CONTENIDO VISTO - idempotente y validado
   ============================================================ */
router.post("/contenido-visto", async (req, res) => {
    try {
        const { usuarioId, cursoId, moduloIndex, contenidoIndex } = req.body;

        if (usuarioId == null || !cursoId || moduloIndex == null || contenidoIndex == null) {
            return res.status(400).json({ success: false, error: "Faltan datos obligatorios" });
        }

        // Validar curso y límites
        const curso = await Curso.findById(cursoId);
        if (!curso) return res.status(404).json({ success: false, error: "Curso no encontrado" });

        const totalModulos = curso.modulos.length;
        if (moduloIndex < 0 || moduloIndex >= totalModulos) {
            return res.status(400).json({ success: false, error: "Índice de módulo fuera de rango" });
        }
        const totalContenidos = (curso.modulos[moduloIndex].contenido || []).length;
        if (contenidoIndex < 0 || contenidoIndex >= totalContenidos) {
            return res.status(400).json({ success: false, error: "Índice de contenido fuera de rango" });
        }

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
            // actualizar posición actual SOLO si la nueva posición es "mayor" o diferente
            progreso.moduloActual = moduloIndex;
            progreso.contenidoActual = contenidoIndex;
        }

        // Evitar duplicar: buscar si ya existe la entrada del contenido
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
            // actualizar timestamp si ya existe (idempotente)
            progreso.contenidosVistos[existe].visto = true;
            progreso.contenidosVistos[existe].fechaVisto = new Date();
        }

        // Recalcular progreso porcentual usando el curso real
        progreso.progresoPorcentual = calcularProgreso(progreso, curso);
        progreso.ultimaActualizacion = new Date();

        await progreso.save();

        res.json({ success: true, progreso });
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
   COMPLETAR MÓDULO (guardar nota, fecha) — idempotente
   ============================================================ */
router.post("/completar-modulo", async (req, res) => {
    try {
        const { usuarioId, cursoId, moduloIndex, nota } = req.body;

        if (usuarioId == null || !cursoId || moduloIndex == null) {
            return res.status(400).json({ success: false, error: "Faltan datos obligatorios" });
        }

        const curso = await Curso.findById(cursoId);
        if (!curso) return res.status(404).json({ success: false, error: "Curso no encontrado" });

        const totalModulos = curso.modulos.length;
        if (moduloIndex < 0 || moduloIndex >= totalModulos) {
            return res.status(400).json({ success: false, error: "Índice de módulo fuera de rango" });
        }

        let progreso = await ProgresoCurso.findOne({ usuarioId, cursoId });
        if (!progreso) {
            progreso = new ProgresoCurso({ usuarioId, cursoId });
        }

        // Buscar si el módulo ya está registrado como completado
        const idx = progreso.modulosCompletados.findIndex(m => m.moduloIndex === moduloIndex);

        if (idx === -1) {
            progreso.modulosCompletados.push({
                moduloIndex,
                completado: true,
                fechaCompletado: new Date(),
                notaEvaluacion: nota || 0
            });
        } else {
            // Actualizar información (no duplicar)
            progreso.modulosCompletados[idx].completado = true;
            progreso.modulosCompletados[idx].fechaCompletado = new Date();
            progreso.modulosCompletados[idx].notaEvaluacion = nota || progreso.modulosCompletados[idx].notaEvaluacion || 0;
        }

        // Avanzar moduloActual solo si existe uno siguiente
        if (moduloIndex + 1 < totalModulos) {
            progreso.moduloActual = moduloIndex + 1;
            progreso.contenidoActual = 0;
        } else {
            // Si era el último módulo, dejamos moduloActual en el último (no más allá)
            progreso.moduloActual = totalModulos - 1;
            progreso.contenidoActual = (curso.modulos[progreso.moduloActual].contenido?.length || 1) - 1;
        }

        // Recalcular progreso
        progreso.progresoPorcentual = calcularProgreso(progreso, curso);

        progreso.ultimaActualizacion = new Date();
        await progreso.save();

        res.json({
            success: true,
            progreso,
            siguienteModulo: Math.min(moduloIndex + 1, totalModulos - 1),
            mensaje: `Módulo ${moduloIndex + 1} completado.`
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
        if (!usuarioId || !cursoId || moduloIndex == null) {
            return res.status(400).json({ success: false, error: "Datos incompletos" });
        }

        const curso = await Curso.findById(cursoId);
        if (!curso) return res.status(404).json({ success: false, error: "Curso no encontrado" });

        // Reusar la lógica de completar-modulo para evitar duplicación de código
        // (podrías llamar internamente o repetir la misma lógica)
        // Aquí simplificamos reutilizando la ruta anterior: (optimización posible)
        // Para claridad, actualizamos manualmente similar a completar-modulo:

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
            progreso.modulosCompletados[idx].notaEvaluacion = nota || progreso.modulosCompletados[idx].notaEvaluacion || 0;
        }

        // Avanzar moduloActual de forma segura
        const totalModulos = curso.modulos.length;
        if (moduloIndex + 1 < totalModulos) {
            progreso.moduloActual = moduloIndex + 1;
            progreso.contenidoActual = 0;
        } else {
            progreso.moduloActual = totalModulos - 1;
            progreso.contenidoActual = (curso.modulos[progreso.moduloActual].contenido?.length || 1) - 1;
        }

        progreso.progresoPorcentual = calcularProgreso(progreso, curso);
        progreso.ultimaActualizacion = new Date();

        // Actualizar habilidad_nueva en Usuario (mantén tu lógica)
        const usuario = await Usuario.findById(usuarioId);
        if (usuario) {
            usuario.habilidad_nueva = nota;
            await usuario.save();
        }

        await progreso.save();

        res.json({
            success: true,
            progreso,
            habilidad_nueva: nota,
            mensaje: `Módulo ${moduloIndex + 1} completado y evaluación guardada`
        });
    } catch (error) {
        console.log("Error en /evaluacion:", error);
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
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

        const curso = await Curso.findById(cursoId);
        if (!curso) return res.status(404).json({ success: false, error: "Curso no encontrado" });

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

        const usuario = await Usuario.findById(usuarioId);
        if (usuario) {
            usuario.habilidad_nueva = notaFinal;
            await usuario.save();
        }

        res.json({
            success: true,
            progreso,
            habilidad_nueva: notaFinal,
            mensaje: "¡Curso completado exitosamente!"
        });
    } catch (error) {
        console.log("Error en evaluacion-final:", error);
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
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post("/completar-curso", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

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
        console.log("Error en completar-curso:", error);
        res.status(500).json({ success: false, error: error.message });
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