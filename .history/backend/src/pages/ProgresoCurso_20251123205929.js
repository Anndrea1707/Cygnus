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
progresoCursoSchema.post('save', async function(doc) {
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

            // 1. Calcular tiempo transcurrido desde el último curso (en años)
            const fechaActual = new Date();
            const fechaUltimoCurso = new Date(doc.fechaCompletado);
            const diffMilisegundos = fechaActual - fechaUltimoCurso;
            const tiempoTranscurrido = diffMilisegundos / (1000 * 60 * 60 * 24 * 365.25); // en años

            console.log(`📅 Tiempo transcurrido: ${tiempoTranscurrido.toFixed(6)} años`);

            // 2. Obtener parámetros originales de la encuesta
            const tiempoAreaOriginal = usuario.encuesta_inicial.tiempo_area || 1; // años (default 1 si no existe)
            const nivelRecordacionOriginal = usuario.nivel_recordacion;

            // 3. Aplicar regla de tres para calcular nuevo nivel
            const nivelRecordacionNuevo = (tiempoTranscurrido * nivelRecordacionOriginal) / tiempoAreaOriginal;

            // 4. Limitar entre 0 y 1
            let nivelFinal = Math.max(0, Math.min(1, nivelRecordacionNuevo));

            // 5. Si el tiempo transcurrido es mayor al tiempo original, aplicar reducción adicional
            if (tiempoTranscurrido > tiempoAreaOriginal) {
                nivelFinal = nivelFinal * 0.7; // Reducir 30% adicional
                console.log(`📉 Aplicando reducción adicional por tiempo extendido`);
            }

            // 6. Actualizar usuario
            await Usuario.findByIdAndUpdate(doc.usuarioId, {
                nivel_recordacion_nuevo: Number(nivelFinal.toFixed(4)),
                ultima_actualizacion_recordacion: new Date(),
                ultimo_curso_completado: doc.fechaCompletado
            });

            console.log(`✅ Recordación actualizada: ${usuario.nombre_completo}`);
            console.log(`   - Tiempo original: ${tiempoAreaOriginal} años`);
            console.log(`   - Recordación original: ${(nivelRecordacionOriginal * 100).toFixed(1)}%`);
            console.log(`   - Tiempo transcurrido: ${tiempoTranscurrido.toFixed(4)} años`);
            console.log(`   - Recordación nueva: ${(nivelFinal * 100).toFixed(1)}%`);
            console.log(`   - Fecha último curso: ${fechaUltimoCurso.toLocaleDateString()}`);

        } catch (error) {
            console.error(`❌ Error en middleware de recordación para usuario ${doc.usuarioId}:`, error);
        }
    }
});

module.exports = mongoose.model("ProgresoCurso", progresoCursoSchema);