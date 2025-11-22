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

    // ⭐ ELIMINADO: habilidadNueva

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

module.exports = mongoose.model("ProgresoCurso", progresoCursoSchema);