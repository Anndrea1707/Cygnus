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


module.exports = router;
