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
        notaEvaluacion: { type: Number, default: 0 }
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

            // Verificar que tenga los datos necesarios de la encuesta
            if (!usuario.encuesta_inicial?.tasa_olvido || usuario.nivel_recordacion == null) {
                console.log(`ℹ️ Usuario ${doc.usuarioId} no tiene datos de encuesta completos`);
                return;
            }

            // 1. CONTAR CURSOS COMPLETADOS (incluyendo este)
            const totalCursosCompletados = await ProgresoCurso.countDocuments({
                usuarioId: doc.usuarioId,
                cursoCompletado: true,
                fechaCompletado: { $ne: null }
            });

            console.log(`📊 Total cursos completados: ${totalCursosCompletados}`);

            const tiempoAreaOriginal = usuario.encuesta_inicial.tiempo_area || 1;
            const nivelRecordacionOriginal = usuario.nivel_recordacion;
            let nivelFinal;

            // 2. LÓGICA DIFERENTE SEGÚN SI ES PRIMER CURSO O NO
            if (totalCursosCompletados === 1) {
                // ✅ PRIMER CURSO COMPLETADO
                console.log(`🎯 Es el PRIMER curso del usuario`);

                // Para el primer curso, mantener recordación alta (90-100% del original)
                const fechaRegistro = usuario.creado_en;
                const fechaActual = new Date();
                const tiempoDesdeRegistro = (fechaActual - fechaRegistro) / (1000 * 60 * 60 * 24 * 365.25);

                // FÓRMULA INVERSA CORREGIDA
                nivelFinal = nivelRecordacionOriginal * (1 - (tiempoDesdeRegistro / (tiempoAreaOriginal * 2)));

                console.log(`   - Tiempo desde registro: ${tiempoDesdeRegistro.toFixed(4)} años`);

            } else {
                // ✅ SEGUNDO CURSO EN ADELANTE
                console.log(`📚 Es el curso #${totalCursosCompletados} del usuario`);

                // Buscar el PENÚLTIMO curso completado
                const cursosCompletados = await ProgresoCurso.find({
                    usuarioId: doc.usuarioId,
                    cursoCompletado: true,
                    fechaCompletado: { $ne: null },
                    _id: { $ne: doc._id } // Excluir el curso actual
                }).sort({ fechaCompletado: -1 }).limit(1);

                if (cursosCompletados.length === 0) {
                    console.log(`❌ No se encontró curso anterior`);
                    return;
                }

                const fechaUltimoCurso = cursosCompletados[0].fechaCompletado;
                const fechaActual = new Date();
                const tiempoTranscurrido = (fechaActual - fechaUltimoCurso) / (1000 * 60 * 60 * 24 * 365.25);

                console.log(`📅 Tiempo desde último curso: ${tiempoTranscurrido.toFixed(6)} años`);

                // ✅ FÓRMULA INVERSA CORREGIDA
                nivelFinal = nivelRecordacionOriginal * (1 - (tiempoTranscurrido / tiempoAreaOriginal));

                // Si el tiempo es negativo o muy extraño, usar valor mínimo
                if (tiempoTranscurrido < 0) {
                    nivelFinal = nivelRecordacionOriginal * 0.95;
                    console.log(`⚠️  Tiempo negativo, usando valor seguro`);
                }
            }

            // 3. LIMITAR ENTRE MÍNIMO Y MÁXIMO
            nivelFinal = Math.max(0.05, Math.min(0.95, nivelFinal)); // Mínimo 5%, máximo 95%

            // 4. ACTUALIZAR USUARIO
            await Usuario.findByIdAndUpdate(doc.usuarioId, {
                nivel_recordacion_nuevo: Number(nivelFinal.toFixed(4)),
                ultima_actualizacion_recordacion: new Date(),
                ultimo_curso_completado: doc.fechaCompletado
            });

            console.log(`✅ Recordación actualizada: ${usuario.nombre_completo}`);
            console.log(`   - Tiempo original encuesta: ${tiempoAreaOriginal} años`);
            console.log(`   - Recordación original: ${(nivelRecordacionOriginal * 100).toFixed(1)}%`);
            console.log(`   - Recordación nueva: ${(nivelFinal * 100).toFixed(1)}%`);

        } catch (error) {
            console.error(`❌ Error en middleware de recordación para usuario ${doc.usuarioId}:`, error);
        }
    }
});

module.exports = mongoose.model("ProgresoCurso", progresoCursoSchema);