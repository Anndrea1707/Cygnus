const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary.js");
const Recurso = require("./Recurso"); 

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 🔹 Obtener recursos
router.get("/", async (req, res) => {
  try {
    const recursos = await Recurso.find().sort({ creado: -1 });
    res.json(recursos);
  } catch (err) {
    res.status(500).json({ mensaje: "Error obteniendo recursos" });
  }
});

// 🔹 Crear nuevo recurso
router.post("/nuevo", upload.single("archivo"), async (req, res) => {
  try {
    const { titulo, descripcion, tipo } = req.body;

    if (!req.file) {
      return res.status(400).json({ mensaje: "Debe subir un archivo" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      async (error, result) => {
        if (error) return res.status(500).json({ mensaje: "Error subiendo a Cloudinary" });

        const nuevoRecurso = new Recurso({
          titulo,
          descripcion,
          tipo,
          url: result.secure_url,
        });

        await nuevoRecurso.save();

        res.json({ ok: true, recurso: nuevoRecurso });
      }
    );

    uploadStream.end(req.file.buffer);

  } catch (err) {
    res.status(500).json({ mensaje: "Error creando recurso" });
  }
});

module.exports = router;