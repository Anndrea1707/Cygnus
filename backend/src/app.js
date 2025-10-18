// ===============================
// 🌌 Cygnus Backend - app.js
// ===============================

// Cargar variables de entorno
require("dotenv").config({ path: "../.env" });

// Dependencias
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Inicialización del servidor
const app = express();

// ===============================
// 🧩 MIDDLEWARES
// ===============================

// Permitir peticiones del frontend (Vite usa el puerto 5173)
app.use(
  cors({
    origin: "http://localhost:5173", // Cambia si tu frontend usa otro puerto
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Parsear JSON del body
app.use(express.json());

// ===============================
// 🌐 RUTAS
// ===============================

app.use("/api/registro", require("./pages/Registro"));

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🚀 Servidor Cygnus funcionando correctamente");
});

// ===============================
// 💾 CONEXIÓN A MONGODB
// ===============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) =>
    console.error("❌ Error al conectar a MongoDB:", err.message)
  );

// ===============================
// ⚡ PUERTO DEL SERVIDOR
// ===============================

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);
