const mongoose = require("mongoose");

const sesionUsuarioSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },

    inicio_sesion: {
      type: Date,
      required: true,
    },

    fin_sesion: {
      type: Date,
      default: null,
    },

    duracion_horas: {
      type: Number,
      default: 0,
    },

    // Fecha base para agrupar sesiones (sin hora)
    fecha: {
      type: String, // formato "YYYY-MM-DD"
      required: true,
    },
  },
  { collection: "sesiones_usuarios" }
);

const SesionUsuario = mongoose.model(
  "SesionUsuario",
  sesionUsuarioSchema
);

module.exports = SesionUsuario;
