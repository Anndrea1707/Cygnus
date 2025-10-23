// backend/src/pages/Login.js
const express = require("express");
const bcrypt = require("bcryptjs"); // o "bcrypt", si lo usas
const Usuario = require("./Usuario");

const router = express.Router();

// Controlador
const loginUsuario = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ mensaje: "Faltan datos" });
    }

    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    res.status(200).json({ mensaje: "Inicio de sesión exitoso", usuario });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// Ruta POST
router.post("/", loginUsuario);

// Exportar el router
module.exports = router;