// backend/src/app.js
require("dotenv").config({ path: "./.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Usuario = require("./pages/Usuario");
const ProgresoCurso = require("./pages/ProgresoCurso");
const { recuerdo } = require("./modelos/ModelosMatematicos");

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Rutas
app.use("/api/registro", require("./pages/Registro"));
app.use("/api/login", require("./pages/Login"));
app.use("/api/usuarios/count", require("./pages/UsuariosCount"));
app.use("/api/encuesta", require("./pages/Encuesta"));
app.use("/api/biblioteca", require("./pages/Biblioteca"));
app.use("/api/perfil", require("./pages/ModificarPerfil"));
app.use("/api/adminusuarios", require("./pages/AdminUsuarios"));
app.use("/api/usuarios", require("./pages/UsuariosRoutes"));
app.use("/api/cursos", require("./pages/Cursos"));
app.use("/api/pruebas", require("./pages/PruebaConocimiento"));
app.use("/api/sesiones", require("./pages/SesionUsuarioRoutes"));
app.use("/api/progreso", require("./pages/ProgresoCursoRoutes"));


async function actualizarUsuariosAlIniciar() {
  try {
    console.log("🔄 Actualizando usuarios automáticamente...");

    const usuarios = await Usuario.find();
    let actualizados = 0;

    for (let user of usuarios) {
      try {
        let guardar = false;

        // ================================================
        // 1️⃣ Recalcular nivel_recordacion (encuesta)
        // ================================================
        const encuesta = user.encuesta_inicial;

        if (encuesta?.completada) {
          const t = encuesta.tiempo_area;
          const lambda = encuesta.tasa_olvido;

          // Validación segura
          if (
            t !== null &&
            lambda !== null &&
            !isNaN(t) &&
            !isNaN(lambda) &&
            t >= 0 &&
            lambda >= 0
          ) {
            const nuevoNivel = recuerdo(t, lambda);

            if (user.nivel_recordacion !== nuevoNivel) {
              user.nivel_recordacion = nuevoNivel;
              guardar = true;
            }
          }
        }

        // ================================================
        // 2️⃣ Inicializar nivel_recordacion_nuevo solo si aplica
        // ================================================
        const progreso = await ProgresoCurso.findOne({ usuarioId: user._id });

        if (progreso) {
          if (
            user.nivel_recordacion_nuevo === null ||
            user.nivel_recordacion_nuevo === undefined
          ) {
            user.nivel_recordacion_nuevo = null;
            guardar = true;
          }
        }

        if (guardar) {
          await user.save();
          actualizados++;
        }

      } catch (errorUser) {
        console.error(`⚠️ Error procesando usuario ${user._id}:`, errorUser);
      }
    }

    console.log(`✅ Usuarios actualizados automáticamente: ${actualizados}`);

  } catch (error) {
    console.error("❌ Error general en actualización:", error);
  }
}

// =====================================================
// 🔗 Conectar a MongoDB y ejecutar actualización automática
// =====================================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Conectado a MongoDB");
    await actualizarUsuariosAlIniciar(); // ⬅️ se ejecuta automáticamente
  })
  .catch((err) => console.error("❌ Error al conectar a MongoDB:", err));


// Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);
