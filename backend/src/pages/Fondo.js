const mongoose = require("mongoose");

const FondoSchema = new mongoose.Schema({
  url: { type: String, required: true },
});

module.exports = mongoose.model("Fondo", FondoSchema);
