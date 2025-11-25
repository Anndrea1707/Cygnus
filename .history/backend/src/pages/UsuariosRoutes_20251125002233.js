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
   📌 3. NUEVO: Sincronizar usuario (datos frescos desde BD)
=============================== */
router.get("/sincronizar/:id", async (req, res) => {
  try {
    console.log(`🔄 Sincronizando usuario ${req.params.id} desde BD...`);
    
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    console.log('✅ Usuario sincronizado:', {
      nombre: usuario.nombre_completo,
      nivel_recordacion_nuevo: usuario.nivel_recordacion_nuevo,
      nivel_recordacion: usuario.nivel_recordacion,
      habilidad_nueva: usuario.habilidad_nueva
    });

    res.json({
      success: true,
      usuario: usuario
    });
  } catch (error) {
    console.error('❌ Error sincronizando usuario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al sincronizar usuario' 
    });
  }
});

/* ============================
   📌 4. Crear usuario (ya lo tienes, pero lo dejamos igual)
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
   📌 5. Actualizar usuario
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
   📌 6. Eliminar usuario
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