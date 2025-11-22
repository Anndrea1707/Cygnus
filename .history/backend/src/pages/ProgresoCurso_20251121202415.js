const mongoose = require("mongoose");

const progresoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true
    },
    curso: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Curso",
      required: true
    },

    // Última posición del usuario
    moduloActual: { type: Number, default: 0 },
    contenidoActual: { type: Number, default: 0 },

    // Porcentaje total del curso
    porcentaje: { type: Number, default: 0 },

    actualizadoEn: { type: Date, default: Date.now }
  },
  { collection: "progreso_cursos" }
);

progresoSchema.index({ usuario: 1, curso: 1 }, { unique: true });

module.exports = mongoose.model("ProgresoCurso", progresoSchema);
