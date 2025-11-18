const mongoose = require("mongoose");

const RecursoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  tipo: { type: String, enum: ["video", "audio", "documento", "imagen"], required: true },
  url: { type: String, required: true },
  creado: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Recurso", RecursoSchema);