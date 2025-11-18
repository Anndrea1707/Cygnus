const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

// === CONFIG CLOUDINARY ===
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// === MULTER PARA ARCHIVOS TEMPORALES ===
const upload = multer({ dest: "uploads/" });

// === MODELOS INTERNOS ===
const AvatarSchema = new mongoose.Schema({
  url: String,
  public_id: String,
  fecha: { type: Date, default: Date.now },
});

const FondoSchema = new mongoose.Schema({
  url: String,
  public_id: String,
  fecha: { type: Date, default: Date.now },
});

const Avatar = mongoose.model("Avatar", AvatarSchema);
const Fondo = mongoose.model("Fondo", FondoSchema);

// === ROUTER ===
const router = express.Router();

/* ============================
   SUBIR AVATAR
============================ */
router.post("/avatar", upload.single("imagen"), async (req, res) => {
  try {
    const subida = await cloudinary.uploader.upload(req.file.path, {
      folder: "cygnus/avatares",
    });

    const nuevo = await Avatar.create({
      url: subida.secure_url,
      public_id: subida.public_id,
    });

    res.json({ ok: true, avatar: nuevo });
  } catch (error) {
    console.error("❌ Error al subir avatar:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/* ============================
   LISTAR AVATARES
============================ */
router.get("/avatar", async (req, res) => {
  try {
    const lista = await Avatar.find().sort({ fecha: -1 });
    res.json(lista);
  } catch {
    res.status(500).json({ error: "No se pudieron obtener los avatares" });
  }
});

/* ============================
   SUBIR FONDO
============================ */
router.post("/fondo", upload.single("imagen"), async (req, res) => {
  try {
    const subida = await cloudinary.uploader.upload(req.file.path, {
      folder: "cygnus/fondos",
    });

    const nuevo = await Fondo.create({
      url: subida.secure_url,
      public_id: subida.public_id,
    });

    res.json({ ok: true, fondo: nuevo });
  } catch (error) {
    console.error("❌ Error al subir fondo:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/* ============================
   LISTAR FONDOS
============================ */
router.get("/fondo", async (req, res) => {
  try {
    const lista = await Fondo.find().sort({ fecha: -1 });
    res.json(lista);
  } catch {
    res.status(500).json({ error: "No se pudieron obtener los fondos" });
  }
});

module.exports = router;
