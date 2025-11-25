const express = require("express");
const ProgresoCurso = require("./ProgresoCurso");
const Usuario = require("./Usuario");
const Curso = require("./ModeloCursos");
const router = express.Router();

// ⭐ NUEVO: Importar funciones de recomendaciones
const {
    obtenerRecomendacionPorcentual,
    verificarBloqueoEvaluacion
} = require("../helpers/recomendacionesEvaluacion");

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

    // 2) Progreso dentro del módulo actual (30% dividido entre módulos)
    const moduloActual = Math.min(Math.max(0, progreso?.moduloActual || 0), totalModulos - 1);
    const contenidosVistosEnModulo = (progreso?.contenidosVistos || []).filter(
        c => c.moduloIndex === moduloActual && c.visto
    ).length;
    const totalContenidosModuloActual = totalContenidosPorModulo[moduloActual] || 1;
    const progresoModuloActual = (contenidosVistosEnModulo / totalContenidosModuloActual) * (30 / totalModulos);
    progresoTotal += progresoModuloActual;

    // Si evaluación final está completada → debe ser 100
    if (progreso?.evaluacionFinalCompletada) {
        return 100;
    }

    // REDONDEAR AQUÍ (antes de comparaciones)
    const porcentaje = Math.min(100, Math.max(0, Math.round(progresoTotal)));

    // Si llegó a 100 sin evaluación final → marcar 90
    if (porcentaje >= 100) {
        return 90;
    }

    return porcentaje;
}

/* ============================================================
   🔹 UTIL: Calcular nueva habilidad MEJORADO CON DESAUMENTOS
   ============================================================ */
async function calcularNuevaHabilidad(usuarioId, cursoNivel, nota, tipo = "modulo") {
    try {
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) return null;

        const habilidadActual = usuario.habilidad_nueva > 0
            ? usuario.habilidad_nueva
            : (usuario.prueba_conocimiento?.habilidad || 1);

        let nuevaHabilidad = habilidadActual;
        let cambio = 0;

        // LÓGICA DE AUMENTO
        if (nota >= 90) {
            if (cursoNivel === "avanzado" && habilidadActual < 5) cambio = 0.5;
            else if (cursoNivel === "intermedio" && habilidadActual < 4) cambio = 0.4;
            else if (cursoNivel === "básico" && habilidadActual < 3) cambio = 0.3;
        } else if (nota >= 80) {
            if (cursoNivel === "avanzado" && habilidadActual < 5) cambio = 0.3;
            else if (cursoNivel === "intermedio" && habilidadActual < 4) cambio = 0.2;
            else if (cursoNivel === "básico" && habilidadActual < 3) cambio = 0.15;
        } else if (nota >= 70) {
            if (cursoNivel === "avanzado" && habilidadActual < 5) cambio = 0.2;
            else if (cursoNivel === "intermedio" && habilidadActual < 4) cambio = 0.1;
        }

        // ✅ NUEVA LÓGICA: DESAUMENTO SOLO EN CASOS GRAVES
        if (nota < 60) {
            if (tipo === "evaluacion_final") {
                cambio = -0.5; // Fuerte reducción por reprobar final
            } else if (cursoNivel === "avanzado" && habilidadActual > 3) {
                cambio = -0.3; // Reducción por fallar en avanzado
            }
        }

        // Bonus por evaluación final (solo si aprueba)
        if (tipo === "evaluacion_final" && nota >= 80) {
            cambio += 0.2;
        }

        nuevaHabilidad = Math.min(5, Math.max(1, habilidadActual + cambio));

        // Solo actualizar si hay cambio significativo
        if (Math.abs(cambio) >= 0.1) {
            await Usuario.findByIdAndUpdate(usuarioId, {
                habilidad_nueva: Math.round(nuevaHabilidad * 10) / 10
            });

            const direccion = cambio > 0 ? "↑" : "↓";
            console.log(`🎯 Habilidad ${direccion}: ${habilidadActual} → ${nuevaHabilidad} (Nota: ${nota}, Curso: ${cursoNivel})`);
            return nuevaHabilidad;
        }

        return habilidadActual;

    } catch (error) {
        console.error("Error calculando nueva habilidad:", error);
        return null;
    }
}

/* ============================================================
   🔹 UTIL: Normalizar módulos completados (SOLO completados si aprobaron)
   ============================================================ */
function normalizarModulosCompletadosBackend(modulosCompletados = []) {
    const map = new Map();
    for (const m of modulosCompletados) {
        // SOLO marcar como completado si tiene nota >= 70
        const estaCompletado = m.completado && (m.notaEvaluacion || 0) >= 70;
        
        if (typeof m.moduloIndex !== "number") continue;
        map.set(m.moduloIndex, {
            moduloIndex: m.moduloIndex,
            completado: estaCompletado,
            fechaCompletado: m.fechaCompletado || null,
            notaEvaluacion: typeof m.notaEvaluacion === "number" ? m.notaEvaluacion : 0,
            aprobado: estaCompletado,
            ultimoIntento: m.ultimoIntento || null,
            bloqueadoHasta: m.bloqueadoHasta || null
        });
    }
    return Array.from(map.values()).sort((a, b) => a.moduloIndex - b.moduloIndex);
}

/* ============================================================
   📌 12. NUEVO: VERIFICAR BLOQUEO DE EVALUACIÓN
   ============================================================ */
router.post("/verificar-bloqueo-evaluacion", async (req, res) => {
    try {
        const { usuarioId, cursoId, moduloIndex, tipo } = req.body;

        const progreso = await ProgresoCurso.findOne({ usuarioId, cursoId });
        if (!progreso) {
            return res.json({
                success: true,
                bloqueado: false,
                mensaje: "No hay progreso registrado"
            });
        }

        let ultimoIntento = null;
        let bloqueadoHasta = null;
        let nota = 0;

        if (tipo === "modulo" && moduloIndex !== undefined) {
            const modulo = progreso.modulosCompletados.find(m => m.moduloIndex === moduloIndex);
            if (modulo) {
                ultimoIntento = modulo.ultimoIntento;
                bloqueadoHasta = modulo.bloqueadoHasta;
                nota = modulo.notaEvaluacion || 0;
            }
        } else if (tipo === "final") {
            ultimoIntento = progreso.evaluacionFinalUltimoIntento;
            bloqueadoHasta = progreso.evaluacionFinalBloqueadoHasta;
            nota = progreso.notaEvaluacionFinal || 0;
        }

        // Verificar si está bloqueado
        const ahora = new Date();
        if (bloqueadoHasta && ahora < new Date(bloqueadoHasta)) {
            const tiempoRestanteMs = new Date(bloqueadoHasta) - ahora;
            const tiempoRestanteMinutos = Math.ceil(tiempoRestanteMs / (1000 * 60));
            
            const recomendacion = obtenerRecomendacionPorcentual(nota);
            
            return res.json({
                success: true,
                bloqueado: true,
                tiempoRestante: tiempoRestanteMinutos,
                recomendacion: recomendacion.mensaje,
                desbloqueo: bloqueadoHasta
            });
        }

        res.json({
            success: true,
            bloqueado: false,
            mensaje: "Evaluación disponible"
        });

    } catch (error) {
        console.error("Error verificando bloqueo:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

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
   📌 2. GUARDAR/REGISTRAR CONTENIDO VISTO - idempotente y validado
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
   📌 3. COMPLETAR MÓDULO (guardar nota, fecha) — idempotente CON BLOQUEO
   ============================================================ */
router.post("/completar-modulo", async (req, res) => {
    try {
        const { usuarioId, cursoId, moduloIndex, nota, minutosBloqueo } = req.body;

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

        const ahora = new Date();
        let bloqueadoHasta = null;

        // Calcular fecha de desbloqueo si hay bloqueo
        if (minutosBloqueo > 0) {
            bloqueadoHasta = new Date(ahora.getTime() + minutosBloqueo * 60 * 1000);
        }

        if (idx === -1) {
            progreso.modulosCompletados.push({
                moduloIndex,
                completado: true,
                fechaCompletado: ahora,
                notaEvaluacion: nota || 0,
                ultimoIntento: ahora,
                bloqueadoHasta: bloqueadoHasta
            });
        } else {
            // Actualizar información (no duplicar)
            progreso.modulosCompletados[idx].completado = true;
            progreso.modulosCompletados[idx].fechaCompletado = ahora;
            progreso.modulosCompletados[idx].notaEvaluacion = nota || progreso.modulosCompletados[idx].notaEvaluacion || 0;
            progreso.modulosCompletados[idx].ultimoIntento = ahora;
            progreso.modulosCompletados[idx].bloqueadoHasta = bloqueadoHasta;
        }

        // Avanzar moduloActual solo si existe uno siguiente Y si aprobó
        const recomendacion = obtenerRecomendacionPorcentual(nota);
        if (recomendacion.puedeAvanzar && moduloIndex + 1 < totalModulos) {
            progreso.moduloActual = moduloIndex + 1;
            progreso.contenidoActual = 0;
        } else {
            // Si no puede avanzar, mantener en el mismo módulo
            progreso.moduloActual = moduloIndex;
        }

        // ✅ ACTUALIZAR HABILIDAD_NUEVA CON LÓGICA MEJORADA (ANTES de guardar)
        const nuevaHabilidad = await calcularNuevaHabilidad(usuarioId, curso.nivel, nota, "modulo");

        // Recalcular progreso
        progreso.progresoPorcentual = calcularProgreso(progreso, curso);
        progreso.ultimaActualizacion = ahora;

        await progreso.save();

        res.json({
            success: true,
            progreso,
            habilidad_nueva: nuevaHabilidad,
            recomendacion: recomendacion,
            puedeAvanzar: recomendacion.puedeAvanzar,
            siguienteModulo: recomendacion.puedeAvanzar ? Math.min(moduloIndex + 1, totalModulos - 1) : moduloIndex,
            mensaje: `Módulo ${moduloIndex + 1} completado.`
        });
    } catch (error) {
        console.log("Error completando módulo:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ============================================================
   📌 4. REGISTRAR EVALUACIÓN FINAL - MEJORADO CON BLOQUEO
   ============================================================ */
router.post("/evaluacion-final", async (req, res) => {
    try {
        const { usuarioId, cursoId, notaFinal, minutosBloqueo } = req.body;

        const curso = await Curso.findById(cursoId);
        if (!curso) return res.status(404).json({ success: false, error: "Curso no encontrado" });

        let progreso = await ProgresoCurso.findOne({ usuarioId, cursoId });

        if (!progreso) {
            progreso = new ProgresoCurso({
                usuarioId,
                cursoId,
                modulosCompletados: [],
                contenidosVistos: []
            });
        }

        const ahora = new Date();
        let bloqueadoHasta = null;

        // Calcular fecha de desbloqueo si hay bloqueo
        if (minutosBloqueo > 0) {
            bloqueadoHasta = new Date(ahora.getTime() + minutosBloqueo * 60 * 1000);
        }

        progreso.evaluacionFinalCompletada = true;
        progreso.notaEvaluacionFinal = notaFinal;
        progreso.evaluacionFinalUltimoIntento = ahora;
        progreso.evaluacionFinalBloqueadoHasta = bloqueadoHasta;

        // Solo marcar como completado si aprobó
        if (notaFinal >= 70) {
            progreso.progresoPorcentual = 100;
            progreso.cursoCompletado = true;
            progreso.fechaCompletado = ahora;
            progreso.estado = "completado";
        } else {
            progreso.progresoPorcentual = 90; // Máximo sin aprobar evaluación final
        }

        progreso.ultimaActualizacion = ahora;

        await progreso.save();

        const nuevaHabilidad = await calcularNuevaHabilidad(usuarioId, curso.nivel, notaFinal, "evaluacion_final");
        const recomendacion = obtenerRecomendacionPorcentual(notaFinal);

        res.json({
            success: true,
            progreso,
            habilidad_nueva: nuevaHabilidad,
            recomendacion: recomendacion,
            aprobado: notaFinal >= 70,
            mensaje: notaFinal >= 70 ? "¡Curso completado exitosamente!" : "Evaluación final registrada"
        });

    } catch (error) {
        console.log("Error en evaluacion-final:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ============================================================
   📌 5. VERIFICAR SI PUEDE HACER EVALUACIÓN FINAL
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

        // Verificar si la evaluación final está bloqueada
        const ahora = new Date();
        const evaluacionFinalBloqueada = progreso.evaluacionFinalBloqueadoHasta &&
            ahora < new Date(progreso.evaluacionFinalBloqueadoHasta);

        res.json({
            success: true,
            puedeHacerEvaluacion: todosModulosCompletados &&
                !progreso.evaluacionFinalCompletada &&
                !evaluacionFinalBloqueada,
            modulosCompletados,
            totalModulos: parseInt(totalModulos),
            evaluacionFinalCompletada: progreso.evaluacionFinalCompletada,
            evaluacionFinalBloqueada: evaluacionFinalBloqueada,
            desbloqueo: progreso.evaluacionFinalBloqueadoHasta
        });

    } catch (error) {
        console.log("Error verificando evaluación final:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ============================================================
   📌 6. OBTENER PROGRESO PARA CONTINUAR
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
   📌 7. COMPLETAR CURSO (SOLO UNA VEZ - ELIMINADAS LAS DUPLICADAS)
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

/* ============================================================
   📌 8. REINICIAR PROGRESO DEL CURSO
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
                evaluacionFinalUltimoIntento: null,
                evaluacionFinalBloqueadoHasta: null,
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
   📌 9. OBTENER HABILIDAD DEL USUARIO
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

        // ✅ LÓGICA CORRECTA: usar habilidad_nueva si es > 0, sino habilidad de prueba
        const habilidad = usuario.habilidad_nueva > 0
            ? usuario.habilidad_nueva
            : (usuario.prueba_conocimiento?.habilidad || 0);

        res.json({
            success: true,
            habilidad,
            fuente: usuario.habilidad_nueva > 0 ? "habilidad_nueva" : "prueba_conocimiento"
        });

    } catch (error) {
        console.log("Error obteniendo habilidad:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ============================================================
   📌 10. ACTUALIZAR HABILIDAD MANUALMENTE (para testing/admin)
   ============================================================ */
router.put("/actualizar-habilidad", async (req, res) => {
    try {
        const { usuarioId, nuevaHabilidad } = req.body;

        if (!usuarioId || nuevaHabilidad == null) {
            return res.status(400).json({ success: false, error: "Datos incompletos" });
        }

        const usuario = await Usuario.findByIdAndUpdate(
            usuarioId,
            {
                habilidad_nueva: Math.min(5, Math.max(0, nuevaHabilidad))
            },
            { new: true }
        );

        if (!usuario) {
            return res.status(404).json({ success: false, error: "Usuario no encontrado" });
        }

        res.json({
            success: true,
            habilidad_nueva: usuario.habilidad_nueva,
            mensaje: "Habilidad actualizada correctamente"
        });

    } catch (error) {
        console.log("Error actualizando habilidad:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ============================================================
   📌 11. OBTENER NOTAS DETALLADAS DEL CURSO COMPLETADO
   ============================================================ */
router.get("/notas-detalladas/:usuarioId/:cursoId", async (req, res) => {
    try {
        const { usuarioId, cursoId } = req.params;

        // Buscar progreso del curso
        const progreso = await ProgresoCurso.findOne({ usuarioId, cursoId });

        if (!progreso) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró el progreso del curso'
            });
        }

        // Buscar información del curso para obtener nombres de módulos
        const curso = await Curso.findById(cursoId);
        if (!curso) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró el curso'
            });
        }

        // Ordenar módulos completados por índice y enriquecer con información del curso
        const modulosDetallados = progreso.modulosCompletados
            ?.filter(mod => mod.completado)
            ?.sort((a, b) => a.moduloIndex - b.moduloIndex)
            ?.map(modulo => {
                const infoModulo = curso.modulos[modulo.moduloIndex];
                return {
                    moduloIndex: modulo.moduloIndex,
                    nombre: infoModulo?.nombre || `Módulo ${modulo.moduloIndex + 1}`,
                    completado: modulo.completado,
                    fechaCompletado: modulo.fechaCompletado,
                    notaEvaluacion: modulo.notaEvaluacion || 0,
                    tieneEvaluacion: !!(infoModulo?.evaluacion)
                };
            }) || [];

        res.json({
            success: true,
            notas: {
                modulos: modulosDetallados,
                evaluacionFinal: {
                    completada: progreso.evaluacionFinalCompletada,
                    nota: progreso.notaEvaluacionFinal || 0
                },
                cursoCompletado: progreso.cursoCompletado,
                fechaCompletado: progreso.fechaCompletado || progreso.ultimaActualizacion,
                progresoGeneral: progreso.progresoPorcentual
            },
            cursoInfo: {
                nombre: curso.nombre,
                totalModulos: curso.modulos.length,
                nivel: curso.nivel
            }
        });

    } catch (error) {
        console.error('Error obteniendo notas detalladas:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });
    }
});

/* ============================================================
   📌 13. NUEVO: OBTENER RECOMENDACIÓN POR PORCENTAJE
   ============================================================ */
router.post("/obtener-recomendacion", async (req, res) => {
    try {
        const { porcentaje } = req.body;
        
        if (porcentaje === undefined || porcentaje === null) {
            return res.status(400).json({
                success: false,
                error: "Porcentaje es requerido"
            });
        }

        const recomendacion = obtenerRecomendacionPorcentual(porcentaje);
        
        res.json({
            success: true,
            recomendacion,
            porcentaje
        });

    } catch (error) {
        console.error("Error obteniendo recomendación:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;