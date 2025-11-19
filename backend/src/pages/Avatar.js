const mongoose = require("mongoose");

const AvatarSchema = new mongoose.Schema({
  url: { type: String, required: true },
  categoria: { type: String, default: "" }, // opcional
});

// Modelo apunta a la colección "avatares"
module.exports = mongoose.model("avatares", AvatarSchema);
