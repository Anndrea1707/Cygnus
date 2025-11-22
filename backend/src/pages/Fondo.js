const mongoose = require("mongoose");

const FondoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  {
    timestamps: true, // crea createdAt y updatedAt automáticamente
  }
);

module.exports = mongoose.model("Fondo", FondoSchema);
