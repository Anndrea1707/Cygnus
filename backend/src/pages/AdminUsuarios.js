const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary.js");
const mongoose = require("mongoose");

const router = express.Router();

// Multer memoria
const upload = multer({ storage: multer.memoryStorage() });

/* ============================
   MODELOS
============================ */

// AVATARES
const AvatarSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: {
    type: String,
    enum: ["Humanos", "Animales", "Robots", "Alien", "Abstracto"],
    required: true,
  },
  url: { type: String, required: true },
  public_id: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
});

// FONDOS
const FondoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  url: { type: String, required: true },
  public_id: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
});

// Colecciones
const Avatar =
  mongoose.models.Avatar || mongoose.model("Avatar", AvatarSchema, "avatares");

const Fondo =
  mongoose.models.Fondo || mongoose.model("Fondo", FondoSchema, "fondos");

/* ============================
   SUBIR A CLOUDINARY
============================ */
function subirACloudinary(buffer, carpeta) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: carpeta },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/* ============================
   SUBIR AVATAR
============================ */
router.post("/avatar", upload.single("imagen"), async (req, res) => {
  try {
    const { nombre, categoria } = req.body;

    if (!req.file)
      return res.status(400).json({ error: "Debe subir una imagen" });

    if (!nombre) return res.status(400).json({ error: "Debe escribir un nombre" });

    if (!categoria)
      return res.status(400).json({ error: "Debe elegir una categoría" });

    const uploadResult = await subirACloudinary(
      req.file.buffer,
      "cygnus/avatares"
    );

    const nuevo = await Avatar.create({
      nombre,
      categoria,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });

    res.json({ ok: true, avatar: nuevo });
  } catch (error) {
    console.error("Error subir avatar:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ============================
   LISTAR AVATARES
============================ */
router.get("/avatar", async (req, res) => {
  try {
    const lista = await Avatar.find().sort({ fecha: -1 });
    res.json(lista);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener avatares" });
  }
});

/* ============================
   ELIMINAR AVATAR
============================ */
router.delete("/avatar/:id", async (req, res) => {
  try {
    const avatar = await Avatar.findById(req.params.id);
    if (!avatar)
      return res.status(404).json({ error: "Avatar no encontrado" });

    await cloudinary.uploader.destroy(avatar.public_id);
    await Avatar.findByIdAndDelete(req.params.id);

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ============================
   SUBIR FONDO
============================ */
router.post("/fondo", upload.single("imagen"), async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!req.file)
      return res.status(400).json({ error: "Debe subir una imagen" });

    if (!nombre)
      return res.status(400).json({ error: "Debe escribir un nombre" });

    const uploadResult = await subirACloudinary(
      req.file.buffer,
      "cygnus/fondos"
    );

    const nuevo = await Fondo.create({
      nombre,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });

    res.json({ ok: true, fondo: nuevo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ============================
   LISTAR FONDOS
============================ */
router.get("/fondo", async (req, res) => {
  try {
    const lista = await Fondo.find().sort({ fecha: -1 });
    res.json(lista);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener fondos" });
  }
});

/* ============================
   ELIMINAR FONDO
============================ */
router.delete("/fondo/:id", async (req, res) => {
  try {
    const fondo = await Fondo.findById(req.params.id);
    if (!fondo)
      return res.status(404).json({ error: "Fondo no encontrado" });

    await cloudinary.uploader.destroy(fondo.public_id);
    await Fondo.findByIdAndDelete(req.params.id);

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
