// backend/src/app.js
require("dotenv").config({ path: "./.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const pruebaConocimientoRoutes = require('./pages/PruebaConocimiento');

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
app.use("/api/modelos-matematicos", require("./pages/ModelosMatematicosRoutes"));


// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error al conectar a MongoDB:", err));

// Servidor
const PORT = process.env.PORT || 4000;
app.get("/", (req, res) => {
  res.send("🚀 Backend Cygnus funcionando correctamente");
});
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);