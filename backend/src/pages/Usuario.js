const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema(
  {
    cedula: { type: String, required: true, unique: true },
    nombre_completo: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    fecha_nacimiento: { type: Date, required: true },
    contrasena: { type: String, required: true },

    rol: {
      type: String,
      default: "estudiante",
      enum: ["estudiante", "profesor", "admin"],
    },

    apodo: { type: String, default: "" },
    avatar: { type: String, default: "" },
    fondo: { type: String, default: "" },

    // ⭐ ENCUESTA INICIAL (sin área de interés)
    encuesta_inicial: {
      completada: { type: Boolean, default: false },
      comodidad_area: { type: String, default: null },
      estilo_aprendizaje: { type: String, default: null },
      tiempo_estudio: { type: String, default: null },
      objetivo: { type: String, default: null },

      // Datos para la curva del olvido / memoria
      tiempo_area: { type: Number, default: null },  // Años de experiencia
      tasa_olvido: { type: Number, default: null },  // Decimal 0-1
    },
    nivel_recordacion: { type: Number, default: null },

    // ⭐ PRUEBA DE CONOCIMIENTO
    prueba_conocimiento: {
      completada: { type: Boolean, default: false },
      fecha_realizacion: { type: Date, default: null },
      puntuacion: { type: Number, default: 0 },
      habilidad: { type: Number, min: 0, max: 5, default: 1 }
      // NOTA: Se eliminó categoria_evaluada
    },
    // ⭐ NUEVO CAMPO: Habilidad Nueva - No se promedia, se actualiza directamente
    habilidad_nueva: { 
      type: Number, 
      min: 0, 
      max: 5, 
      default: 0 
    },
    
    creado_en: { type: Date, default: Date.now },

    // ⭐ Registro básico para seguimiento de sesiones
    ultima_sesion_inicio: { type: Date, default: null },
    ultima_sesion_cierre: { type: Date, default: null },
  },
  { collection: "usuarios" }
);

// Exportar
const Usuario = mongoose.model("Usuario", usuarioSchema);
module.exports = Usuario;
