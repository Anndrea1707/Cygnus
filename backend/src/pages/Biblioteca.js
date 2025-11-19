const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary.js");
const Recurso = require("./Recurso");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
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


// POST
router.post("/nuevo", upload.single("archivo"), async (req, res) => {
  console.log("PETICIÓN RECIBIDA /nuevo");
  console.log("Archivo:", req.file?.originalname);

  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, mensaje: "Falta el archivo" });
    }

    const { titulo, descripcion, tipo } = req.body;

    if (!titulo || !descripcion || !tipo) {
      return res.status(400).json({ ok: false, mensaje: "Faltan campos" });
    }

    // SUBIDA A CLOUDINARY (versión correcta)
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "cygnus-recursos",
          resource_type: "raw",
          type: "upload",
          access_mode: "public",
          use_filename: true,
          unique_filename: false,
          filename_override: req.file.originalname,
          flags: "attachment"
        },
        (error, result) => {
          if (error) {
            console.error("ERROR CLOUDINARY:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      stream.end(req.file.buffer);
    });

    // GUARDAR EN BD
    const nuevoRecurso = new Recurso({
      titulo,
      descripcion,
      tipo,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    });

    await nuevoRecurso.save();

    res.json({ ok: true, recurso: nuevoRecurso });

  } catch (error) {
    console.error("ERROR COMPLETO AL GUARDAR:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno", detalles: error.message });
  }
});


// PUT
router.put("/:id", upload.single("archivo"), async (req, res) => {
  try {
    const recurso = await Recurso.findById(req.params.id);
    if (!recurso) return res.status(404).json({ mensaje: "Recurso no encontrado" });

    // Si sube nuevo archivo, borrar el anterior
    if (req.file && recurso.public_id) {
      await cloudinary.uploader.destroy(recurso.public_id, {
        resource_type: "raw"
      });
    }

    const updates = {
      titulo: req.body.titulo || recurso.titulo,
      descripcion: req.body.descripcion || recurso.descripcion,
      tipo: req.body.tipo || recurso.tipo,
    };

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: "cygnus-recursos",
            resource_type: "raw",
            type: "upload",
            use_filename: true,
            unique_filename: false,
            filename_override: req.file.originalname,
            flags: "attachment"
          },
          (error, result) => (error ? reject(error) : resolve(result))
        ).end(req.file.buffer);
      });

      updates.url = `${uploadResult.secure_url}?attachment=${encodeURIComponent(req.file.originalname)}`;
      updates.public_id = uploadResult.public_id;
    }

    const actualizado = await Recurso.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ ok: true, recurso: actualizado });

  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
});


// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const recurso = await Recurso.findById(req.params.id);
    if (!recurso) return res.status(404).json({ mensaje: "Recurso no encontrado" });

    if (recurso.public_id) {
      await cloudinary.uploader.destroy(recurso.public_id, { resource_type: "raw" });
    }

    await Recurso.findByIdAndDelete(req.params.id);

    res.json({ ok: true, mensaje: "Recurso eliminado correctamente" });

  } catch (err) {
    console.error("Error eliminando recurso:", err);
    res.status(500).json({ mensaje: "Error al eliminar recurso" });
  }
});

module.exports = router;
