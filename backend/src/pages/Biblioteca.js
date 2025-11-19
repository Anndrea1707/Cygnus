const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary.js");
const Recurso = require("./Recurso");


const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB máx
});

// GET
router.get("/", async (req, res) => {
  try {
    const recursos = await Recurso.find().sort({ creado: -1 });
    res.json(recursos);
  } catch (err) {
    console.error("Error GET /api/biblioteca:", err);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
});

// POST - ESTE SÍ GUARDA EN CLOUDINARY Y MONGO
router.post("/nuevo", upload.single("archivo"), async (req, res) => {
  console.log("PETICIÓN RECIBIDA /nuevo");
  console.log("Archivo:", req.file?.originalname, req.file?.size ? `${(req.file.size / 1024 / 1024).toFixed(2)} MB` : "NO");
  console.log("Datos:", req.body);

  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, mensaje: "Falta el archivo" });
    }

    const { titulo, descripcion, tipo } = req.body;
    if (!titulo || !descripcion || !tipo) {
      return res.status(400).json({ ok: false, mensaje: "Faltan título, descripción o tipo" });
    }

    // Subida a Cloudinary con PROMESA segura
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "cygnus-recursos",
          resource_type: "auto",
          timeout: 60000
        },
        (error, result) => {
          if (error) {
            console.error("ERROR CLOUDINARY:", error);
            reject(error);
          } else {
            console.log("Subido a Cloudinary:", result.secure_url);
            resolve(result);
          }
        }
      );
      stream.end(req.file.buffer);
    });

    // Guardar en MongoDB
    const nuevoRecurso = new Recurso({
      titulo,
      descripcion,
      tipo,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    });

    await nuevoRecurso.save();
    console.log("Guardado en MongoDB con ID:", nuevoRecurso._id);

    res.json({ ok: true, recurso: nuevoRecurso });

  } catch (error) {
    console.error("ERROR COMPLETO AL GUARDAR:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error interno del servidor",
      detalles: error.message
    });
  }
});

// PUT: Editar recurso (elimina anterior en Cloudinary si hay nuevo archivo)
router.put("/:id", upload.single("archivo"), async (req, res) => {
  try {
    const recurso = await Recurso.findById(req.params.id);
    if (!recurso) return res.status(404).json({ mensaje: "Recurso no encontrado" });

    // Si sube nuevo archivo → eliminar el anterior
    if (req.file && recurso.public_id) {
      await cloudinary.uploader.destroy(recurso.public_id);
    }

    const updates = {
      titulo: req.body.titulo || recurso.titulo,
      descripcion: req.body.descripcion || recurso.descripcion,
      tipo: req.body.tipo || recurso.tipo,
    };

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "cygnus-recursos" },
          (error, uploadResult) => {
            if (error) reject(error);
            else resolve(uploadResult);
          }
        ).end(req.file.buffer);
      });
      updates.url = result.secure_url;
      updates.public_id = result.public_id;
    }

    const actualizado = await Recurso.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ ok: true, recurso: actualizado });
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
});

// DELETE: Eliminar recurso y archivo de Cloudinary
router.delete("/:id", async (req, res) => {
  try {
    const recurso = await Recurso.findById(req.params.id);
    if (!recurso) return res.status(404).json({ mensaje: "Recurso no encontrado" });

    // ← AQUÍ ESTÁ LO NUEVO: ELIMINAR DE CLOUDINARY
    if (recurso.public_id) {
      await cloudinary.uploader.destroy(recurso.public_id);
      console.log(`Archivo eliminado de Cloudinary: ${recurso.public_id}`);
    }

    // Eliminar de MongoDB
    await Recurso.findByIdAndDelete(req.params.id);

    res.json({ ok: true, mensaje: "Recurso eliminado correctamente" });
  } catch (err) {
    console.error("Error eliminando recurso:", err);
    res.status(500).json({ mensaje: "Error al eliminar recurso" });
  }
});

module.exports = router;