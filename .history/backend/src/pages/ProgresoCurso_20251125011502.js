// src/modelos/ProgresoCurso.js
const mongoose = require("mongoose");

const progresoCursoSchema = new mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },

    cursoId: {
        type: String,
        required: true
    },

    // ⭐ MEJORADO: Progreso detallado por módulo
    moduloActual: {
        type: Number,
        default: 0
    },

    contenidoActual: {
        type: Number,
        default: 0
    },

    // ⭐ NUEVO: Módulos completados con detalles
    modulosCompletados: [{
        moduloIndex: { type: Number, required: true },
        completado: { type: Boolean, default: false },
        fechaCompletado: { type: Date, default: null },
        notaEvaluacion: { type: Number, default: 0 },
        // ⭐ NUEVO: Para control de bloqueos
        ultimoIntento: { type: Date, default: null },
        bloqueadoHasta: { type: Date, default: null }
    }],

    // ⭐ NUEVO: Contenidos vistos por módulo
    contenidosVistos: [{
        moduloIndex: { type: Number, required: true },
        contenidoIndex: { type: Number, required: true },
        visto: { type: Boolean, default: false },
        fechaVisto: { type: Date, default: null }
    }],

    evaluacionFinalCompletada: {
        type: Boolean,
        default: false
    },

    notaEvaluacionFinal: {
        type: Number,
        default: 0
    },

    // ⭐ NUEVO: Para control de bloqueos de evaluación final
    evaluacionFinalUltimoIntento: {
        type: Date,
        default: null
    },

    evaluacionFinalBloqueadoHasta: {
        type: Date,
        default: null
    },

    progresoPorcentual: {
        type: Number,
        default: 0
    },

    ultimaActualizacion: {
        type: Date,
        default: Date.now
    },

    cursoCompletado: {
        type: Boolean,
        default: false
    },

    fechaCompletado: {
        type: Date,
        default: null
    },

    // ⭐ NUEVO: Para controlar si puede hacer evaluación final
    modulosParaEvaluacionFinal: {
        type: Number,
        default: 0
    },

    // ⭐ NUEVO: Estado del curso
    estado: {
        type: String,
        enum: ["en_progreso", "completado", "abandonado"],
        default: "en_progreso"
    }
});

// ============================================================
// 🔥 MIDDLEWARE: Actualizar recordación nueva automáticamente
// ============================================================
progresoCursoSchema.post('save', async function (doc) {
    // Solo ejecutar si el curso se acaba de marcar como completado
    if (doc.cursoCompletado && doc.fechaCompletado) {
        try {
            console.log(`🔄 Procesando actualización de recordación para usuario ${doc.usuarioId}`);

            const Usuario = mongoose.model('Usuario');
            const usuario = await Usuario.findById(doc.usuarioId);

            if (!usuario) {
                console.log(`❌ Usuario ${doc.usuarioId} no encontrado`);
                return;
            }

            // Verificar que tenga los datos necesarios
            if (!usuario.lambda_original || !usuario.tiempo_original_meses) {
                console.log(`ℹ️ Usuario no tiene datos de encuesta completos`);
                return;
            }

            // 1. CONTAR CURSOS COMPLETADOS
            const totalCursosCompletados = await this.constructor.countDocuments({
                usuarioId: doc.usuarioId,
                cursoCompletado: true,
                fechaCompletado: { $ne: null }
            });

            console.log(`📊 Total cursos completados: ${totalCursosCompletados}`);

            // 2. OBTENER DATOS ORIGINALES
            const lambda_original = usuario.lambda_original;
            const tiempo_original_meses = usuario.tiempo_original_meses;

            let tiempo_transcurrido_meses;

            // 3. CALCULAR TIEMPO TRANSCURRIDO
            if (totalCursosCompletados === 1) {
                // ✅ PRIMER CURSO: tiempo desde que se registró
                const fechaRegistro = usuario.creado_en;
                const fechaActual = new Date();
                const diffMs = fechaActual - fechaRegistro;
                tiempo_transcurrido_meses = diffMs / (1000 * 60 * 60 * 24 * 30.44); // convertir a meses

                console.log(`🎯 Primer curso - Tiempo desde registro: ${tiempo_transcurrido_meses.toFixed(2)} meses`);

            } else {
                // ✅ SEGUNDO CURSO+: tiempo desde último curso completado
                const cursosCompletados = await this.constructor.find({
                    usuarioId: doc.usuarioId,
                    cursoCompletado: true,
                    fechaCompletado: { $ne: null },
                    _id: { $ne: doc._id }
                }).sort({ fechaCompletado: -1 }).limit(1);

                if (cursosCompletados.length === 0) {
                    console.log(`❌ No se encontró curso anterior para comparar`);
                    return;
                }

                const fechaUltimoCurso = cursosCompletados[0].fechaCompletado;
                const fechaActual = new Date();
                const diffMs = fechaActual - fechaUltimoCurso;
                tiempo_transcurrido_meses = diffMs / (1000 * 60 * 60 * 24 * 30.44); // convertir a meses

                console.log(`📚 Curso #${totalCursosCompletados} - Tiempo desde último curso: ${tiempo_transcurrido_meses.toFixed(2)} meses`);
            }

            // 4. CALCULAR LAMBDA_NUEVA (REGLA DE 3)
            // Si original: tiempo_original_meses → lambda_original
            // Ahora: tiempo_transcurrido_meses → lambda_nueva
            const lambda_nueva = (lambda_original * tiempo_transcurrido_meses) / tiempo_original_meses;

            // Limitar lambda_nueva entre 0.01 y 0.5 (valores razonables)
            const lambda_final = Math.max(0.01, Math.min(0.5, lambda_nueva));

            // 5. CALCULAR NUEVO TIEMPO (acumulado)
            const tiempo_nuevo_meses = tiempo_original_meses + tiempo_transcurrido_meses;

            // 6. CALCULAR NIVEL_RECORDACION_NUEVO con fórmula de curva de olvido
            const { recuerdo } = require("../modelos/ModelosMatematicos");
            const tiempo_nuevo_anios = tiempo_nuevo_meses / 12;
            const nivel_recordacion_nuevo = recuerdo(tiempo_nuevo_anios, lambda_final);

            console.log(`📈 Cálculos de actualización:`, {
                tiempo_original_meses,
                lambda_original: (lambda_original * 100).toFixed(1) + '%',
                tiempo_transcurrido_meses: tiempo_transcurrido_meses.toFixed(2),
                lambda_nueva: (lambda_final * 100).toFixed(1) + '%',
                tiempo_nuevo_meses: tiempo_nuevo_meses.toFixed(2),
                nivel_recordacion_nuevo: (nivel_recordacion_nuevo * 100).toFixed(1) + '%'
            });

            // 7. ACTUALIZAR USUARIO
            const usuarioActualizado = await Usuario.findByIdAndUpdate(doc.usuarioId, {
                lambda_nueva: lambda_final,
                tiempo_nuevo_meses: tiempo_nuevo_meses,
                nivel_recordacion_nuevo: nivel_recordacion_nuevo,
                ultima_actualizacion_recordacion: new Date(),
                ultimo_curso_completado: doc.fechaCompletado
            }, { new: true });

            console.log(`✅ Recordación actualizada correctamente para ${usuario.nombre_completo}`);
            console.log(`🔄 Usuario actualizado en BD - nivel_recordacion_nuevo: ${usuarioActualizado.nivel_recordacion_nuevo}`);

        } catch (error) {
            console.error(`❌ Error en middleware de recordación:`, error);
        }
    }
});

module.exports = mongoose.model("ProgresoCurso", progresoCursoSchema);