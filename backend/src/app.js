// backend/src/app.js
require("dotenv").config({ path: "./.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Rutas
app.use("/api/registro", require("./pages/Registro"));
app.use("/api/login", require("./pages/Login")); // ✅ ahora usa require, no import

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error al conectar a MongoDB:", err));

// Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);
