const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const upload = multer({ storage: multer.memoryStorage() });

// -------------------- ESQUEMAS -------------------- //

const recursoSchema = new mongoose.Schema({
    tipo: { type: String, enum: ["link", "archivo"], required: true },
    nombre: String,
    url: String,
});

const contenidoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    tipo: { type: String, enum: ["video", "lectura", "actividad"], required: true },

    portada: String,
    contenidoTexto: String,
    videoUrl: String,
    actividadArchivo: String,

    fechaPublicacion: { type: Date, default: Date.now },
    recursosExtra: [recursoSchema],
});

const evaluacionSchema = new mongoose.Schema({
    preguntas: [
        {
            enunciado: String,
            opciones: [String],
            correcta: Number,
            dificultad: Number,
            tema: String,
        }
    ],
    tiempoEspera: { type: Number, default: 3600000 },
});

const moduloSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    imagen: String,
    contenidos: [contenidoSchema],
    evaluacion: evaluacionSchema,
    orden: Number,
});

const cursoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: String,
    fechaPublicacion: { type: Date, default: Date.now },
    horas: Number,
    nivel: { type: String, enum: ["básico", "intermedio", "alto"] },
    imagen: String,
    categoria: String,
    modulos: [moduloSchema],
});

const Curso = mongoose.model("Curso", cursoSchema);

// -------------------- ENDPOINT SUBIR IMAGEN -------------------- //

router.post("/upload", upload.single("imagen"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: "No se recibió ningún archivo" });
        }

        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "cursos",           // Carpeta en Cloudinary
                    resource_type: "image",     // Importante para imágenes
                    use_filename: true,         // Usa el nombre original del archivo
                    unique_filename: false,     // No genera un nombre único automático
                    filename_override: req.file.originalname
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            stream.end(req.file.buffer);
        });

        res.json({
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id
        });

    } catch (error) {
        console.error("Error subiendo imagen:", error);
        res.status(500).json({ msg: "Error al subir imagen", detalles: error.message });
    }
});

// -------------------- ENDPOINTS CURSOS -------------------- //

// Crear curso
router.post("/", async (req, res) => {
    try {
        const curso = new Curso(req.body);
        await curso.save();
        res.json({ msg: "Curso creado correctamente", curso });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al crear curso" });
    }
});

// Obtener todos los cursos
router.get("/", async (req, res) => {
    try {
        const cursos = await Curso.find();
        res.json(cursos);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener cursos" });
    }
});

// Obtener curso por ID
router.get("/:id", async (req, res) => {
    try {
        const curso = await Curso.findById(req.params.id);
        res.json(curso);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener curso" });
    }
});

// Editar curso
router.put("/:id", async (req, res) => {
    try {
        const curso = await Curso.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        res.json({ msg: "Curso actualizado", curso });
    } catch (error) {
        res.status(500).json({ msg: "Error al editar curso" });
    }
});

// Eliminar curso
router.delete("/:id", async (req, res) => {
    try {
        await Curso.findByIdAndDelete(req.params.id);
        res.json({ msg: "Curso eliminado" });
    } catch (error) {
        res.status(500).json({ msg: "Error al eliminar curso" });
    }
});

// Agregar módulo
router.post("/:id/modulos", async (req, res) => {
    try {
        const curso = await Curso.findById(req.params.id);
        curso.modulos.push(req.body);
        await curso.save();
        res.json({ msg: "Módulo agregado", curso });
    } catch (error) {
        res.status(500).json({ msg: "Error al agregar módulo" });
    }
});

// Agregar contenido
router.post("/:id/modulos/:moduloId/contenidos", async (req, res) => {
    try {
        const curso = await Curso.findById(req.params.id);
        const modulo = curso.modulos.id(req.params.moduloId);

        modulo.contenidos.push(req.body);
        await curso.save();

        res.json({ msg: "Contenido agregado", curso });
    } catch (error) {
        res.status(500).json({ msg: "Error al agregar contenido" });
    }
});

module.exports = router;