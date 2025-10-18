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
    creado_en: { type: Date, default: Date.now },
  },
  { collection: "usuarios" }
);

// ✅ Exportar correctamente el modelo
const Usuario = mongoose.model("Usuario", usuarioSchema);
module.exports = Usuario;

await nuevoUsuario.save();
console.log("✅ Usuario guardado correctamente:", nuevoUsuario);