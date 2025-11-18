// backend/src/pages/ModificarPerfil.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Usuario = require("./Usuario"); // si tu Usuario.js está en src/pages
// Si tu modelo está en src/models/Usuario.js usa: const Usuario = require("../models/Usuario");

const cloudinary = require("cloudinary").v2;

// Configurar Cloudinary (usa .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD || "",
  api_key: process.env.CLOUDINARY_KEY || "",
  api_secret: process.env.CLOUDINARY_SECRET || "",
});

// Multer: guarda temporalmente en uploads/
const upload = multer({ dest: path.join(__dirname, "..", "..", "uploads") });

// --------------------- SUBIR AVATAR ---------------------
router.post("/subirAvatar", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, msg: "No file uploaded" });

    const filePath = req.file.path;

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "cygnus/avatars",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });

    // Borrar archivo temporal
    fs.unlink(filePath, (err) => {
      if (err) console.warn("Warning: no se pudo borrar archivo temporal:", err);
    });

    return res.json({ ok: true, url: result.secure_url });
  } catch (err) {
    console.error("Error en /subirAvatar:", err);
    return res.status(500).json({ ok: false, msg: "Error subiendo avatar" });
  }
});

// --------------------- MODIFICAR PERFIL ---------------------
router.post("/modificarPerfil", async (req, res) => {
  try {
    const { id, nombre_completo, apodo, correo, avatar, fondo } = req.body;

    if (!id) return res.status(400).json({ ok: false, msg: "Falta id de usuario" });

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      { nombre_completo, apodo, correo, avatar, fondo },
      { new: true, runValidators: true }
    );

    if (!usuarioActualizado) return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });

    return res.json({ ok: true, usuarioActualizado });
  } catch (err) {
    console.error("Error en /modificarPerfil:", err);
    return res.status(500).json({ ok: false, msg: "Error actualizando perfil" });
  }
});

module.exports = router;
