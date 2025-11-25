const express = require("express");
const router = express.Router();
const ModelosMatematicos = require("../models/ModelosMatematicos");

// Obtener todos
router.get("/", async (req, res) => {
  try {
    const modelos = await ModelosMatematicos.find();
    res.json(modelos);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener modelos" });
  }
});

// Crear
router.post("/", async (req, res) => {
  try {
    const nuevoModelo = new ModelosMatematicos(req.body);
    const guardado = await nuevoModelo.save();
    res.json(guardado);
  } catch (err) {
    res.status(500).json({ error: "Error al crear modelo" });
  }
});

// Eliminar
router.delete("/:id", async (req, res) => {
  try {
    await ModelosMatematicos.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Modelo eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar modelo" });
  }
});



module.exports = router;
