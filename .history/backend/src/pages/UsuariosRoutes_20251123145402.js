const express = require("express");
const Usuario = require("./Usuario");
const router = express.Router();

/* ============================
   📌 1. Obtener todos los usuarios
=============================== */
router.get("/", async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener usuarios" });
  }
});

/* ============================
   📌 2. Obtener usuario por ID
=============================== */
router.get("/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al buscar usuario" });
  }
});

/* ============================
   📌 3. Crear usuario (ya lo tienes, pero lo dejamos igual)
=============================== */
router.post("/", async (req, res) => {
  try {
    const nuevo = new Usuario(req.body);
    await nuevo.save();
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear usuario" });
  }
});

/* ============================
   📌 4. Actualizar usuario
=============================== */
router.put("/:id", async (req, res) => {
  try {
    const actualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar usuario" });
  }
});

/* ============================
   📌 5. Eliminar usuario
=============================== */
router.delete("/:id", async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar usuario" });
  }
});

/* ==================================================
   ⭐ CALCULAR nivel_recordacion_nuevo (Regla de Tres)
=================================================== */
router.post("/calcular-nivel-recordacion", async (req, res) => {
  try {
    const { usuarioId, fechaUltimoCurso } = req.body;

    if (!usuarioId || !fechaUltimoCurso) {
      return res.status(400).json({ mensaje: "Datos incompletos" });
    }

    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // ============================
    // 1️⃣ Datos base del usuario
    // ============================
    const A = usuario.encuesta_inicial.tiempo_area;          // años
    const B = usuario.encuesta_inicial.nivel_recordacion;    // decimal 0–1

    if (A == null || B == null) {
      return res.status(400).json({
        mensaje: "Faltan datos: tiempo_area o nivel_recordacion"
      });
    }

    // ============================
    // 2️⃣ Calcular C = tiempo transcurrido en años
    // ============================
    const fechaCurso = new Date(fechaUltimoCurso);
    const hoy = new Date();

    // Diferencia en años exactos
    const C = (hoy - fechaCurso) / (1000 * 60 * 60 * 24 * 365);

    // ============================
    // 3️⃣ Regla de tres:
    // X = (C × B) / A
    // ============================
    let X = (C * B) / A;

    // Limitar a máximo 1 (100%)
    if (X > 1) X = 1;

    // ============================
    // 4️⃣ Guardar en BD
    // ============================
    usuario.nivel_recordacion_nuevo = X;
    await usuario.save();

    return res.json({
      success: true,
      mensaje: "nivel_recordacion_nuevo actualizado correctamente",
      nivel_recordacion_nuevo: X,
      detalles: { A, B, C, formula: "X = (C * B) / A" }
    });

  } catch (error) {
    console.error("Error calculando recordación:", error);
    return res.status(500).json({
      mensaje: "Error al calcular nivel_recordacion_nuevo"
    });
  }
});


module.exports = router;
