// src/modelos/ProgresoCurso.js
const mongoose = require("mongoose");

const progresoCursoSchema = new mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },

    cursoId: {
        type: String, // tus cursos tienen id generado por frontend
        required: true
    },

    // En qué módulo va actualmente
    moduloActual: {
        type: Number,
        default: 0
    },

    // En qué contenido del módulo va
    contenidoActual: {
        type: Number,
        default: 0
    },

    // Lista de módulos completados
    modulosCompletados: {
        type: [Number],
        default: []
    },

    // Si la evaluación final está completada
    evaluacionFinalCompletada: {
        type: Boolean,
        default: false
    },

    // Progreso porcentual total
    progresoPorcentual: {
        type: Number,
        default: 0
    },

    // NOTA: habilidadNueva (0-5) que viene de cada evaluación
    habilidadNueva: {
        type: Number,
        default: 0
    },

    // Última actualización
    ultimaActualizacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("ProgresoCurso", progresoCursoSchema);
