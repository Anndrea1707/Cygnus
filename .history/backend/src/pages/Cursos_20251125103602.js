const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary.js");
const Curso = require("./ModeloCursos"); // ← Importamos el modelo

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB límite
});

// GET - Obtener todos los cursos
router.get("/", async (req, res) => {
  try {
    const cursos = await Curso.find()
      .populate("creadoPor", "nombre_completo correo")
      .sort({ creadoEn: -1 });
    res.json(cursos);
  } catch (err) {
    console.error("Error GET /api/cursos:", err);
    res.status(500).json({ mensaje: "Error del servidor al obtener cursos" });
  }
});

// GET - Obtener un curso por ID
router.get("/:id", async (req, res) => {
  try {
    const curso = await Curso.findById(req.params.id)
      .populate("creadoPor", "nombre_completo correo avatar");

    if (!curso) {
      return res.status(404).json({ mensaje: "Curso no encontrado" });
    }

    res.json(curso);
  } catch (err) {
    console.error("Error GET /api/cursos/:id:", err);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
});

// POST - Subir imagen a Cloudinary
router.post("/upload", upload.single("imagen"), async (req, res) => {
  console.log("PETICIÓN RECIBIDA /api/cursos/upload");
  console.log("Archivo:", req.file?.originalname);

  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, mensaje: "Falta la imagen" });
    }

    // SUBIDA A CLOUDINARY
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "cygnus-cursos",
          resource_type: "image",
          type: "upload",
          access_mode: "public",
          use_filename: true,
          unique_filename: true,
          filename_override: req.file.originalname,
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

    res.json({
      ok: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      mensaje: "Imagen subida correctamente"
    });

  } catch (error) {
    console.error("ERROR COMPLETO AL SUBIR IMAGEN:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error interno al subir imagen",
      detalles: error.message
    });
  }
});

// POST - Subir archivo/recurso a Cloudinary
router.post("/upload-recurso", upload.single("archivo"), async (req, res) => {
  console.log("PETICIÓN RECIBIDA /api/cursos/upload-recurso");
  console.log("Archivo:", req.file?.originalname);

  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, mensaje: "Falta el archivo" });
    }

    // Determinar el tipo de recurso
    const esVideo = req.file.mimetype.startsWith('video/');
    const esImagen = req.file.mimetype.startsWith('image/');
    const esPDF = req.file.mimetype === 'application/pdf';

    const resourceType = esVideo ? 'video' :
      esImagen ? 'image' :
        'raw';

    // SUBIDA A CLOUDINARY
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "cygnus-cursos-recursos",
          resource_type: resourceType,
          type: "upload",
          access_mode: "public",
          use_filename: true,
          unique_filename: true,
          filename_override: req.file.originalname,
          ...(resourceType === 'raw' && { flags: "attachment" })
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

    res.json({
      ok: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      tipo: resourceType,
      mensaje: "Archivo subido correctamente"
    });

  } catch (error) {
    console.error("ERROR COMPLETO AL SUBIR ARCHIVO:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error interno al subir archivo",
      detalles: error.message
    });
  }
});

// POST - Crear nuevo curso completo
router.post("/", async (req, res) => {
  try {
    console.log("PETICIÓN RECIBIDA para crear curso:", req.body);

    const {
      nombre,
      descripcion,
      imagen,
      horas,
      nivel,
      modulos,
      evaluacionFinal
    } = req.body;

    // Validaciones básicas (sin categoría, ya que el curso será de Matemáticas por defecto)
    if (!nombre || !descripcion || !imagen || !horas || !nivel) {
      return res.status(400).json({
        ok: false,
        mensaje: "Faltan campos obligatorios del curso"
      });
    }

    // Validar que hay al menos un módulo
    if (!modulos || modulos.length === 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "El curso debe tener al menos un módulo"
      });
    }

    // Validar máximo 4 módulos
    if (modulos.length > 4) {
      return res.status(400).json({
        ok: false,
        mensaje: "Máximo 4 módulos permitidos"
      });
    }

    // Validar que cada módulo tenga contenido
    for (let i = 0; i < modulos.length; i++) {
      const modulo = modulos[i];
      if (!modulo.contenido || modulo.contenido.length === 0) {
        return res.status(400).json({
          ok: false,
          mensaje: `El módulo "${modulo.nombre}" no tiene contenido`
        });
      }
    }
    // VALIDAR EVALUACIONES DE MÓDULOS
    for (let i = 0; i < modulos.length; i++) {
      const modulo = modulos[i];
      const evaluacion = modulo.evaluacion;

      if (!evaluacion || !evaluacion.preguntas) {
        return res.status(400).json({
          ok: false,
          mensaje: `El módulo "${modulo.nombre}" no tiene evaluación válida`
        });
      }

      // Debe tener exactamente 20 preguntas
      if (evaluacion.preguntas.length !== 20) {
        return res.status(400).json({
          ok: false,
          mensaje: `La evaluación del módulo "${modulo.nombre}" debe tener exactamente 20 preguntas`
        });
      }

      const porDificultad = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      evaluacion.preguntas.forEach(p => porDificultad[p.dificultad]++);

      for (let d = 1; d <= 5; d++) {
        if (porDificultad[d] !== 4) {
          return res.status(400).json({
            ok: false,
            mensaje: `La evaluación del módulo "${modulo.nombre}" debe tener 4 preguntas de dificultad ${d}`
          });
        }
      }
    }


    // Validar evaluación final (20 preguntas, 4 por dificultad)
    if (evaluacionFinal && evaluacionFinal.preguntas) {
      if (evaluacionFinal.preguntas.length !== 20) {
        return res.status(400).json({
          ok: false,
          mensaje: "La evaluación final debe tener exactamente 20 preguntas"
        });
      }

      const preguntasPorDificultad = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      evaluacionFinal.preguntas.forEach(pregunta => {
        if (pregunta.dificultad >= 1 && pregunta.dificultad <= 5) {
          preguntasPorDificultad[pregunta.dificultad]++;
        }
      });

      for (let i = 1; i <= 5; i++) {
        if (preguntasPorDificultad[i] !== 4) {
          return res.status(400).json({
            ok: false,
            mensaje: `Debe haber exactamente 4 preguntas de dificultad ${i}`
          });
        }
      }
    }

    // Crear nuevo curso (categoria fija a "Matemáticas")
    const nuevoCurso = new Curso({
      nombre,
      descripcion,
      imagen,
      imagenPublicId: req.body.imagenPublicId || "",
      horasEstimadas: horas,
      nivel,
      categoria: "Matemáticas",
      modulos: modulos || [],
      evaluacionFinal: evaluacionFinal || { titulo: "", descripcion: "", preguntas: [] },
      // creadoPor: req.user._id  // Reemplazar por autenticación real cuando exista
    });

    await nuevoCurso.save();

    res.status(201).json({
      ok: true,
      curso: nuevoCurso,
      mensaje: "Curso creado exitosamente"
    });

  } catch (error) {
    console.error("ERROR COMPLETO AL CREAR CURSO:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error interno al crear curso",
      detalles: error.message
    });
  }
});

// PUT - Actualizar curso completo
router.put("/:id", async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      imagen,
      horas,
      nivel,
      modulos,
      evaluacionFinal
    } = req.body;


    // Validaciones básicas (sin categoría)
    if (!nombre || !descripcion || !imagen || !horas || !nivel) {
      return res.status(400).json({
        ok: false,
        mensaje: "Faltan campos obligatorios del curso"
      });
    }

    // Validar que hay al menos un módulo
    if (!modulos || modulos.length === 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "El curso debe tener al menos un módulo"
      });
    }

    // Validar máximo 4 módulos
    if (modulos.length > 4) {
      return res.status(400).json({
        ok: false,
        mensaje: "Máximo 4 módulos permitidos"
      });
    }
    // VALIDAR EVALUACIONES DE MÓDULOS
    for (let i = 0; i < modulos.length; i++) {
      const modulo = modulos[i];
      const evaluacion = modulo.evaluacion;

      if (!evaluacion || !evaluacion.preguntas) {
        return res.status(400).json({
          ok: false,
          mensaje: `El módulo "${modulo.nombre}" no tiene evaluación válida`
        });
      }

      // Debe tener exactamente 20 preguntas
      if (evaluacion.preguntas.length !== 20) {
        return res.status(400).json({
          ok: false,
          mensaje: `La evaluación del módulo "${modulo.nombre}" debe tener exactamente 20 preguntas`
        });
      }

      const porDificultad = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      evaluacion.preguntas.forEach(p => porDificultad[p.dificultad]++);

      for (let d = 1; d <= 5; d++) {
        if (porDificultad[d] !== 4) {
          return res.status(400).json({
            ok: false,
            mensaje: `La evaluación del módulo "${modulo.nombre}" debe tener 4 preguntas de dificultad ${d}`
          });
        }
      }
    }

    // Buscar y actualizar curso
    const cursoActualizado = await Curso.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        descripcion,
        imagen,
        imagenPublicId: req.body.imagenPublicId || "",
        horasEstimadas: horas,
        nivel,
        categoria: "Matemáticas",
        modulos: modulos || [],
        evaluacionFinal: evaluacionFinal || { titulo: "", descripcion: "", preguntas: [] },
        actualizadoEn: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!cursoActualizado) {
      return res.status(404).json({
        ok: false,
        mensaje: "Curso no encontrado"
      });
    }

    res.json({
      ok: true,
      curso: cursoActualizado,
      mensaje: "Curso actualizado exitosamente"
    });

  } catch (error) {
    console.error("ERROR COMPLETO AL ACTUALIZAR CURSO:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error interno al actualizar curso",
      detalles: error.message
    });
  }
});

// DELETE - Eliminar curso
router.delete("/:id", async (req, res) => {
  try {
    const curso = await Curso.findById(req.params.id);

    if (!curso) {
      return res.status(404).json({
        ok: false,
        mensaje: "Curso no encontrado"
      });
    }

    // Eliminar imágenes de Cloudinary si existen
    if (curso.imagenPublicId) {
      try {
        await cloudinary.uploader.destroy(curso.imagenPublicId, {
          resource_type: "image"
        });
      } catch (e) {
        console.warn("Advertencia al eliminar imagen principal en Cloudinary:", e.message);
      }
    }

    // Eliminar recursos de módulos de Cloudinary
    for (const modulo of curso.modulos) {
      if (modulo.imagenPortadaPublicId) {
        try {
          await cloudinary.uploader.destroy(modulo.imagenPortadaPublicId, {
            resource_type: "image"
          });
        } catch (e) {
          console.warn("Advertencia al eliminar imagen de módulo en Cloudinary:", e.message);
        }
      }

      for (const contenido of modulo.contenido) {
        if (contenido.recursoExtraPublicId) {
          try {
            await cloudinary.uploader.destroy(contenido.recursoExtraPublicId, {
              resource_type: contenido.tipoRecurso === 'video' ? 'video' : 'raw'
            });
          } catch (e) {
            console.warn("Advertencia al eliminar recurso extra en Cloudinary:", e.message);
          }
        }
      }
    }

    await Curso.findByIdAndDelete(req.params.id);

    res.json({
      ok: true,
      mensaje: "Curso eliminado correctamente"
    });

  } catch (err) {
    console.error("Error eliminando curso:", err);
    res.status(500).json({
      ok: false,
      mensaje: "Error al eliminar curso"
    });
  }
});

// GET - Buscar cursos
router.get("/buscar/:termino", async (req, res) => {
  try {
    const cursos = await Curso.find({
      $text: { $search: req.params.termino },
      estado: "activo"
    }).sort({ score: { $meta: "textScore" } });

    res.json(cursos);
  } catch (err) {
    console.error("Error GET /api/cursos/buscar/:termino:", err);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
});


module.exports = router;
