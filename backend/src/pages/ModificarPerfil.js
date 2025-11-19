const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Usuario = require("./Usuario");
const Avatar = require("./Avatar");
const Fondo = require("./Fondo");
const cloudinary = require("cloudinary").v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD || "",
  api_key: process.env.CLOUDINARY_KEY || "",
  api_secret: process.env.CLOUDINARY_SECRET || "",
});

// Multer temporal
const upload = multer({ dest: path.join(__dirname, "..", "..", "uploads") });

// --------------------- SUBIR AVATAR ---------------------
router.post("/avatar", upload.single("imagen"), async (req, res) => {
  try {
    const { nombre, categoria } = req.body;
    if (!req.file) return res.status(400).json({ ok: false, msg: "No file uploaded" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "cygnus/avatares",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });

    fs.unlink(req.file.path, () => {});

    const nuevoAvatar = await Avatar.create({
      nombre,
      categoria,
      url: result.secure_url,
      public_id: result.public_id,
    });

    res.json({ ok: true, avatar: nuevoAvatar });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Error subiendo avatar" });
  }
});

// --------------------- LISTAR AVATARES ---------------------
router.get("/avatar", async (req, res) => {
  try {
    const lista = await Avatar.find().sort({ fecha: -1 });
    res.json(lista);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Error obteniendo avatares" });
  }
});

// --------------------- SUBIR FONDO ---------------------
router.post("/fondo", upload.single("imagen"), async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!req.file) return res.status(400).json({ ok: false, msg: "No file uploaded" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "cygnus/fondos",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });

    fs.unlink(req.file.path, () => {});

    const nuevoFondo = await Fondo.create({
      nombre,
      url: result.secure_url,
      public_id: result.public_id,
    });

    res.json({ ok: true, fondo: nuevoFondo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Error subiendo fondo" });
  }
});

// --------------------- LISTAR FONDOS ---------------------
router.get("/fondo", async (req, res) => {
  try {
    const lista = await Fondo.find().sort({ fecha: -1 });
    res.json(lista);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Error obteniendo fondos" });
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

    if (!usuarioActualizado)
      return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });

    res.json({ ok: true, usuarioActualizado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Error actualizando perfil" });
  }
});

module.exports = router;
