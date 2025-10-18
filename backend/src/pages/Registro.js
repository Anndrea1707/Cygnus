const express = require("express");
const bcrypt = require("bcryptjs");
const Usuario = require("./Usuario"); // 👈 corregido según tu estructura (mismo folder)

const router = express.Router();

// ✅ Ruta para registrar usuarios
router.post("/", async (req, res) => {
  try {
    console.log("📩 Datos recibidos del frontend:", req.body);

    const {
      cedula,
      nombre_completo,
      correo,
      fecha_nacimiento,
      contrasena,
      confirmar_contrasena,
    } = req.body;

    // Validar campos vacíos
    if (
      !cedula ||
      !nombre_completo ||
      !correo ||
      !fecha_nacimiento ||
      !contrasena ||
      !confirmar_contrasena
    ) {
      console.log("⚠️ Campos vacíos detectados");
      return res.status(400).json({ mensaje: "Por favor completa todos los campos." });
    }

    // Validar contraseñas
    if (contrasena !== confirmar_contrasena) {
      console.log("⚠️ Contraseñas no coinciden");
      return res.status(400).json({ mensaje: "Las contraseñas no coinciden." });
    }

    // Verificar si ya existe
    const existe = await Usuario.findOne({ $or: [{ cedula }, { correo }] });
    if (existe) {
      console.log("⚠️ Usuario ya existe");
      return res.status(400).json({ mensaje: "Ya existe un usuario con esa cédula o correo." });
    }

    // Encriptar contraseña
    console.log("🔐 Encriptando contraseña...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    // Guardar nuevo usuario
    const nuevoUsuario = new Usuario({
      cedula,
      nombre_completo,
      correo,
      fecha_nacimiento,
      contrasena: hashedPassword,
    });

    console.log("💾 Guardando usuario en MongoDB...");
    await nuevoUsuario.save();

    console.log("✅ Usuario registrado correctamente");
    res.status(201).json({ mensaje: "Usuario registrado correctamente 🎉" });

  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    res.status(500).json({
      mensaje: "Error en el servidor.",
      error: error.message, // 👈 enviamos detalle
    });
  }
});

module.exports = router;
