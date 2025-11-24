const express = require("express");
const ProgresoCurso = require("./ProgresoCurso");
const Usuario = require("./Usuario");
const Curso = require("./ModeloCursos");
const router = express.Router();

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
   📌 3. COMPLETAR MÓDULO (guardar nota, fecha) — idempotente
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

        // ✅ ACTUALIZAR HABILIDAD_NUEVA CON LÓGICA MEJORADA (ANTES de guardar)
        const nuevaHabilidad = await calcularNuevaHabilidad(usuarioId, curso.nivel, nota, "modulo");

        // Recalcular progreso
        progreso.progresoPorcentual = calcularProgreso(progreso, curso);
        progreso.ultimaActualizacion = new Date();

        await progreso.save();

        res.json({
            success: true,
            progreso,
            habilidad_nueva: nuevaHabilidad,
            siguienteModulo: Math.min(moduloIndex + 1, totalModulos - 1),
            mensaje: `Módulo ${moduloIndex + 1} completado.`
        });
    } catch (error) {
        console.log("Error completando módulo:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ============================================================
   📌 4. REGISTRAR EVALUACIÓN FINAL - MEJORADO (CON save() PARA ACTIVAR MIDDLEWARE)
   ============================================================ */
router.post("/evaluacion-final", async (req, res) => {
    try {
        const { usuarioId, cursoId, notaFinal } = req.body;
        if (!usuarioId || !cursoId) return res.status(400).json({ success: false, error: "Datos incompletos" });

        const curso = await Curso.findById(cursoId);
        if (!curso) return res.status(404).json({ success: false, error: "Curso no encontrado" });

        // ✅ CAMBIO: Usar find + save() en lugar de findOneAndUpdate para activar middleware
        let progreso = await ProgresoCurso.findOne({ usuarioId, cursoId });

        if (!progreso) {
            progreso = new ProgresoCurso({
                usuarioId,
                cursoId,
                modulosCompletados: [],
                contenidosVistos: []
            });
        }

        // ✅ ACTUALIZAR CAMPOS MANUALMENTE (misma funcionalidad)
        progreso.evaluacionFinalCompletada = true;
        progreso.progresoPorcentual = 100;
        progreso.cursoCompletado = true;
        progreso.fechaCompletado = new Date();
        progreso.estado = "completado";
        progreso.ultimaActualizacion = new Date();

        // ✅ GUARDAR CON save() - ESTO ACTIVARÁ EL MIDDLEWARE DE RECORDACIÓN
        await progreso.save();

        // ✅ ACTUALIZAR HABILIDAD_NUEVA CON LÓGICA MEJORADA (funcionalidad existente)
        const nuevaHabilidad = await calcularNuevaHabilidad(usuarioId, curso.nivel, notaFinal, "evaluacion_final");

        res.json({
            success: true,
            progreso,
            habilidad_nueva: nuevaHabilidad,
            mensaje: "¡Curso completado exitosamente!"
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

module.exports = router;